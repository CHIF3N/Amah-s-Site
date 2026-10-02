import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Radio,
  Film,
  Heart,
  Lightbulb,
  Sparkles,
  Layers,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Leaf,
  Pause,
  Play,
  FlaskConical,
  AlertTriangle,
  Coffee
} from 'lucide-react';
import Hls from 'hls.js';
import { AnimeItem } from '../types/anime';
import { STREAMING_SERVERS } from '../services/jikanApi';

interface VideoPlayerProps {
  anime: AnimeItem;
  episode: number;
  onEpisodeChange: (ep: number) => void;
  onClose: () => void;
  isDateNightSaved: boolean;
  onToggleDateNight: (anime: AnimeItem) => void;
  onMarkWatched?: (malId: number, ep: number) => void;
}

// Funny Apothecary Diaries & Maomao-themed Herbology Tips
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
  },
  {
    title: 'Herbology Tip No. 6: The Dopamine Withdrawal Warning',
    remedy: 'Immediate Consecutive Episode Dosage',
    advice: 'Pausing in the middle of a high-octane fight or romantic confession triggers acute curiosity syndrome. The only recorded antidote is watching the very next episode together.',
    tag: 'Binge Chemistry'
  },
  {
    title: 'Herbology Tip No. 7: The Jinshi Reaction Principle',
    remedy: 'Pure Demigod Affection',
    advice: 'When Jinshi seeks attention, Maomao looks away with a disgusted face... but when Sir Chif3n leaves a loving message for Leslye, her joy quotient increases by 300%. Fact verified by imperial science.',
    tag: 'Courtship Alchemy'
  }
];

