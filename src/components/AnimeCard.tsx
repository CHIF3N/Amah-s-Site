import React, { useState } from 'react';
import { Play, Info, Heart, Star, Sparkles, Leaf } from 'lucide-react';
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
  const posterUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  const isRecent = anime.year && anime.year >= 2023;

  return (
    <div className="group relative flex flex-col bg-[#071711]/60 border border-emerald-900/40 rounded-xl overflow-hidden hover:border-emerald-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/40">
      
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
        {!imgError && posterUrl ? (
          <img
            src={posterUrl}
            alt={anime.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#061e15] to-[#04120d] text-center">
            <Leaf className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
            <p className="text-xs font-semibold text-emerald-200 line-clamp-2">{anime.title}</p>
          </div>
        )}

        {/* Contrast Scrim for Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

        {/* Demigod Recommendation Crown / Herb Indicator (Top Left) */}
        {anime.chif3nNote && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-medium text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Maomao Pick</span>
          </div>
        )}

        {/* Date Night Heart Action (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDateNight(anime);
          }}
          title={isDateNightSaved ? 'Saved in Date Night Queue' : 'Save for Date Night'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md border transition-all ${
            isDateNightSaved
              ? 'bg-rose-600/90 text-white border-rose-400 scale-105 shadow-md'
              : 'bg-black/50 text-zinc-300 border-white/10 hover:text-rose-300 hover:bg-black/80'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isDateNightSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Center Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-2.5 px-4 bg-black/50 backdrop-blur-[2px]">
          <button
            onClick={() => onPlay(anime)}
            className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-950/60 transition-transform active:scale-95"
            title="Stream Episode 1"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
          <button
            onClick={() => onOpenDetails(anime)}
            className="p-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 shadow-md transition-transform active:scale-95"
            title="View Synopsis & Imperial Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content & Zero-Pill Unboxed Metadata */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata line with typographic separators (anti-slop: NO pills!) */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80 mb-1">
            {anime.score && (
              <span className="flex items-center gap-0.5 text-amber-300 font-medium">
                <Star className="w-3 h-3 fill-amber-300" />
                <span className="tabular-nums">{anime.score.toFixed(1)}</span>
              </span>
            )}
            {anime.score && <span aria-hidden="true" className="text-emerald-800">·</span>}
            <span className="tabular-nums font-mono text-emerald-200/90">
              {anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}
            </span>
            {anime.year && (
              <>
                <span aria-hidden="true" className="text-emerald-800">·</span>
                <span className={isRecent ? 'text-amber-300 font-semibold' : 'text-emerald-400/80'}>
                  {anime.year}
                </span>
              </>
            )}
          </div>

          <h3
            onClick={() => onOpenDetails(anime)}
            className="text-sm font-medium text-emerald-50 group-hover:text-emerald-300 transition-colors line-clamp-1 cursor-pointer"
            title={anime.title_english || anime.title}
          >
            {anime.title_english || anime.title}
          </h3>

          {/* Quiet genre tags without pill boxes */}
          {anime.genres && anime.genres.length > 0 && (
            <p className="text-[11px] text-emerald-400/70 truncate mt-0.5">
              {anime.genres.slice(0, 2).map((g) => g.name).join(' · ')}
            </p>
          )}
        </div>

        {/* Quick action footer */}
        <div className="mt-2.5 pt-2 border-t border-emerald-900/50 flex items-center justify-between text-xs">
          <button
            onClick={() => onPlay(anime)}
            className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Stream</span>
          </button>
          <button
            onClick={() => onOpenDetails(anime)}
            className="text-emerald-400/70 hover:text-emerald-200 transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
