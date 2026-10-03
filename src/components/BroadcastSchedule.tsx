import React, { useState } from 'react';
import { Calendar, Clock, Globe, Play, Sparkles, X, ChevronRight } from 'lucide-react';
import { AnimeItem } from '../types/anime';

interface BroadcastScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAnime: (anime: AnimeItem) => void;
  catalog: AnimeItem[];
}

interface ScheduleEntry {
  day: string;
  timeJST: string;
  timeLocal: string;
  title: string;
  titleKanji: string;
  network: string;
  studio: string;
  malId: number;
  coverUrl: string;
  episode: number;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SCHEDULE_DATA: ScheduleEntry[] = [
  {
    day: 'Friday',
    timeJST: '23:00 JST',
    timeLocal: '10:00 AM EDT',
    title: 'The Apothecary Diaries',
    titleKanji: '薬屋のひとりごと',
    network: 'Nippon TV',
    studio: 'TOHO animation & OLM',
    malId: 54492,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
    episode: 24
  },
  {
    day: 'Friday',
    timeJST: '23:00 JST',
    timeLocal: '10:00 AM EDT',
    title: "Frieren: Beyond Journey's End",
    titleKanji: '葬送のフリーレン',
    network: 'Nippon TV (FRIDAY ANIME NIGHT)',
    studio: 'Madhouse',
    malId: 52991,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
    episode: 28
  },
  {
    day: 'Thursday',
    timeJST: '00:26 JST',
    timeLocal: '11:26 AM EDT',
    title: 'Dan Da Dan',
    titleKanji: 'ダンダダン',
    network: 'MBS / TBS',
    studio: 'Science SARU',
    malId: 57334,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1939/144675.jpg',
    episode: 12
  },
  {
    day: 'Saturday',
    timeJST: '00:00 JST',
    timeLocal: '11:00 AM EDT',
    title: 'Solo Leveling',
    titleKanji: '俺だけレベルアップな件',
    network: 'Tokyo MX',
    studio: 'A-1 Pictures',
    malId: 52299,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1500/140813.jpg',
    episode: 12
  },
  {
    day: 'Thursday',
    timeJST: '00:26 JST',
    timeLocal: '11:26 AM EDT',
    title: 'Wind Breaker',
    titleKanji: 'ウィンドブレイカー',
    network: 'MBS / TBS',
    studio: 'CloverWorks',
    malId: 54900,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1816/141566.jpg',
    episode: 13
  },
  {
    day: 'Sunday',
    timeJST: '17:00 JST',
    timeLocal: '04:00 AM EDT',
    title: 'Shangri-La Frontier',
    titleKanji: 'シャングリラ・フロンティア',
    network: 'MBS / TBS',
    studio: 'C2C',
    malId: 52347,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1456/138035.jpg',
    episode: 25
  },
  {
    day: 'Wednesday',
    timeJST: '23:30 JST',
    timeLocal: '10:30 AM EDT',
    title: 'Oshi no Ko',
    titleKanji: '【推しの子】',
    network: 'Tokyo MX',
    studio: 'Doga Kobo',
    malId: 52034,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1812/134736.jpg',
    episode: 11
  },
  {
    day: 'Tuesday',
    timeJST: '23:00 JST',
    timeLocal: '10:00 AM EDT',
    title: 'Bleach: Thousand-Year Blood War',
    titleKanji: 'BLEACH 千年血戦篇',
    network: 'TV Tokyo',
    studio: 'Pierrot Films',
    malId: 41467,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1908/135406.jpg',
    episode: 13
  },
  {
    day: 'Monday',
    timeJST: '22:30 JST',
    timeLocal: '09:30 AM EDT',
    title: 'Chikyuu no Undou ni Tsuite (Orb: Movement of the Earth)',
    titleKanji: 'チ。 ―地球の運動について―',
    network: 'NHK General',
    studio: 'Madhouse',
    malId: 52215,
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1800/144677.jpg',
    episode: 25
  }
];

export const BroadcastSchedule: React.FC<BroadcastScheduleProps> = ({
  isOpen,
  onClose,
  onPlayAnime,
  catalog
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Friday');
  const [isJST, setIsJST] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentShows = SCHEDULE_DATA.filter((s) => s.day === selectedDay);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-[#071911] via-[#04120c] to-[#0c1813] border border-emerald-500/50 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-cinzel text-[10px] uppercase tracking-widest text-amber-300 font-bold block">
                Imperial Broadcast Schedule
              </span>
              <h3 className="font-cinzel text-lg font-bold text-white">
                Weekly Airing Calendar
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* JST vs Local Toggle */}
            <button
              onClick={() => setIsJST(!isJST)}
              className="px-2.5 py-1 rounded-lg bg-[#030e08] border border-emerald-800 hover:border-emerald-500 text-xs font-mono text-emerald-200 flex items-center gap-1.5 transition-colors"
              title="Toggle between Japan Standard Time and Local Time"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isJST ? 'Timezone: JST (Tokyo)' : 'Timezone: Local (EDT)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Pills Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {WEEKDAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-md shadow-amber-900/30'
                    : 'bg-[#030e09] text-emerald-300/80 border-emerald-900 hover:text-white hover:border-emerald-700'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Schedule List */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto scrollbar-thin pr-1">
          {currentShows.length === 0 ? (
            <div className="py-12 text-center text-emerald-400/80 text-xs">
              No prime shows scheduled for {selectedDay}. Switch to Friday or Saturday for major broadcasts!
            </div>
          ) : (
            currentShows.map((show) => {
              const matched = catalog.find((a) => a.mal_id === show.malId) || ({
                mal_id: show.malId,
                title: show.title,
                images: { jpg: { image_url: show.coverUrl } },
                episodes: show.episode
              } as AnimeItem);

              return (
                <div
                  key={show.title}
                  className="p-3.5 rounded-xl bg-[#04120c]/80 border border-emerald-900/70 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-950">
                      <img src={show.coverUrl} alt={show.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300 font-mono">
                          {isJST ? show.timeJST : show.timeLocal}
                        </span>
                        <span className="text-emerald-800">·</span>
                        <span className="text-[10px] text-emerald-400/80 font-mono">{show.network}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate font-cinzel mt-0.5">
                        {show.title}
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-serif truncate">
                        {show.titleKanji} · Studio: {show.studio}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onPlayAnime(matched);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Ep {show.episode}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-emerald-900/60 pt-3 flex items-center justify-between text-[11px] text-emerald-400/70">
          <span>Synced with Tokyo Television Airwaves</span>
          <span className="text-amber-400">Never miss an episode with Sir Chif3n</span>
        </div>
      </div>
    </div>
  );
};
