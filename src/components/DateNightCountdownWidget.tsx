import React, { useState, useEffect } from 'react';
import {
  Heart,
  Clock,
  Play,
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
  Film,
  Plus
} from 'lucide-react';
import { DateNightItem, AnimeItem } from '../types/anime';

interface DateNightCountdownWidgetProps {
  firstItem?: DateNightItem;
  onPlayAnime: (malId: number, title: string) => void;
  onExploreCatalog: () => void;
  onOpenDateNightTab: () => void;
}

export const DateNightCountdownWidget: React.FC<DateNightCountdownWidgetProps> = ({
  firstItem,
  onPlayAnime,
  onExploreCatalog,
  onOpenDateNightTab
}) => {
  // Target date timestamp for the countdown (persisted or defaulted to upcoming 8:00 PM)
  const [targetTime, setTargetTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('leslye_date_night_target');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed > Date.now()) return parsed;
      }
    } catch (e) {}

    // Default to today at 8:00 PM (or tomorrow at 8:00 PM if already passed)
    const now = new Date();
    const planned = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0, 0);
    if (planned.getTime() <= now.getTime()) {
      planned.setDate(planned.getDate() + 1);
    }
    return planned.getTime();
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false });

  const [showScheduler, setShowScheduler] = useState<boolean>(false);
  const [customDateTime, setCustomDateTime] = useState<string>('');

  // Ticking countdown effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isOverdue: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const handleSetTarget = (timestamp: number) => {
    setTargetTime(timestamp);
    try {
      localStorage.setItem('leslye_date_night_target', timestamp.toString());
    } catch (e) {}
    setShowScheduler(false);
  };

  const handleSchedulePreset = (type: 'tonight' | 'tomorrow' | 'saturday') => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0, 0);

    if (type === 'tonight') {
      if (now.getHours() >= 20) {
        d.setHours(21, 30, 0, 0); // later tonight
      }
    } else if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (type === 'saturday') {
      const day = d.getDay();
      const diffDays = (6 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diffDays);
      d.setHours(21, 0, 0, 0);
    }

    handleSetTarget(d.getTime());
  };

  const formattedTargetDate = new Date(targetTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="relative rounded-2xl overflow-hidden border border-rose-500/40 bg-gradient-to-br from-[#160c14] via-[#091710] to-[#04120c] p-4 sm:p-6 shadow-2xl transition-all">
      {/* Background celestial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Anime Details & Status */}
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          {firstItem ? (
            <div className="relative w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-black shrink-0 border border-rose-500/50 shadow-lg group">
              <img
                src={firstItem.image}
                alt={firstItem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-1 left-1 p-1 rounded-full bg-rose-950/80 backdrop-blur-sm border border-rose-400/60">
                <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
              </div>
            </div>
          ) : (
            <div className="w-20 sm:w-24 aspect-[3/4] rounded-xl bg-[#061e14] border border-emerald-800/80 flex flex-col items-center justify-center p-2 text-center shrink-0">
              <Film className="w-6 h-6 text-emerald-500 mb-1" />
              <span className="text-[10px] text-emerald-300 font-cinzel">Empty Queue</span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-cinzel text-[11px] font-bold text-rose-300 uppercase tracking-widest flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                <span>Next Date Night Session</span>
              </span>
              <span className="text-emerald-800">·</span>
              <span className="text-[11px] text-amber-300/90 font-mono">
                {formattedTargetDate}
              </span>
            </div>

            {firstItem ? (
              <>
                <h3 className="text-base sm:text-xl font-bold text-white truncate font-cinzel">
                  {firstItem.title}
                </h3>
                <p className="text-xs text-rose-200/80 line-clamp-1 mt-0.5 italic">
                  "{firstItem.coupleComment || 'Handpicked for date night with Sir Chif3n 💚'}"
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
                  Queue Your Next Couple Anime
                </h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Browse the library to add an anime for your next viewing session.
                </p>
              </>
            )}

            {/* Quick date schedule trigger */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setShowScheduler(!showScheduler)}
                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-mono"
              >
                <Calendar className="w-3 h-3" />
                <span>Adjust Target Date</span>
              </button>
              <span className="text-emerald-800">·</span>
              <button
                onClick={onOpenDateNightTab}
                className="text-[11px] text-emerald-400 hover:text-white hover:underline flex items-center gap-1 font-mono"
              >
                <span>View Full Queue →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Ticking Countdown Units & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-rose-900/40">
          {/* 4-digit countdown block */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#040e09]/90 border border-emerald-800/80 text-center min-w-[52px]">
              <span className="font-mono text-lg sm:text-xl font-extrabold text-amber-300 tabular-nums block leading-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-medium block">
                Days
              </span>
            </div>

            <span className="text-amber-400 font-bold text-sm">:</span>

            <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#040e09]/90 border border-emerald-800/80 text-center min-w-[52px]">
              <span className="font-mono text-lg sm:text-xl font-extrabold text-amber-300 tabular-nums block leading-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-medium block">
                Hours
              </span>
            </div>

            <span className="text-amber-400 font-bold text-sm">:</span>

            <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#040e09]/90 border border-emerald-800/80 text-center min-w-[52px]">
              <span className="font-mono text-lg sm:text-xl font-extrabold text-amber-300 tabular-nums block leading-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-medium block">
                Mins
              </span>
            </div>

            <span className="text-amber-400 font-bold text-sm">:</span>

            <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#040e09]/90 border border-rose-900/80 text-center min-w-[52px]">
              <span className="font-mono text-lg sm:text-xl font-extrabold text-rose-400 tabular-nums block leading-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-rose-500 font-medium block">
                Secs
              </span>
            </div>
          </div>

          {/* Action CTA */}
          {firstItem ? (
            <button
              onClick={() => onPlayAnime(firstItem.malId, firstItem.title)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-rose-950/60 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Begin Date Night Stream</span>
            </button>
          ) : (
            <button
              onClick={onExploreCatalog}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Pick Date Night Title</span>
            </button>
          )}
        </div>
      </div>

      {/* Scheduler Accordion */}
      {showScheduler && (
        <div className="mt-4 pt-3 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-emerald-400 font-medium">Quick Presets:</span>
            <button
              onClick={() => handleSchedulePreset('tonight')}
              className="px-2.5 py-1 rounded-lg bg-[#05170f] border border-emerald-800 hover:border-emerald-500 text-emerald-200"
            >
              Tonight 8:00 PM
            </button>
            <button
              onClick={() => handleSchedulePreset('tomorrow')}
              className="px-2.5 py-1 rounded-lg bg-[#05170f] border border-emerald-800 hover:border-emerald-500 text-emerald-200"
            >
              Tomorrow 8:00 PM
            </button>
            <button
              onClick={() => handleSchedulePreset('saturday')}
              className="px-2.5 py-1 rounded-lg bg-[#05170f] border border-emerald-800 hover:border-emerald-500 text-emerald-200"
            >
              Saturday 9:00 PM
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              onChange={(e) => setCustomDateTime(e.target.value)}
              className="bg-[#030d08] border border-emerald-800 rounded-lg px-2 py-1 text-xs text-emerald-100 focus:outline-none focus:border-amber-400"
            />
            {customDateTime && (
              <button
                onClick={() => {
                  const parsed = new Date(customDateTime).getTime();
                  if (!isNaN(parsed) && parsed > Date.now()) {
                    handleSetTarget(parsed);
                  }
                }}
                className="px-3 py-1 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400"
              >
                Set
              </button>
            )}
            <button
              onClick={() => setShowScheduler(false)}
              className="text-emerald-500 hover:text-emerald-300 ml-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
