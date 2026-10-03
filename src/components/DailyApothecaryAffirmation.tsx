import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Leaf, Heart, RefreshCw, Quote, Shield, Copy, Check, Wand2, FlaskConical, Download, Image as ImageIcon } from 'lucide-react';
import { generateAndDownloadQuoteImage } from '../utils/quoteImageGenerator';

export interface ApothecaryAffirmation {
  quote: string;
  herb: string;
  temperament: string;
  decree: string;
  source?: string;
  aiNote?: string;
}

export const BASE_APOTHECARY_AFFIRMATIONS: ApothecaryAffirmation[] = [
  {
    quote: "Even the deadliest poison in the imperial palace yields to the right remedy; take today one breath at a time, my sweet Leslye. 🌿",
    herb: "Sweet Mountain Angelica & Licorice Root",
    temperament: "Tranquility & Peace",
    decree: "Imperial Rear Palace Decree #104",
    source: "Demigod Codex"
  },
  {
    quote: "Curiosity is your superpower. Walk softly, uncover every imperial secret, but fear no shadow today. ✨",
    herb: "Dried Star Jasmine & Silver Needle Tea",
    temperament: "Wisdom & Insight",
    decree: "Imperial Rear Palace Decree #217",
    source: "Maomao Herbal Ledger"
  },
  {
    quote: "No palace intrigue, worldly noise, or mortal stress can diminish what your Demigod sees in you daily. ❤️",
    herb: "Crushed Rose Quartz & Imperial Lotus",
    temperament: "Demigod Devotion",
    decree: "Demigod Sanctuary Decree #001",
    source: "Sir Chif3n's Vow"
  },
  {
    quote: "Like rare medicinal herbs found on misty peaks, the most exquisite souls take patience to bloom. Rest your eyes when needed.",
    herb: "Wild Ginseng & Steamed Chrysanthemum",
    temperament: "Patience & Healing",
    decree: "Imperial Rear Palace Decree #342",
    source: "Apothecary Archives"
  },
  {
    quote: "Testing for poison is basic court hygiene—testing my love for you reveals 100% purity with zero toxins. 🧪",
    herb: "Wolfberry & Red Date Elixir",
    temperament: "Affection & Protection",
    decree: "Imperial Rear Palace Decree #411",
    source: "Royal Banquet Test"
  },
  {
    quote: "Whenever mortal life feels bitter, remember that bitter medicines precede the most radiant strength. You are cherished.",
    herb: "Roasted Barley & Honeycomb",
    temperament: "Courage & Warmth",
    decree: "Demigod Sanctuary Decree #777",
    source: "Sir Chif3n's Vow"
  },
  {
    quote: "Like Maomao deciphering court conspiracies, you solve every challenge with effortless elegance and quiet brilliance.",
    herb: "Peppermint & Snow Lotus",
    temperament: "Intellect & Grace",
    decree: "Imperial Rear Palace Decree #520",
    source: "Maomao Herbal Ledger"
  },
  {
    quote: "If the rear palace banquet grows tiresome, remember we have our private anime sanctuary and endless snacks waiting. 🍵",
    herb: "Honeyed Osmanthus & Roasted Oolong",
    temperament: "Imperial Sanctuary",
    decree: "Demigod Sanctuary Decree #888",
    source: "Sir Chif3n's Vow"
  },
  {
    quote: "Your brilliant smile possesses stronger medicinal potency than thousand-year-old wild snow lotus. One smile cures all weary thoughts.",
    herb: "Crushed Amber Pine & Royal Flute Root",
    temperament: "Celestial Vitality",
    decree: "Imperial Rear Palace Decree #612",
    source: "Imperial Physician Records"
  },
  {
    quote: "Never apologize for observing what others are blind to. Your sharp eyes and tender heart make you irreplaceable.",
    herb: "Dragon-scale Jade Licorice & White Peony",
    temperament: "Clarity & Dignity",
    decree: "Maomao Herbal Ledger #333",
    source: "Maomao Herbal Ledger"
  }
];