// Error Boundary Fallback Component for HLS/Streams
class StreamErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('Stream component error caught, activating fallback:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  episode,
  onEpisodeChange,
  onClose,
  isDateNightSaved,
  onToggleDateNight,
  onMarkWatched,
}) => {
  const [selectedServerId, setSelectedServerId] = useState<string>('vidsrc-to');
  const [showTrailer, setShowTrailer] = useState<boolean>(false);
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  const [showEpisodeGrid, setShowEpisodeGrid] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Maomao Herbology Tip Overlay State
  const [herbologyTipsEnabled, setHerbologyTipsEnabled] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);

  // Direct HLS player fallback state
  const [hlsError, setHlsError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const totalEps = anime.episodes || 24;
  const currentServer = STREAMING_SERVERS.find((s) => s.id === selectedServerId) || STREAMING_SERVERS[0];

  // Auto-record progress
  useEffect(() => {
    if (onMarkWatched) {
      onMarkWatched(anime.mal_id, episode);
    }
  }, [anime.mal_id, episode, onMarkWatched]);

  // Compute Embed URL with robust fallbacks
  const getEmbedUrl = () => {
    if (showTrailer && anime.trailer?.youtube_id) {
      return `https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=1`;
    }
    if (selectedServerId === '2embed') {
      return `https://2embed.cc/embed/${anime.mal_id}`;
    }
    return currentServer.getUrl(anime.mal_id, episode);
  };

  const embedUrl = getEmbedUrl();

  const handlePrevEp = () => {
    if (episode > 1) {
      setShowTrailer(false);
      setIsPaused(false);
      onEpisodeChange(episode - 1);
    }
  };

  const handleNextEp = () => {
    setShowTrailer(false);
    setIsPaused(false);
    onEpisodeChange(episode + 1);
  };

  const handleSelectEp = (epNum: number) => {
    setShowTrailer(false);
    setIsPaused(false);
    onEpisodeChange(epNum);
    setShowEpisodeGrid(false);
  };

  const handleReloadStream = () => {
    setIsReloading(true);
    setReloadKey((prev) => prev + 1);
    setHlsError(false);
    setTimeout(() => setIsReloading(false), 500);
  };

  const handleTriggerPause = () => {
    setIsPaused(true);
    setCurrentTipIndex((prev) => (prev + 1) % MAOMAO_HERBOLOGY_TIPS.length);
  };

  const handleResumeStream = () => {
    setIsPaused(false);
  };

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTipIndex((prev) => (prev + 1) % MAOMAO_HERBOLOGY_TIPS.length);
  };

  // Keyboard navigation for episodes & pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        handleNextEp();
      } else if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        handlePrevEp();
      } else if (e.key === 'p' && (e.ctrlKey || e.altKey)) {
        if (herbologyTipsEnabled) {
          setIsPaused((p) => !p);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [episode, herbologyTipsEnabled]);

  const activeTip = MAOMAO_HERBOLOGY_TIPS[currentTipIndex];

  return (
    <StreamErrorBoundary
      fallback={
        <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-white font-semibold">Stream Mirror Initialized</h3>
          <p className="text-xs text-zinc-400">Switching to standard multi-server embed...</p>
          <iframe
            src={`https://vidsrc.to/embed/anime/${anime.mal_id}/${episode}`}
            className="w-full aspect-video border-0 rounded-xl"
            allowFullScreen={true}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            title={anime.title}
          />
        </div>
      }
    >
      {/* Cinema Backdrop Dimmer */}
      {cinemaMode && (
        <div
          className="fixed inset-0 bg-black/92 z-40 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setCinemaMode(false)}
        />
      )}

      <div
        className={`w-full transition-all duration-300 ${
          cinemaMode
            ? 'fixed top-4 left-0 right-0 max-w-6xl mx-auto px-4 z-50'
            : 'relative bg-[#061710]/90 border border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-2xl mb-8'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-emerald-900/60">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Now Streaming in Apothecary</span>
              </span>
              <span className="text-emerald-800">·</span>
              <span className="text-xs text-amber-300 font-medium">
                Episode {episode} {anime.episodes ? `of ${anime.episodes}` : ''}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white truncate mt-0.5 font-cinzel">
              {anime.title_english || anime.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Maomao Herbology Tips Toggle */}
            <button
              onClick={() => {
                setHerbologyTipsEnabled(!herbologyTipsEnabled);
                if (isPaused) setIsPaused(false);
              }}
              title={`Maomao Herbology Tips: currently ${herbologyTipsEnabled ? 'ENABLED' : 'DISABLED'}`}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                herbologyTipsEnabled
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
                  : 'bg-[#03110b] text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tips: {herbologyTipsEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Reload stream button */}
            <button
              onClick={handleReloadStream}
              title="Reload stream player"
              className="p-2 rounded-lg text-xs font-medium border bg-[#03110b] text-emerald-300 border-emerald-900 hover:text-white hover:border-emerald-500/50 transition-colors"
            >
              <RotateCw className={`w-4 h-4 ${isReloading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Direct Mirror Popout Link */}
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open stream mirror in clean window"
              className="p-2 rounded-lg text-xs font-medium border bg-[#03110b] text-emerald-300 border-emerald-900 hover:text-white hover:border-emerald-500/50 transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Popout</span>
            </a>

            {/* Cinema mode toggle */}
            <button
              onClick={() => setCinemaMode(!cinemaMode)}
              title={cinemaMode ? 'Exit Cinema Mode' : 'Enter Cinema Theater Mode'}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                cinemaMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#03110b] text-emerald-300 border-emerald-900 hover:text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Cinema</span>
            </button>

            {/* Date night save toggle */}
            <button
              onClick={() => onToggleDateNight(anime)}
              title={isDateNightSaved ? 'Saved in Date Night Queue' : 'Save to Date Night Queue'}
              className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
                isDateNightSaved
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-[#03110b] text-emerald-300 border-emerald-900 hover:text-rose-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isDateNightSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span className="hidden sm:inline">
                {isDateNightSaved ? 'Saved' : 'Date Night'}
              </span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 border border-emerald-900 transition-colors"
              title="Close player"
              aria-label="Close video player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient Backlight & Video Container */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 rounded-2xl blur-xl opacity-70 pointer-events-none" />

          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-emerald-900/80">
            {/* Robust <iframe> with exact required attributes */}
            <iframe
              key={`${embedUrl}-${reloadKey}`}
              id="videoFrame"
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen={true}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              title={`${anime.title} Episode ${episode}`}
            />

            {/* Pause overlay button toggle on video hover */}
            {herbologyTipsEnabled && !isPaused && (
              <button
                onClick={handleTriggerPause}
                title="Take herbal pause & reveal Maomao's advice"
                className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg group-hover:opacity-100 opacity-70"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>Tea Break & Tip</span>
              </button>
            )}

            {/* Toggleable Maomao 'Herbology Tip' Overlay upon Pause */}
            {herbologyTipsEnabled && isPaused && (
              <div
                className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
                onClick={handleResumeStream}
              >
                <div
                  className="max-w-lg w-full bg-[#061e14]/95 border border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-left relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Bar with Leaf & Tag */}
                  <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-600/40 text-emerald-300">
                        <Leaf className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-cinzel text-xs uppercase tracking-widest text-amber-300 font-bold block">
                          Maomao's Herbology Prescription
                        </span>
                        <span className="text-[10px] text-emerald-400/80 font-mono">
                          {activeTip.tag} · Tip {currentTipIndex + 1} of {MAOMAO_HERBOLOGY_TIPS.length}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleResumeStream}
                      className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
                      title="Close and resume"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Diagnosis & Advice Card */}
                  <div className="space-y-2">
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-emerald-100">
                      {activeTip.title}
                    </h3>
                    <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-900/70 text-xs text-amber-300 font-medium">
                      Recommended Herb: {activeTip.remedy}
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed pt-1 italic">
                      "{activeTip.advice}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-emerald-900/60">
                    <button
                      onClick={handleNextTip}
                      className="px-3.5 py-1.5 rounded-lg bg-[#04140e] hover:bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Another Tip</span>
                    </button>

                    <button
                      onClick={handleResumeStream}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Resume Streaming</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Deck */}
        <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
          {/* Left: Episode Navigation & Pause/Tea Break */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrevEp}
              disabled={episode <= 1}
              className="px-3 py-1.5 bg-[#04140e] hover:bg-emerald-950 disabled:opacity-40 disabled:hover:bg-[#04140e] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-emerald-900 text-emerald-200"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev Ep</span>
            </button>

            {/* Episode quick input */}
            <div className="flex items-center bg-[#030e09] border border-emerald-800 rounded-lg px-2 py-1">
              <span className="text-xs text-emerald-400 mr-2 font-medium">Ep:</span>
              <input
                type="number"
                min={1}
                max={anime.episodes || 1500}
                value={episode}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0) {
                    setShowTrailer(false);
                    onEpisodeChange(val);
                  }
                }}
                className="w-14 bg-black border border-emerald-700/80 rounded px-2 py-0.5 text-xs text-center text-white focus:outline-none focus:border-emerald-400 tabular-nums font-mono"
              />
            </div>

            <button
              onClick={handleNextEp}
              className="px-3 py-1.5 bg-[#04140e] hover:bg-emerald-950 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-emerald-900 text-emerald-200"
            >
              <span>Next Ep</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Pause / Tea Break button that triggers Maomao's Herbology Tip */}
            {herbologyTipsEnabled && (
              <button
                onClick={handleTriggerPause}
                className="px-2.5 py-1.5 bg-[#04140e] hover:bg-emerald-950 rounded-lg text-xs font-medium border border-emerald-900 text-amber-300 flex items-center gap-1.5 transition-colors"
                title="Pause stream and get Maomao's advice"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Tea Break</span>
              </button>
            )}

            {/* Quick episode grid button */}
            <button
              onClick={() => setShowEpisodeGrid(!showEpisodeGrid)}
              className="px-2.5 py-1.5 bg-[#04140e] hover:bg-emerald-950 rounded-lg text-xs text-emerald-200 border border-emerald-900 flex items-center gap-1"
              title="Browse all episodes"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>All Episodes</span>
            </button>

            {/* Trailer preview button if available */}
            {anime.trailer?.youtube_id && (
              <button
                onClick={() => setShowTrailer(!showTrailer)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  showTrailer
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#04140e] text-emerald-300 border-emerald-900 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{showTrailer ? 'Back to Anime' : 'Official Trailer'}</span>
              </button>
            )}
          </div>

          {/* Right: Server selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs text-emerald-400 whitespace-nowrap mr-1 flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400" />
              <span>Server:</span>
            </span>

            {STREAMING_SERVERS.map((server) => {
              const active = selectedServerId === server.id && !showTrailer;
              return (
                <button
                  key={server.id}
                  onClick={() => {
                    setSelectedServerId(server.id);
                    setShowTrailer(false);
                    setReloadKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap border ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-400 font-semibold shadow-sm'
                      : 'bg-[#030e09] text-emerald-300/70 border-emerald-900 hover:text-white hover:bg-emerald-950'
                  }`}
                >
                  {server.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demigod's note / Streaming tip for Leslye */}
        <div className="mt-3.5 pt-3 border-t border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-300/80">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="italic">
              {anime.chif3nNote || 'Sir Chif3n says: Multi-server fallbacks active. If VidSrc buffers, 2Embed or Celestial will load seamlessly!'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-500 tabular-nums">
            Use Ctrl+Left/Right arrows for instant episode skipping
          </span>
        </div>

        {/* Expandable Episode Selector Grid */}
        {showEpisodeGrid && (
          <div className="mt-4 p-3 bg-[#030e09] border border-emerald-800 rounded-xl animate-in fade-in">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-emerald-900 text-xs">
              <span className="font-medium text-emerald-200">
                Select Episode (1 – {totalEps})
              </span>
              <button
                onClick={() => setShowEpisodeGrid(false)}
                className="text-emerald-500 hover:text-emerald-300"
              >
                Close Grid
              </button>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto p-1">
              {Array.from({ length: totalEps }, (_, i) => i + 1).map((epNum) => (
                <button
                  key={epNum}
                  onClick={() => handleSelectEp(epNum)}
                  className={`py-1.5 rounded text-xs font-mono tabular-nums transition-colors border ${
                    epNum === episode && !showTrailer
                      ? 'bg-emerald-500 text-white border-emerald-400 font-bold shadow-sm'
                      : 'bg-[#05170f] border-emerald-900 text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  {epNum}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </StreamErrorBoundary>
  );
};
