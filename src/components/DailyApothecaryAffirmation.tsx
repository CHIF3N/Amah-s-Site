import React, { useState, useMemo } from 'react';
import { Sparkles, Leaf, Heart, RefreshCw, Quote, Shield } from 'lucide-react';

export const APOTHECARY_AFFIRMATIONS = [
  {
    quote: "Even the deadliest poison in the imperial palace yields to the right remedy; take today one breath at a time, my love. 🌿",
    herb: "Sweet Mountain Angelica & Licorice",
    temperament: "Tranquility & Peace",
    decree: "Imperial Rear Palace Decree #104"
  },
  {
    quote: "Curiosity is your superpower. Walk softly, but fear no shadow today. ✨",
    herb: "Dried Star Jasmine & Silver Needle Tea",
    temperament: "Wisdom & Insight",
    decree: "Imperial Rear Palace Decree #217"
  },
  {
    quote: "No palace intrigue or worldly noise can diminish what your Demigod sees in you daily. ❤️",
    herb: "Crushed Rose Quartz & Imperial Lotus",
    temperament: "Demigod Devotion",
    decree: "Demigod Sanctuary Decree #001"
  },
  {
    quote: "Like rare medicinal herbs, the most exquisite souls take patience to bloom. Rest your eyes when needed.",
    herb: "Wild Ginseng & Steamed Chrysanthemum",
    temperament: "Patience & Healing",
    decree: "Imperial Rear Palace Decree #342"
  },
  {
    quote: "Testing for poison is basic court hygiene—but testing my love for you reveals 100% purity with zero toxins. 🧪",
    herb: "Wolfberry & Red Date Elixir",
    temperament: "Affection & Protection",
    decree: "Imperial Rear Palace Decree #411"
  },
  {
    quote: "Whenever mortal life feels bitter, remember that bitter medicines precede the most radiant strength. You are cherished.",
    herb: "Roasted Barley & Honeycomb",
    temperament: "Courage & Warmth",
    decree: "Demigod Sanctuary Decree #777"
  },
  {
    quote: "Like Maomao deciphering court conspiracies, you solve every challenge with effortless elegance and quiet brilliance.",
    herb: "Peppermint & Snow Lotus",
    temperament: "Intellect & Grace",
    decree: "Imperial Rear Palace Decree #520"
  }
];

export const DailyApothecaryAffirmation: React.FC = () => {
  // Deterministic daily index based on date string
  const deterministicDailyIndex = useMemo(() => {
    const todayStr = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % APOTHECARY_AFFIRMATIONS.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(deterministicDailyIndex);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);

  const activeAffirmation = APOTHECARY_AFFIRMATIONS[currentIndex];

  const handleBrewAnother = () => {
    setIsBrewing(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % APOTHECARY_AFFIRMATIONS.length);
      setIsBrewing(false);
    }, 300);
  };

  return (
    <div className="relative rounded-2xl p-5 sm:p-6 overflow-hidden bg-gradient-to-r from-[#061e14] via-[#05160f] to-[#0a2318] border border-emerald-500/40 shadow-xl transition-all">
      {/* Subtle antique watermark */}
      <div className="absolute top-2 right-4 opacity-10 pointer-events-none">
        <Quote className="w-24 h-24 text-emerald-400" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-cinzel text-[10px] font-bold text-amber-300 uppercase tracking-widest px-2 py-0.5 rounded bg-black/50 border border-amber-500/40">
              📜 Daily Apothecary Affirmation
            </span>
            <span className="text-emerald-700">·</span>
            <span className="text-[11px] text-emerald-400 font-mono">
              Herb: {activeAffirmation.herb}
            </span>
            <span className="text-emerald-700 hidden sm:inline">·</span>
            <span className="text-[11px] text-amber-400/80 italic hidden sm:inline">
              {activeAffirmation.temperament}
            </span>
          </div>

          <p className="font-serif text-sm sm:text-base text-emerald-50 font-normal leading-relaxed italic tracking-wide">
            "{activeAffirmation.quote}"
          </p>

          <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono pt-0.5">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Dedicated by Sir Chif3n for Lady Leslye · {activeAffirmation.decree}</span>
          </div>
        </div>

        {/* Brew Another Refresh Pill */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={handleBrewAnother}
            disabled={isBrewing}
            className="px-3.5 py-2 rounded-xl bg-[#03110b] hover:bg-emerald-950/90 text-amber-300 border border-amber-500/40 text-xs font-medium transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
            title="Cycle to another medicinal quote"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isBrewing ? 'animate-spin' : ''}`} />
            <span>🧪 Brew Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};
