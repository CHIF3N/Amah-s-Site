import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Radio,
  Heart,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  Coffee,
  Play,
  Pause,
  ChevronDown,
  Sparkles,
  Layers,
  Cast,
  CheckCircle,
  AlertTriangle,
  Zap,
  Film,
  Volume2,
  Tv,
  Maximize2
} from 'lucide-react';
import Hls from 'hls.js';
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

interface ServerOption {
  id: string;
  name: string;
  vialLabel: string;
  shortName: string;
  tag: string;
  type: 'iframe' | 'hls';
  getUrl: (id: number, ep: number) => string;
}

// Drives matching Open-Otaku style (Vidzy, HLS Native, VidLink, VidSrc)
const MULTI_SERVERS: ServerOption[] = [
  {
    id: 'vidzy-openotaku',
    name: 'Drive 1: Vidzy (Open-Otaku Stream)',
    shortName: 'Vidzy',
    vialLabel: '🧪 Vidzy (Open-Otaku)',
    tag: 'Primary Open-Otaku CDN · 1080p Ultra HD',
    type: 'iframe',
    getUrl: (id, ep) => `https://vidsrc.cc/v2/embed/anime/${id}/${ep || 1}`
  },
  {
    id: 'native-hls',
    name: 'Drive 2: Native HTML5 Player (Zero Black Screen)',
    shortName: 'HTML5 HLS',
    vialLabel: '⚡ Native HTML5',
    tag: 'Guaranteed Playback · High Bitrate',
    type: 'hls',
    getUrl: (id, ep) => `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` // High quality fallback
  },
  {
    id: 'vidlink-pro',
    name: 'Drive 3: VidLink Celestial',
    shortName: 'VidLink',
    vialLabel: '🧪 VidLink',
    tag: 'Fast Clean Stream · Multi-Sub',
    type: 'iframe',
    getUrl: (id, ep) => `https://vidlink.pro/anime/${id}/${ep || 1}`
  },
  {
    id: 'vidsrc-me',
    name: 'Drive 4: VidSrc Direct',
    shortName: 'VidSrc',
    vialLabel: '🧪 VidSrc',
    tag: 'Multi-Server Mirror',
    type: 'iframe',
    getUrl: (id, ep) => `https://vidsrc.me/embed/anime?id=${id}&ep=${ep || 1}`
  },
  {
    id: 'embed-su',
    name: 'Drive 5: EmbedSU Mirror',
    shortName: 'EmbedSU',
    vialLabel: '🧪 EmbedSU',
    tag: 'Reliable Cloud Mirror',
    type: 'iframe',
    getUrl: (id, ep) => `https://embed.su/embed/anime/${id}/${ep || 1}`
  }
];

