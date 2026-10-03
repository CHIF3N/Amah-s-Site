import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Heart,
  Crown,
  Play,
  RotateCcw,
  Compass,
  Film,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Leaf,
  Clock,
  ArrowUpDown,
  BookOpen,
  Feather,
  Quote,
  Radio,
  Dice5,
  Zap,
  Filter
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { VideoPlayer } from './components/VideoPlayer';
import { AnimeCard } from './components/AnimeCard';
import { AnimeDetailModal } from './components/AnimeDetailModal';
import { DateNightQueue } from './components/DateNightQueue';
import { DemigodLoveScrolls } from './components/DemigodLoveScrolls';
import { DemigodPoetryDrawer } from './components/DemigodPoetryDrawer';
import { MangaReaderArchive } from './components/MangaReaderArchive';
import { NovelReader } from './components/NovelReader';
import { DateNightCountdownWidget } from './components/DateNightCountdownWidget';
import { DailyApothecaryAffirmation } from './components/DailyApothecaryAffirmation';
import { AnimeGachaAltar } from './components/AnimeGachaAltar';
import { BroadcastSchedule } from './components/BroadcastSchedule';
import { LoFiRadio } from './components/LoFiRadio';
import { LiveLoveScrollChatbox } from './components/LiveLoveScrollChatbox';
import { WatchActivityChart } from './components/WatchActivityChart';
import { AmbientCanvas } from './components/AmbientCanvas';
import { AnimeItem, DateNightItem, WatchHistoryItem, DailyWatchActivity } from './types/anime';
import { CURATED_ANIME, DEMIGOD_SCROLLS, MAOMAO_STATEMENTS_FOR_LESLYE } from './data/curatedData';
import { searchAnime, fetchRecentAnime, sortAnimeByRecent } from './services/jikanApi';

