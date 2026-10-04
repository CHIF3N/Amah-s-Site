import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Crown,
  Camera,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  Calendar,
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Image as ImageIcon,
  Check,
  Tag
} from 'lucide-react';
import {
  TimeLockedCapsule,
  subscribeToTimeLockedCapsules,
  saveTimeLockedCapsule
} from '../services/firebase';

interface ImperialScrapbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: 'chif3n' | 'leslye';
}

interface ScrapbookPhoto {
  id: string;
  url: string;
  caption: string;
  category: string;
  date: string;
  author: string;
}

const DEFAULT_MEMORIES: ScrapbookPhoto[] = [
  {
    id: 'mem-1',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    caption: 'Our inaugural Apothecary Diaries marathon! Testing snacks for poison 🍵✨',
    category: 'Late Night Anime',
    date: 'Autumn 2024',
    author: 'Sir Chif3n'
  },
  {
    id: 'mem-2',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    caption: 'Warm green tea and blanket burrito comfort session with my Demigod ❤️',
    category: 'Palace Date Nights',
    date: 'Winter 2024',
    author: 'Lady Leslye'
  },
  {
    id: 'mem-3',
    url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    caption: 'Tasting exotic boba and herbal potions together on a Sunday stroll 🧋',
    category: 'Sweet Concoctions',
    date: 'Spring 2025',
    author: 'Sir Chif3n'
  }
];

