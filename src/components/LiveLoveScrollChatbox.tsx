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
  RotateCw,
  Zap,
  Globe,
  Radio,
  Check
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
  onOpenLoginModal?: () => void;
}

const SEEDED_DEFAULT_SCROLLS: LiveLoveMessage[] = [
  {
    id: 'scroll-seed-1',
    sender: 'Sir Chif3n (Demigod) 👑',
    senderRole: 'chif3n',
    text: 'To my precious Maomao, Lady Leslye: Testing all your snacks for poison so you can watch peacefully ❤️',
    timestamp: Date.now() - 1000 * 60 * 45
  },
  {
    id: 'scroll-seed-2',
    sender: 'Lady Leslye (Apothecary Empress) 🌿',
    senderRole: 'leslye',
    text: 'Thank you Sir Chif3n! Tonight is officially cuddle night. The rear palace can wait! 🍵✨',
    timestamp: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'scroll-seed-3',
    sender: 'Sir Chif3n (Demigod) 👑',
    senderRole: 'chif3n',
    text: 'Sacred Decree: You are adored beyond measure. Relax your shoulders and lean on me.',
    timestamp: Date.now() - 1000 * 60 * 15
  }
];

const ROMANTIC_PRESETS = [
  'Testing your tea for poison... 🧪',
  'Demigod cuddles on demand ❤️',
  'Sending boba & snacks 🧋',
  'You are my sacred remedy 🌿',
  'Emergency blanket burrito! 🌯'
];