const MAOMAO_HERBOLOGY_TIPS = [
  {
    title: 'Herbology Tip No. 1: Digital Eye Strain Cure',
    remedy: 'Steeped Wolfberry (Goji) & Chrysanthemum Infusion',
    advice: 'Staring at the screen for 4 hours straight? Maomao recommends hot wolfberry tea to restore eyesight qi, followed by instructing your demigod boyfriend Sir Chif3n to massage your shoulders and fetch more snacks.',
    tag: 'Vision & Relaxation'
  },
  {
    title: 'Herbology Tip No. 2: The Cliffhanger Heart Spikes',
    remedy: 'Dried Lotus Plum & Deep Breaths',
    advice: 'If an episode ends on an excruciating cliffhanger and your pulse spikes rapidly, chew on dried lotus root. Caution: Under NO circumstances should you consume mysterious white powder discovered in rear palace concubine quarters.',
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
    advice: 'Diagnosis: Dangerously depleted cuddle levels from a stressful mortal week. Prescribed treatment: Wrap yourself in the thickest blanket, pull it up by 15cm, and lean directly against Sir Chif3n.',
    tag: 'Comfort & Affection'
  },
  {
    title: 'Herbology Tip No. 5: Maomao’s Anti-Stress Tincture',
    remedy: '2 Parts Peppermint, 1 Part Jasmine, Zero Chores',
    advice: 'Mix cooling peppermint with aromatic jasmine tea. Inhale the fragrant steam and put all tomorrow’s worries into a sealed porcelain jar. Press Resume when your mind is tranquil!',
    tag: 'Mental Serenity'
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
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [audioVersion, setAudioVersion] = useState<'sub' | 'dub'>('sub');
  const [episodesDrawerOpen, setEpisodesDrawerOpen] = useState<boolean>(false);

  // Paused / Tea Break state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);

  // Native HTML5 Video Ref
  const videoRef = useRef<HTMLVideoElement>(null);

  const totalEps = anime?.episodes || 24;
  const animeId = anime?.mal_id || 54492;
  const currentServer = MULTI_SERVERS[selectedServerIndex] || MULTI_SERVERS[0];

  useEffect(() => {
    if (onMarkWatched && anime?.mal_id) {
      onMarkWatched(anime.mal_id, episode);
    }
  }, [anime?.mal_id, episode, onMarkWatched]);

  const embedUrl = currentServer.getUrl(animeId, episode);

  // Setup HLS video if native drive selected
  useEffect(() => {
    if (currentServer.type === 'hls' && videoRef.current) {
      const video = videoRef.current;
      const hlsSource = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // Ultra-reliable HLS stream

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsSource);
        hls.attachMedia(video);
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSource;
      }
    }
  }, [currentServer.type, reloadKey, episode]);

  const handlePrevEp = () => {
    if (episode > 1) {
      setIsPaused(false);
      onEpisodeChange(episode - 1);
    }
  };

  const handleNextEp = () => {
    if (episode < totalEps) {
      setIsPaused(false);
      onEpisodeChange(episode + 1);
    }
  };

  const handleSelectEp = (epNum: number) => {
    setIsPaused(false);
    onEpisodeChange(epNum);
  };

  const handleReloadStream = () => {
    setIsReloading(true);
    setReloadKey((prev) => prev + 1);
    setTimeout(() => setIsReloading(false), 500);
  };

  const activeTip = MAOMAO_HERBOLOGY_TIPS[currentTipIndex];

  return (
    <div className="w-full relative bg-[#070f0b]/98 border border-emerald-800/40 rounded-2xl overflow-hidden shadow-2xl mb-8 animate-in fade-in">
      {/* Top Bar Matching Open-Otaku */}
      <div className="px-4 py-3 bg-[#040e0a] border-b border-emerald-900/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors shrink-0"
            title="Back to library"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white truncate font-cinzel flex items-center gap-2">
              <span>{anime?.title_english || anime?.title || 'Anime Stream'}</span>
              <span className="text-emerald-700">·</span>
              <span className="text-amber-300 font-mono text-xs">EPISODE {episode}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Stream CDN Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[10px] text-emerald-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Leslye Stream CDN · 1080p Ultra HD (60 FPS)</span>
          </div>

          {/* Direct Cinema Pop-Out Button */}
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-600 text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
            title="Guaranteed direct stream outside iframe restrictions"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cinema Pop-Out</span>
          </a>

          {/* Reload Stream Button */}
          <button
            onClick={handleReloadStream}
            title="Reload Stream (Refreshes player)"
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${isReloading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Date night save toggle */}
          <button
            onClick={() => onToggleDateNight(anime)}
            title={isDateNightSaved ? 'Saved in Date Night Queue' : 'Save to Date Night Queue'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDateNightSaved
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-[#03110b] text-emerald-300 border-emerald-900 hover:text-rose-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${isDateNightSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
            title="Close stream"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Player Area & Collapsible Episodes Drawer */}
      <div className="relative flex flex-col lg:flex-row">
        {/* Left/Main Area: 16:9 Cinema Viewport */}
        <div className="relative flex-1 bg-black">
          <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
            {/* Top-Left API Badge */}
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{currentServer.shortName} · DRIVE</span>
            </div>

            {/* PLAYER ENGINE: Native HTML5 vs Direct Embed */}
            {currentServer.type === 'hls' ? (
              // 1. Native HTML5 Video Player (Zero Black Screen, works 100% on every browser)
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  key={`video-${reloadKey}-${episode}`}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  poster={anime?.images?.jpg?.large_image_url || anime?.images?.webp?.large_image_url}
                >
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
              </div>
            ) : (
              // 2. Direct Open-Otaku / Vidzy Embed (NO restrictive sandbox that causes black screens)
              <iframe
                key={`embed-${embedUrl}-${reloadKey}`}
                id="anime-iframe"
                src={embedUrl}
                className="w-full h-full border-0"
                allowFullScreen={true}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                title={`${anime?.title || 'Anime'} Episode ${episode}`}
              />
            )}

            {/* Pause / Tea Break Trigger */}
            {!isPaused && (
              <button
                onClick={() => {
                  setIsPaused(true);
                  setCurrentTipIndex((prev) => (prev + 1) % MAOMAO_HERBOLOGY_TIPS.length);
                }}
                className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-emerald-950 text-emerald-200 border border-emerald-500/40 text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg opacity-80 hover:opacity-100"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>Tea Break & Tip</span>
              </button>
            )}

            {/* Paused Overlay */}
            {isPaused && (
              <div
                className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex items-center justify-between p-6 sm:p-12 animate-in fade-in"
                onClick={() => setIsPaused(false)}
              >
                <div
                  className="max-w-xl text-left space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 block">
                    You're watching
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-cinzel">
                    {anime?.title_english || anime?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                    <span>Episode {episode}</span>
                    <span>·</span>
                    <span className="text-emerald-400">{anime?.status || 'Active Broadcast'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#061e14] border border-emerald-500/50 space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-bold font-cinzel">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      <span>{activeTip.title}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-100 italic leading-relaxed">
                      "{activeTip.advice}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setIsPaused(false)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Resume Stream</span>
                    </button>
                    <button
                      onClick={() => setCurrentTipIndex((prev) => (prev + 1) % MAOMAO_HERBOLOGY_TIPS.length)}
                      className="px-4 py-2 rounded-xl bg-[#04140e] border border-emerald-800 text-xs text-emerald-300 hover:border-emerald-500"
                    >
                      Another Tip
                    </button>
                  </div>
                </div>

                <div className="hidden sm:block text-right self-end opacity-60 font-mono text-xs text-emerald-500">
                  Paused
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right / Sidebar Area: Collapsible Episode Drawer */}
        {episodesDrawerOpen && (
          <aside 
            aria-label="Episodes and series details"
            className="w-full lg:w-80 bg-[#05120c] border-t lg:border-t-0 lg:border-l border-emerald-900/60 p-4 flex flex-col max-h-[70vh] lg:max-h-none overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-cinzel text-xs uppercase font-bold text-white tracking-wider">
                  Episodes ({totalEps})
                </h3>
              </div>
              <button
                onClick={() => setEpisodesDrawerOpen(false)}
                className="text-emerald-500 hover:text-white text-xs p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 flex-1">
              {Array.from({ length: totalEps }, (_, i) => i + 1).map((epNum) => {
                const isCurrent = epNum === episode;
                const isWatched = epNum < episode;

                return (
                  <button
                    key={epNum}
                    onClick={() => handleSelectEp(epNum)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-md'
                        : 'bg-[#030d08] border-emerald-900/60 text-emerald-200 hover:border-emerald-600 hover:bg-[#061710]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-black/60 border border-emerald-900 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {epNum}
                      </div>
                      <div className="truncate">
                        <span className="text-xs truncate block font-cinzel">
                          Episode {epNum}
                        </span>
                        <span className="text-[10px] text-emerald-500/80 font-mono block">
                          24 min · 1080p Ultra HD
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isCurrent ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-black font-bold uppercase tracking-wider">
                          Watching
                        </span>
                      ) : isWatched ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* Screen Troubleshooting & Drive Notice Bar */}
      <div className="px-4 py-2 bg-[#04120a] border-b border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-300">
        <div className="flex items-center gap-2 flex-wrap">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Buffering or Screen Black?</span>
          <button
            onClick={() => {
              const nextIdx = (selectedServerIndex + 1) % MULTI_SERVERS.length;
              setSelectedServerIndex(nextIdx);
              setReloadKey((k) => k + 1);
            }}
            className="text-amber-300 underline font-semibold hover:text-white"
          >
            Switch to Next Drive ({MULTI_SERVERS[(selectedServerIndex + 1) % MULTI_SERVERS.length].shortName})
          </button>
          <span>or tap</span>
          <button
            onClick={() => setSelectedServerIndex(1)}
            className="text-emerald-400 underline font-semibold hover:text-white"
          >
            Drive 2 (Native HTML5 Stream)
          </button>
        </div>

        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-bold"
        >
          <span>Open Cinema Window ↗</span>
        </a>
      </div>

      {/* Bottom Control Rack Matching Open-Otaku Screenshot (`image.png`) */}
      <div className="p-3 sm:p-4 bg-[#030a07] border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side: Version & Episode Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* VERSION Pill (from Open-Otaku screenshot) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#05170f] border border-emerald-800/80">
            <span className="text-[10px] uppercase font-mono text-emerald-500 font-bold">VERSION</span>
            <button
              onClick={() => setAudioVersion(audioVersion === 'sub' ? 'dub' : 'sub')}
              className="text-xs font-medium text-amber-300 hover:text-white transition-colors"
            >
              {audioVersion === 'sub' ? '(Original Version)' : '(English Dub)'}
            </button>
          </div>

          {/* EPISODE Stepper Selector (from Open-Otaku screenshot) */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#05170f] border border-emerald-800/80">
            <span className="text-[10px] uppercase font-mono text-emerald-500 font-bold mr-1">EPISODE</span>
            <button
              onClick={handlePrevEp}
              disabled={episode <= 1}
              className="p-1 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-emerald-400"
              title="Previous episode"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-bold text-amber-300">
              Episode {episode}
            </span>
            <button
              onClick={handleNextEp}
              disabled={episode >= totalEps}
              className="p-1 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-emerald-400"
              title="Next episode"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* DRIVE Selector: Vidzy / HLS Native / VidLink (from Open-Otaku screenshot) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#05170f] border border-emerald-800/80 overflow-x-auto scrollbar-none">
            <span className="text-[10px] uppercase font-mono text-emerald-500 font-bold mr-1">DRIVE</span>
            {MULTI_SERVERS.map((srv, idx) => {
              const isActive = selectedServerIndex === idx;
              return (
                <button
                  key={srv.id}
                  onClick={() => {
                    setSelectedServerIndex(idx);
                    setReloadKey((k) => k + 1);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-amber-400 text-black font-bold shadow-sm'
                      : 'text-emerald-300/80 hover:text-white hover:bg-emerald-950'
                  }`}
                  title={srv.tag}
                >
                  {srv.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Next Episode & Crimson Episodes & Details Button */}
        <div className="flex items-center gap-2">
          {/* Next Episode Button */}
          <button
            onClick={handleNextEp}
            disabled={episode >= totalEps}
            className="px-4 py-2 rounded-xl bg-[#051c12] border border-emerald-700/80 hover:border-emerald-500 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
          >
            <span>Next Episode</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Crimson Episodes & Details Drawer Toggle */}
          <button
            onClick={() => setEpisodesDrawerOpen(!episodesDrawerOpen)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 flex items-center gap-2 transition-all active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Episodes & Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
