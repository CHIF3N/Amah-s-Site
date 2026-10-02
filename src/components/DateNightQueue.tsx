import React, { useState } from 'react';
import { Heart, Play, Trash2, CheckCircle2, Star, Sparkles, MessageCircleHeart, Leaf } from 'lucide-react';
import { DateNightItem } from '../types/anime';

interface DateNightQueueProps {
  items: DateNightItem[];
  onPlayAnime: (malId: number, title: string) => void;
  onRemoveItem: (malId: number) => void;
  onToggleWatched: (malId: number) => void;
  onUpdateComment: (malId: number, comment: string) => void;
  onUpdateRating: (malId: number, rating: number) => void;
  onExploreCatalog: () => void;
}

export const DateNightQueue: React.FC<DateNightQueueProps> = ({
  items,
  onPlayAnime,
  onRemoveItem,
  onToggleWatched,
  onUpdateComment,
  onUpdateRating,
  onExploreCatalog,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempComment, setTempComment] = useState<string>('');

  const watchedCount = items.filter((i) => i.watched).length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Date Night Header Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-[#06241a] via-[#04150f] to-[#0d2a1f] border border-emerald-500/30 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-cinzel text-xs uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lady Leslye & Sir Chif3n's Inner Palace Sanctuary</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel">Date Night Watchlist & Elixir Log</h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-xl">
              Consecrated anime series for our cozy evenings: blanket burrito, sweet lotus snacks, and undivided affection.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-[#03110b] border border-emerald-800/80 text-center">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Completed</span>
              <span className="font-mono text-sm font-semibold text-amber-300 tabular-nums">
                {watchedCount} / {items.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Queue items */}
      {items.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl border border-emerald-900/50 bg-[#061710]/40">
          <Heart className="w-12 h-12 text-emerald-700 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-base font-semibold text-emerald-100">The Date Night Queue is Empty</h3>
          <p className="text-xs text-emerald-300/70 max-w-sm mx-auto mt-1 mb-5">
            Click the heart icon on any anime card in the recent catalog to add it to your couple watchlist.
          </p>
          <button
            onClick={onExploreCatalog}
            className="px-5 py-2 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
          >
            Explore Recent Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.malId}
              className={`p-4 rounded-xl border transition-all ${
                item.watched
                  ? 'bg-[#030e09]/50 border-emerald-900/40 opacity-80'
                  : 'bg-[#061710]/70 border-emerald-900/60 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex gap-3.5">
                {/* Poster */}
                <div className="w-16 h-22 rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.malId)}
                      className="text-emerald-500/60 hover:text-rose-400 transition-colors p-1"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => onUpdateRating(item.malId, star)}
                        title={`Rate ${star} stars`}
                        className="p-0.5 text-zinc-600 hover:text-amber-300 transition-colors"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            (item.ourRating || 0) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[11px] text-amber-300/80 ml-1.5 font-medium">
                      {item.ourRating ? `${item.ourRating}/5 Stars` : 'Rate together'}
                    </span>
                  </div>

                  {/* Actions & Watched Toggle */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleWatched(item.malId)}
                      className={`text-xs flex items-center gap-1.5 transition-colors ${
                        item.watched
                          ? 'text-emerald-400 hover:text-emerald-300 font-medium'
                          : 'text-emerald-400/70 hover:text-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.watched ? 'Watched with Chif3n' : 'Mark Watched'}</span>
                    </button>

                    <button
                      onClick={() => onPlayAnime(item.malId, item.title)}
                      className="px-3 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-emerald-300" />
                      <span>Stream</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Couple Memory / Comment */}
              <div className="mt-3 pt-2.5 border-t border-emerald-900/60">
                {editingId === item.malId ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempComment}
                      onChange={(e) => setTempComment(e.target.value)}
                      placeholder="Add a sweet memory or note..."
                      className="flex-1 bg-[#040e0a] border border-emerald-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={() => {
                        onUpdateComment(item.malId, tempComment);
                        setEditingId(null);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setEditingId(item.malId);
                      setTempComment(item.coupleComment || '');
                    }}
                    className="flex items-center justify-between text-xs text-emerald-300/80 hover:text-emerald-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <MessageCircleHeart className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span className="italic truncate">
                        {item.coupleComment || 'Click to write a couple memory...'}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 shrink-0">Edit</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
