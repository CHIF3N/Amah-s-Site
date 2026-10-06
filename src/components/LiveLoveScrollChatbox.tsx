import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Heart,
  Crown,
  Leaf,
  Sparkles,
  MessageCircle,
  X,
  Clock,
  Radio,
  CheckCheck,
  Cloud,
  Trash2,
  Volume2,
  Maximize2
} from 'lucide-react';
import { useRealtimeLoveSync, LiveMessage } from '../hooks/useRealtimeLoveSync';

interface LiveLoveScrollChatboxProps {
  isFloating?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenLoginModal?: () => void;
  overrideRole?: 'chif3n' | 'leslye';
  onRoleChange?: (role: 'chif3n' | 'leslye') => void;
}

const ROMANTIC_PRESETS = [
  'Testing your tea for poison... 🧪',
  'Demigod cuddles on demand ❤️',
  'Sending boba & snacks 🧋',
  'You are my sacred remedy 🌿',
  'Emergency blanket burrito! 🌯',
  'Sacred decree: Relax your shoulders 💕'
];

export const LiveLoveScrollChatbox: React.FC<LiveLoveScrollChatboxProps> = ({
  isFloating = false,
  isOpen = true,
  onClose,
  onOpenLoginModal,
  overrideRole,
  onRoleChange
}) => {
  const [internalRole, setInternalRole] = useState<'chif3n' | 'leslye'>(() => {
    try {
      const saved = localStorage.getItem('leslye_active_user');
      if (saved === 'chif3n' || saved === 'leslye') return saved;
    } catch (e) {}
    return 'chif3n';
  });

  const activeRole = overrideRole || internalRole;

  const {
    messages,
    partnerTyping,
    connectionStatus,
    sendMessage,
    deleteMessage,
    reactToMessage,
    sendTypingStatus
  } = useRealtimeLoveSync(activeRole);

  const [inputText, setInputText] = useState<string>('');
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingDebounceRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleRoleToggle = (role: 'chif3n' | 'leslye') => {
    setInternalRole(role);
    try {
      localStorage.setItem('leslye_active_user', role);
      localStorage.setItem('leslye_game_role', role);
    } catch (e) {}
    if (onRoleChange) onRoleChange(role);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTypingStatus(true);
    clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1800);
  };

  // Send message
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    if (!customText) setInputText('');
    setShowPresets(false);
    sendTypingStatus(false);

    await sendMessage({
      text: textToSend,
      type: 'text'
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`flex flex-col bg-gradient-to-b from-[#05170f] via-[#030e09] to-[#020906] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden transition-all ${
        isFloating
          ? 'fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[380px] h-[500px] z-50 animate-in slide-in-from-bottom-5'
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
              <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                <span>{connectionStatus === 'connected' ? 'Live WebSocket + Cloud' : 'Cloud Sync Active'}</span>
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono block">
              Direct instant link between Chif3n's & Leslye's devices
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

      {/* Role Switcher Pill Bar */}
      <div className="px-3 py-2 bg-[#020b06] border-b border-emerald-950 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-emerald-500">Speaking as:</span>
          <button
            onClick={() => handleRoleToggle('chif3n')}
            className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 transition-all ${
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
            className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 transition-all ${
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
            Switch Profile
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
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
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
                {/* Delete button */}
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 transition-opacity ml-1 p-0.5"
                  title="Remove scroll"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md relative ${
                  isChif3n
                    ? 'bg-gradient-to-br from-[#1c1404] to-[#2b1f06] border border-amber-500/40 text-amber-100 rounded-tr-none'
                    : 'bg-gradient-to-br from-[#062015] to-[#04150d] border border-emerald-500/40 text-emerald-100 rounded-tl-none'
                }`}
              >
                {/* Voice note indicator */}
                {msg.type === 'audio' && (
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 mb-1 border border-amber-500/30 text-amber-200">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-mono">Voice Potion ({msg.duration || 5}s)</span>
                  </div>
                )}

                {/* Image preview */}
                {msg.type === 'image' && msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-48 border border-white/10">
                    <img src={msg.imageUrl} alt="Scroll Photo" className="w-full object-cover max-h-48" />
                  </div>
                )}

                {/* Text */}
                {msg.text && <p className="font-serif whitespace-pre-wrap">{msg.text}</p>}
                {msg.caption && <p className="font-serif text-[11px] text-emerald-200/90 mt-1 italic">{msg.caption}</p>}

                {/* Reactions & Synced tick */}
                <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-emerald-950/40">
                  <div className="flex items-center gap-1 flex-wrap">
                    {['❤️', '🌿', '✨', '🍵'].map((emoji) => {
                      const count = msg.reactions?.[emoji]?.length || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => reactToMessage(msg.id, emoji)}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-all ${
                            count > 0
                              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 shadow-sm'
                              : 'bg-black/20 border-transparent text-zinc-500 hover:text-emerald-300'
                          }`}
                        >
                          {emoji} {count > 0 && <span className="font-mono text-[9px] font-bold">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-emerald-400/60 font-mono shrink-0">
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    <span>Live</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live typing indicator */}
        {partnerTyping?.isTyping && (
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300/90 py-1 px-2 animate-pulse bg-emerald-950/40 rounded-xl border border-emerald-800/40 w-fit">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              {partnerTyping.user === 'leslye' ? 'Lady Leslye' : 'Sir Chif3n'} is inscribing a love scroll... ✍️
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Romantic Presets Dropup */}
      {showPresets && (
        <div className="p-2 bg-[#020d07] border-t border-emerald-900/60 flex flex-wrap gap-1.5 animate-in slide-in-from-bottom-2">
          {ROMANTIC_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
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
          handleSend();
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
          onChange={handleInputChange}
          placeholder={`Inscribe love scroll as ${activeRole === 'leslye' ? 'Lady Leslye' : 'Sir Chif3n'}...`}
          className="flex-1 bg-[#020b06] border border-emerald-900/80 focus:border-amber-400/80 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700/80 outline-none"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 text-black font-bold disabled:opacity-40 shadow-md transition-all active:scale-95"
          title="Send scroll to partner in real time"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
