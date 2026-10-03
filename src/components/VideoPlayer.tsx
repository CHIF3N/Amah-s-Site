import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  RotateCw,
  ShieldCheck,
  Coffee,
  Play,
  Layers,
  Sparkles,
  Server,
  Zap,
  Film
} from 'lucide-react';
import { AnimeItem } from '../types/anime';

interface VideoPlayerProps {
  anime: AnimeItem;
  episode: number;
  onEpisodeChange: (ep: number) => void;
  onClose: () => void;
  isDateNightSaved: boolean;
  onToggleDateNight: (anime: AnimeItem) => void;
  onMarkWatched?: (malId: number, ep: number) => void;
}

export interface StreamServer {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  buildUrl: (malId: number, ep: number) => string;
}

export const STREAM_SERVERS: StreamServer[] = [
  {
    id: 'vial-1',
    name: 'VidSrc Alpha (Vial I - Primary)',
    shortName: 'VidSrc',
    tag: '1080p Ultra HD · High Speed CDN',
    buildUrl: (id, ep) => `https://vidsrc.cc/v2/embed/anime/${id}/${ep || 1}`
  },
  {
    id: 'vial-2',
    name: 'EmbedSU (Vial II - Backup)',
    shortName: 'EmbedSU',
    tag: 'Cloud Stream · Sub/Dub Multi-Audio',
    buildUrl: (id, ep) => `https://embed.su/embed/anime/${id}/${ep || 1}`
  },
  {
    id: 'vial-3',
    name: 'VidSrc Direct (Vial III - Fallback)',
    shortName: 'VidSrc Direct',
    tag: 'Direct Resolver · High Uptime',
    buildUrl: (id, ep) => `https://vidsrc.me/embed/anime?id=${id}&ep=${ep || 1}`
  },
  {
    id: 'vial-4',
    name: '2Embed (Vial IV - Direct Mirror)',
    shortName: '2Embed',
    tag: 'Imperial Backup Mirror',
    buildUrl: (id, ep) => `https://2embed.cc/embed/${id}`
  }
];