export default function App() {
  const [activeTab, setActiveTab] = useState<'browse' | 'airing' | 'manga' | 'novels' | 'demigod-picks' | 'date-night' | 'love-scrolls'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AnimeItem[] | null>(null);
  const [animeCatalog, setAnimeCatalog] = useState<AnimeItem[]>(() => sortAnimeByRecent(CURATED_ANIME));
  const [selectedGenre, setSelectedGenre] = useState<string>('All Realm');
  const [sortOrder, setSortOrder] = useState<'score' | 'trending' | 'recent'>('recent');

  // Currently playing anime
  const [currentPlayingAnime, setCurrentPlayingAnime] = useState<AnimeItem | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);

  // Modals & Panels
  const [detailAnime, setDetailAnime] = useState<AnimeItem | null>(null);
  const [poetryDrawerOpen, setPoetryDrawerOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [gachaModalOpen, setGachaModalOpen] = useState(false);
  const [radioModalOpen, setRadioModalOpen] = useState(false);
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);

  // Ambience mode
  const [ambientMode, setAmbientMode] = useState<'stars' | 'sakura' | 'off'>('stars');

  // Rotating poetic dedication index
  const [bannerStatementIdx, setBannerStatementIdx] = useState(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerStatementIdx((prev) => (prev + 1) % MAOMAO_STATEMENTS_FOR_LESLYE.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Persisted state: Date Night queue
  const [dateNightItems, setDateNightItems] = useState<DateNightItem[]>(() => {
    try {
      const saved = localStorage.getItem('leslye_date_night');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        malId: 54492,
        title: 'The Apothecary Diaries',
        image: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
        addedAt: Date.now() - 1000 * 60 * 60 * 24,
        watched: false,
        ourRating: 5,
        coupleComment: 'Our crown jewel anime! Maomao is literally Leslye 🌿✨'
      },
      {
        malId: 52991,
        title: "Frieren: Beyond Journey's End",
        image: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
        addedAt: Date.now() - 1000 * 60 * 60 * 48,
        watched: true,
        ourRating: 5,
        coupleComment: 'Loved every single second of watching this together.'
      }
    ];
  });

  // Persisted state: Watch history
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('leslye_watch_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        malId: 54492,
        title: 'The Apothecary Diaries',
        image: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
        episode: 5,
        totalEpisodes: 24,
        lastWatchedAt: Date.now() - 1000 * 60 * 30,
        server: 'Vial I (API Resolver)',
      },
      {
        malId: 52991,
        title: "Frieren: Beyond Journey's End",
        image: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
        episode: 14,
        totalEpisodes: 28,
        lastWatchedAt: Date.now() - 1000 * 60 * 180,
        server: 'Vial II (VidSrc Mirror)',
      }
    ];
  });

  // Persisted state: Daily Watch Activity for Recharts
  const [activityData, setActivityData] = useState<DailyWatchActivity[]>(() => {
    try {
      const saved = localStorage.getItem('leslye_watch_activity');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      { day: 'Mon', fullDate: 'Day 1', episodes: 3 },
      { day: 'Tue', fullDate: 'Day 2', episodes: 5 },
      { day: 'Wed', fullDate: 'Day 3', episodes: 2 },
      { day: 'Thu', fullDate: 'Day 4', episodes: 4 },
      { day: 'Fri', fullDate: 'Day 5', episodes: 6 },
      { day: 'Sat', fullDate: 'Day 6', episodes: 8 },
      { day: 'Sun', fullDate: 'Day 7', episodes: 4 },
    ];
  });

  // Persisted state: Leslye custom notes
  const [leslyeNotes, setLeslyeNotes] = useState<Array<{ id: string; text: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem('leslye_custom_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'initial-1',
        text: 'Thank you for building my Maomao apothecary realm, Sir Chif3n. You are my favorite protector! 💚',
        date: 'Today',
      }
    ];
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('leslye_date_night', JSON.stringify(dateNightItems));
    } catch (e) {}
  }, [dateNightItems]);

  useEffect(() => {
    try {
      localStorage.setItem('leslye_watch_history', JSON.stringify(watchHistory));
    } catch (e) {}
  }, [watchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('leslye_watch_activity', JSON.stringify(activityData));
    } catch (e) {}
  }, [activityData]);

  useEffect(() => {
    try {
      localStorage.setItem('leslye_custom_notes', JSON.stringify(leslyeNotes));
    } catch (e) {}
  }, [leslyeNotes]);

  // Initial load recent releases
  useEffect(() => {
    let isMounted = true;
    fetchRecentAnime().then((data) => {
      if (isMounted && data && data.length > 0) {
        setAnimeCatalog(sortAnimeByRecent(data));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Search execution
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAnime(query);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Start playing (rolls viewport smoothly to top)
  const handlePlayAnime = (anime: AnimeItem, ep: number = 1) => {
    setCurrentPlayingAnime(anime);
    setCurrentEpisode(ep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mark watched in history and increment weekly activity
  const handleRecordHistory = (malId: number, ep: number) => {
    const anime = currentPlayingAnime;
    if (!anime) return;
    setWatchHistory((prev) => {
      const filtered = prev.filter((item) => item.malId !== malId);
      const poster = anime?.images?.webp?.image_url || anime?.images?.jpg?.image_url || '';
      const updated: WatchHistoryItem = {
        malId,
        title: anime?.title_english || anime?.title || 'Anime Stream',
        image: poster,
        episode: ep,
        totalEpisodes: anime?.episodes || null,
        lastWatchedAt: Date.now(),
        server: 'Vial I (API Resolver)',
      };
      return [updated, ...filtered].slice(0, 10);
    });

    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    setActivityData((prev) => {
      return prev.map((item) => {
        if (item.day === currentDayName) {
          return { ...item, episodes: item.episodes + 1 };
        }
        return item;
      });
    });
  };

  const totalThisWeek = useMemo(() => {
    return activityData.reduce((acc, curr) => acc + (curr?.episodes || 0), 0);
  }, [activityData]);

  const streakDays = useMemo(() => {
    return activityData.filter((d) => d?.episodes > 0).length;
  }, [activityData]);

  // Toggle Date Night item
  const handleToggleDateNight = (anime: AnimeItem) => {
    const exists = dateNightItems.some((i) => i.malId === anime?.mal_id);
    if (exists) {
      setDateNightItems((prev) => prev.filter((i) => i.malId !== anime?.mal_id));
      showToast(`Removed "${anime?.title_english || anime?.title}" from Date Night`);
    } else {
      const poster = anime?.images?.webp?.image_url || anime?.images?.jpg?.image_url || '';
      const newItem: DateNightItem = {
        malId: anime?.mal_id || Date.now(),
        title: anime?.title_english || anime?.title || 'Date Night Anime',
        image: poster,
        addedAt: Date.now(),
        watched: false,
        ourRating: 5,
        coupleComment: 'Handpicked for date night with Sir Chif3n 💚'
      };
      setDateNightItems((prev) => [newItem, ...prev]);
      showToast(`Added "${anime?.title_english || anime?.title}" to Date Night Queue! 🌿`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle ambient mode
  const handleToggleAmbient = () => {
    if (ambientMode === 'stars') setAmbientMode('sakura');
    else if (ambientMode === 'sakura') setAmbientMode('off');
    else setAmbientMode('stars');
  };

  // Genre Filters List
  const GENRE_PILLS = [
    'All Realm',
    'Action & Shonen',
    'Fantasy & Isekai',
    'Sci-Fi & Cyberpunk',
    'Drama & Mystery',
    'Comedy & Slice',
    'Romance & Palace'
  ];

  // Map genre pill to keywords
  const genreKeywordMap: Record<string, string[]> = {
    'Action & Shonen': ['action', 'shounen', 'shonen', 'super power', 'martial arts'],
    'Fantasy & Isekai': ['fantasy', 'isekai', 'magic', 'adventure'],
    'Sci-Fi & Cyberpunk': ['sci-fi', 'mecha', 'space', 'cyberpunk'],
    'Drama & Mystery': ['drama', 'mystery', 'psychological', 'suspense'],
    'Comedy & Slice': ['comedy', 'slice of life', 'gag'],
    'Romance & Palace': ['romance', 'historical', 'shoujo', 'palace']
  };

  // Filtered & Sorted Catalog
  const filteredAndSortedCatalog = useMemo(() => {
    let list = searchResults || animeCatalog;

    // Airing filter if activeTab is airing
    if (activeTab === 'airing') {
      list = list.filter((a) => a?.status === 'Currently Airing' || (a?.year && a.year >= 2024));
    }

    // Genre filter
    if (selectedGenre !== 'All Realm') {
      const keywords = genreKeywordMap[selectedGenre] || [];
      list = list.filter((anime) => {
        return anime?.genres?.some((g) =>
          keywords.some((kw) => g?.name?.toLowerCase().includes(kw))
        );
      });
    }

    // Sort order
    return [...list].sort((a, b) => {
      if (sortOrder === 'score') {
        return (b?.score || 0) - (a?.score || 0);
      } else if (sortOrder === 'trending') {
        return (b?.popularity || 100) - (a?.popularity || 100);
      } else {
        // recent first
        const yearA = a?.year || (a?.status === 'Currently Airing' ? 2025 : 2020);
        const yearB = b?.year || (b?.status === 'Currently Airing' ? 2025 : 2020);
        if (yearB !== yearA) return yearB - yearA;
        return (b?.score || 0) - (a?.score || 0);
      }
    });
  }, [searchResults, animeCatalog, selectedGenre, sortOrder, activeTab]);

  return (
    <div className="min-h-screen bg-[#040c08] text-emerald-50 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 relative pb-16 md:pb-0">
      {/* Ambient Canvas */}
      <AmbientCanvas enabled={ambientMode !== 'off'} mode={ambientMode} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-50 p-4 rounded-xl bg-[#061e14]/95 border border-emerald-500/50 shadow-2xl text-xs sm:text-sm text-emerald-100 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Interactive Modals */}
      <DemigodPoetryDrawer
        isOpen={poetryDrawerOpen}
        onClose={() => setPoetryDrawerOpen(false)}
      />

      <BroadcastSchedule
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onPlayAnime={(a) => handlePlayAnime(a, 1)}
        catalog={animeCatalog}
      />

      <AnimeGachaAltar
        isOpen={gachaModalOpen}
        onClose={() => setGachaModalOpen(false)}
        animeList={animeCatalog}
        onPlayAnime={(a) => handlePlayAnime(a, 1)}
        onToggleDateNight={handleToggleDateNight}
        isDateNightSaved={(id) => dateNightItems.some((i) => i.malId === id)}
      />

      <LoFiRadio
        isOpen={radioModalOpen}
        onClose={() => setRadioModalOpen(false)}
      />

      {/* Top Navbar with Branding */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSchedule={() => setScheduleModalOpen(true)}
        onOpenGacha={() => setGachaModalOpen(true)}
        onOpenRadio={() => setRadioModalOpen(true)}
        onOpenPoetry={() => setPoetryDrawerOpen(true)}
        ambientMode={ambientMode}
        onToggleAmbient={handleToggleAmbient}
        dateNightCount={dateNightItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 relative z-20">
        
        {/* Stream Player Section (Immediate Viewport Rollout) */}
        {currentPlayingAnime && (
          <VideoPlayer
            anime={currentPlayingAnime}
            episode={currentEpisode}
            onEpisodeChange={(ep) => setCurrentEpisode(ep)}
            onClose={() => setCurrentPlayingAnime(null)}
            isDateNightSaved={dateNightItems.some((i) => i.malId === currentPlayingAnime?.mal_id)}
            onToggleDateNight={handleToggleDateNight}
            onMarkWatched={handleRecordHistory}
          />
        )}

        {/* Quick Navigation Pill Bar (Scrollable horizontally on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x border-b border-emerald-950 pb-3">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start border ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-950/60'
                : 'bg-[#05170f] text-emerald-300/80 border-emerald-900/80 hover:text-white hover:border-emerald-700'
            }`}
          >
            <span>🌿 Realm Home</span>
          </button>

          <button
            onClick={() => setActiveTab('airing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start border ${
              activeTab === 'airing'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md'
                : 'bg-[#05170f] text-emerald-300/80 border-emerald-900/80 hover:text-white hover:border-emerald-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Airing Now</span>
          </button>

          <button
            onClick={() => setScheduleModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#05170f] border border-emerald-900/80 text-emerald-300/80 hover:text-white hover:border-emerald-700 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>📅 Broadcast Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('demigod-picks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start border ${
              activeTab === 'demigod-picks'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold border-amber-300 shadow-md'
                : 'bg-[#05170f] text-amber-400/90 border-amber-900/50 hover:text-white hover:border-amber-600'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>👑 My Vault / Favorites</span>
          </button>

          <button
            onClick={() => setGachaModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/40 text-amber-300 hover:border-amber-400 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-400" />
            <span>🎲 Anime Gacha Altar</span>
          </button>

          <button
            onClick={() => setRadioModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#05170f] border border-emerald-900/80 text-emerald-300/80 hover:text-white hover:border-emerald-700 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>🎵 OST Lo-Fi Radio</span>
          </button>

          <button
            onClick={() => setActiveTab('manga')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start border ${
              activeTab === 'manga'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md'
                : 'bg-[#05170f] text-emerald-300/80 border-emerald-900/80 hover:text-white hover:border-emerald-700'
            }`}
          >
            <span>📜 Manga Scrolls</span>
          </button>

          <button
            onClick={() => setActiveTab('novels')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start border ${
              activeTab === 'novels'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md'
                : 'bg-[#05170f] text-emerald-300/80 border-emerald-900/80 hover:text-white hover:border-emerald-700'
            }`}
          >
            <span>📖 Imperial Tomes (Novels)</span>
          </button>
        </div>

        {/* Tab 1: Anime Catalog (Browse & Airing) */}
        {(activeTab === 'browse' || activeTab === 'airing') && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Widgets: Next Date Night Countdown & Daily Affirmation */}
            {!searchResults && !currentPlayingAnime && (
              <div className="space-y-4">
                <DateNightCountdownWidget
                  firstItem={dateNightItems[0]}
                  onPlayAnime={(id, title) => {
                    const matched = animeCatalog.find((a) => a.mal_id === id) || ({
                      mal_id: id,
                      title,
                      images: { jpg: { image_url: '' } }
                    } as AnimeItem);
                    handlePlayAnime(matched, 1);
                  }}
                  onExploreCatalog={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                  onOpenDateNightTab={() => setActiveTab('date-night')}
                />

                <DailyApothecaryAffirmation />
              </div>
            )}

            {/* Live Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search series (e.g. Apothecary Diaries, Frieren, Dandadan, Solo Leveling)..."
                  className="w-full bg-[#030e09]/90 border border-emerald-800/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-400 shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white text-xs p-1"
                  >
                    &times;
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Continue Streaming & Progress Section */}
            {!searchResults && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-base sm:text-lg font-semibold text-white font-cinzel">
                      Continue Streaming & Activity
                    </h2>
                  </div>
                  {watchHistory.length > 0 && (
                    <button
                      onClick={() => setWatchHistory([])}
                      className="text-xs text-emerald-500 hover:text-emerald-300 transition-colors"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {/* Recharts Weekly Progress Activity Chart */}
                <WatchActivityChart
                  activityData={activityData}
                  totalThisWeek={totalThisWeek}
                  streakDays={streakDays}
                />

                {/* Quick Resume Row */}
                {watchHistory.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {watchHistory.map((item) => (
                      <div
                        key={item.malId}
                        onClick={() => {
                          const matched = animeCatalog.find((a) => a.mal_id === item.malId) || ({
                            mal_id: item.malId,
                            title: item.title,
                            images: { jpg: { image_url: item.image } },
                            episodes: item.totalEpisodes,
                          } as AnimeItem);
                          handlePlayAnime(matched, item.episode);
                        }}
                        className="group min-w-[210px] sm:min-w-[240px] max-w-[240px] bg-[#061710]/70 border border-emerald-900/60 rounded-xl p-2.5 hover:border-emerald-400/50 cursor-pointer transition-all shrink-0 flex gap-3 items-center shadow-md"
                      >
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-950">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-white truncate font-cinzel">{item.title}</h4>
                          <p className="text-[11px] text-amber-300 mt-0.5">Resume Ep {item.episode}</p>
                          <span className="text-[10px] text-emerald-500/80 block">Click to stream</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Filter Pill Row & Sorting Selector Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-emerald-950">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {GENRE_PILLS.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                      selectedGenre === genre
                        ? 'bg-emerald-600 text-white border-emerald-400 font-semibold shadow-sm'
                        : 'bg-[#05170f] text-emerald-300/80 border-emerald-900/80 hover:text-white hover:bg-emerald-950'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {/* Sorting Selector Dropdown on the Right */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <div className="flex items-center gap-1.5 bg-[#030e09] border border-emerald-900/80 rounded-xl px-3 py-1.5 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-emerald-500">Sort:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-transparent text-emerald-200 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="recent" className="bg-[#040e0a] text-white">Recently Updated</option>
                    <option value="score" className="bg-[#040e0a] text-white">Highest Score</option>
                    <option value="trending" className="bg-[#040e0a] text-white">Trending Brews</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid of Reference Style Anime Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredAndSortedCatalog.map((anime) => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={anime}
                  onPlay={(a) => handlePlayAnime(a, 1)}
                  onOpenDetails={(a) => setDetailAnime(a)}
                  isDateNightSaved={dateNightItems.some((i) => i.malId === anime?.mal_id)}
                  onToggleDateNight={handleToggleDateNight}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Manga Scrolls (MangaDex Integration) */}
        {activeTab === 'manga' && (
          <MangaReaderArchive />
        )}

        {/* Tab 3: Imperial Tomes (In-App Novel Sanctuary) */}
        {activeTab === 'novels' && (
          <NovelReader />
        )}

        {/* Tab 4: Demigod's Picks / Sacred Vault */}
        {activeTab === 'demigod-picks' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#06241a] via-[#04150f] to-[#0c261c] border border-amber-500/40">
              <div className="max-w-2xl">
                <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
                  👑 Sacred Royal Vault
                </span>
                <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Demigod's Handpicked Picks for Lady Leslye ❤️
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 leading-relaxed">
                  Every series in this vault was carefully reviewed by your demigod boyfriend for mystery, romance, emotional impact, and peerless animation quality—ranked with recent anime first!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {sortAnimeByRecent(CURATED_ANIME).map((anime) => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={anime}
                  onPlay={(a) => handlePlayAnime(a, 1)}
                  onOpenDetails={(a) => setDetailAnime(a)}
                  isDateNightSaved={dateNightItems.some((i) => i.malId === anime?.mal_id)}
                  onToggleDateNight={handleToggleDateNight}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Date Night Queue */}
        {activeTab === 'date-night' && (
          <DateNightQueue
            items={dateNightItems}
            onPlayAnime={(malId, title) => {
              const matched = animeCatalog.find((a) => a.mal_id === malId) || ({
                mal_id: malId,
                title,
                images: { jpg: { image_url: '' } },
              } as AnimeItem);
              handlePlayAnime(matched, 1);
            }}
            onRemoveItem={(malId) => {
              setDateNightItems((prev) => prev.filter((i) => i.malId !== malId));
              showToast('Removed from Date Night Queue');
            }}
            onToggleWatched={(malId) => {
              setDateNightItems((prev) =>
                prev.map((i) => (i.malId === malId ? { ...i, watched: !i.watched } : i))
              );
            }}
            onUpdateComment={(malId, comment) => {
              setDateNightItems((prev) =>
                prev.map((i) => (i.malId === malId ? { ...i, coupleComment: comment } : i))
              );
            }}
            onUpdateRating={(malId, rating) => {
              setDateNightItems((prev) =>
                prev.map((i) => (i.malId === malId ? { ...i, ourRating: rating } : i))
              );
            }}
            onExploreCatalog={() => setActiveTab('browse')}
          />
        )}

        {/* Tab 6: Love Scrolls & Decrees */}
        {activeTab === 'love-scrolls' && (
          <DemigodLoveScrolls
            scrolls={DEMIGOD_SCROLLS}
            leslyeNotes={leslyeNotes}
            onAddLeslyeNote={(text) => {
              const newEntry = {
                id: `note-${Date.now()}`,
                text,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              };
              setLeslyeNotes((prev) => [newEntry, ...prev]);
              showToast('Whisper inscribed in the Imperial Diary! 🌿✨');
            }}
            onDeleteLeslyeNote={(id) => {
              setLeslyeNotes((prev) => prev.filter((n) => n.id !== id));
            }}
          />
        )}
      </main>

      {/* Floating Bottom Nav for Mobile Ergonomics */}
      <BottomNav
        activeTab={
          activeTab === 'date-night' || activeTab === 'love-scrolls' || activeTab === 'airing'
            ? 'browse'
            : activeTab
        }
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Anime Detail Modal */}
      {detailAnime && (
        <AnimeDetailModal
          anime={detailAnime}
          onClose={() => setDetailAnime(null)}
          onPlay={(a) => handlePlayAnime(a, 1)}
          isDateNightSaved={dateNightItems.some((i) => i.malId === detailAnime?.mal_id)}
          onToggleDateNight={handleToggleDateNight}
        />
      )}

      {/* Floating Real-time Love Scrolls Chatbox */}
      <LiveLoveScrollChatbox
        isFloating={true}
        isOpen={floatingChatOpen}
        onClose={() => setFloatingChatOpen(false)}
      />

      {/* Floating Chatbox Launcher Button (Bottom Right) */}
      {!floatingChatOpen && (
        <button
          onClick={() => setFloatingChatOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-rose-950/60 border border-rose-400/50 flex items-center gap-2 transition-all active:scale-95 animate-in fade-in"
          title="Open Real-time Love Scrolls & Live Chat"
        >
          <Heart className="w-4 h-4 fill-white animate-pulse" />
          <span className="hidden sm:inline font-cinzel">Live Love Scrolls</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-emerald-500" />
        </button>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-emerald-900/60 bg-[#030906] py-8 text-xs text-emerald-400/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-sm text-emerald-200">LESLYE'S REALM</span>
            <span className="text-emerald-800">·</span>
            <span className="text-emerald-400">Crafted with celestial devotion by Sir Chif3n</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-emerald-400/80 text-xs">
            <button onClick={() => setActiveTab('browse')} className="hover:text-white transition-colors">🌿 Anime</button>
            <button onClick={() => setActiveTab('manga')} className="hover:text-white transition-colors">📜 MangaDex</button>
            <button onClick={() => setActiveTab('novels')} className="hover:text-white transition-colors">📖 Imperial Tomes</button>
            <button onClick={() => setScheduleModalOpen(true)} className="hover:text-white transition-colors">📅 Schedule</button>
            <button onClick={() => setGachaModalOpen(true)} className="hover:text-amber-300 transition-colors">🎲 Gacha Altar</button>
            <button onClick={() => setRadioModalOpen(true)} className="hover:text-emerald-300 transition-colors">🎵 Lo-Fi Radio</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
