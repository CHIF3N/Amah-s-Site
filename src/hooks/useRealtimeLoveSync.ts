import { useState, useEffect, useRef, useCallback } from 'react';
import {
  subscribeToLoveScrolls,
  pushLoveScrollToCloud,
  deleteLoveScrollFromCloud,
  reactToLoveScrollInCloud,
  subscribeToWhisperNotes,
  pushWhisperNoteToCloud,
  deleteWhisperNoteFromCloud,
  FirebaseLoveScroll,
  FirebaseWhisperNote
} from '../services/firebase';

export interface LiveMessage extends FirebaseLoveScroll {}

const SEEDED_SCROLLS: LiveMessage[] = [
  {
    id: 'scroll-seed-1',
    sender: 'Sir Chif3n (Demigod) 👑',
    senderRole: 'chif3n',
    type: 'text',
    text: 'To my precious Maomao, Lady Leslye: Testing all your snacks for poison so you can watch peacefully ❤️',
    timestamp: Date.now() - 1000 * 60 * 45
  },
  {
    id: 'scroll-seed-2',
    sender: 'Lady Leslye (Apothecary Empress) 🌿',
    senderRole: 'leslye',
    type: 'text',
    text: 'Thank you Sir Chif3n! Tonight is officially cuddle night. The rear palace can wait! 🍵✨',
    timestamp: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'scroll-seed-3',
    sender: 'Sir Chif3n (Demigod) 👑',
    senderRole: 'chif3n',
    type: 'text',
    text: 'Sacred Decree: You are adored beyond measure. Relax your shoulders and lean on me.',
    timestamp: Date.now() - 1000 * 60 * 15
  }
];

const SEEDED_WHISPERS: FirebaseWhisperNote[] = [
  {
    id: 'whisper-seed-1',
    text: 'Thank you for building my Maomao apothecary realm, Sir Chif3n. You are my favorite protector! 💚',
    sender: 'Lady Leslye 🌿',
    date: 'Today',
    timestamp: Date.now() - 1000 * 60 * 60 * 2
  }
];

