import React, { useState } from 'react';
import { Play, Info, Heart, Star, Sparkles, Building, Film } from 'lucide-react';
import { AnimeItem } from '../types/anime';

interface AnimeCardProps {
  anime: AnimeItem;
  onPlay: (anime: AnimeItem) => void;
  onOpenDetails: (anime: AnimeItem) => void;
  isDateNightSaved: boolean;
  onToggleDateNight: (anime: AnimeItem) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onPlay,
  onOpenDetails,
  isDateNightSaved,
  onToggleDateNight,
}) => {
  const [imgError, setImgError] = useState(false);
  const posterUrl = anime?.images?.webp?.large_image_url || anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url;
  
  // Extract primary studio name
  const studioName = anime?.studios && anime.studios.length > 0 ? anime.studios[0].name : null;
  const ratingScore = anime?.score ? anime.score.toFixed(1) : '9.0';
  const displayYear = anime?.year || 2024;

  return (
    <div className="group relative flex flex-col bg-[#07150f]/80 border border-[#14231a] hover:border-emerald-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/50 hover:-translate-y-1">
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
        {!imgError && posterUrl ? (
          <img
            src={posterUrl}
            alt={anime?.title || 'Anime poster'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#061e15] to-[#04120d] text-center">
            <Film className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
            <p className="text-xs font-semibold text-emerald-200 line-clamp-2">{anime?.title || 'Unknown Title'}</p>
          </div>
        )}

        {/* High-Contrast Media Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40 pointer-events-none" />

        {/* Top Left: Glowing Amber Star Rating Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-bold text-amber-300 border border-amber-400/40 shadow-md">
          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
          <span className="font-mono tabular-nums">{ratingScore}</span>
        </div>

        {/* Top Right: Release Year Tag & Date Night Heart */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-mono text-emerald-300 border border-emerald-800/80">
            {displayYear}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleDateNight(anime);
            }}
            title={isDateNightSaved ? 'Saved in Date Night Queue' : 'Save for Date Night'}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
              isDateNightSaved
                ? 'bg-rose-600 text-white border-rose-400 scale-105 shadow-md shadow-rose-950/60'
                : 'bg-black/60 text-zinc-300 border-white/10 hover:text-rose-300 hover:bg-black/85'
            }`}
          >
            <Heart className={`w-3 h-3 ${isDateNightSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Demigod's Pick ❤️ Signature Tag */}
        {anime?.chif3nNote && (
          <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1 bg-gradient-to-r from-rose-950/90 to-red-950/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-rose-200 border border-rose-500/60 shadow-lg shadow-rose-950/60">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>Demigod's Pick ❤️</span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-3 px-4 bg-black/60 backdrop-blur-[2px]">
          <button
            onClick={() => onPlay(anime)}
            className="p-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-950/80 transition-transform active:scale-95"
            title="Stream Episode 1"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
          <button
            onClick={() => onOpenDetails(anime)}
            className="p-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 shadow-md transition-transform active:scale-95"
            title="View Full Details & Voice Cast"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content & Dual-Title Display */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Japanese Kanji Typography Overlay (The Reference Card Style) */}
          {anime?.title_japanese && (
            <p className="text-[11px] font-serif text-emerald-400/90 font-medium tracking-wide truncate mb-0.5">
              {anime.title_japanese}
            </p>
          )}

          {/* Localized English Title */}
          <h3
            onClick={() => onOpenDetails(anime)}
            className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer font-cinzel leading-snug"
            title={anime?.title_english || anime?.title}
          >
            {anime?.title_english || anime?.title}
          </h3>

          {/* Studio Tag & Episodes Count */}
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 mt-1.5 font-mono truncate">
            {studioName && (
              <span className="px-1.5 py-0.5 rounded bg-[#04120a] border border-emerald-900 text-emerald-300 truncate">
                {studioName}
              </span>
            )}
            <span className="text-emerald-700">·</span>
            <span>{anime?.episodes ? `${anime.episodes} eps` : 'Ongoing'}</span>
          </div>

          {/* Clean 2-Line Synopsis */}
          {anime?.synopsis && (
            <p className="text-[11px] text-emerald-300/70 line-clamp-2 mt-1.5 leading-snug">
              {anime.synopsis}
            </p>
          )}
        </div>

        {/* Quick Stream CTA */}
        <div className="pt-2 border-t border-emerald-950 flex items-center justify-between text-xs">
          <button
            onClick={() => onPlay(anime)}
            className="text-emerald-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Stream Ep 1</span>
          </button>

          <button
            onClick={() => onOpenDetails(anime)}
            className="text-[11px] text-emerald-500 hover:text-white"
          >
            Details →
          </button>
        </div>
      </div>
    </div>
  );
};