const PROCEDURAL_HERBS = [
  "Mountain Angelica & Golden Licorice",
  "Dried Star Jasmine & Silver Needle",
  "Crushed Rose Quartz & Imperial Lotus",
  "Wild Ginseng & Snow Chrysanthemum",
  "Honeyed Wolfberry & Red Date Elixir",
  "Glacial Snow Lotus & Peppermint Dew",
  "Ox-Bezoar & Steamed Agarwood",
  "Golden Osmanthus & Dragon Well Tea",
  "Crimson Camellia & Celestial Pearl",
  "Amber Pine Resin & Roasted Barley"
];

const PROCEDURAL_TEMPERAMENTS = [
  "Tranquility & Peace",
  "Demigod Devotion ❤️",
  "Poison Immunity & Health 🧪",
  "Courtly Wisdom & Insight",
  "Intellectual Radiance",
  "Boundless Affection & Warmth",
  "Restful Slumber & Sweet Dreams"
];

const PROCEDURAL_PHRASES = [
  "Take today one gentle breath at a time; no imperial decree is more urgent than your well-being.",
  "Your Demigod watches over your peace. Let every anxiety dissolve like salt in boiling herbal tea.",
  "Your quiet brilliance outshines every jewel in the emperor's pavilion.",
  "Rest your eyes and drink warm water. Even the greatest court apothecary pauses between decoctions.",
  "Whatever challenges arise today, remember you possess the intellect of Maomao and the devotion of a demigod.",
  "Your happiness is the true north of this entire sanctuary. Be proud of who you are.",
  "Like celestial jade, your worth is innate and untouched by the chaotic mortal world.",
  "Every second you exist makes this world softer, brighter, and infinitely more beautiful to me."
];