export const ImperialScrapbookModal: React.FC<ImperialScrapbookModalProps> = ({
  isOpen,
  onClose,
  activeRole
}) => {
  const [activeTab, setActiveTab] = useState<'scrapbook' | 'capsules' | 'seal-capsule'>('scrapbook');
  const [photos, setPhotos] = useState<ScrapbookPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('imperial_scrapbook_photos');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_MEMORIES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [capsules, setCapsules] = useState<TimeLockedCapsule[]>([]);

  // New capsule form state
  const [capsuleTitle, setCapsuleTitle] = useState('');
  const [capsuleText, setCapsuleText] = useState('');
  const [unlockDays, setUnlockDays] = useState<number>(1);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordedVoiceData, setRecordedVoiceData] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Photo upload state
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState('Palace Date Nights');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to time-locked capsules from Firestore
  useEffect(() => {
    const unsub = subscribeToTimeLockedCapsules((list) => {
      setCapsules(list);
    });
    return () => unsub();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1000;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          const newPhoto: ScrapbookPhoto = {
            id: `photo-${Date.now()}`,
            url: compressed,
            caption: newCaption.trim() || 'Precious imperial memory with my beloved ❤️',
            category: newCategory,
            date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            author: activeRole === 'chif3n' ? 'Sir Chif3n' : 'Lady Leslye'
          };
          const updated = [newPhoto, ...photos];
          setPhotos(updated);
          localStorage.setItem('imperial_scrapbook_photos', JSON.stringify(updated));
          setNewCaption('');
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Start voice recording for capsule
  const handleStartVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedVoiceData(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVoice(true);
    } catch (err) {
      console.warn('Microphone error:', err);
    }
  };

  const handleStopVoice = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  // Seal new capsule to Firestore
  const handleSealCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsuleTitle.trim()) return;

    const unlockTime = Date.now() + unlockDays * 24 * 60 * 60 * 1000;
    const authorName = activeRole === 'chif3n' ? 'Sir Chif3n 👑' : 'Lady Leslye 🌿';

    const newCapsule: TimeLockedCapsule = {
      id: `capsule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorRole: activeRole,
      authorName,
      title: capsuleTitle.trim(),
      unlockTimestamp: unlockTime,
      createdTimestamp: Date.now(),
      messageType: recordedVoiceData ? 'voice' : 'text',
      content: recordedVoiceData || capsuleText.trim() || 'A sacred imperial love decree awaiting its time.',
      sealDesign: activeRole === 'chif3n' ? 'imperial-gold' : 'jade-apothecary'
    };

    await saveTimeLockedCapsule(newCapsule);
    setCapsuleTitle('');
    setCapsuleText('');
    setRecordedVoiceData(null);
    setActiveTab('capsules');
  };

  const filteredPhotos = selectedCategory === 'All'
    ? photos
    : photos.filter((p) => p.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-[#031910] via-[#02100a] to-[#010805] border border-emerald-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#02140d] border-b border-emerald-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-400/50 flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>The Imperial Scrapbook & Time Capsules</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                  Devotion Archive
                </span>
              </h2>
              <p className="text-xs text-emerald-400/80 font-serif italic">
                Eternal Keepsakes of Sir Chif3n & Lady Leslye
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-400 hover:text-white bg-emerald-950/60 border border-emerald-900 hover:border-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-5 py-2.5 bg-[#010e08] border-b border-emerald-950 flex items-center justify-between gap-2 overflow-x-auto shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('scrapbook')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === 'scrapbook'
                  ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold shadow-sm'
                  : 'bg-transparent border-transparent text-emerald-400/70 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bamboo Photo Wall ({photos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('capsules')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === 'capsules'
                  ? 'bg-amber-600/30 border-amber-400 text-white font-bold shadow-sm'
                  : 'bg-transparent border-transparent text-emerald-400/70 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Time-Locked Capsules ({capsules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('seal-capsule')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === 'seal-capsule'
                  ? 'bg-rose-600/30 border-rose-400 text-white font-bold shadow-sm'
                  : 'bg-transparent border-transparent text-rose-400/70 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Seal New Love Capsule ⏳</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: Scrapbook Photo Wall */}
          {activeTab === 'scrapbook' && (
            <div className="space-y-6">
              
              {/* Category Filter & Add Photo Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/60">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
                  {['All', 'Palace Date Nights', 'Late Night Anime', 'Sweet Concoctions'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg border transition-all ${
                        selectedCategory === cat
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                          : 'bg-[#02100a] border-emerald-900/80 text-emerald-400/70 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Caption for new photo..."
                    className="px-3 py-1.5 rounded-xl bg-[#020e08] border border-emerald-900 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Add Memory</span>
                  </button>
                </div>
              </div>

              {/* Photo Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="p-3 bg-[#02130c] border border-emerald-800/60 rounded-2xl shadow-xl flex flex-col justify-between group hover:border-emerald-500/80 transition-all transform hover:-translate-y-0.5"
                  >
                    <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-black/40 mb-3 border border-emerald-900/60">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono text-emerald-300 border border-emerald-600/40">
                        {photo.category}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-emerald-100 font-serif leading-snug italic">
                        "{photo.caption}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400/70 pt-2 border-t border-emerald-900/60">
                        <span>{photo.author}</span>
                        <span>{photo.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Time-Locked Capsules */}
          {activeTab === 'capsules' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="font-serif">
                  Time-Locked Capsules are sealed decrees and voice memories that cannot be broken open until the designated milestone date arrives!
                </p>
              </div>

              {capsules.length === 0 ? (
                <div className="p-12 text-center text-emerald-400/60 font-serif space-y-3">
                  <p>No time capsules sealed yet.</p>
                  <button
                    onClick={() => setActiveTab('seal-capsule')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-cinzel font-bold text-xs shadow-md"
                  >
                    Seal Your First Capsule
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {capsules.map((cap) => {
                    const isUnlocked = Date.now() >= cap.unlockTimestamp;
                    const diff = Math.max(0, cap.unlockTimestamp - Date.now());
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                    return (
                      <div
                        key={cap.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-[#032014] to-[#01140c] border-emerald-400/80 shadow-xl'
                            : 'bg-[#02100a] border-amber-600/50 shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {isUnlocked ? (
                              <Unlock className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-amber-400 animate-pulse" />
                            )}
                            <h4 className="font-cinzel text-sm font-bold text-white">{cap.title}</h4>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isUnlocked
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                              : 'bg-amber-950 border-amber-500 text-amber-300'
                          }`}>
                            {isUnlocked ? 'Seal Broken ✨' : `Unlocks in ${days}d ${hours}h`}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-emerald-400/70 mb-3">
                          Sealed by {cap.authorName} on {new Date(cap.createdTimestamp).toLocaleDateString()}
                        </div>

                        {isUnlocked ? (
                          <div className="p-3 rounded-xl bg-black/40 border border-emerald-700/50 text-xs">
                            {cap.messageType === 'voice' ? (
                              <div className="space-y-2">
                                <span className="text-[10px] font-mono text-emerald-400">🎙️ Unlocked Voice Note:</span>
                                <audio controls src={cap.content} className="w-full h-8" />
                              </div>
                            ) : (
                              <p className="font-serif italic text-emerald-100 leading-relaxed">
                                "{cap.content}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-black/60 border border-amber-800/40 text-center space-y-2">
                            <span className="text-2xl">🔒</span>
                            <p className="text-xs font-serif text-amber-200/90 italic">
                              "Sealed by Imperial Decree. Breaking this seal before {new Date(cap.unlockTimestamp).toLocaleDateString()} is strictly forbidden!"
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Seal New Capsule */}
          {activeTab === 'seal-capsule' && (
            <form onSubmit={handleSealCapsule} className="max-w-xl mx-auto space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-cinzel text-base font-bold text-white">
                  Seal a Milestone Love Capsule ⏳
                </h3>
                <p className="text-xs text-emerald-300/80 font-serif">
                  Write a secret decree or record your voice. It will remain locked away until your chosen date.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-emerald-400 mb-1">
                  Capsule Title:
                </label>
                <input
                  type="text"
                  required
                  value={capsuleTitle}
                  onChange={(e) => setCapsuleTitle(e.target.value)}
                  placeholder="e.g. For our next anniversary / Open on our next movie night!"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#020e08] border border-emerald-900 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-amber-400 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-emerald-400 mb-1">
                  Unlock Schedule:
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  {[
                    { label: 'Tomorrow', days: 1 },
                    { label: '3 Days', days: 3 },
                    { label: '1 Week', days: 7 },
                    { label: '1 Month', days: 30 }
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.days}
                      onClick={() => setUnlockDays(preset.days)}
                      className={`p-2 rounded-xl border transition-all ${
                        unlockDays === preset.days
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-[#02100a] border-emerald-950 text-emerald-400/80 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-emerald-400 mb-1">
                  Secret Love Decree (Text):
                </label>
                <textarea
                  rows={3}
                  value={capsuleText}
                  onChange={(e) => setCapsuleText(e.target.value)}
                  placeholder="Pour your heart into this secret decree..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#020e08] border border-emerald-900 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-amber-400 font-serif"
                />
              </div>

              {/* Optional Voice Capsule Note */}
              <div className="p-3.5 rounded-xl bg-[#02120a] border border-emerald-900/80 space-y-2">
                <span className="text-xs font-mono text-amber-300 block">
                  Optional: Record a Voice Capsule 🎙️
                </span>

                <div className="flex items-center gap-3">
                  {!isRecordingVoice ? (
                    <button
                      type="button"
                      onClick={handleStartVoice}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/30 border border-rose-500 text-rose-300 text-xs font-mono flex items-center gap-1.5 hover:bg-rose-600/40"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{recordedVoiceData ? 'Re-record Voice Note' : 'Record Voice Decree'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopVoice}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-mono flex items-center gap-1.5 animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {recordedVoiceData && (
                    <span className="text-xs text-emerald-300 font-mono flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Voice Note Ready
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-black font-cinzel font-bold text-xs tracking-wider shadow-lg active:scale-98"
              >
                Seal with Imperial Wax & Gold ✨
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
