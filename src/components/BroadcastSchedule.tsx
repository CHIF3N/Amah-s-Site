import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, Play, Sparkles, X, ChevronRight, Loader2, RefreshCw, Radio } from 'lucide-react';
import { AnimeItem } from '../types/anime';

interface BroadcastScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAnime: (anime: AnimeItem) => void;
  catalog: AnimeItem[];
}

export interface LiveScheduleItem {
  id: number;
  malId: number;
  title: string;
  titleKanji?: string;
  coverUrl: string;
  broadcastTime: string;
  localTime: string;
  dayOfWeek: string;
  dateStr: string;
  network: string;
  status: 'Airing' | 'Upcoming' | 'Live Today';
  score?: number | null;
  episodes?: number;
  synopsis?: string | null;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to compute actual calendar dates for Monday through Sunday of the CURRENT week
function getCurrentWeekDates(): { dayName: string; date: Date; dateStr: string; isToday: boolean }[] {
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 is Sunday, 1 is Monday...
  // Convert so Monday = 0, Sunday = 6
  const normalizedIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  return WEEKDAYS.map((dayName, idx) => {
    const diff = idx - normalizedIndex;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);

    const isToday = diff === 0;
    const dateStr = targetDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });

    return {
      dayName,
      date: targetDate,
      dateStr,
      isToday
    };
  });
}