const MAOMAO_HERBOLOGY_TIPS = [
  {
    title: 'Herbology Tip No. 1: Digital Eye Strain Cure',
    remedy: 'Steeped Wolfberry (Goji) & Chrysanthemum Infusion',
    advice: 'Staring at the screen for hours? Maomao recommends hot wolfberry tea to restore eyesight qi, followed by having Sir Chif3n fetch more snacks and boba.',
    tag: 'Vision & Relaxation'
  },
  {
    title: 'Herbology Tip No. 2: The Cliffhanger Heart Spikes',
    remedy: 'Dried Lotus Plum & Deep Breaths',
    advice: 'If an episode ends on an excruciating cliffhanger, chew on dried lotus plum. Caution: Under NO circumstances should you consume mysterious white powder discovered in rear palace quarters.',
    tag: 'Heart Rate Protocol'
  },
  {
    title: 'Herbology Tip No. 3: Royal Poison Testing Protocol',
    remedy: 'Demigod Taste-Testing Rite',
    advice: 'Testing for poison is basic imperial court hygiene. Always have Sir Chif3n sample the date night boba and popcorn first to certify they are safe and sufficiently delicious for Lady Leslye.',
    tag: 'Imperial Safety'
  },
  {
    title: 'Herbology Tip No. 4: Acute Fatigue Diagnosis',
    remedy: 'Emergency Blanket Burrito Treatment',
    advice: 'Diagnosis: Dangerously depleted cuddle levels from a stressful mortal week. Prescribed treatment: Wrap yourself in the softest blanket and lean directly against Sir Chif3n.',
    tag: 'Comfort & Affection'
  }
];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  episode,
  onEpisodeChange,
  onClose,
  isDateNightSaved,
  onToggleDateNight,
  onMarkWatched,
}) => {
  const [selectedServerIndex, setSelectedServerIndex] = useState<number>(0);
  const [isFrameLoading, setIsFrameLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [episodesDrawerOpen, setEpisodesDrawerOpen] = useState<boolean>(false);
  const [isTeaBreak, setIsTeaBreak] = useState<boolean>(false);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);

  const animeId = anime?.mal_id || 54492;
  const totalEps = anime?.episodes || 24;
  const currentServer = STREAM_SERVERS[selectedServerIndex] || STREAM_SERVERS[0];
  const streamUrl = currentServer.buildUrl(animeId, episode);

  useEffect(() => {
    if (onMarkWatched && anime?.mal_id) {
      onMarkWatched(anime.mal_id, episode);
    }
  }, [anime?.mal_id, episode, onMarkWatched]);

  // Flash loader on change, then reveal player
  useEffect(() => {
    setIsFrameLoading(true);
    const timer = setTimeout(() => {
      setIsFrameLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [episode, selectedServerIndex, reloadKey]);

  const handleNextEpisode = () => {
    if (episode < totalEps) {
      onEpisodeChange(episode + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (episode > 1) {
      onEpisodeChange(episode - 1);
    }
  };

  const handleReloadFrame = () => {
    setIsFrameLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleCycleServer = () => {
    setSelectedServerIndex((prev) => (prev + 1) % STREAM_SERVERS.length);
  };

  return (
    <div className="w-full rounded-2xl bg-[#030d08] border border-emerald-500/40 shadow-2xl overflow-hidden mb-6 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-[#020b06] border-b border-emerald-900/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold text-white truncate">
                {anime?.title_english || anime?.title || 'Imperial Cinema'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 shrink-0">
                EP {episode}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 block truncate">
              {currentServer.name} · {currentServer.tag}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Reload Stream Button in Header */}
          <button
            onClick={handleReloadFrame}
            className="px-2.5 py-1.5 rounded-xl bg-[#04140e] border border-emerald-800 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Reload Video Stream"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFrameLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reload Stream</span>
          </button>

          {/* Date Night Toggle */}
          <button
            onClick={() => onToggleDateNight(anime)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isDateNightSaved
                ? 'bg-rose-600/30 border-rose-400 text-rose-300'
                : 'bg-[#04140e] border-emerald-900/80 text-emerald-400 hover:text-white'
            }`}
            title="Toggle Date Night Watchlist"
          >
            <Heart className={`w-4 h-4 ${isDateNightSaved ? 'fill-rose-400' : ''}`} />
          </button>

          {/* Tea Break / Herbology Tip */}
          <button
            onClick={() => setIsTeaBreak(!isTeaBreak)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isTeaBreak
                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                : 'bg-[#04140e] border-emerald-900/80 text-amber-400 hover:text-white'
            }`}
            title="Maomao's Herbology & Tea Break"
          >
            <Coffee className="w-4 h-4" />
          </button>

          {/* Close Player */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#04140e] hover:bg-rose-950/60 border border-emerald-900/80 hover:border-rose-500 text-emerald-400 hover:text-white text-xs transition-colors"
            title="Close Cinema"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Player Viewport & Side Panel */}
      <div className="flex flex-col lg:flex-row bg-black">
        {/* Cinema Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center">
          <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
            {/* Server Badge Overlay */}
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded bg-black/85 backdrop-blur-md border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-lg pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">{currentServer.shortName}</span>
              <span className="text-zinc-500">|</span>
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] text-emerald-400/90">Ad-Free Sandbox</span>
            </div>

            {/* Subtle Loading Pulse Overlay (Fades out quickly) */}
            {isFrameLoading && (
              <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-2 pointer-events-none transition-opacity duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center animate-pulse">
                  <Play className="w-5 h-5 text-emerald-400 fill-emerald-400 ml-0.5" />
                </div>
                <span className="text-xs font-cinzel text-emerald-200">
                  Channeling {currentServer.name}...
                </span>
              </div>
            )}

            {/*
              SANDBOXED IFRAME ARCHITECTURE:
              - sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              - Strictly omits allow-top-navigation and allow-popups
              - Eliminates black screen and blocks all mobile redirects & popunders!
            */}
            <iframe
              id="anime-player-frame"
              key={`stream-${streamUrl}-${reloadKey}`}
              src={streamUrl}
              onLoad={() => setIsFrameLoading(false)}
              className="w-full h-full border-0 aspect-video rounded-xl bg-black shadow-2xl"
              allowFullScreen={true}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            />
          </div>
        </div>

        {/* Side Episodes Selector Panel (Desktop) */}
        <div className="hidden lg:flex flex-col w-72 bg-[#020b06] border-l border-emerald-900/60 p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
            <span className="font-cinzel text-xs font-bold text-amber-300">
              Episodes ({totalEps})
            </span>
            <span className="text-[10px] font-mono text-emerald-500">
              Ep {episode} of {totalEps}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] grid grid-cols-4 gap-1.5 pr-1 scrollbar-thin">
            {Array.from({ length: totalEps }, (_, i) => i + 1).map((epNum) => (
              <button
                key={epNum}
                onClick={() => onEpisodeChange(epNum)}
                className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  epNum === episode
                    ? 'bg-emerald-500 text-black shadow-md ring-2 ring-emerald-400'
                    : 'bg-[#04140e] text-emerald-300 hover:bg-[#072419] border border-emerald-900/60'
                }`}
              >
                {epNum}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tea Break / Herbology Recommendation Banner */}
      {isTeaBreak && (
        <div className="p-4 bg-gradient-to-r from-[#061e12] via-[#04150d] to-[#0a1b12] border-t border-b border-amber-400/40 animate-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                  {MAOMAO_HERBOLOGY_TIPS[currentTipIndex].title}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-emerald-950 border border-emerald-600 text-emerald-300">
                  {MAOMAO_HERBOLOGY_TIPS[currentTipIndex].tag}
                </span>
              </div>
              <p className="text-xs font-serif text-white font-semibold">
                🌿 Remedy: {MAOMAO_HERBOLOGY_TIPS[currentTipIndex].remedy}
              </p>
              <p className="text-xs text-emerald-200/90 font-serif italic">
                "{MAOMAO_HERBOLOGY_TIPS[currentTipIndex].advice}"
              </p>
            </div>

            <button
              onClick={() =>
                setCurrentTipIndex((prev) => (prev + 1) % MAOMAO_HERBOLOGY_TIPS.length)
              }
              className="px-3 py-1.5 rounded-lg bg-[#03110b] hover:bg-emerald-950 text-amber-300 border border-amber-400/50 text-xs shrink-0 font-medium transition-colors"
            >
              Next Remedy →
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar: Server Switcher & Episode Controls */}
      <div className="p-3 bg-[#020b06] border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-3">
        {/* Multi-Server Mirror Switcher & Reload Stream Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Server className="w-3 h-3 text-emerald-400" />
            <span>Server:</span>
          </span>

          {STREAM_SERVERS.map((srv, idx) => (
            <button
              key={srv.id}
              onClick={() => setSelectedServerIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedServerIndex === idx
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-md ring-1 ring-amber-300'
                  : 'bg-[#04140e] text-emerald-300 border border-emerald-900/80 hover:border-emerald-600'
              }`}
              title={srv.tag}
            >
              <Zap className="w-3 h-3" />
              <span>{srv.shortName}</span>
            </button>
          ))}

          {/* Primary Dedicated 'Reload Stream' Button */}
          <button
            onClick={handleReloadFrame}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 hover:text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Reload Current Video Stream"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFrameLoading ? 'animate-spin' : ''}`} />
            <span>Reload Stream</span>
          </button>
        </div>

        {/* Episode Step & Mobile Episodes Drawer Toggle */}
        <div className="flex items-center gap-2">
          {/* Prev Episode */}
          <button
            onClick={handlePrevEpisode}
            disabled={episode <= 1}
            className="px-3 py-1.5 rounded-xl bg-[#04140e] border border-emerald-900/80 text-emerald-300 hover:text-white text-xs font-medium disabled:opacity-40 flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {/* Current Ep Pill */}
          <span className="px-3 py-1 rounded-xl bg-black/60 border border-emerald-900/60 font-mono text-xs text-amber-300 font-bold">
            Ep {episode} / {totalEps}
          </span>

          {/* Next Episode */}
          <button
            onClick={handleNextEpisode}
            disabled={episode >= totalEps}
            className="px-3 py-1.5 rounded-xl bg-[#04140e] border border-emerald-900/80 text-emerald-300 hover:text-white text-xs font-medium disabled:opacity-40 flex items-center gap-1 transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Episodes Drawer Toggle */}
          <button
            onClick={() => setEpisodesDrawerOpen(!episodesDrawerOpen)}
            className="lg:hidden px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Episodes</span>
          </button>
        </div>
      </div>

      {/* Mobile Episodes Grid Drawer */}
      {episodesDrawerOpen && (
        <div className="lg:hidden p-3 bg-[#010804] border-t border-emerald-950 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/40">
            <span className="font-cinzel text-xs font-bold text-amber-300">
              Select Episode ({totalEps})
            </span>
            <button
              onClick={() => setEpisodesDrawerOpen(false)}
              className="text-[11px] text-emerald-400 underline font-mono"
            >
              Done
            </button>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {Array.from({ length: totalEps }, (_, i) => i + 1).map((epNum) => (
              <button
                key={epNum}
                onClick={() => {
                  onEpisodeChange(epNum);
                  setEpisodesDrawerOpen(false);
                }}
                className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  epNum === episode
                    ? 'bg-emerald-500 text-black shadow-md ring-2 ring-emerald-400'
                    : 'bg-[#04140e] text-emerald-300 border border-emerald-900/60'
                }`}
              >
                {epNum}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
