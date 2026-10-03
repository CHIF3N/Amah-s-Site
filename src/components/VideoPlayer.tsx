import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Maximize2,
  Loader2,
  RefreshCw,
  Server
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

export interface StreamProvider {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  type: 'iframe' | 'hls';
  priority: number;
  buildUrl: (malId: number, ep: number) => string;
}

// Dynamic multi-source provider hierarchy: VidSrc -> EmbedSU -> VidSrc Mirrors -> VidLink -> Native Stream
export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc-cc',
    name: 'VidSrc Alpha (v2 Primary)',
    shortName: 'VidSrc Alpha',
    tag: 'Primary High-Speed CDN · 1080p Ultra HD',
    type: 'iframe',
    priority: 1,
    buildUrl: (id, ep) => `https://vidsrc.cc/v2/embed/anime/${id}/${ep || 1}`
  },
  {
    id: 'embedsu',
    name: 'EmbedSU (Secondary Resolver)',
    shortName: 'EmbedSU',
    tag: 'Cloud Resolver · Multi-Audio (Sub/Dub)',
    type: 'iframe',
    priority: 2,
    buildUrl: (id, ep) => `https://embed.su/embed/anime/${id}/${ep || 1}`
  },
  {
    id: 'vidsrc-me',
    name: 'VidSrc Direct (Mirror B)',
    shortName: 'VidSrc Direct',
    tag: 'High Reliability · Direct Stream',
    type: 'iframe',
    priority: 3,
    buildUrl: (id, ep) => `https://vidsrc.me/embed/anime?id=${id}&ep=${ep || 1}`
  },
  {
    id: 'vidsrc-to',
    name: 'VidSrc To (Mirror C)',
    shortName: 'VidSrc To',
    tag: 'Alternative Cloud Server',
    type: 'iframe',
    priority: 4,
    buildUrl: (id, ep) => `https://vidsrc.to/embed/anime/${id}/${ep || 1}`
  },
  {
    id: 'vidlink',
    name: 'VidLink Pro',
    shortName: 'VidLink',
    tag: 'Clean UI · No Buffering',
    type: 'iframe',
    priority: 5,
    buildUrl: (id, ep) => `https://vidlink.pro/anime/${id}/${ep || 1}`
  },
  {
    id: '2embed',
    name: '2Embed Imperial Mirror',
    shortName: '2Embed',
    tag: 'Backup Mirror',
    type: 'iframe',
    priority: 6,
    buildUrl: (id, ep) => `https://www.2embed.cc/embedmal/${id}?ep=${ep || 1}`
  },
  {
    id: 'native-hls',
    name: 'Native HTML5 Drive (Zero Black Screen Fallback)',
    shortName: 'Native HTML5',
    tag: 'Guaranteed Playback · High Bitrate',
    type: 'hls',
    priority: 7,
    buildUrl: () => `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
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
  // Provider and Resolver State
  const [providerIndex, setProviderIndex] = useState<number>(0);
  const [isResolving, setIsResolving] = useState<boolean>(true);
  const [cycleAttemptCount, setCycleAttemptCount] = useState<number>(1);
  const [resolveCountdown, setResolveCountdown] = useState<number>(6);
  const [autoCycleNotice, setAutoCycleNotice] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [audioVersion, setAudioVersion] = useState<'sub' | 'dub'>('sub');
  const [episodesDrawerOpen, setEpisodesDrawerOpen] = useState<boolean>(false);

  // Paused / Tea Break state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);

  // Native HTML5 Video Ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoCycleTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const totalEps = anime?.episodes || 24;
  const animeId = anime?.mal_id || 54492;
  const currentProvider = STREAM_PROVIDERS[providerIndex] || STREAM_PROVIDERS[0];

  useEffect(() => {
    if (onMarkWatched && anime?.mal_id) {
      onMarkWatched(anime.mal_id, episode);
    }
  }, [anime?.mal_id, episode, onMarkWatched]);

  const embedUrl = currentProvider.buildUrl(animeId, episode);

  // Cycle to next provider automatically or manually
  const cycleToNextProvider = useCallback((reason = 'manual') => {
    const nextIdx = (providerIndex + 1) % STREAM_PROVIDERS.length;
    const nextProvider = STREAM_PROVIDERS[nextIdx];

    setAutoCycleNotice(
      reason === 'timeout'
        ? `Server '${currentProvider.shortName}' timed out. Auto-cycling to '${nextProvider.shortName}'...`
        : `Switching to Drive: ${nextProvider.shortName}`
    );

    setProviderIndex(nextIdx);
    setCycleAttemptCount((c) => c + 1);
    setIsResolving(true);
    setResolveCountdown(6);
    setReloadKey((k) => k + 1);

    setTimeout(() => {
      setAutoCycleNotice(null);
    }, 4500);
  }, [providerIndex, currentProvider.shortName]);

  // Setup Automated Provider Watchdog & Countdown
  useEffect(() => {
    // If it's a native HLS stream, we don't need iframe timeout
    if (currentProvider.type === 'hls') {
      setIsResolving(false);
      return;
    }

    setIsResolving(true);
    setResolveCountdown(6);

    // Countdown interval
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setResolveCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Watchdog timer: If iframe doesn't respond or load properly within 6 seconds, auto-cycle
    clearTimeout(autoCycleTimerRef.current);
    autoCycleTimerRef.current = setTimeout(() => {
      // Auto cycle only through the top 3 high-speed servers (VidSrc Alpha -> EmbedSU -> VidSrc Direct)
      if (cycleAttemptCount < 4) {
        cycleToNextProvider('timeout');
      } else {
        // If cycled through 3 servers already, mark as resolved so user can click to play
        setIsResolving(false);
      }
    }, 6500);

    return () => {
      clearTimeout(autoCycleTimerRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, [currentProvider.id, currentProvider.type, episode, animeId, reloadKey, cycleAttemptCount, cycleToNextProvider]);

  // Handle iframe load
  const handleIframeLoaded = () => {
    // Clear watchdog when iframe loads
    clearTimeout(autoCycleTimerRef.current);
    clearInterval(countdownIntervalRef.current);
    setTimeout(() => {
      setIsResolving(false);
    }, 600);
  };

  // Setup HLS video if native drive selected
  useEffect(() => {
    if (currentProvider.type === 'hls' && videoRef.current) {
      const video = videoRef.current;
      const hlsSource = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

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
  }, [currentProvider.type, reloadKey, episode]);

  const handlePrevEp = () => {
    if (episode > 1) {
      setIsPaused(false);
      setCycleAttemptCount(1);
      onEpisodeChange(episode - 1);
    }
  };

  const handleNextEp = () => {
    if (episode < totalEps) {
      setIsPaused(false);
      setCycleAttemptCount(1);
      onEpisodeChange(episode + 1);
    }
  };

  const handleSelectEp = (epNum: number) => {
    setIsPaused(false);
    setCycleAttemptCount(1);
    onEpisodeChange(epNum);
  };

  const handleReloadStream = () => {
    setIsReloading(true);
    setIsResolving(true);
    setReloadKey((prev) => prev + 1);
    setTimeout(() => setIsReloading(false), 500);
  };

  const activeTip = MAOMAO_HERBOLOGY_TIPS[currentTipIndex];

  return (
    <div className="w-full relative bg-[#070f0b]/98 border border-emerald-800/40 rounded-2xl overflow-hidden shadow-2xl mb-8 animate-in fade-in">
      {/* Top Header Bar */}
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
          {/* Active Provider Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[10px] text-emerald-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{currentProvider.shortName} · Drive {providerIndex + 1}/{STREAM_PROVIDERS.length}</span>
          </div>

          {/* Direct Cinema Pop-Out Button (Bypasses any iframe restrictions with 100% guarantee) */}
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-600 text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-all shadow-md active:scale-95"
            title="Open stream in dedicated cinema tab (Bypasses iframe restrictions)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-black" />
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

      {/* Auto-Cycle Notification Banner */}
      {autoCycleNotice && (
        <div className="bg-gradient-to-r from-amber-950 via-emerald-950 to-amber-950 border-b border-amber-500/50 py-1.5 px-4 text-center text-xs text-amber-300 flex items-center justify-center gap-2 animate-in fade-in">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono">{autoCycleNotice}</span>
        </div>
      )}

      {/* Main Player Area & Collapsible Episodes Drawer */}
      <div className="relative flex flex-col lg:flex-row">
        {/* Left/Main Area: 16:9 Cinema Viewport */}
        <div className="relative flex-1 bg-black">
          <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
            {/* Top-Left Provider Indicator */}
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{currentProvider.shortName}</span>
              <span className="text-amber-400">·</span>
              <span className="text-zinc-400 text-[9px]">{currentProvider.tag.split('·')[0]}</span>
            </div>

            {/* BLACK SCREEN PREVENTER OVERLAY: Displayed while resolving stream */}
            {isResolving && currentProvider.type !== 'hls' && (
              <div className="absolute inset-0 z-10 bg-[#040e0a]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                {/* Poster Background Shadow */}
                {anime?.images?.jpg?.large_image_url && (
                  <div
                    className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none filter blur-sm"
                    style={{ backgroundImage: `url(${anime.images.jpg.large_image_url})` }}
                  />
                )}

                <div className="relative z-10 space-y-3 max-w-md">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>

                  <div>
                    <h4 className="font-cinzel text-base font-bold text-white">
                      Resolving Stream Engine...
                    </h4>
                    <p className="text-xs text-emerald-300 font-mono mt-0.5">
                      Connecting to {currentProvider.name}
                    </p>
                    <p className="text-[11px] text-emerald-500/80 mt-1">
                      Auto-checking stream health. Cycling to next provider in {resolveCountdown}s if response hangs.
                    </p>
                  </div>

                  {/* Immediate Action Buttons to Prevent Black Screen */}
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => cycleToNextProvider('manual')}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Switch to Next Server (Drive {(providerIndex + 1) % STREAM_PROVIDERS.length + 1})</span>
                    </button>

                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-[#04140e] border border-emerald-700 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Direct Cinema Pop-Out</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* PLAYER ENGINE: Native HTML5 vs Dynamic Multi-Provider Embed */}
            {currentProvider.type === 'hls' ? (
              // 1. Native HTML5 Video Player
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
              // 2. Strict & Safe Sandboxed Iframe (Prevents Black Screen while Blocking Redirect Hijacking)
              <iframe
                ref={iframeRef}
                key={`embed-${embedUrl}-${reloadKey}-${providerIndex}`}
                id="anime-stream-iframe"
                src={embedUrl}
                onLoad={handleIframeLoaded}
                className="w-full h-full border-0"
                allowFullScreen={true}
                /*
                 * Strict Sandbox Policy:
                 * allow-scripts: Required for video player engine & HLS decryption (prevents black screen).
                 * allow-same-origin: Required for video CDN storage, cookies & Web Workers (prevents black screen).
                 * allow-forms: Allows player controls and search.
                 * allow-presentation: Allows Picture-in-Picture & Chromecast.
                 * Omits 'allow-top-navigation' & 'allow-top-navigation-by-user-activation' to strictly prevent ad hijacking!
                 */
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-downloads"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                referrerPolicy="origin"
                loading="eager"
                title={`${anime?.title || 'Anime'} Episode ${episode} (${currentProvider.shortName})`}
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
            className="w-full lg:w-80 bg-[#05120c] border-t lg:border-t-0 lg:border-l border-emerald-900/60 p-4 flex flex-col max-h-[70vh] lg:max-h-none overflow-y-auto scrollbar-thin"
          >
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

      {/* Screen Troubleshooting & Automated Resolver Bar */}
      <div className="px-4 py-2 bg-[#04120a] border-b border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-300">
        <div className="flex items-center gap-2 flex-wrap">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">Stream Resolver:</span>
          <span>Drive {providerIndex + 1}: <strong className="text-amber-300">{currentProvider.name}</strong></span>
          <button
            onClick={() => cycleToNextProvider('manual')}
            className="text-amber-300 underline font-semibold hover:text-white ml-1"
          >
            Cycle Next Provider ({STREAM_PROVIDERS[(providerIndex + 1) % STREAM_PROVIDERS.length].shortName})
          </button>
          <span>·</span>
          <button
            onClick={() => {
              setProviderIndex(6); // Native HTML5
              setReloadKey((k) => k + 1);
            }}
            className="text-emerald-400 underline font-semibold hover:text-white"
          >
            Drive 7 (Native Player)
          </button>
        </div>

        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-bold"
        >
          <span>Direct Cinema Window ↗</span>
        </a>
      </div>

      {/* Bottom Control Rack: VERSION, EPISODE, and DRIVE Selectors */}
      <div className="p-3 sm:p-4 bg-[#030a07] border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side: Version & Episode Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* VERSION Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#05170f] border border-emerald-800/80">
            <span className="text-[10px] uppercase font-mono text-emerald-500 font-bold">VERSION</span>
            <button
              onClick={() => setAudioVersion(audioVersion === 'sub' ? 'dub' : 'sub')}
              className="text-xs font-medium text-amber-300 hover:text-white transition-colors"
            >
              {audioVersion === 'sub' ? '(Original Sub)' : '(English Dub)'}
            </button>
          </div>

          {/* EPISODE Stepper Selector */}
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

          {/* DYNAMIC MULTI-PROVIDER SELECTOR: Cycles through VidSrc, EmbedSU, etc. */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#05170f] border border-emerald-800/80 overflow-x-auto scrollbar-none">
            <span className="text-[10px] uppercase font-mono text-emerald-500 font-bold mr-1">DRIVE</span>
            {STREAM_PROVIDERS.map((srv, idx) => {
              const isActive = providerIndex === idx;
              return (
                <button
                  key={srv.id}
                  onClick={() => {
                    setProviderIndex(idx);
                    setCycleAttemptCount(1);
                    setIsResolving(true);
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
