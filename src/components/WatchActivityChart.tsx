import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Leaf, Flame, TrendingUp, Sparkles } from 'lucide-react';
import { DailyWatchActivity } from '../types/anime';

interface WatchActivityChartProps {
  activityData: DailyWatchActivity[];
  totalThisWeek: number;
  streakDays: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#051c13] border border-emerald-500/40 px-3 py-2 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="text-amber-300 font-medium font-cinzel">{data.day} ({data.fullDate})</p>
        <p className="text-emerald-100 font-semibold mt-0.5">
          {data.episodes} {data.episodes === 1 ? 'Episode' : 'Episodes'} Watched
        </p>
        <span className="text-[10px] text-emerald-400/70 italic block mt-0.5">
          Apothecary Prescription
        </span>
      </div>
    );
  }
  return null;
};

export const WatchActivityChart: React.FC<WatchActivityChartProps> = ({
  activityData,
  totalThisWeek,
  streakDays,
}) => {
  // Find current day name
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#062016]/90 via-[#04140e]/95 to-[#061d15]/90 border border-emerald-800/40 shadow-xl space-y-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white font-cinzel flex items-center gap-1.5">
              <span>Leslye's Weekly Streaming Progress</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h3>
            <p className="text-[11px] text-emerald-400/80">
              Episodes watched each day of the week
            </p>
          </div>
        </div>

        {/* Small stats badges */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#03110b] border border-emerald-900/70 text-right">
            <span className="text-[9px] text-emerald-500 uppercase tracking-wider block">This Week</span>
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              {totalThisWeek} eps
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-[#03110b] border border-emerald-900/70 text-right flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40 shrink-0" />
            <div>
              <span className="text-[9px] text-emerald-500 uppercase tracking-wider block">Streak</span>
              <span className="font-mono text-xs font-bold text-emerald-300 tabular-nums">
                {streakDays} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-32 sm:h-36 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="#059669"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6ee7b7' }}
            />
            <YAxis
              stroke="#047857"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: '#34d399' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }} />
            <Bar dataKey="episodes" radius={[6, 6, 2, 2]}>
              {activityData.map((entry, index) => {
                const isToday = entry.day === todayName;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isToday ? '#fbbf24' : '#10b981'}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-400/70">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>Gold bar marks Today ({todayName})</span>
        </span>
        <span className="italic text-amber-300/80">
          "Each episode brings us closer together" - Sir Chif3n
        </span>
      </div>
    </div>
  );
};
