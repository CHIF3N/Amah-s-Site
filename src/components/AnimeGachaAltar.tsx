import React, { useState } from 'react';
import {
  Sparkles,
  Dice5,
  Play,
  Heart,
  Flame,
  Star,
  RefreshCw,
  Crown,
  Leaf,
  X
} from 'lucide-react';
import { AnimeItem } from '../types/anime';
import { CURATED_ANIME } from '../data/curatedData';

interface AnimeGachaAltarProps {
  animeList: AnimeItem[];
  onPlayAnime: (anime: AnimeItem) => void;
  onToggleDateNight: (anime: AnimeItem) => void;
  isDateNightSaved: (malId: number) => boolean;
  isOpen: boolean;
  onClose: () => void;
}

const RARITY_TIERS = [
  { tier: 'SSR', label: 'Demigod Imperial Treasure', color: 'from-amber-400 via-rose-500 to-amber-300', border: 'border-amber-400', badge: 'bg-amber-400 text-black' },
  { tier: 'SR', label: 'Rare Imperial Elixir', color: 'from-emerald-400 via-teal-400 to-emerald-300', border: 'border-emerald-400', badge: 'bg-emerald-500 text-white' },
  { tier: 'R', label: 'Purifying Herbal Tonic', color: 'from-cyan-400 via-blue-500 to-teal-300', border: 'border-cyan-400', badge: 'bg-cyan-600 text-white' }
];

export const AnimeGachaAltar: React.FC<AnimeGachaAltarProps> = ({
  animeList,
  onPlayAnime,
  onToggleDateNight,
  isDateNightSaved,
  isOpen,
  onClose
}) => {
  const [isSummoning, setIsSummoning] = useState<boolean>(false);
  const [summonResult, setSummonResult] = useState<{
    anime: AnimeItem;
    tier: typeof RARITY_TIERS[0];
    demigodBlessing: string;
  } | null>(null);

  const pool = animeList && animeList.length > 0 ? animeList : CURATED_ANIME;

  const handleSummon = () => {
    setIsSummoning(true);
    setSummonResult(null);

    setTimeout(() => {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      const tierIndex = Math.random() > 0.5 ? 0 : Math.random() > 0.3 ? 1 : 2;
      const tier = RARITY_TIERS[tierIndex];

      const blessings = [
        "The imperial stars align: This series is certified 100% poison-free and filled with peak cinema!",
        "Demigod decree: An emotional rollercoaster handpicked to warm Lady Leslye's heart tonight.",
        "Maomao examined this elixir: Contains traces of supreme animation, top-tier mysteries, and zero filler!",
        "Consecrated viewing: Wrap up in a cozy blanket and let Sir Chif3n prepare the snacks."
      ];
      const demigodBlessing = blessings[Math.floor(Math.random() * blessings.length)];

      setSummonResult({ anime: picked, tier, demigodBlessing });
      setIsSummoning(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-gradient-to-br from-[#0c2016] via-[#05140e] to-[#120a10] border border-amber-400/50 p-6 sm:p-8 shadow-2xl space-y-6 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Particle/Altar decorative background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div className="flex items-center gap-2 text-left">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
              <Dice5 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-cinzel text-[10px] uppercase tracking-widest text-amber-300 font-bold block">
                Sacred Summoning Rite
              </span>
              <h3 className="font-cinzel text-lg font-bold text-white">Anime Gacha Altar</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Altar Cauldron / Summon Visual */}
        {!summonResult && (
          <div className="py-8 space-y-4">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-rose-500 opacity-30 blur-xl ${isSummoning ? 'animate-spin' : ''}`} />
              <div className="relative w-24 h-24 rounded-full bg-[#04110a] border-2 border-amber-400/70 flex items-center justify-center shadow-inner">
                <Sparkles className={`w-10 h-10 text-amber-300 ${isSummoning ? 'animate-bounce' : ''}`} />
              </div>
            </div>

            <div>
              <h4 className="font-cinzel text-base font-bold text-white">
                {isSummoning ? 'Brewing Imperial Anime Elixir...' : 'Offer a Prayer to the Altar'}
              </h4>
              <p className="text-xs text-emerald-200/80 max-w-sm mx-auto mt-1">
                {isSummoning
                  ? 'Consulting ancient celestial scrolls and testing for maximum entertainment value...'
                  : 'Can\'t decide what to watch? Let the Demigod oracle choose the perfect anime for your mood!'}
              </p>
            </div>

            <button
              onClick={handleSummon}
              disabled={isSummoning}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-amber-950/60 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
            >
              <Dice5 className={`w-4 h-4 ${isSummoning ? 'animate-spin' : ''}`} />
              <span>{isSummoning ? 'Summoning...' : 'Perform Imperial Summon (Free)'}</span>
            </button>
          </div>
        )}

        {/* Summon Result Presentation */}
        {summonResult && (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            {/* Rarity Banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 border border-amber-400/60 shadow-lg">
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${summonResult.tier.badge}`}>
                {summonResult.tier.tier}
              </span>
              <span className="text-amber-300 font-cinzel">{summonResult.tier.label}</span>
            </div>

            {/* Anime Card Preview */}
            <div className="flex gap-4 p-4 rounded-xl bg-[#030e08] border border-emerald-800 text-left">
              <div className="w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-700 shadow-md">
                <img
                  src={summonResult.anime.images?.webp?.large_image_url || summonResult.anime.images?.jpg?.large_image_url || summonResult.anime.images?.jpg?.image_url}
                  alt={summonResult.anime.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{summonResult.anime.score ? summonResult.anime.score.toFixed(1) : '9.0'}</span>
                    <span className="text-emerald-700">·</span>
                    <span>{summonResult.anime.year || 2024}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-cinzel line-clamp-1 mt-0.5">
                    {summonResult.anime.title_english || summonResult.anime.title}
                  </h4>
                  {summonResult.anime.title_japanese && (
                    <p className="text-[10px] text-emerald-400/80 font-serif line-clamp-1">
                      {summonResult.anime.title_japanese}
                    </p>
                  )}
                  <p className="text-[11px] text-emerald-300/80 line-clamp-2 mt-1">
                    {summonResult.anime.synopsis}
                  </p>
                </div>

                <p className="text-[10px] text-amber-400/90 italic mt-2 border-t border-emerald-950 pt-1">
                  "{summonResult.demigodBlessing}"
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSummon}
                className="px-3.5 py-2 rounded-xl bg-[#04140e] border border-emerald-800 hover:border-emerald-600 text-xs text-emerald-300 font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Summon Again</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleDateNight(summonResult.anime)}
                  className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1 ${
                    isDateNightSaved(summonResult.anime.mal_id)
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-[#03110b] text-emerald-300 border-emerald-800 hover:text-rose-300'
                  }`}
                  title="Save to Date Night"
                >
                  <Heart className={`w-4 h-4 ${isDateNightSaved(summonResult.anime.mal_id) ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>

                <button
                  onClick={() => {
                    onPlayAnime(summonResult.anime);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Stream Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