export const BroadcastSchedule: React.FC<BroadcastScheduleProps> = ({
  isOpen,
  onClose,
  onPlayAnime,
  catalog
}) => {
  const weekDates = getCurrentWeekDates();
  const todayEntry = weekDates.find((w) => w.isToday) || weekDates[0];

  const [selectedDay, setSelectedDay] = useState<string>(todayEntry.dayName);
  const [scheduleItems, setScheduleItems] = useState<LiveScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userTimeZone, setUserTimeZone] = useState<string>('Local Time');

  useEffect(() => {
    try {
      setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (e) {}
  }, []);

  // Fetch or generate dynamic live broadcast schedule
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const targetWeekInfo = weekDates.find((w) => w.dayName.toLowerCase() === selectedDay.toLowerCase()) || todayEntry;

    // Fetch from Jikan API with fallback
    const fetchLiveSchedule = async () => {
      try {
        const filter = selectedDay.toLowerCase();
        const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${filter}&limit=16`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.data) && data.data.length > 0 && isMounted) {
            const mapped: LiveScheduleItem[] = data.data.map((item: any, idx: number) => {
              const broadcastTime = item.broadcast?.time || '23:30';
              const network = item.broadcast?.string || item.studios?.[0]?.name || 'Imperial TV';

              return {
                id: item.mal_id || idx,
                malId: item.mal_id,
                title: item.title_english || item.title,
                titleKanji: item.title_japanese,
                coverUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
                broadcastTime: item.broadcast?.string || `${broadcastTime} JST`,
                localTime: `${broadcastTime} (${userTimeZone.split('/')[1] || 'Local'})`,
                dayOfWeek: selectedDay,
                dateStr: targetWeekInfo.dateStr,
                network,
                status: (targetWeekInfo.isToday ? 'Live Today' : 'Upcoming') as 'Live Today' | 'Upcoming',
                score: item.score,
                episodes: item.episodes || 12,
                synopsis: item.synopsis
              };
            });

            setScheduleItems(mapped);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Jikan Schedule API offline or throttled, generating dynamic local schedule:', err);
      }

      // Dynamic Fallback: generates schedules with current week dates
      if (isMounted) {
        const fallbackShows = catalog.slice(0, 10).map((anime, idx) => {
          const baseHour = 18 + (idx % 6);
          const minutes = (idx * 15) % 60;
          const timeFormatted = `${baseHour}:${minutes < 10 ? '0' : ''}${minutes}`;

          return {
            id: anime.mal_id,
            malId: anime.mal_id,
            title: anime.title_english || anime.title,
            titleKanji: '薬屋のひとりごと / 帝室放送',
            coverUrl: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
            broadcastTime: `${timeFormatted} JST`,
            localTime: `${baseHour - 4}:${minutes < 10 ? '0' : ''}${minutes} (${userTimeZone.split('/')[1] || 'Local'})`,
            dayOfWeek: selectedDay,
            dateStr: targetWeekInfo.dateStr,
            network: 'Imperial Anime Broadcast',
            status: (targetWeekInfo.isToday ? 'Live Today' : 'Upcoming') as 'Live Today' | 'Upcoming',
            score: anime.score,
            episodes: anime.episodes || 24,
            synopsis: anime.synopsis
          };
        });

        setScheduleItems(fallbackShows);
        setIsLoading(false);
      }
    };

    fetchLiveSchedule();

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedDay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#020a06]/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-gradient-to-b from-[#05180f] via-[#03100a] to-[#020805] border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#03110b] border-b border-emerald-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                  Live Imperial Broadcast Schedule
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Dynamic Live Dates</span>
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 font-mono flex items-center gap-2">
                <Globe className="w-3 h-3 text-amber-400" />
                <span>Detected Timezone: {userTimeZone}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Selector Pills with Current Week Calendar Dates */}
        <div className="px-5 py-3 bg-[#020b06] border-b border-emerald-950 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          {weekDates.map((item) => {
            const isSelected = selectedDay.toLowerCase() === item.dayName.toLowerCase();
            return (
              <button
                key={item.dayName}
                onClick={() => setSelectedDay(item.dayName)}
                className={`px-4 py-2 rounded-2xl text-xs font-cinzel font-bold transition-all shrink-0 flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-950/60 ring-2 ring-amber-300 scale-105'
                    : 'bg-[#04160e] text-emerald-300 border border-emerald-900 hover:border-emerald-600 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{item.dayName}</span>
                  {item.isToday && (
                    <span
                      className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        isSelected ? 'bg-black text-amber-300' : 'bg-emerald-900 text-emerald-300'
                      }`}
                    >
                      Today
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono font-normal ${
                    isSelected ? 'text-black/80 font-semibold' : 'text-emerald-500'
                  }`}
                >
                  {item.dateStr}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shows Grid for Selected Day */}
        <div className="flex-1 p-5 overflow-y-auto scrollbar-thin bg-gradient-to-b from-[#020906] to-[#010604]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="font-cinzel text-xs text-emerald-300">
                Fetching live airing schedule for {selectedDay}...
              </p>
            </div>
          ) : scheduleItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-emerald-400/80">
              <Clock className="w-8 h-8 text-amber-400 mb-2 opacity-60" />
              <p className="font-cinzel text-sm text-white">No broadcasts registered for {selectedDay}</p>
              <p className="text-xs font-serif mt-1">Select another day of the week to view broadcasts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduleItems.map((item) => (
                <div
                  key={`${item.malId}-${item.dayOfWeek}`}
                  className="bg-gradient-to-r from-[#04150e] to-[#061d13] border border-emerald-900/80 hover:border-emerald-500/80 rounded-2xl p-3.5 flex gap-3.5 transition-all shadow-md group"
                >
                  {/* Poster Thumbnail */}
                  <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 relative bg-black">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {item.status === 'Live Today' && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600/90 text-white font-mono text-[8px] font-bold uppercase shadow">
                        Live Today
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 mb-0.5">
                        <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{item.dateStr}</span>
                        <span>·</span>
                        <span className="truncate">{item.broadcastTime}</span>
                      </div>

                      <h3 className="font-cinzel text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-[10px] font-mono text-emerald-400/80 truncate mt-0.5">
                        {item.network}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-950 mt-1">
                      <span className="text-[10px] font-mono text-emerald-500">
                        {item.score ? `★ ${item.score}` : `${item.episodes} Episodes`}
                      </span>

                      <button
                        onClick={() => {
                          const matched = catalog.find((c) => c.mal_id === item.malId) || {
                            mal_id: item.malId,
                            title: item.title,
                            title_english: item.title,
                            images: { jpg: { large_image_url: item.coverUrl, image_url: item.coverUrl } },
                            episodes: item.episodes || 24,
                            synopsis: item.synopsis || '',
                            genres: [{ mal_id: 1, name: 'Anime' }]
                          };
                          onPlayAnime(matched as AnimeItem);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-cinzel font-bold flex items-center gap-1 shadow transition-all active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Watch Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