function getInitialMessages(): LiveMessage[] {
  try {
    const raw = localStorage.getItem('imperial_live_scrolls');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return SEEDED_SCROLLS;
}

function getInitialWhispers(): FirebaseWhisperNote[] {
  try {
    const raw = localStorage.getItem('leslye_custom_notes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return SEEDED_WHISPERS;
}

export function useRealtimeLoveSync(activeRole: 'chif3n' | 'leslye') {
  const [messages, setMessages] = useState<LiveMessage[]>(getInitialMessages);
  const [whispers, setWhispers] = useState<FirebaseWhisperNote[]>(getInitialWhispers);
  const [partnerTyping, setPartnerTyping] = useState<{ user: 'chif3n' | 'leslye'; isTyping: boolean } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'cloud-only' | 'offline'>('connecting');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  // Helper to merge and sort unique messages by timestamp
  const mergeMessages = useCallback((incoming: LiveMessage[]) => {
    setMessages((prev) => {
      const map = new Map<string, LiveMessage>();
      for (const m of prev) map.set(m.id, m);
      for (const m of incoming) {
        const existing = map.get(m.id);
        if (!existing) {
          map.set(m.id, m);
        } else {
          // Merge reactions and updated fields
          map.set(m.id, {
            ...existing,
            ...m,
            reactions: { ...(existing.reactions || {}), ...(m.reactions || {}) }
          });
        }
      }
      const sorted = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
      try {
        localStorage.setItem('imperial_live_scrolls', JSON.stringify(sorted.slice(-200)));
      } catch (e) {}
      return sorted;
    });
  }, []);

  // Helper to merge whispers
  const mergeWhispers = useCallback((incoming: FirebaseWhisperNote[]) => {
    setWhispers((prev) => {
      const map = new Map<string, FirebaseWhisperNote>();
      for (const w of prev) map.set(w.id, w);
      for (const w of incoming) map.set(w.id, w);
      const sorted = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
      try {
        localStorage.setItem('leslye_custom_notes', JSON.stringify(sorted.slice(-150)));
      } catch (e) {}
      return sorted;
    });
  }, []);

  // 1. WebSocket Dual Real-Time Connection
  useEffect(() => {
    isMountedRef.current = true;

    // Cross-tab broadcast channel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastRef.current = new BroadcastChannel('leslye_realm_live_sync');
      broadcastRef.current.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'new_message' && data.message) {
          mergeMessages([data.message]);
        } else if (data.type === 'delete_message' && data.id) {
          setMessages((prev) => prev.filter((m) => m.id !== data.id));
        } else if (data.type === 'new_whisper' && data.note) {
          mergeWhispers([data.note]);
        } else if (data.type === 'delete_whisper' && data.id) {
          setWhispers((prev) => prev.filter((w) => w.id !== data.id));
        } else if (data.type === 'typing') {
          setPartnerTyping(data.typing);
        }
      };
    }

    const connectWebSocket = () => {
      if (!isMountedRef.current) return;
      if (typeof window === 'undefined') return;

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isMountedRef.current) return;
          setConnectionStatus('connected');
          // Announce presence
          ws.send(JSON.stringify({ type: 'ping_presence', player: activeRole }));
        };

        ws.onmessage = (event) => {
          if (!isMountedRef.current) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'init') {
              if (Array.isArray(data.messages) && data.messages.length > 0) {
                mergeMessages(data.messages);
              }
              if (Array.isArray(data.whispers) && data.whispers.length > 0) {
                mergeWhispers(data.whispers);
              }
            } else if (data.type === 'new_message' && data.message) {
              mergeMessages([data.message]);
              if (data.message.senderRole !== activeRole) {
                setUnreadCount((c) => c + 1);
              }
            } else if (data.type === 'delete_message' && data.id) {
              setMessages((prev) => prev.filter((m) => m.id !== data.id));
            } else if (data.type === 'update_message_reactions' && data.id) {
              setMessages((prev) =>
                prev.map((m) => (m.id === data.id ? { ...m, reactions: data.reactions } : m))
              );
            } else if (data.type === 'typing') {
              if (data.user !== activeRole) {
                setPartnerTyping({ user: data.user, isTyping: !!data.isTyping });
                clearTimeout(typingTimeoutRef.current);
                if (data.isTyping) {
                  typingTimeoutRef.current = setTimeout(() => {
                    setPartnerTyping(null);
                  }, 4000);
                }
              }
            } else if (data.type === 'new_whisper' && data.note) {
              mergeWhispers([data.note]);
            } else if (data.type === 'delete_whisper' && data.id) {
              setWhispers((prev) => prev.filter((w) => w.id !== data.id));
            }
          } catch (e) {
            console.warn('WS message parse error:', e);
          }
        };

        ws.onclose = () => {
          if (!isMountedRef.current) return;
          setConnectionStatus((prev) => (prev === 'connected' ? 'cloud-only' : prev));
          // Auto-reconnect with backoff
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3500);
        };

        ws.onerror = () => {
          if (!isMountedRef.current) return;
          setConnectionStatus('cloud-only');
        };
      } catch (err) {
        setConnectionStatus('cloud-only');
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    // 2. Cloud Firestore Real-Time Subscriptions (Guarantees multi-device worldwide sync)
    const unsubLoveScrolls = subscribeToLoveScrolls((cloudMsgs) => {
      if (cloudMsgs && cloudMsgs.length > 0) {
        mergeMessages(cloudMsgs);
      }
    });

    const unsubWhispers = subscribeToWhisperNotes((cloudWhispers) => {
      if (cloudWhispers && cloudWhispers.length > 0) {
        mergeWhispers(cloudWhispers);
      }
    });

    // 3. Keepalive heartbeat
    const heartbeat = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping_presence', player: activeRole }));
      }
    }, 15000);

    return () => {
      isMountedRef.current = false;
      unsubLoveScrolls();
      unsubWhispers();
      clearInterval(heartbeat);
      clearTimeout(reconnectTimeoutRef.current);
      clearTimeout(typingTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (broadcastRef.current) {
        broadcastRef.current.close();
      }
    };
  }, [activeRole, mergeMessages, mergeWhispers]);

  // Dispatch outgoing message
  const sendMessage = useCallback(
    async (payload: {
      text?: string;
      type?: 'text' | 'audio' | 'image';
      audioUrl?: string;
      duration?: number;
      imageUrl?: string;
      caption?: string;
    }) => {
      const sender =
        activeRole === 'leslye'
          ? 'Lady Leslye (Apothecary Empress) 🌿'
          : 'Sir Chif3n (Demigod) 👑';

      const newMsg: LiveMessage = {
        id: `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender,
        senderRole: activeRole,
        type: payload.type || (payload.audioUrl ? 'audio' : payload.imageUrl ? 'image' : 'text'),
        text: payload.text?.trim() || undefined,
        audioUrl: payload.audioUrl,
        duration: payload.duration,
        imageUrl: payload.imageUrl,
        caption: payload.caption?.trim() || undefined,
        reactions: {},
        timestamp: Date.now()
      };

      // 1. Optimistic local update (0ms)
      mergeMessages([newMsg]);

      // 2. Cross-tab BroadcastChannel
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'new_message', message: newMsg });
      }

      // 3. WebSocket send
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'send_message', ...newMsg }));
      }

      // 4. Cloud Firestore (Worldwide direct phone/laptop sync)
      pushLoveScrollToCloud(newMsg).catch((err) =>
        console.warn('Firestore push failed:', err)
      );

      // 5. REST fallback dispatch
      try {
        fetch('/api/scrolls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMsg)
        }).catch(() => {});
      } catch (e) {}

      return newMsg;
    },
    [activeRole, mergeMessages]
  );

  // Delete message
  const deleteMessage = useCallback(
    async (id: string) => {
      // 1. Optimistic remove
      setMessages((prev) => prev.filter((m) => m.id !== id));

      // 2. BroadcastChannel
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'delete_message', id });
      }

      // 3. WebSocket
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'delete_message', id }));
      }

      // 4. Firestore
      deleteLoveScrollFromCloud(id).catch(() => {});

      // 5. REST
      try {
        fetch(`/api/scrolls/${id}`, { method: 'DELETE' }).catch(() => {});
      } catch (e) {}
    },
    []
  );

  // React to message
  const reactToMessage = useCallback(
    async (id: string, emoji: string) => {
      const user = activeRole === 'leslye' ? 'Lady Leslye' : 'Sir Chif3n';

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const currentReactions = { ...(m.reactions || {}) };
          const list = currentReactions[emoji] ? [...currentReactions[emoji]] : [];
          const idx = list.indexOf(user);
          if (idx === -1) {
            list.push(user);
          } else {
            list.splice(idx, 1);
          }
          if (list.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = list;
          }
          return { ...m, reactions: currentReactions };
        })
      );

      // WebSocket
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'react_message', id, emoji, user }));
      }

      // Firestore
      reactToLoveScrollInCloud(id, emoji, user).catch(() => {});

      // REST
      try {
        fetch(`/api/scrolls/${id}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji, user })
        }).catch(() => {});
      } catch (e) {}
    },
    [activeRole]
  );

  // Broadcast typing status
  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'typing', user: activeRole, isTyping }));
      }
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({
          type: 'typing',
          typing: isTyping ? { user: activeRole, isTyping: true } : null
        });
      }
    },
    [activeRole]
  );

  // Add whisper note (Lady Leslye's Herbal Diary)
  const addWhisperNote = useCallback(
    async (text: string) => {
      const sender = activeRole === 'leslye' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑';
      const newNote: FirebaseWhisperNote = {
        id: `whisper-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: text.trim(),
        sender,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now()
      };

      // 1. Optimistic
      mergeWhispers([newNote]);

      // 2. BroadcastChannel
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'new_whisper', note: newNote });
      }

      // 3. WebSocket
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'add_whisper', note: newNote }));
      }

      // 4. Firestore
      pushWhisperNoteToCloud(newNote).catch(() => {});

      // 5. REST
      try {
        fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNote)
        }).catch(() => {});
      } catch (e) {}

      return newNote;
    },
    [activeRole, mergeWhispers]
  );

  // Delete whisper note
  const deleteWhisperNote = useCallback(async (id: string) => {
    setWhispers((prev) => prev.filter((w) => w.id !== id));

    if (broadcastRef.current) {
      broadcastRef.current.postMessage({ type: 'delete_whisper', id });
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'delete_whisper', id }));
    }

    deleteWhisperNoteFromCloud(id).catch(() => {});

    try {
      fetch(`/api/notes/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}
  }, []);

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    messages,
    whispers,
    partnerTyping,
    connectionStatus,
    unreadCount,
    clearUnreadCount,
    sendMessage,
    deleteMessage,
    reactToMessage,
    sendTypingStatus,
    addWhisperNote,
    deleteWhisperNote
  };
}
