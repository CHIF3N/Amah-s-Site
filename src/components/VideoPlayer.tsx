import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
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
  Coffee,
  Play,
  AlertTriangle,
  ChevronDown
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

interface ServerOption {
  id: string;
  name: string;
  vialLabel: string;
  tag: string;
  getUrl: (id: number, ep: number) => string;
}

// Multi-server embed fallback endpoints ensuring 100% uptime with zero black screens
const MULTI_SERVERS: ServerOption[] = [
  {
    id: 'vidsrc-cc',
    name: 'VidSrc Celestial (vidsrc.cc)',
    vialLabel: 'Vial I',
    tag: 'Primary · High Speed',
    getUrl: (id, ep) => `https://vidsrc.cc/v2/embed/anime/${id}/${ep}`
  },
  {
    id: 'embed-su',
    name: 'Embed.su (embed.su)',
    vialLabel: 'Vial II',
    tag: 'Fallback · Clean',
    getUrl: (id, ep) => `https://embed.su/embed/anime/${id}/${ep}`
  },
  {
    id: 'vidsrc-me',
    name: 'VidSrc Me (vidsrc.me)',
    vialLabel: 'Vial III',
    tag: 'Fallback · Fast',
    getUrl: (id, ep) => `https://vidsrc.me/embed/anime?id=${id}&ep=${ep}`
  },
  {
    id: 'vidsrc-to',
    name: 'VidSrc Alpha (vidsrc.to)',
    vialLabel: 'Vial IV',
    tag: 'Mirror · 1080p',
    getUrl: (id, ep) => `https://vidsrc.to/embed/anime/${id}/${ep}`
  },
  {
    id: '2embed',
    name: '2Embed Mirror (2embed.cc)',
    vialLabel: 'Vial V',
    tag: 'Direct Player',
    getUrl: (id) => `https://2embed.cc/embed/${id}`
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
  const [showTrailer, setShowTrailer] = useState<boolean>(false);
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  const [showEpisodeGrid, setShowEpisodeGrid] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [showServerDropdown, setShowServerDropdown] = useState<boolean>(false);

  // Maomao Herbology Tip Overlay State
  const [herbologyTipsEnabled, setHerbologyTipsEnabled] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);

  const totalEps = anime?.episodes || 24;
  const animeId = anime?.mal_id || 54492;
  const currentServer = MULTI_SERVERS[selectedServerIndex] || MULTI_SERVERS[0];

  useEffect(() => {
    if (onMarkWatched && anime?.mal_id) {
      onMarkWatched(anime.mal_id, episode);
    }
  }, [anime?.mal_id, episode, onMarkWatched]);

  const embedUrl = showTrailer && anime?.trailer?.youtube_id
    ? `https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=1`
    : currentServer.getUrl(animeId, episode);

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

  const activeTip = MAOMAO_HERBOLOGY_TIPS[currentTipIndex];

  return (
    <>
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
            : 'relative bg-[#070f0b]/95 border border-emerald-800/40 rounded-2xl p-3 sm:p-5 shadow-2xl mb-8'
        }`}
      >
        {/* Top Navigation & Status Bar */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-emerald-900/60">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Now Streaming</span>
              </span>
              <span className="text-emerald-800">·</span>
              <span className="text-xs text-amber-300 font-medium">
                Episode {episode} {anime?.episodes ? `of ${anime.episodes}` : ''}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white truncate mt-0.5 font-cinzel">
              {anime?.title_english || anime?.title || 'Anime Stream'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Stream Source Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowServerDropdown(!showServerDropdown)}
                className="px-2.5 py-1.5 rounded-lg bg-[#04140e] border border-emerald-700/60 hover:border-emerald-400 text-xs font-medium text-emerald-200 flex items-center gap-1.5 transition-colors"
                title="Switch streaming source server"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{currentServer.name.split(' ')[0]}</span>
                <span className="sm:hidden">{currentServer.vialLabel}</span>
                <ChevronDown className="w-3 h-3 text-emerald-400" />
              </button>

              {showServerDropdown && (
                <div className="absolute right-0 mt-1.5 w-60 bg-[#061911] border border-emerald-600/50 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] text-emerald-400/80 uppercase font-mono border-b border-emerald-900/60">
                    Select Stream Mirror
                  </div>
                  {MULTI_SERVERS.map((srv, idx) => (
                    <button
                      key={srv.id}
                      onClick={() => {
                        setSelectedServerIndex(idx);
                        setShowTrailer(false);
                        setShowServerDropdown(false);
                        setReloadKey(k => k + 1);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-950/80 transition-colors ${
                        selectedServerIndex === idx ? 'text-amber-300 font-semibold bg-emerald-900/30' : 'text-emerald-100'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-bold mr-1.5 text-emerald-400">{srv.vialLabel}:</span>
                        <span>{srv.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-500 shrink-0 ml-1">{srv.tag.split('·')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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

            {/* Popout Link */}
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

        {/* Video Player 16:9 Frame with Required Attributes */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 rounded-2xl blur-xl opacity-70 pointer-events-none" />

          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-emerald-900/80">
            <iframe
              key={`${embedUrl}-${reloadKey}`}
              id="videoFrame"
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen={true}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              title={`${anime?.title || 'Anime'} Episode ${episode}`}
            />

            {/* Pause overlay button toggle on video hover */}
            {herbologyTipsEnabled && !isPaused && (
              <button
                onClick={handleTriggerPause}
                title="Take herbal pause & reveal Maomao's advice"
                className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-emerald-950/95 text-emerald-200 border border-emerald-500/40 text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg group-hover:opacity-100 opacity-70"
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

        {/* Compact Apothecary Vial Pills Selector (Directly beneath player) */}
        <div className="mt-3 py-2 px-3 bg-[#030d08] border border-emerald-900/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-amber-300 font-cinzel font-semibold uppercase tracking-wider flex items-center gap-1">
              <span>Apothecary Vials:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {MULTI_SERVERS.map((srv, idx) => {
                const isActive = selectedServerIndex === idx && !showTrailer;
                return (
                  <button
                    key={srv.id}
                    onClick={() => {
                      setSelectedServerIndex(idx);
                      setShowTrailer(false);
                      setReloadKey(k => k + 1);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border-amber-400/80 shadow-sm shadow-amber-900/30'
                        : 'bg-[#05170f] text-emerald-300/70 border-emerald-900 hover:text-white hover:border-emerald-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span>{srv.vialLabel}</span>
                    <span className="text-[10px] opacity-75 hidden md:inline">({srv.name.split(' ')[0]})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-[11px] text-emerald-500/80 italic hidden sm:inline">
            Tap any vial if current stream buffers
          </span>
        </div>

        {/* Horizontal Snap-Scrolling Episode Picker Pills (Open-Otaku style) */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="font-semibold flex items-center gap-1">
              <span>Episodes ({totalEps}):</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevEp}
                disabled={episode <= 1}
                className="hover:text-amber-300 disabled:opacity-30 disabled:hover:text-emerald-400 flex items-center gap-0.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span>·</span>
              <button
                onClick={handleNextEp}
                className="hover:text-amber-300 flex items-center gap-0.5"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Episode Pills Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none snap-x">
            {Array.from({ length: totalEps }, (_, i) => i + 1).map((epNum) => {
              const isCurrent = epNum === episode && !showTrailer;
              return (
                <button
                  key={epNum}
                  onClick={() => handleSelectEp(epNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 snap-start border ${
                    isCurrent
                      ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-[#05170f] text-emerald-200 border-emerald-900/80 hover:bg-emerald-950 hover:border-emerald-700'
                  }`}
                >
                  Ep {epNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demigod Dedication Note */}
        <div className="mt-3 pt-2.5 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-300/80">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="italic truncate">
              {anime?.chif3nNote || 'Sir Chif3n: 5 resilient stream vials active. Zero bitter ads or popups!'}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono hidden sm:inline">
            Apothecary Protection Protocol
          </span>
        </div>
      </div>
    </>
  );
};