function getStoredMessages(): LiveLoveMessage[] {
  try {
    const saved = localStorage.getItem('imperial_live_scrolls');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return SEEDED_DEFAULT_SCROLLS;
}

export const LiveLoveScrollChatbox: React.FC<LiveLoveScrollChatboxProps> = ({
  isFloating = false,
  isOpen = true,
  onClose,
  onOpenLoginModal
}) => {
  const [messages, setMessages] = useState<LiveLoveMessage[]>(() => getStoredMessages());
  const [inputText, setInputText] = useState<string>('');
  const [activeRole, setActiveRole] = useState<'chif3n' | 'leslye'>(() => {
    try {
      const saved = localStorage.getItem('leslye_active_user');
      if (saved === 'chif3n' || saved === 'leslye') return saved;
    } catch (e) {}
    return 'chif3n';
  });

  const [connectionMode, setConnectionMode] = useState<'live' | 'local'>('live');
  const [showPresets, setShowPresets] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<number>(0);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Persist messages to local storage and broadcast across tabs
  const persistMessages = (updated: LiveLoveMessage[]) => {
    setMessages(updated);
    try {
      localStorage.setItem('imperial_live_scrolls', JSON.stringify(updated.slice(-100)));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'scrolls_update', messages: updated });
      }
    } catch (e) {}
  };

  // Ultra-fast Real-Time Synchronizer: fetches new messages from server
  const syncMessagesFromServer = async () => {
    try {
      const res = await fetch(`/api/scrolls?since=${lastTimestampRef.current}`);
      if (res.ok) {
        const text = await res.text();
        if (text.startsWith('{')) {
          const json = JSON.parse(text);
          if (json.messages && Array.isArray(json.messages) && json.messages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newOnes = json.messages.filter((m: LiveLoveMessage) => !existingIds.has(m.id));
              if (newOnes.length === 0) return prev;
              const combined = [...prev, ...newOnes].sort((a, b) => a.timestamp - b.timestamp);
              lastTimestampRef.current = combined[combined.length - 1].timestamp;
              try {
                localStorage.setItem('imperial_live_scrolls', JSON.stringify(combined.slice(-100)));
              } catch (e) {}
              return combined;
            });
            setConnectionMode('live');
          }
        }
      }
    } catch (e) {
      setConnectionMode('local');
    }
  };

  useEffect(() => {
    // 1. Setup BroadcastChannel for 0ms cross-tab instant messaging
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('imperial_love_scrolls_channel');
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === 'scrolls_update' && Array.isArray(event.data.messages)) {
          setMessages(event.data.messages);
        }
      };
    }

    // 2. Initial fetch from server
    syncMessagesFromServer();

    // 3. Regular polling loop (1.5s) for multi-device sync
    const pollTimer = setInterval(syncMessagesFromServer, 1500);

    // 4. WebSocket setup with graceful fallback (won't crash if offline or on Netlify)
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => setConnectionMode('live');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message' && data.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              const next = [...prev, data.message];
              lastTimestampRef.current = data.message.timestamp;
              try {
                localStorage.setItem('imperial_live_scrolls', JSON.stringify(next.slice(-100)));
              } catch (e) {}
              return next;
            });
          }
        } catch (err) {}
      };
      ws.onerror = () => setConnectionMode('local');
    } catch (e) {
      setConnectionMode('local');
    }

    return () => {
      clearInterval(pollTimer);
      if (channelRef.current) channelRef.current.close();
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const handleRoleToggle = (role: 'chif3n' | 'leslye') => {
    setActiveRole(role);
    try {
      localStorage.setItem('leslye_active_user', role);
      localStorage.setItem('leslye_game_role', role);
    } catch (e) {}
  };

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    if (!customText) setInputText('');
    setShowPresets(false);

    const sender =
      activeRole === 'leslye'
        ? 'Lady Leslye (Apothecary Empress) 🌿'
        : 'Sir Chif3n (Demigod) 👑';

    // 1. Optimistic Local Update (Instant 0ms display on screen)
    const newScroll: LiveLoveMessage = {
      id: `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender,
      senderRole: activeRole,
      text: textToSend,
      timestamp: Date.now()
    };

    const nextMessages = [...messages, newScroll];
    persistMessages(nextMessages);
    lastTimestampRef.current = newScroll.timestamp;

    // 2. Send to backend REST API & Webhook (with graceful catch)
    try {
      await fetch('/api/scrolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender,
          senderRole: activeRole,
          text: textToSend
        })
      });
    } catch (err) {
      // Fallback: Also ping webhook endpoint
      try {
        await fetch('/api/webhook/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender,
            senderRole: activeRole,
            text: textToSend
          })
        });
      } catch (e) {}
    }

    // 3. Send over WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(
          JSON.stringify({
            type: 'send_message',
            sender,
            senderRole: activeRole,
            text: textToSend
          })
        );
      } catch (e) {}
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`flex flex-col bg-gradient-to-b from-[#05170f] via-[#030e09] to-[#020906] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden transition-all ${
        isFloating
          ? 'fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[380px] h-[480px] z-50 animate-in slide-in-from-bottom-5'
          : 'w-full h-[520px]'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-[#03110b] border-b border-emerald-900/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/40 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-xs font-bold text-white tracking-wide">
                Live Love Scrolls
              </h3>
              <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                <span className={`w-1.5 h-1.5 rounded-full ${connectionMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{connectionMode === 'live' ? 'Cloud Synced' : 'Local Sanctum'}</span>
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono block">
              Dedicated chat between Chif3n & Leslye
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Role Switcher Pill Bar (Answers "do we need a login or something") */}
      <div className="px-3 py-2 bg-[#020b06] border-b border-emerald-950 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-emerald-500">Speaking as:</span>
          <button
            onClick={() => handleRoleToggle('chif3n')}
            className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] flex items-center gap-1 transition-all ${
              activeRole === 'chif3n'
                ? 'bg-amber-400 text-black border-amber-300 shadow-sm'
                : 'bg-[#03110b] text-amber-300/70 border-emerald-900 hover:text-white'
            }`}
          >
            <Crown className="w-3 h-3" />
            <span>Sir Chif3n 👑</span>
          </button>
          <button
            onClick={() => handleRoleToggle('leslye')}
            className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] flex items-center gap-1 transition-all ${
              activeRole === 'leslye'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                : 'bg-[#03110b] text-emerald-300/70 border-emerald-900 hover:text-white'
            }`}
          >
            <Leaf className="w-3 h-3" />
            <span>Lady Leslye 🌿</span>
          </button>
        </div>

        {onOpenLoginModal && (
          <button
            onClick={onOpenLoginModal}
            className="text-[10px] text-amber-300 underline font-mono hover:text-white"
          >
            Profile
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto scrollbar-thin">
        {messages.map((msg) => {
          const isMe = msg.senderRole === activeRole;
          const isChif3n = msg.senderRole === 'chif3n';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              {/* Sender Name */}
              <div className="flex items-center gap-1 text-[10px] font-mono mb-1 text-emerald-400/80 px-1">
                {isChif3n ? (
                  <Crown className="w-3 h-3 text-amber-400" />
                ) : (
                  <Leaf className="w-3 h-3 text-emerald-400" />
                )}
                <span>{msg.sender.split('(')[0]}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-500 text-[9px]">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  isChif3n
                    ? 'bg-gradient-to-br from-[#1c1404] to-[#2b1f06] border border-amber-500/40 text-amber-100 rounded-tr-none'
                    : 'bg-gradient-to-br from-[#062015] to-[#04150d] border border-emerald-500/40 text-emerald-100 rounded-tl-none'
                }`}
              >
                <p className="font-serif whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Romantic Presets Dropup */}
      {showPresets && (
        <div className="p-2 bg-[#020d07] border-t border-emerald-900/60 flex flex-wrap gap-1.5 animate-in slide-in-from-bottom-2">
          {ROMANTIC_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(preset)}
              className="px-2.5 py-1 rounded-lg bg-[#041a0f] hover:bg-emerald-950 text-emerald-200 border border-emerald-800 text-[11px] font-serif transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Input & Send Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-[#03110b] border-t border-emerald-900/80 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="p-2 rounded-xl text-amber-400 hover:bg-emerald-950 transition-colors"
          title="Romantic presets"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Inscribe love scroll as ${activeRole === 'leslye' ? 'Lady Leslye' : 'Sir Chif3n'}...`}
          className="flex-1 bg-[#020b06] border border-emerald-900/80 focus:border-amber-400/80 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700/80 outline-none"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 text-black font-bold disabled:opacity-40 shadow-md transition-all active:scale-95"
          title="Send scroll"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
