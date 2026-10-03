import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Heart,
  Crown,
  Leaf,
  Sparkles,
  MessageCircle,
  X,
  Smile,
  Shield,
  Clock,
  RotateCw
} from 'lucide-react';

export interface LiveLoveMessage {
  id: string;
  sender: string;
  senderRole: 'chif3n' | 'leslye' | 'demigod';
  text: string;
  timestamp: number;
}

interface LiveLoveScrollChatboxProps {
  isFloating?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const LiveLoveScrollChatbox: React.FC<LiveLoveScrollChatboxProps> = ({
  isFloating = false,
  isOpen = true,
  onClose
}) => {
  const [messages, setMessages] = useState<LiveLoveMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [currentSender, setCurrentSender] = useState<string>(() => {
    try {
      return localStorage.getItem('leslye_chat_sender') || 'Sir Chif3n (Demigod) 👑';
    } catch (e) {
      return 'Sir Chif3n (Demigod) 👑';
    }
  });
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<number>(0);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Ultra-fast Real-Time Synchronizer: fetches new messages from server
  const syncMessages = async () => {
    try {
      const res = await fetch(`/api/scrolls?since=${lastTimestampRef.current}`);
      if (res.ok) {
        const json = await res.json();
        if (json.messages && Array.isArray(json.messages) && json.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = json.messages.filter((m: LiveLoveMessage) => !existingIds.has(m.id));
            if (newOnes.length === 0) return prev;
            const combined = [...prev, ...newOnes].sort((a, b) => a.timestamp - b.timestamp);
            lastTimestampRef.current = combined[combined.length - 1].timestamp;
            return combined;
          });
          setLastSyncTime(Date.now());
        }
      }
    } catch (e) {
      console.warn('Real-time sync poll failed:', e);
    }
  };

  // Initial full fetch & fast 1.2-second polling loop
  useEffect(() => {
    // 1. Initial full fetch
    fetch('/api/scrolls')
      .then((r) => r.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          if (data.messages.length > 0) {
            lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp;
          }
          setLastSyncTime(Date.now());
        }
      })
      .catch((e) => console.warn(e));

    // 2. Ultra-fast 1.2-second polling to guarantee real-time updates across different mobile devices
    const pollTimer = setInterval(syncMessages, 1200);

    // 3. Parallel WebSocket connection for sub-second updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => setIsConnected(true);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init' && Array.isArray(data.messages)) {
            setMessages(data.messages);
            if (data.messages.length > 0) {
              lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp;
            }
          } else if (data.type === 'new_message' && data.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              const next = [...prev, data.message];
              lastTimestampRef.current = data.message.timestamp;
              return next;
            });
          }
        } catch (err) {}
      };

      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => setIsConnected(false);
    } catch (e) {}

    return () => {
      clearInterval(pollTimer);
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend) return;

    setInputText('');
    const senderRole = currentSender.toLowerCase().includes('leslye') ? 'leslye' : 'chif3n';

    // 1. Optimistic Local Update (Appears instantly on sender's screen)
    const optimisticMessage: LiveLoveMessage = {
      id: `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: currentSender,
      senderRole,
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    lastTimestampRef.current = optimisticMessage.timestamp;

    // 2. Send to backend REST API (Guaranteed persistent delivery across all networks)
    try {
      await fetch('/api/scrolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentSender,
          senderRole,
          text: textToSend
        })
      });
    } catch (err) {
      console.error('Error posting live scroll:', err);
    }

    // 3. Also send over WebSocket if open
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(
          JSON.stringify({
            type: 'send_message',
            sender: currentSender,
            senderRole,
            text: textToSend
          })
        );
      } catch (e) {}
    }
  };

  const handleSenderChange = (name: string) => {
    setCurrentSender(name);
    try {
      localStorage.setItem('leslye_chat_sender', name);
    } catch (e) {}
  };

  const sendStamp = (stampText: string) => {
    setInputText(stampText);
  };

  if (isFloating && !isOpen) return null;

  return (
    <div
      className={`rounded-2xl bg-[#061710]/95 border border-emerald-500/50 shadow-2xl flex flex-col overflow-hidden backdrop-blur-md transition-all ${
        isFloating
          ? 'fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-80 sm:w-96 max-h-[520px]'
          : 'w-full'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#06241a] via-[#04150f] to-[#0c261c] border-b border-emerald-900/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-600/40 text-emerald-300 shrink-0">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/40" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-cinzel text-xs font-bold text-white uppercase tracking-wider truncate">
                Live Love Scrolls
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Live sync running every second" />
            </div>
            <p className="text-[10px] text-amber-300 truncate font-mono">
              Direct Demigod & Maomao Parchment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sender Toggle */}
          <select
            value={currentSender}
            onChange={(e) => handleSenderChange(e.target.value)}
            className="bg-[#030e08] border border-emerald-800 text-emerald-200 text-[10px] font-mono rounded px-1.5 py-1 focus:outline-none cursor-pointer"
            title="Who is writing?"
          >
            <option value="Sir Chif3n (Demigod) 👑">Sir Chif3n 👑</option>
            <option value="Lady Leslye (Maomao) 🌿">Lady Leslye 🌿</option>
            <option value="Demigod Whisper ❤️">Demigod Whisper ❤️</option>
          </select>

          {isFloating && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-emerald-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="p-4 overflow-y-auto space-y-3 flex-1 max-h-[360px] min-h-[220px] scrollbar-thin bg-black/30">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-emerald-500 text-xs italic">
            Connecting to imperial parchment... Type a love note below to inscribe in real time!
          </div>
        ) : (
          messages.map((msg) => {
            const isChif3n = msg.sender.toLowerCase().includes('chif3n') || msg.senderRole === 'chif3n' || msg.senderRole === 'demigod';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isChif3n ? 'items-start' : 'items-end'} animate-in fade-in`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[10px] font-bold font-cinzel ${isChif3n ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {msg.sender}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-md ${
                    isChif3n
                      ? 'bg-gradient-to-br from-[#0c261b] to-[#061710] border border-amber-500/40 text-emerald-50 rounded-tl-sm'
                      : 'bg-gradient-to-br from-[#122e20] to-[#082015] border border-emerald-500/60 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Affection Stamp Pills */}
      <div className="px-3 py-1.5 bg-[#030e09] border-t border-emerald-950 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
        <button
          onClick={() => sendStamp('I love you endlessly, my queen ❤️')}
          className="px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-700/60 text-rose-300 hover:text-white shrink-0"
        >
          ❤️ Endlessly
        </button>
        <button
          onClick={() => sendStamp('Are you ready for Date Night anime? 🍵✨')}
          className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-700/60 text-amber-300 hover:text-white shrink-0"
        >
          🍵 Tea & Date Night
        </button>
        <button
          onClick={() => sendStamp('Looking at you is my favorite medicine 🌿')}
          className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 hover:text-white shrink-0"
        >
          🌿 My Medicine
        </button>
        <button
          onClick={() => sendStamp('Demigod cuddle protocol activated 👑')}
          className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-700/60 text-cyan-300 hover:text-white shrink-0"
        >
          👑 Cuddle Protocol
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#030d08] border-t border-emerald-900/60 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Inscribe love scroll as ${currentSender.split(' ')[0]}...`}
          className="flex-1 bg-[#05170f] border border-emerald-800/80 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-amber-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold text-xs disabled:opacity-40 transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
