import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Smile, Check, Leaf } from 'lucide-react';
import { MoodHerbStatus, subscribeToMoodHerbStatus, updateMoodHerbStatus } from '../services/firebase';

interface MoodHerbPillProps {
  currentRole: 'chif3n' | 'leslye';
}

const IMPERIAL_MOODS = [
  { id: 'serene', emoji: '🌿', label: 'Serene & Peaceful', desc: 'Good herbal tea brewing, calm and happy' },
  { id: 'cuddles', emoji: '🍵', label: 'Craving Anime & Cuddles', desc: 'Ready for date night and demigod warmth' },
  { id: 'maomao', emoji: '🧪', label: 'Maomao Research Mode', desc: 'Hyperfocused, analyzing potions and mysteries' },
  { id: 'sleepy', emoji: '😴', label: 'Drowsy / Needs Pampering', desc: 'Sleepy empress needing gentle care' },
  { id: 'euphoric', emoji: '🌸', label: 'Euphoric & Loving', desc: 'Heart fluttering, feeling celestial devotion' },
  { id: 'guarded', emoji: '⚔️', label: 'Tired / Demigod Protect Me', desc: 'Exhausted by court duties, wrap me in blankets' },
];

export const MoodHerbPill: React.FC<MoodHerbPillProps> = ({ currentRole }) => {
  const [currentStatus, setCurrentStatus] = useState<MoodHerbStatus>({
    moodId: 'serene',
    emoji: '🌿',
    label: 'Serene & Peaceful',
    updatedBy: 'leslye',
    lastUpdated: Date.now()
  });

  const [isOpen, setIsOpen] = useState(false);
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    const unsub = subscribeToMoodHerbStatus((status) => {
      if (status && status.moodId) {
        setCurrentStatus(status);
      }
    });
    return () => unsub();
  }, []);

  const handleSelectMood = async (m: typeof IMPERIAL_MOODS[0]) => {
    const updated: MoodHerbStatus = {
      moodId: m.id,
      emoji: m.emoji,
      label: m.label,
      note: customNote.trim() || undefined,
      updatedBy: currentRole,
      lastUpdated: Date.now()
    };
    setCurrentStatus(updated);
    await updateMoodHerbStatus(updated);
    setIsOpen(false);
  };

  const partnerRole = currentRole === 'chif3n' ? 'leslye' : 'chif3n';
  const isPartnerStatus = currentStatus.updatedBy === partnerRole;
  const displayName = currentStatus.updatedBy === 'leslye' ? 'Lady Leslye' : 'Sir Chif3n';

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-[#03150d] via-[#042014] to-[#02130c] hover:border-emerald-400/80 text-emerald-200 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95 group"
        title="Imperial Mood Herb — Tap to set your mood or see your partner's status"
      >
        <span className="text-sm group-hover:scale-110 transition-transform">{currentStatus.emoji}</span>
        <div className="hidden lg:flex items-center gap-1">
          <span className="text-[10px] text-amber-300 font-bold uppercase">{displayName}:</span>
          <span className="text-emerald-300 truncate max-w-[130px]">{currentStatus.label}</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto z-50 w-72 sm:w-80 rounded-2xl bg-[#03140d]/95 backdrop-blur-xl border border-emerald-500/60 p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 text-white">
          <div className="flex items-center justify-between pb-2.5 border-b border-emerald-900/60 mb-3">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <h4 className="font-cinzel text-xs font-bold text-emerald-100">Imperial Mood Herbs</h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/70">Syncs worldwide</span>
          </div>

          <p className="text-[11px] text-emerald-300/80 mb-3 font-serif">
            Select your current disposition so your beloved knows how to tend to your spirit:
          </p>

          <div className="space-y-1.5 mb-3">
            {IMPERIAL_MOODS.map((m) => {
              const isSelected = currentStatus.moodId === m.id && currentStatus.updatedBy === currentRole;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMood(m)}
                  className={`w-full text-left p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold'
                      : 'bg-[#020e09] border-emerald-900/60 hover:border-emerald-600 text-emerald-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{m.emoji}</span>
                    <div className="min-w-0">
                      <span className="block truncate font-medium">{m.label}</span>
                      <span className="block text-[10px] text-emerald-400/70 truncate font-serif italic">
                        {m.desc}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          {currentStatus.note && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-amber-200 italic mb-2">
              "{currentStatus.note}" — {displayName}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
