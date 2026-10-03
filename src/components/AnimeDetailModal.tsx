import React, { useState } from 'react';
import { X, Play, Heart, Star, Film, Sparkles, Calendar, BookOpen, Leaf, Mic2, Users } from 'lucide-react';
import { AnimeItem } from '../types/anime';

interface AnimeDetailModalProps {
  anime: AnimeItem | null;
  onClose: () => void;
  onPlay: (anime: AnimeItem) => void;
  isDateNightSaved: boolean;
  onToggleDateNight: (anime: AnimeItem) => void;
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({
  anime,
  onClose,
  onPlay,
  isDateNightSaved,
  onToggleDateNight,
}) => {
  const [showFullSynopsis, setShowFullSynopsis] = useState<boolean>(false);

  if (!anime) return null;

  const poster = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  // Curated voice actor mappings for top shows
  const voiceCast: Record<string, Array<{ role: string; actor: string; romaji: string }>> = {
    'The Apothecary Diaries': [
      { role: 'Maomao (猫猫)', actor: 'Aoi Yuuki', romaji: '悠木 碧' },
      { role: 'Jinshi (壬氏)', actor: 'Takeo Otsuka', romaji: '大塚 剛央' },
      { role: 'Gaoshun (高順)', actor: 'Katsuyuki Konishi', romaji: '小西 克幸' },
      { role: 'Lady Gyokuyou (玉葉妃)', actor: 'Atsumi Tanezaki', romaji: '種﨑 敦美' }
    ],
    "Frieren: Beyond Journey's End": [
      { role: 'Frieren (フリーレン)', actor: 'Atsumi Tanezaki', romaji: '種﨑 敦美' },
      { role: 'Fern (フェルン)', actor: 'Kana Ichinose', romaji: '市ノ瀬 加那' },
      { role: 'Stark (シュタルク)', actor: 'Chiaki Kobayashi', romaji: '小林 千晃' },
      { role: 'Himmel (ヒンメル)', actor: 'Nobuhiko Okamoto', romaji: '岡本 信彦' }
    ],
    'Dan Da Dan': [
      { role: 'Momo Ayase (綾瀬桃)', actor: 'Shion Wakayama', romaji: '若山 詩音' },
      { role: 'Ken "Okarun" Takakura', actor: 'Natsuki Hanae', romaji: '花江 夏樹' },
      { role: 'Turbo Granny (ターボババア)', actor: 'Mayumi Tanaka', romaji: '田中 真弓' }
    ],
    'Solo Leveling': [
      { role: 'Sung Jinwoo (水篠旬)', actor: 'Taito Ban', romaji: '坂 泰斗' },
      { role: 'Cha Hae-In (向坂雫)', actor: 'Reina Ueda', romaji: '上田 麗奈' },
      { role: 'Go Gunhee (後藤清臣)', actor: 'Banjou Ginga', romaji: '銀河 万丈' }
    ]
  };

  const defaultCast = [
    { role: 'Lead Protagonist', actor: 'Elite Cast Ensemble', romaji: '主演声優' },
    { role: 'Supporting Companion', actor: 'Acclaimed Voice Artist', romaji: '助演声優' }
  ];

  const matchedCast = Object.entries(voiceCast).find(([title]) =>
    anime.title?.toLowerCase().includes(title.toLowerCase()) ||
    (anime.title_english && anime.title_english.toLowerCase().includes(title.toLowerCase()))
  )?.[1] || defaultCast;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#06150f] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-emerald-200 hover:text-white hover:bg-black/90 border border-emerald-500/30 transition-colors"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header with Backdrop / Cover */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-black">
          {poster && (
            <img
              src={poster}
              alt=""
              className="w-full h-full object-cover blur-md scale-110 opacity-35"
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06150f] via-[#06150f]/60 to-transparent" />

          {/* Quick Header Overlay */}
          <div className="absolute bottom-4 left-4 right-16 flex items-end gap-4">
            <div className="w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden border border-emerald-700/80 shadow-xl shrink-0 bg-black hidden xs:block">
              {poster && <img src={poster} alt={anime.title} className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight font-cinzel">
                {anime.title_english || anime.title}
              </h2>
              {anime.title_japanese && (
                <p className="text-xs text-emerald-300 font-serif mt-0.5 truncate">{anime.title_japanese}</p>
              )}
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-emerald-200/90 mt-2">
                {anime.score && (
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{anime.score.toFixed(2)}</span>
                  </span>
                )}
                {anime.score && <span className="text-emerald-800">·</span>}
                <span className="font-mono tabular-nums">
                  {anime.episodes ? `${anime.episodes} Episodes` : 'Airing'}
                </span>
                {anime.year && (
                  <>
                    <span className="text-emerald-800">·</span>
                    <span className="text-amber-300 font-medium">Released {anime.year}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {/* Demigod Dedication Note */}
          {anime.chif3nNote && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-[#072418] to-teal-950/60 border border-emerald-500/40 flex items-start gap-3">
              <Leaf className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-cinzel text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                  Apothecary Directive from Sir Chif3n
                </span>
                <p className="text-sm text-emerald-100 mt-0.5 italic">
                  {anime.chif3nNote}
                </p>
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Imperial Case Overview</span>
            </h4>
            <p className={`text-sm text-emerald-100/90 leading-relaxed ${showFullSynopsis ? '' : 'line-clamp-3'}`}>
              {anime.synopsis || 'No synopsis recorded in the imperial scrolls.'}
            </p>
            {anime.synopsis && anime.synopsis.length > 200 && (
              <button
                onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                className="text-xs text-amber-300 hover:underline mt-1 font-mono"
              >
                {showFullSynopsis ? 'Show Less ↑' : 'Read Full Overview ↓'}
              </button>
            )}
          </div>

          {/* Japanese Voice Actor Roster (Reference Style) */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mic2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice Cast & Seiyuu Roster (キャスト)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchedCast.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#04120a] border border-emerald-900/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="text-white font-medium block font-cinzel">{c.role}</span>
                    <span className="text-[10px] text-emerald-400/80 font-serif">{c.romaji}</span>
                  </div>
                  <span className="text-amber-300 font-mono text-[11px] font-semibold">{c.actor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-900/60 text-xs">
            <div>
              <span className="text-emerald-500 block">Genres</span>
              <span className="text-emerald-200 font-medium">
                {anime.genres && anime.genres.length > 0
                  ? anime.genres.map((g) => g.name).join(', ')
                  : 'Anime'}
              </span>
            </div>
            <div>
              <span className="text-emerald-500 block">Studio</span>
              <span className="text-emerald-200 font-medium">
                {anime.studios && anime.studios.length > 0
                  ? anime.studios.map((s) => s.name).join(', ')
                  : 'Official Studio'}
              </span>
            </div>
            <div>
              <span className="text-emerald-500 block">Release Year</span>
              <span className="text-amber-300 font-semibold">
                {anime.year || 'Recent Release'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-emerald-900/60 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onToggleDateNight(anime);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-2 ${
                isDateNightSaved
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border-emerald-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isDateNightSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{isDateNightSaved ? 'Saved in Date Night' : 'Add to Date Night'}</span>
            </button>

            <button
              onClick={() => {
                onPlay(anime);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Stream Episode 1</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
