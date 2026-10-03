import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Heart,
  Crown,
  Leaf,
  Sparkles,
  Lock,
  ArrowLeft,
  Cloud,
  CheckCheck,
  Key,
  AlertCircle,
  Eye,
  EyeOff,
  Mic,
  Square,
  Play,
  Pause,
  Image as ImageIcon,
  X,
  Maximize2,
  ZoomIn,
  Download,
  Volume2,
  Bell,
  BellRing
} from 'lucide-react';
import {
  subscribeToLoveScrolls,
  pushLoveScrollToCloud,
  FirebaseLoveScroll
} from '../services/firebase';

export interface LiveLoveMessage {
  id: string;
  sender: string;
  senderRole: 'chif3n' | 'leslye' | 'demigod';
  type?: 'text' | 'audio' | 'image';
  text?: string;
  audioUrl?: string;
  duration?: number;
  imageUrl?: string;
  caption?: string;
  timestamp: number;
}

interface ImperialChatVaultProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
}

const SEEDED_DEFAULT_SCROLLS: LiveLoveMessage[] = [
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

const ROMANTIC_PRESETS = [
  'Testing your tea for poison... 🧪',
  'Demigod cuddles on demand ❤️',
  'Sending boba & snacks 🧋',
  'You are my sacred remedy 🌿',
  'Emergency blanket burrito! 🌯',
  'Sacred decree: Relax your shoulders 💕',
  'Ready for our date night anime! 🍿'
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

/**
 * Custom Apothecary Voice Player component with waveform animation, native <audio preload="auto">, and cross-device decoders
 */
const ApothecaryAudioPlayer: React.FC<{ audioUrl: string; duration?: number; isChif3n: boolean }> = ({
  audioUrl,
  duration,
  isChif3n
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync duration if passed as prop
  useEffect(() => {
    if (duration && duration > 0) {
      setTotalDuration(duration);
    }
  }, [duration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = 1.0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Audio play error:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      className={`p-3 rounded-2xl flex items-center gap-3 border shadow-inner ${
        isChif3n
          ? 'bg-[#181104] border-amber-500/40 text-amber-200'
          : 'bg-[#041a10] border-emerald-500/40 text-emerald-200'
      }`}
    >
      {/* Hidden Native Audio Element with preload="auto" and cross-device Base64 decoding */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        playsInline={true}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (d && !isNaN(d) && isFinite(d)) {
            setTotalDuration(Math.round(d));
          }
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={(e) => {
          console.warn('Native audio element error:', e);
          setIsPlaying(false);
        }}
      />

      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 ${
          isChif3n
            ? 'bg-amber-400 hover:bg-amber-300 text-black'
            : 'bg-emerald-500 hover:bg-emerald-400 text-black'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1 min-w-[140px]">
        <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400/90">
          <span className="flex items-center gap-1 font-bold">
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span>Voice Potion</span>
          </span>
          <span>{formatSecs(currentTime)} / {formatSecs(totalDuration || 5)}</span>
        </div>

        {/* Progress Bar & Animated Waveform bars */}
        <div className="relative w-full h-2 bg-black/60 rounded-full overflow-hidden border border-emerald-950">
          <div
            className={`h-full transition-all duration-100 ${
              isChif3n ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Subtle Waveform Animation */}
        <div className="flex items-center gap-0.5 h-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isPlaying ? 'animate-pulse' : 'opacity-40'
              } ${isChif3n ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{
                height: isPlaying ? `${Math.max(3, ((i * 7) % 8) + 2)}px` : '3px',
                animationDelay: `${i * 60}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ImperialChatVault: React.FC<ImperialChatVaultProps> = ({
  isOpen,
  onClose,
  onOpenLoginModal
}) => {
  // Passcode gate state: check sessionStorage for unlocked status
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('realm_vault_unlocked') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Chat message & active role states
  const [messages, setMessages] = useState<LiveLoveMessage[]>(() => getStoredMessages());
  const [inputText, setInputText] = useState('');
  const [activeRole, setActiveRole] = useState<'chif3n' | 'leslye'>(() => {
    try {
      const saved = localStorage.getItem('leslye_active_user');
      if (saved === 'chif3n' || saved === 'leslye') return saved;
    } catch (e) {}
    return 'chif3n';
  });

  const [showPresets, setShowPresets] = useState(false);

  // Notification state
  const [notificationsActive, setNotificationsActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Image zoom modal state
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const passcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus passcode input when opening gate
  useEffect(() => {
    if (isOpen && !isUnlocked) {
      setTimeout(() => {
        passcodeInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isUnlocked]);

  // Real-time Firestore sync
  useEffect(() => {
    if (!isOpen || !isUnlocked) return;

    const unsubscribeCloud = subscribeToLoveScrolls((cloudMsgs) => {
      if (cloudMsgs && cloudMsgs.length > 0) {
        setMessages((prev) => {
          const map = new Map<string, LiveLoveMessage>();
          for (const m of prev) map.set(m.id, m);
          for (const m of cloudMsgs) map.set(m.id, m);
          const combined = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
          try {
            localStorage.setItem('imperial_live_scrolls', JSON.stringify(combined.slice(-150)));
          } catch (e) {}
          return combined;
        });
      }
    });

    return () => {
      unsubscribeCloud();
    };
  }, [isOpen, isUnlocked]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isUnlocked) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isUnlocked]);

  // Handle Passcode Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim().toLowerCase();

    if (cleanPass === 'chif3n') {
      setIsUnlocked(true);
      setPasscodeError(null);
      try {
        sessionStorage.setItem('realm_vault_unlocked', 'true');
      } catch (e) {}
    } else {
      setIsShaking(true);
      setPasscodeError('Invalid Seal. Only the Demigod holds the key. 🌿');
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleLockVault = () => {
    try {
      sessionStorage.removeItem('realm_vault_unlocked');
    } catch (e) {}
    setIsUnlocked(false);
    setPasscode('');
    setPasscodeError(null);
  };

  const handleRoleToggle = (role: 'chif3n' | 'leslye') => {
    setActiveRole(role);
    try {
      localStorage.setItem('leslye_active_user', role);
      localStorage.setItem('leslye_game_role', role);
    } catch (e) {}
  };

  // --- VOICE RECORDING ENGINE ---
  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Voice recording is not supported in this browser environment.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detect optimal supported audio MIME type across iOS Safari and Chrome/Android
      let selectedMime = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          selectedMime = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          selectedMime = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          selectedMime = 'audio/ogg';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          selectedMime = 'audio/webm';
        }
      }

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or failed:', err);
      alert('Microphone access was denied. Please allow microphone access to record voice potions.');
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const sendVoiceRecording = () => {
    if (!mediaRecorderRef.current) return;
    const duration = recordingSeconds;
    const recordedMime = mediaRecorderRef.current.mimeType || 'audio/webm';

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: recordedMime });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string; // 'data:audio/...;base64,...'
        await dispatchMultimediaMessage({
          type: 'audio',
          audioUrl: base64Audio,
          duration: Math.max(1, duration)
        });
      };

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current.stop();
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // --- IMAGE SHARING ENGINE WITH CANVAS COMPRESSOR ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = async () => {
        // Compress image via hidden canvas
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          await dispatchMultimediaMessage({
            type: 'image',
            imageUrl: compressedDataUrl,
            caption: inputText.trim() || undefined
          });
          setInputText('');
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Dispatch message helper
  const dispatchMultimediaMessage = async (payload: Partial<LiveLoveMessage>) => {
    const sender =
      activeRole === 'leslye'
        ? 'Lady Leslye (Apothecary Empress) 🌿'
        : 'Sir Chif3n (Demigod) 👑';

    const newScroll: LiveLoveMessage = {
      id: `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender,
      senderRole: activeRole,
      type: payload.type || 'text',
      text: payload.text,
      audioUrl: payload.audioUrl,
      duration: payload.duration,
      imageUrl: payload.imageUrl,
      caption: payload.caption,
      timestamp: Date.now()
    };

    // Optimistic local update
    const next = [...messages, newScroll];
    setMessages(next);
    try {
      localStorage.setItem('imperial_live_scrolls', JSON.stringify(next.slice(-150)));
    } catch (e) {}

    // Transmit instantly to Cloud Firestore
    await pushLoveScrollToCloud(newScroll as FirebaseLoveScroll);
  };

  // Send regular text message
  const handleSendTextMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    if (!customText) setInputText('');
    setShowPresets(false);

    await dispatchMultimediaMessage({
      type: 'text',
      text: textToSend
    });
  };

  if (!isOpen) return null;

  // 1. Passcode Gate Screen
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020a06]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div
          className={`w-full max-w-md bg-gradient-to-b from-[#051a10] via-[#03110a] to-[#020a06] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-transform ${
            isShaking ? 'translate-x-[-10px] duration-75' : ''
          }`}
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors"
          >
            ✕
          </button>

          {/* Apothecary Emblem */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-amber-600/20 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-emerald-950/60">
              <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 border border-amber-400/40 text-amber-300 inline-block mb-2">
                The Imperial Archive
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wide">
                Demigod's Seal Required
              </h2>
              <p className="text-xs text-emerald-300/80 font-serif mt-1 max-w-xs mx-auto">
                "Enter the Demigod's Seal to unlock Lady Leslye's Correspondence."
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleUnlock} className="space-y-4 pt-2">
              <div className="relative">
                <input
                  ref={passcodeInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (passcodeError) setPasscodeError(null);
                  }}
                  placeholder="Enter sacred seal..."
                  className="w-full bg-[#020e08] border border-emerald-600/60 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-center text-white placeholder-emerald-700 outline-none transition-all shadow-inner tracking-widest font-mono"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-emerald-500 hover:text-amber-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passcodeError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-serif animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-black font-cinzel font-bold text-sm tracking-wider shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Key className="w-4 h-4" />
                <span>Break The Seal & Enter</span>
              </button>
            </form>

            <div className="pt-2">
              <span className="text-[11px] font-mono text-emerald-600">
                Hint: Sir Chif3n's immortal title
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full-Screen Imperial Archive View
  return (
    <div className="fixed inset-0 z-50 bg-[#090e0b] flex flex-col animate-in fade-in duration-300">
      {/* Top Navigation & Status Bar */}
      <header className="px-4 sm:px-6 py-3.5 bg-[#05110a] border-b border-emerald-900/80 flex items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          {/* Back to Realm Button */}
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#081f14] hover:bg-[#0c2e1e] border border-emerald-700/60 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-cinzel font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Realm</span>
          </button>

          {/* Title & Live Status */}
          <div className="hidden sm:block">
            <h1 className="font-cinzel text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>The Imperial Correspondence</span>
              <span className="text-amber-400">·</span>
              <span className="text-xs text-amber-200/90 font-serif italic font-normal">
                Multimedia Sanctum of Sir Chif3n & Lady Leslye
              </span>
            </h1>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Cloud Synchronized Pill */}
          <div className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Cloud className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wide">
              Cloud Synchronized
            </span>
          </div>

          {/* Alert Permission Button */}
          <button
            onClick={async () => {
              if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission !== 'granted') {
                  const perm = await Notification.requestPermission();
                  if (perm === 'granted') {
                    setNotificationsActive(true);
                  }
                } else {
                  setNotificationsActive(true);
                }
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              notificationsActive
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-[#04140e] border-emerald-900 text-zinc-400 hover:text-amber-300'
            }`}
            title="Enable Background Notifications"
          >
            {notificationsActive ? (
              <BellRing className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {notificationsActive ? 'Alerts Active' : 'Enable Alerts'}
            </span>
          </button>

          {/* Lock Vault Button */}
          <button
            onClick={handleLockVault}
            className="px-2.5 py-1.5 rounded-xl bg-[#04140e] border border-emerald-900 hover:border-amber-400 text-emerald-400 hover:text-amber-300 text-xs font-mono flex items-center gap-1 transition-colors"
            title="Lock Vault & Re-require Passcode"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Lock Vault</span>
          </button>
        </div>
      </header>

      {/* Role Switcher Toolbar */}
      <div className="px-4 sm:px-6 py-2 bg-[#06140d] border-b border-emerald-950 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-500">Author identity:</span>
          <button
            onClick={() => handleRoleToggle('chif3n')}
            className={`px-3 py-1 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeRole === 'chif3n'
                ? 'bg-amber-400 text-black border-amber-300 shadow-md ring-1 ring-amber-300'
                : 'bg-[#03110b] text-amber-300/70 border-emerald-900 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Sir Chif3n (Demigod) 👑</span>
          </button>
          <button
            onClick={() => handleRoleToggle('leslye')}
            className={`px-3 py-1 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeRole === 'leslye'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md ring-1 ring-emerald-300'
                : 'bg-[#03110b] text-emerald-300/70 border-emerald-900 hover:text-white'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Lady Leslye (Empress) 🌿</span>
          </button>
        </div>

        {onOpenLoginModal && (
          <button
            onClick={onOpenLoginModal}
            className="text-[11px] text-amber-300 underline font-mono hover:text-white"
          >
            Switch User
          </button>
        )}
      </div>

      {/* Messages Feed Viewport (Dark Obsidian Jade #090e0b) */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto scrollbar-thin bg-[#090e0b]">
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[11px] font-serif text-emerald-300">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Voice Notes & Photo Potions Enabled · Transmitting to Her Phone in Real-Time</span>
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderRole === activeRole;
          const isChif3n = msg.senderRole === 'chif3n';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              {/* Header Info */}
              <div className="flex items-center gap-1.5 text-xs font-mono mb-1 text-emerald-400/90 px-1">
                {isChif3n ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="font-bold">{msg.sender.split('(')[0]}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400 text-[10px]">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Bubble: Text vs Audio vs Image */}
              <div
                className={`max-w-[90%] sm:max-w-[70%] p-4 rounded-3xl text-sm sm:text-base leading-relaxed shadow-xl ${
                  isChif3n
                    ? 'bg-gradient-to-br from-[#1c1404] via-[#241a06] to-[#2f2208] border border-amber-500/50 text-amber-100 rounded-tr-none'
                    : 'bg-gradient-to-br from-[#062015] via-[#072a1b] to-[#0a3522] border border-emerald-500/50 text-emerald-100 rounded-tl-none'
                }`}
              >
                {/* 1. Voice Note Player */}
                {msg.type === 'audio' && msg.audioUrl ? (
                  <ApothecaryAudioPlayer
                    audioUrl={msg.audioUrl}
                    duration={msg.duration}
                    isChif3n={isChif3n}
                  />
                ) : null}

                {/* 2. Photo Message Card */}
                {msg.type === 'image' && msg.imageUrl ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => setZoomedImage(msg.imageUrl || null)}
                      className="rounded-2xl overflow-hidden cursor-pointer relative group border border-white/10 shadow-lg max-h-72 bg-black flex items-center justify-center"
                    >
                      <img
                        src={msg.imageUrl}
                        alt="Apothecary Photo"
                        className="w-full h-full object-cover max-h-72 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    {msg.caption && (
                      <p className="font-serif whitespace-pre-wrap text-sm">{msg.caption}</p>
                    )}
                  </div>
                ) : null}

                {/* 3. Text Message */}
                {(!msg.type || msg.type === 'text') && (
                  <p className="font-serif whitespace-pre-wrap">{msg.text}</p>
                )}

                <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-emerald-400/70 font-mono">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud Synced</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Romantic Presets Bar */}
      {showPresets && (
        <div className="p-3 bg-[#06140d] border-t border-emerald-900/60 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 shrink-0">
          {ROMANTIC_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSendTextMessage(preset)}
              className="px-3 py-1.5 rounded-xl bg-[#041a0f] hover:bg-emerald-950 text-emerald-200 border border-emerald-800 text-xs font-serif transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Recording Waveform Banner (Active while recording voice note) */}
      {isRecording && (
        <div className="p-3 bg-[#1a0808] border-t border-rose-500/60 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono text-xs text-rose-300 font-bold uppercase tracking-wider">
              Recording Voice Potion... {Math.floor(recordingSeconds / 60)}:
              {recordingSeconds % 60 < 10 ? '0' : ''}
              {recordingSeconds % 60}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelVoiceRecording}
              className="px-3 py-1.5 rounded-xl bg-[#2e0e0e] hover:bg-rose-950 text-rose-300 border border-rose-700 text-xs font-bold transition-colors"
            >
              Cancel ✖
            </button>
            <button
              onClick={sendVoiceRecording}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-cinzel text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Send Potion ✔
            </button>
          </div>
        </div>
      )}

      {/* Input & Dispatch Bar (Voice Notes, Image Sharing, & Text) */}
      <footer className="p-3 sm:p-4 bg-[#05110a] border-t border-emerald-900/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendTextMessage();
          }}
          className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-3"
        >
          {/* Presets Button */}
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="p-3 rounded-2xl bg-[#041a0f] border border-emerald-800 text-amber-400 hover:text-white transition-colors shrink-0"
            title="Romantic Decree Presets"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Hidden File Input for Image Upload */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-[#041a0f] border border-emerald-800 text-emerald-400 hover:text-white transition-colors shrink-0"
            title="Share Photo or Meme"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Voice Note Button */}
          <button
            type="button"
            onClick={isRecording ? sendVoiceRecording : startVoiceRecording}
            className={`p-3 rounded-2xl border transition-all shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-[#041a0f] border-emerald-800 text-rose-400 hover:text-white'
            }`}
            title="Record Voice Note"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Inscribe love scroll as ${activeRole === 'leslye' ? 'Lady Leslye' : 'Sir Chif3n'}...`}
            className="flex-1 bg-[#020e08] border border-emerald-800/80 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-emerald-700/80 outline-none shadow-inner"
          />

          {/* Dispatch Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-black font-cinzel font-bold text-sm disabled:opacity-40 shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all active:scale-95 shrink-0"
            title="Dispatch Love Scroll via Cloud"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Dispatch</span>
          </button>
        </form>
      </footer>

      {/* Expandable Image Zoom Lightbox Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-amber-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage}
              alt="Expanded Potion Photo"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-emerald-500/40"
            />
          </div>
        </div>
      )}
    </div>
  );
};