export const DailyApothecaryAffirmation: React.FC = () => {
  const [affirmation, setAffirmation] = useState<ApothecaryAffirmation>(() => {
    const todayIndex = Math.abs(new Date().getDate() * 7) % BASE_APOTHECARY_AFFIRMATIONS.length;
    return BASE_APOTHECARY_AFFIRMATIONS[todayIndex];
  });

  const [brewCount, setBrewCount] = useState<number>(1);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [sparkleActive, setSparkleActive] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<'all' | 'love' | 'wisdom' | 'health'>('all');

  const handleDownloadImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await generateAndDownloadQuoteImage({
        quote: affirmation.quote,
        herb: affirmation.herb,
        temperament: affirmation.temperament,
        decree: affirmation.decree,
        source: affirmation.source || "Sir Chif3n's Vow for Lady Leslye",
        theme: activeTheme === 'love' ? 'rose-romance' : 'imperial-jade'
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to generate quote image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Play mystical bubbling & crystal chime Web Audio sound
  const playPotionChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();

      // Bubble 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(320 + Math.random() * 80, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(580 + Math.random() * 120, ctx.currentTime + 0.15);
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.18);

      // Chime 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880 + Math.random() * 100, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.05, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  };

  // Generate an instant procedural affirmation locally (0ms latency)
  const generateInstantAffirmation = (theme: string): ApothecaryAffirmation => {
    const randomHerb = PROCEDURAL_HERBS[Math.floor(Math.random() * PROCEDURAL_HERBS.length)];
    const randomTemp = PROCEDURAL_TEMPERAMENTS[Math.floor(Math.random() * PROCEDURAL_TEMPERAMENTS.length)];
    const randomPhrase = PROCEDURAL_PHRASES[Math.floor(Math.random() * PROCEDURAL_PHRASES.length)];
    const decreeNum = Math.floor(100 + Math.random() * 899);

    let prefix = "Imperial Decree: ";
    if (theme === 'love') prefix = "Demigod's Whisper: ";
    if (theme === 'health') prefix = "Apothecary Remedy: ";

    return {
      quote: `${prefix}${randomPhrase}`,
      herb: randomHerb,
      temperament: randomTemp,
      decree: `Imperial Decree #${decreeNum}`,
      source: 'Imperial Oracle ∞'
    };
  };

  // Infinite Brew: Generates a brand new quote on every single click
  const handleInfiniteBrew = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsBrewing(true);
    setSparkleActive(true);
    playPotionChime();
    setBrewCount((prev) => prev + 1);

    // Instantly generate procedural so click has zero delay
    const instant = generateInstantAffirmation(activeTheme);
    setAffirmation(instant);

    // Try fetching a bespoke AI generated quote from the server
    try {
      const res = await fetch('/api/affirmations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: activeTheme === 'love' ? 'deeply romantic and devoted' : 'encouraging, witty and apothecary-themed',
          theme: activeTheme
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.affirmation && json.affirmation.quote) {
          setAffirmation({
            quote: json.affirmation.quote,
            herb: json.affirmation.herb,
            temperament: json.affirmation.temperament,
            decree: json.affirmation.decree,
            source: json.source === 'gemini-3.8-flash' ? '✨ Imperial AI Oracle' : '🌿 Imperial Crucible',
            aiNote: json.affirmation.aiNote
          });
        }
      }
    } catch (err) {
      // Fallback already rendered!
    } finally {
      setIsBrewing(false);
      setTimeout(() => setSparkleActive(false), 800);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(`"${affirmation.quote}" — ${affirmation.herb} (${affirmation.decree})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div
      onClick={() => handleInfiniteBrew()}
      className={`group relative rounded-2xl p-5 sm:p-6 overflow-hidden bg-gradient-to-r from-[#061e14] via-[#05160f] to-[#0a2318] border border-emerald-500/40 hover:border-amber-400/60 shadow-xl transition-all cursor-pointer select-none ${
        sparkleActive ? 'ring-2 ring-amber-400/60 scale-[1.005]' : ''
      }`}
      title="Click anywhere on the card to brew an infinite AI apothecary quote!"
    >
      {/* Subtle antique watermark */}
      <div className="absolute top-2 right-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        <Quote className="w-24 h-24 text-emerald-400" />
      </div>

      {/* Floating Sparkle Particles */}
      {sparkleActive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full bg-amber-400/5 animate-pulse" />
        </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5 max-w-3xl">
          {/* Header Row: Badges, Counter, Herb Info */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-cinzel text-[10px] font-bold text-amber-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/60 border border-amber-500/50 shadow-sm flex items-center gap-1.5">
              <FlaskConical className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Imperial Oracle · Brew #{brewCount}</span>
              <span className="text-amber-400 font-bold">∞</span>
            </span>

            <span className="text-emerald-700">·</span>

            <span className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span>Herb: {affirmation.herb}</span>
            </span>

            <span className="text-emerald-700 hidden sm:inline">·</span>

            <span className="text-[11px] text-amber-300/90 italic hidden sm:inline font-serif">
              {affirmation.temperament}
            </span>

            {affirmation.source && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-mono">
                {affirmation.source}
              </span>
            )}
          </div>

          {/* Main Affirmation Quote */}
          <p className="font-serif text-sm sm:text-base md:text-lg text-emerald-50 font-normal leading-relaxed italic tracking-wide group-hover:text-amber-100 transition-colors">
            "{affirmation.quote}"
          </p>

          {/* Subtext and AI whisper */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] text-emerald-400/90 font-mono pt-1">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Dedicated by Sir Chif3n for Lady Leslye · {affirmation.decree}</span>
            </div>

            <span className="text-amber-300/80 italic font-sans text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Tap anywhere to spawn infinite wisdom!</span>
            </span>
          </div>
        </div>

        {/* Action Controls & Brew Button */}
        <div className="shrink-0 flex items-center gap-2 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
          {/* Download Quote as Image Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="px-3 py-2 rounded-xl bg-[#03110b] hover:bg-emerald-950 text-amber-300 border border-amber-500/50 hover:border-amber-400 text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
            title="Download this quote as a luxury imperial keepsake image"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-cinzel font-bold text-emerald-400">Saved PNG!</span>
              </>
            ) : (
              <>
                <Download className={`w-3.5 h-3.5 text-amber-400 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span className="text-[11px] font-cinzel font-bold hidden sm:inline">Save as Image</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#03110b] hover:bg-emerald-950 text-emerald-300 border border-emerald-800/80 hover:border-emerald-600 text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
            title="Copy this affirmation to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Copied</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          {/* Brew Infinite Quote Button */}
          <button
            onClick={handleInfiniteBrew}
            disabled={isBrewing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-950 via-[#03110b] to-amber-950/80 hover:from-emerald-900 hover:to-amber-900 text-amber-300 border border-amber-500/50 hover:border-amber-400 text-xs font-semibold transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-60"
            title="Spawns a brand new AI / procedural quote infinitely!"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isBrewing ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
            <span className="font-cinzel tracking-wider">🧪 Brew Another (∞)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
