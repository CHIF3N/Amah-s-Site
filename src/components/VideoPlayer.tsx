import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  RotateCw,
  ShieldCheck,
  ShieldAlert,
  Coffee,
  Play,
  Layers,
  Sparkles,
  Server,
  Zap,
  Film,
  ExternalLink,
  Wrench,
  HelpCircle,
  CheckCircle,
  Globe,
  Monitor,
  Search,
  MessageSquare,
  AlertTriangle,
  Flame,
  Tv
} from 'lucide-react';
import { AnimeItem } from '../types/anime';
import {
  WatchPartySession,
  DanmakuReaction,
  subscribeToWatchPartySession,
  updateWatchPartySession,
  broadcastDanmaku
} from '../services/firebase';

interface VideoPlayerProps {
  anime: AnimeItem;
  episode: number;
  onEpisodeChange: (ep: number) => void;
  onClose: () => void;
  isDateNightSaved: boolean;
  onToggleDateNight: (anime: AnimeItem) => void;
  onMarkWatched?: (malId: number, ep: number) => void;
  activeRole?: 'chif3n' | 'leslye';
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
    id: 'vidlink-1',
    name: 'VidLink Pro (Reddit #1 Top Pick)',
    shortName: 'VidLink',
    tag: '⚡ Ultra Fast Multi-CDN · Sub/Dub · No Traps',
    buildUrl: (id, ep) => `https://vidlink.pro/anime/${id}/${ep || 1}`
  },
  {
    id: 'vial-1',
    name: 'VidSrc Alpha (Vial I - Primary)',
    shortName: 'VidSrc Alpha',
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
  },
  {
    id: 'vial-5',
    name: 'MultiEmbed (Vial V - Fast Multi)',
    shortName: 'MultiEmbed',
    tag: 'Direct Multi-Server · Fast Loading',
    buildUrl: (id, ep) => `https://multiembed.mov/?video_id=${id}&tmdb=0`
  },
  {
    id: 'vial-6',
    name: 'AutoEmbed (Vial VI - Clean Mobile)',
    shortName: 'AutoEmbed',
    tag: 'Low Latency · Mobile Stream',
    buildUrl: (id, ep) => `https://player.autoembed.cc/embed/anime/${id}/${ep || 1}`
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
  activeRole = 'chif3n',
}) => {
  const [selectedServerIndex, setSelectedServerIndex] = useState<number>(0);
  const [isFrameLoading, setIsFrameLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [episodesDrawerOpen, setEpisodesDrawerOpen] = useState<boolean>(false);
  const [isTeaBreak, setIsTeaBreak] = useState<boolean>(false);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [directMode, setDirectMode] = useState<boolean>(false);

  // Stream Doctor & Community Solutions Modal
  const [showDoctorModal, setShowDoctorModal] = useState<boolean>(false);
  const [doctorTab, setDoctorTab] = useState<'quick-fix' | 'reddit-faq' | 'community-mirrors'>('quick-fix');
  const [doctorNotice, setDoctorNotice] = useState<string | null>(null);

  // Watch Party states
  const [isWatchPartyActive, setIsWatchPartyActive] = useState<boolean>(true);
  const [partnerStatus, setPartnerStatus] = useState<string | null>(null);
  const [danmakuList, setDanmakuList] = useState<Array<{ id: string; text?: string; icon: string; top: number }>>([]);
  const lastDanmakuIdRef = useRef<string | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const recordedEpisodeRef = useRef<string | null>(null);

  const animeId = anime?.mal_id || 54492;
  const animeTitle = anime?.title_english || anime?.title || 'Anime';
  const totalEps = anime?.episodes || 24;
  const currentServer = STREAM_SERVERS[selectedServerIndex] || STREAM_SERVERS[0];
  const streamUrl = currentServer.buildUrl(animeId, episode);

  // Safely record watch history once per anime + episode (prevents infinite re-render loop)
  useEffect(() => {
    const key = `${anime?.mal_id}-${episode}`;
    if (onMarkWatched && anime?.mal_id && recordedEpisodeRef.current !== key) {
      recordedEpisodeRef.current = key;
      onMarkWatched(anime.mal_id, episode);
    }
  }, [anime?.mal_id, episode]);

  // Flash loader on change, then reveal player
  useEffect(() => {
    setIsFrameLoading(true);
    const timer = setTimeout(() => {
      setIsFrameLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [episode, selectedServerIndex, reloadKey]);

  // Subscribe to shared Watch Party session
  useEffect(() => {
    const unsub = subscribeToWatchPartySession((session: any) => {
      if (!isWatchPartyActive || !session) return;

      // Check if partner changed episode
      if (session.animeMalId === animeId && session.episode !== episode && session.updatedBy !== activeRole) {
        onEpisodeChange(session.episode);
      }

      // Check if partner sent danmaku
      if (session.lastDanmaku && session.lastDanmaku.id !== lastDanmakuIdRef.current) {
        lastDanmakuIdRef.current = session.lastDanmaku.id;
        const d = session.lastDanmaku;
        setDanmakuList((prev) => [
          ...prev,
          { id: d.id, icon: d.icon, text: d.text, top: Math.floor(Math.random() * 65) + 15 }
        ]);
        setTimeout(() => {
          setDanmakuList((prev) => prev.filter((item) => item.id !== d.id));
        }, 6000);
      }

      const otherName = activeRole === 'chif3n' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑';
      setPartnerStatus(`Live with ${otherName}`);
    });

    return () => unsub();
  }, [isWatchPartyActive, animeId, episode, activeRole, onEpisodeChange]);

  const handleSendDanmaku = async (icon: string, text?: string) => {
    const sender = activeRole === 'chif3n' ? 'Sir Chif3n 👑' : 'Lady Leslye 🌿';
    const newDanmaku: DanmakuReaction = {
      id: `danmaku-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender,
      icon,
      text,
      color: '#10b981',
      timestamp: Date.now()
    };
    lastDanmakuIdRef.current = newDanmaku.id;
    setDanmakuList((prev) => [
      ...prev,
      { id: newDanmaku.id, icon, text, top: Math.floor(Math.random() * 65) + 15 }
    ]);
    setTimeout(() => {
      setDanmakuList((prev) => prev.filter((item) => item.id !== newDanmaku.id));
    }, 6000);

    await broadcastDanmaku(newDanmaku);
  };

  const syncEpisodeChange = (newEp: number) => {
    onEpisodeChange(newEp);
    if (isWatchPartyActive) {
      updateWatchPartySession({
        animeMalId: animeId,
        animeTitle,
        episode: newEp,
        currentTime: 0,
        isPlaying: true,
        updatedBy: activeRole
      });
    }
  };

  const handleNextEpisode = () => {
    if (episode < totalEps) {
      syncEpisodeChange(episode + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (episode > 1) {
      syncEpisodeChange(episode - 1);
    }
  };

  const handleReloadFrame = () => {
    setIsFrameLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleCycleServer = () => {
    setSelectedServerIndex((prev) => (prev + 1) % STREAM_SERVERS.length);
    handleReloadFrame();
  };

  // 1-Click Auto Doctor fix
  const handleAutoRepair = () => {
    handleCycleServer();
    setDoctorNotice(`Switched to ${STREAM_SERVERS[(selectedServerIndex + 1) % STREAM_SERVERS.length].name}! Stream reloaded.`);
    setTimeout(() => setDoctorNotice(null), 3500);
  };

  // Request fullscreen on container
  const handleRequestFullscreen = () => {
    if (playerContainerRef.current) {
      try {
        if (playerContainerRef.current.requestFullscreen) {
          playerContainerRef.current.requestFullscreen();
        } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
          (playerContainerRef.current as any).webkitRequestFullscreen();
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className="w-full rounded-2xl bg-[#030d08] border border-emerald-500/40 shadow-2xl overflow-hidden mb-6 animate-in fade-in duration-300"
    >
      {/* Top Header Bar */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020b06] border-b border-emerald-900/60 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 truncate">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold text-white truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                {animeTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 shrink-0">
                EP {episode}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 block truncate">
              {currentServer.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Stream Doctor / Solutions Button */}
          <button
            onClick={() => setShowDoctorModal(true)}
            className="px-2.5 py-1.5 rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 hover:from-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Open Reddit & GitHub Solutions, Auto-Repair & Stream Diagnostics"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span className="hidden sm:inline">Fix Stream</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 border border-amber-400/40 font-mono text-amber-200">
              Doctor
            </span>
          </button>

          {/* Watch Party Synchronizer Pill */}
          <button
            onClick={() => {
              const next = !isWatchPartyActive;
              setIsWatchPartyActive(next);
              if (next) {
                updateWatchPartySession({
                  animeMalId: animeId,
                  animeTitle,
                  episode,
                  currentTime: 0,
                  isPlaying: true,
                  updatedBy: activeRole
                });
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              isWatchPartyActive
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                : 'bg-[#04140e] border-emerald-900 text-zinc-400'
            }`}
            title="Toggle Real-Time Couple Watch Party Sync"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">
              {isWatchPartyActive ? 'Watch Party Active' : 'Enable Watch Party'}
            </span>
          </button>

          {/* Direct Stream / Sandbox Toggle (Fixes black screen / sandbox restriction) */}
          <button
            onClick={() => setDirectMode(!directMode)}
            className={`px-2 py-1.5 sm:px-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              directMode
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
            }`}
            title="Toggle between Ad-Shield Sandbox (zero popups) and Direct Unrestricted Stream"
          >
            {directMode ? <Zap className="w-3.5 h-3.5 text-amber-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden lg:inline">{directMode ? 'Direct Mode' : 'Shielded'}</span>
          </button>

          {/* External Tab Popout Button */}
          <button
            onClick={() => window.open(streamUrl, '_blank', 'noopener,noreferrer')}
            className="p-2 rounded-xl bg-[#04140e] hover:bg-emerald-950/80 border border-emerald-900/80 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs transition-colors"
            title="Open Video Directly in Full Native Browser Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Reload Stream Button in Header */}
          <button
            onClick={handleReloadFrame}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#04140e] border border-emerald-800 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Reload Video Stream"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFrameLoading ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Reload</span>
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
              <span className="text-[9px] text-emerald-400/90">
                {directMode ? 'Direct Mode' : 'Ad-Shield Sandbox'}
              </span>
            </div>

            {/* Non-intrusive Loading Indicator (never covers viewport in black) */}
            {isFrameLoading && (
              <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-[#021008e6] border border-emerald-400/50 flex items-center gap-2 shadow-xl pointer-events-none animate-in fade-in">
                <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="text-[11px] font-mono text-emerald-200">
                  Loading {currentServer.shortName}...
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
              key={`stream-${streamUrl}-${reloadKey}-${directMode ? 'direct' : 'shielded'}`}
              src={streamUrl}
              onLoad={() => setIsFrameLoading(false)}
              className="w-full h-full border-0 aspect-video rounded-xl bg-black shadow-2xl"
              allowFullScreen={true}
              referrerPolicy="origin"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
              sandbox={
                directMode
                  ? undefined
                  : "allow-scripts allow-same-origin allow-forms allow-presentation allow-top-navigation-by-user-activation"
              }
            />

            {/* Flying Danmaku Reactions Layer */}
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
              {danmakuList.map((item) => (
                <div
                  key={item.id}
                  style={{ top: `${item.top}%` }}
                  className="absolute right-0 whitespace-nowrap px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-amber-400/70 text-white font-mono text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-1.5 animate-danmaku pointer-events-none"
                >
                  <span className="text-base">{item.icon}</span>
                  {item.text && <span>{item.text}</span>}
                </div>
              ))}
            </div>
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
                onClick={() => syncEpisodeChange(epNum)}
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

      {/* Real-Time Danmaku Reaction Toolbar */}
      <div className="px-4 py-2.5 bg-[#020d07] border-t border-b border-emerald-900/80 flex items-center justify-between gap-3 overflow-x-auto text-xs font-mono">
        <div className="flex items-center gap-1.5 shrink-0 text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-bold">Danmaku Reactions:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { icon: '🌿', label: 'Medicinal Leaf' },
            { icon: '🍵', label: 'Poison Test Passed!' },
            { icon: '🧪', label: 'Bubbling Cauldron' },
            { icon: '❤️', label: 'Demigod Love' },
            { icon: '🔍', label: 'Maomao Deduction' },
            { icon: '✨', label: 'Imperial Sparkle' }
          ].map((reaction) => (
            <button
              key={reaction.icon}
              onClick={() => handleSendDanmaku(reaction.icon, reaction.label)}
              className="px-2.5 py-1 rounded-xl bg-[#04170f] hover:bg-[#072a1b] border border-emerald-800/80 hover:border-amber-400 text-white text-xs flex items-center gap-1 transition-all active:scale-90 shadow-sm shrink-0"
              title={`Broadcast ${reaction.label} across partner's screen`}
            >
              <span>{reaction.icon}</span>
              <span className="hidden sm:inline text-[10px] text-emerald-200">{reaction.label}</span>
            </button>
          ))}
        </div>

        {partnerStatus && (
          <span className="text-[10px] font-mono text-amber-300/90 shrink-0 hidden md:inline">
            ● {partnerStatus}
          </span>
        )}
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

      {/* Bottom Controls Bar: Server Switcher, Doctor Trigger & Episode Controls */}
      <div className="p-3 bg-[#020b06] border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-3">
        {/* Multi-Server Mirror Switcher & Reload Stream Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {/* Stream Doctor Pill */}
          <button
            onClick={() => setShowDoctorModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 hover:from-amber-500/30 border border-amber-400/70 text-amber-300 text-xs font-mono font-bold shrink-0 flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Solutions & Doctor</span>
          </button>

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

      {/* ========================================================================= */}
      {/* STREAM DOCTOR & REDDIT / GITHUB SOLUTIONS MODAL                           */}
      {/* ========================================================================= */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#05170f] via-[#03100a] to-[#020805] border border-emerald-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
            {/* Modal Header */}
            <header className="px-5 py-3.5 bg-[#03110b] border-b border-emerald-900/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-cinzel text-base font-bold text-white">Stream Doctor & Solutions</h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                      Reddit & GitHub Index
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80">
                    Fixing playback, mobile Chrome issues, popups, and buffering
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowDoctorModal(false)}
                className="p-1.5 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Diagnostic Alert Banner if action triggered */}
            {doctorNotice && (
              <div className="px-5 py-2 bg-emerald-950 border-b border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in slide-in-from-top-1">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{doctorNotice}</span>
              </div>
            )}

            {/* Doctor Navigation Tabs */}
            <div className="grid grid-cols-3 gap-1 px-4 py-2 bg-[#020a06] border-b border-emerald-950 text-xs font-mono">
              <button
                onClick={() => setDoctorTab('quick-fix')}
                className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  doctorTab === 'quick-fix'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-[#03130d] border-transparent text-emerald-400/70 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1-Click Fixes</span>
              </button>
              <button
                onClick={() => setDoctorTab('reddit-faq')}
                className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  doctorTab === 'reddit-faq'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-[#03130d] border-transparent text-emerald-400/70 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Reddit & GitHub Fixes</span>
              </button>
              <button
                onClick={() => setDoctorTab('community-mirrors')}
                className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  doctorTab === 'community-mirrors'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-[#03130d] border-transparent text-emerald-400/70 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Community Mirrors</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {doctorTab === 'quick-fix' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#02140c] border border-emerald-900/80 font-mono text-xs text-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">CURRENT STATUS:</span>
                      <span className="text-amber-300">Ep {episode} of {totalEps}</span>
                    </div>
                    <div>Active Server: <strong>{currentServer.name}</strong></div>
                    <div>Protection Mode: <strong>{directMode ? 'Direct Mode (Unrestricted)' : 'Ad-Shield Sandbox (Zero Popups)'}</strong></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Auto-Repair / Next Best Mirror */}
                    <button
                      onClick={handleAutoRepair}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-600/20 hover:from-amber-500/30 border border-amber-400/70 text-left transition-all active:scale-95 group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <RotateCw className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-xs font-cinzel font-bold text-amber-300">Auto-Repair / Next Mirror</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans">
                        Automatically cycles to the next fastest cloud CDN and flushes the player cache.
                      </p>
                    </button>

                    {/* Switch to VidLink (Reddit Top Recommendation) */}
                    <button
                      onClick={() => {
                        setSelectedServerIndex(0); // VidLink is index 0
                        handleReloadFrame();
                        setDoctorNotice('Activated VidLink Pro! Rated #1 for smooth streaming on Reddit r/animepiracy.');
                        setTimeout(() => setDoctorNotice(null), 3500);
                      }}
                      className="p-3.5 rounded-2xl bg-[#041d13] hover:bg-[#072a1b] border border-emerald-500/60 text-left transition-all active:scale-95"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-cinzel font-bold text-white">Switch to VidLink (Reddit #1)</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans">
                        Top recommended mirror on Reddit. High bitrates, multi-language sub/dub, no trap popups.
                      </p>
                    </button>

                    {/* Open in Direct Native Tab */}
                    <button
                      onClick={() => {
                        window.open(streamUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="p-3.5 rounded-2xl bg-[#041d13] hover:bg-[#072a1b] border border-emerald-500/60 text-left transition-all active:scale-95"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-cinzel font-bold text-white">Open in Clean Native Tab</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans">
                        100% bypasses mobile Chrome iframe sandbox restrictions or black screen graphics glitch.
                      </p>
                    </button>

                    {/* Toggle Ad-Shield vs Direct Mode */}
                    <button
                      onClick={() => {
                        setDirectMode(!directMode);
                        handleReloadFrame();
                        setDoctorNotice(
                          !directMode
                            ? 'Activated Direct Mode. Best if mobile Chrome was blocking player scripts.'
                            : 'Activated Shielded Mode. Ad-blocker sandbox active!'
                        );
                        setTimeout(() => setDoctorNotice(null), 3500);
                      }}
                      className="p-3.5 rounded-2xl bg-[#041d13] hover:bg-[#072a1b] border border-emerald-500/60 text-left transition-all active:scale-95"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-cinzel font-bold text-white">
                          Toggle Shielded ({directMode ? 'Currently Direct' : 'Currently Shielded'})
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans">
                        Shielded blocks all popup redirects. Direct mode enables full native player features.
                      </p>
                    </button>
                  </div>

                  {/* Chrome Fullscreen Trigger */}
                  <div className="p-3.5 rounded-2xl bg-[#021008] border border-emerald-950 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">Mobile Fullscreen Enforcer</div>
                      <div className="text-[10px] text-emerald-400">Lock landscape orientation on phone for cinema immersion</div>
                    </div>
                    <button
                      onClick={handleRequestFullscreen}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-cinzel font-bold flex items-center gap-1.5 active:scale-95 shadow"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Fullscreen</span>
                    </button>
                  </div>
                </div>
              )}

              {doctorTab === 'reddit-faq' && (
                <div className="space-y-3 text-xs font-sans">
                  {/* Item 1: Black screen with sound */}
                  <div className="p-3.5 rounded-2xl bg-[#02140c] border border-emerald-900/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Issue: Black screen but audio is playing on Chrome</span>
                    </div>
                    <p className="text-zinc-300">
                      <strong>Root Cause (from Reddit r/animepiracy & GitHub issues):</strong> Chrome mobile's hardware video acceleration sometimes fails the WebGL DRM handshake when embedded inside cross-origin iframes.
                    </p>
                    <p className="text-emerald-300 font-mono text-[11px]">
                      💡 <strong>Fix:</strong> Switch to <strong>VidLink</strong> or <strong>EmbedSU</strong> (which use HTML5 direct canvas video elements), or tap <em>"Open in Clean Native Tab"</em>.
                    </p>
                  </div>

                  {/* Item 2: Popups and redirects */}
                  <div className="p-3.5 rounded-2xl bg-[#02140c] border border-emerald-900/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Issue: Random tab opens when tapping play on phone</span>
                    </div>
                    <p className="text-zinc-300">
                      <strong>Root Cause:</strong> Free streaming host networks attempt to trigger <code className="text-emerald-400">window.open</code> popunders on user click.
                    </p>
                    <p className="text-emerald-300 font-mono text-[11px]">
                      💡 <strong>Fix:</strong> Keep <strong>Shielded Mode</strong> active. We specifically configure the iframe sandbox to omit <code className="text-emerald-400">allow-popups</code>, completely neutralizing mobile ad traps!
                    </p>
                  </div>

                  {/* Item 3: Buffering and lag */}
                  <div className="p-3.5 rounded-2xl bg-[#02140c] border border-emerald-900/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Issue: Video stops buffering or gets stuck at 0:00</span>
                    </div>
                    <p className="text-zinc-300">
                      <strong>Root Cause:</strong> Peak-hour traffic congestion on a specific server's CDN edge.
                    </p>
                    <p className="text-emerald-300 font-mono text-[11px]">
                      💡 <strong>Fix:</strong> We maintain 7 distinct server mirrors. Click <strong>AutoEmbed</strong> (low-latency mobile stream) or <strong>MultiEmbed</strong> to bypass the bottleneck instantly.
                    </p>
                  </div>

                  {/* Item 4: Sub vs Dub */}
                  <div className="p-3.5 rounded-2xl bg-[#02140c] border border-emerald-900/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                      <Tv className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Tip: How to toggle English Subtitles or English Dub?</span>
                    </div>
                    <p className="text-zinc-300">
                      Both <strong>VidLink</strong> (Server 1) and <strong>EmbedSU</strong> (Server 3) include native CC and Audio language track selectors built directly inside the video player controls in the lower right.
                    </p>
                  </div>
                </div>
              )}

              {doctorTab === 'community-mirrors' && (
                <div className="space-y-3 font-sans text-xs">
                  <p className="text-emerald-200">
                    If an anime is temporarily unavailable on third-party embed CDNs, tap any verified community index below to launch <strong>{animeTitle}</strong> directly:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* HiAnime / Zoro */}
                    <a
                      href={`https://hianime.to/search?keyword=${encodeURIComponent(animeTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#02140c] hover:bg-emerald-950 border border-emerald-800 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div>
                        <div className="font-bold text-white group-hover:text-emerald-300">HiAnime (Zoro)</div>
                        <div className="text-[10px] text-zinc-400">High-bitrate Sub/Dub community</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* AnimePahe */}
                    <a
                      href={`https://animepahe.ru/api?m=search&q=${encodeURIComponent(animeTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#02140c] hover:bg-emerald-950 border border-emerald-800 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div>
                        <div className="font-bold text-white group-hover:text-emerald-300">AnimePahe Direct</div>
                        <div className="text-[10px] text-zinc-400">Lightweight compressed mobile stream</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* Miruro */}
                    <a
                      href={`https://www.miruro.tv/search?query=${encodeURIComponent(animeTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#02140c] hover:bg-emerald-950 border border-emerald-800 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div>
                        <div className="font-bold text-white group-hover:text-emerald-300">Miruro Stream</div>
                        <div className="text-[10px] text-zinc-400">Clean ad-free modern anime interface</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* Official Crunchyroll */}
                    <a
                      href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(animeTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#02140c] hover:bg-emerald-950 border border-emerald-800 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div>
                        <div className="font-bold text-amber-300 group-hover:text-amber-200">Crunchyroll (Official)</div>
                        <div className="text-[10px] text-zinc-400">Licensed simulcast stream</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* YouTube (Muse Asia / Ani-One) */}
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(animeTitle + ' episode ' + episode + ' official')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#02140c] hover:bg-emerald-950 border border-emerald-800 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div>
                        <div className="font-bold text-rose-300 group-hover:text-rose-200">YouTube Official (Muse / Ani-One)</div>
                        <div className="text-[10px] text-zinc-400">Legal YouTube simulcasts</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* Reddit r/animepiracy Search */}
                    <a
                      href={`https://www.reddit.com/r/animepiracy/search/?q=${encodeURIComponent(animeTitle)}&restrict_sr=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#02140c] hover:bg-emerald-950 border border-emerald-800 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div>
                        <div className="font-bold text-orange-400 group-hover:text-orange-300">Reddit r/animepiracy Index</div>
                        <div className="text-[10px] text-zinc-400">Latest threads, mirrors & solutions</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <footer className="px-5 py-3 bg-[#020b06] border-t border-emerald-950 flex items-center justify-between gap-3">
              <span className="text-[10px] font-mono text-emerald-400/80">
                Leslye's Realm Imperial Video Engine v3.0
              </span>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="px-4 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 font-cinzel font-bold text-xs active:scale-95"
              >
                Close Doctor
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
