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
  FlaskConical,
  Clock,
  ArrowUpDown,
  BookOpen,
  Feather,
  Quote
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
import { LightNovelArchive } from './components/LightNovelArchive';
import { ApothecaryPrescriptionCabinet } from './components/ApothecaryPrescriptionCabinet';
import { WatchActivityChart } from './components/WatchActivityChart';
import { AmbientCanvas } from './components/AmbientCanvas';
import { AnimeItem, DateNightItem, WatchHistoryItem, DailyWatchActivity } from './types/anime';
import { CURATED_ANIME, DEMIGOD_SCROLLS, MAOMAO_STATEMENTS_FOR_LESLYE } from './data/curatedData';
import { searchAnime, fetchRecentAnime, sortAnimeByRecent } from './services/jikanApi';

export default function App() {
  const [activeTab, setActiveTab] = useState<'browse' | 'manga' | 'novels' | 'demigod-picks' | 'date-night' | 'love-scrolls'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AnimeItem[] | null>(null);
  const [animeCatalog, setAnimeCatalog] = useState<AnimeItem[]>(() => sortAnimeByRecent(CURATED_ANIME));
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'recent' | 'score' | 'alphabetical'>('recent');

  // Currently playing anime
  const [currentPlayingAnime, setCurrentPlayingAnime] = useState<AnimeItem | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);

  // Detail Modal
  const [detailAnime, setDetailAnime] = useState<AnimeItem | null>(null);

  // Demigod Poetry Drawer
  const [poetryDrawerOpen, setPoetryDrawerOpen] = useState(false);

  // Ambience mode
  const [ambientMode, setAmbientMode] = useState<'stars' | 'sakura' | 'off'>('stars');

  // Rotating poetic dedication index
  const [bannerStatementIdx, setBannerStatementIdx] = useState(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerStatementIdx((prev) => (prev + 1) % MAOMAO_STATEMENTS_FOR_LESLYE.length);
    }, 7000);
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
        server: 'VidSrc Celestial (Vial I)',
      },
      {
        malId: 52991,
        title: "Frieren: Beyond Journey's End",
        image: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
        episode: 14,
        totalEpisodes: 28,
        lastWatchedAt: Date.now() - 1000 * 60 * 180,
        server: 'Embed.su (Vial II)',
      },
      {
        malId: 57334,
        title: 'Dan Da Dan',
        image: 'https://cdn.myanimelist.net/images/anime/1939/144675.jpg',
        episode: 4,
        totalEpisodes: 12,
        lastWatchedAt: Date.now() - 1000 * 60 * 60 * 24,
        server: 'VidSrc Me (Vial III)',
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

  // Persisted state: Leslye notes
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

  // Sync state to local storage
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

  // Initial load recent releases from Jikan / AniList
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

  // Start playing
  const handlePlayAnime = (anime: AnimeItem, ep: number = 1) => {
    setCurrentPlayingAnime(anime);
    setCurrentEpisode(ep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select anime by title string
  const handleSelectAnimeByName = (animeTitle: string) => {
    const matched = animeCatalog.find((a) =>
      a?.title?.toLowerCase().includes(animeTitle.toLowerCase()) ||
      (a?.title_english && a.title_english.toLowerCase().includes(animeTitle.toLowerCase()))
    ) || CURATED_ANIME[0];

    handlePlayAnime(matched, 1);
    showToast(`🌿 Dispensed remedy: Playing "${matched?.title_english || matched?.title}"!`);
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
        server: 'VidSrc Celestial (Vial I)',
      };
      return [updated, ...filtered].slice(0, 10);
    });

    // Increment today's count on the weekly chart
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

  // Weekly activity metrics
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

  // Taste test randomizer
  const handleSurpriseMe = () => {
    const pool = searchResults || animeCatalog;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (picked) {
      handlePlayAnime(picked, 1);
      showToast(`✨ Demigod Decree: "${picked?.title_english || picked?.title}" passed the poison test!`);
    }
  };

  // Toggle ambient mode
  const handleToggleAmbient = () => {
    if (ambientMode === 'stars') setAmbientMode('sakura');
    else if (ambientMode === 'sakura') setAmbientMode('off');
    else setAmbientMode('stars');
  };

  // Filter and rank anime list
  const filteredAndSortedCatalog = useMemo(() => {
    const list = searchResults || animeCatalog;
    
    // Genre filter
    const genreFiltered = list.filter((anime) => {
      if (selectedGenre === 'All') return true;
      return anime?.genres?.some((g) => g?.name?.toLowerCase().includes(selectedGenre.toLowerCase()));
    });

    // Ranking order (Defaults strictly to most recent anime first)
    return [...genreFiltered].sort((a, b) => {
      if (sortOrder === 'recent') {
        const yearA = a?.year || (a?.status === 'Currently Airing' ? 2025 : 2020);
        const yearB = b?.year || (b?.status === 'Currently Airing' ? 2025 : 2020);
        if (yearB !== yearA) return yearB - yearA;
        return (b?.score || 0) - (a?.score || 0);
      } else if (sortOrder === 'score') {
        return (b?.score || 0) - (a?.score || 0);
      } else {
        return (a?.title_english || a?.title || '').localeCompare(b?.title_english || b?.title || '');
      }
    });
  }, [searchResults, animeCatalog, selectedGenre, sortOrder]);

  const genresList = ['All', 'Mystery', 'Drama', 'Romance', 'Action', 'Fantasy', 'Comedy', 'Supernatural'];

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

      {/* Demigod Poetry & Vows Modal */}
      <DemigodPoetryDrawer
        isOpen={poetryDrawerOpen}
        onClose={() => setPoetryDrawerOpen(false)}
      />

      {/* Navbar with Open-Otaku & Demigod styling */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPoetry={() => setPoetryDrawerOpen(true)}
        ambientMode={ambientMode}
        onToggleAmbient={handleToggleAmbient}
        dateNightCount={dateNightItems.length}
      />

      {/* Floating Rotating Parchment Dedication Banner */}
      <aside 
        aria-label="Daily dedication banner"
        className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <div 
          onClick={() => setPoetryDrawerOpen(true)}
          className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 via-[#072418] to-amber-950/60 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs cursor-pointer hover:border-amber-400/50 transition-all shadow-md group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded bg-amber-400/20 text-amber-300 font-bold font-cinzel text-[10px] uppercase shrink-0">
              Demigod Dedication
            </span>
            <p className="text-emerald-100 italic truncate font-serif text-xs sm:text-sm">
              {MAOMAO_STATEMENTS_FOR_LESLYE[bannerStatementIdx]}
            </p>
          </div>
          <span className="text-[11px] text-amber-300 group-hover:underline shrink-0 hidden sm:inline">
            Read Poems & Vows →
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-8 relative z-20">
        
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

        {/* Tab 1: Anime Catalog & Streaming */}
        {activeTab === 'browse' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Hero Dedication Header */}
            {!currentPlayingAnime && (
              <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#06241a] via-[#04150f] to-[#0c261c] border border-emerald-500/30 shadow-2xl">
                <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-cinzel text-xs uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dedicated to Leslye from her Demigod Boyfriend Sir Chif3n</span>
                    </span>
                    <span className="text-emerald-700">·</span>
                    <span className="text-xs text-emerald-300 italic">Maomao Sanctuary</span>
                  </div>

                  <h1 className="font-cinzel text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    Where Every Scroll Begins With You.
                  </h1>

                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-2.5 leading-relaxed max-w-2xl font-normal">
                    Ad-free streaming sanctuary powered by multi-server resilience. Explore the latest 2024–2025 releases, read MangaDex scrolls, and relax in imperial comfort.
                  </p>

                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-2xl">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search anime (e.g. Apothecary Diaries, Frieren, Dandadan, Solo Leveling)..."
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
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap"
                    >
                      {isSearching ? 'Searching...' : 'Search Anime'}
                    </button>
                  </form>

                  {/* Quick Tags */}
                  <div className="flex items-center gap-2 mt-3.5 text-xs text-emerald-300/80 flex-wrap">
                    <span className="text-emerald-500">Curated for Leslye:</span>
                    {['The Apothecary Diaries', 'Dandadan', 'Frieren', 'Solo Leveling', 'Wind Breaker', 'Horimiya'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          searchAnime(tag).then((res) => setSearchResults(res));
                        }}
                        className="hover:text-amber-300 underline decoration-emerald-800 underline-offset-4 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Prescriptions Cabinet */}
            {!searchResults && (
              <ApothecaryPrescriptionCabinet onSelectAnimeByName={handleSelectAnimeByName} />
            )}

            {/* Continue Streaming Section with Weekly Progress Activity Chart */}
            {!searchResults && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-base sm:text-lg font-semibold text-white font-cinzel">Continue Streaming & Progress</h2>
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

                {/* Small Recharts Activity Chart */}
                <WatchActivityChart
                  activityData={activityData}
                  totalThisWeek={totalThisWeek}
                  streakDays={streakDays}
                />

                {/* Quick resume carousel */}
                {watchHistory.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-emerald-300/80 font-medium">Quick Resume for Lady Leslye</span>
                      <span className="text-[11px] text-emerald-600 font-mono">{watchHistory.length} active series</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {watchHistory.map((item) => (
                        <div
                          key={item.malId}
                          onClick={() => {
                            const matched = CURATED_ANIME.find((a) => a.mal_id === item.malId) || {
                              mal_id: item.malId,
                              title: item.title,
                              images: { jpg: { image_url: item.image } },
                              episodes: item.totalEpisodes,
                            } as AnimeItem;
                            handlePlayAnime(matched, item.episode);
                          }}
                          className="group min-w-[210px] sm:min-w-[240px] max-w-[240px] bg-[#061710]/70 border border-emerald-900/60 rounded-xl p-2.5 hover:border-emerald-400/50 cursor-pointer transition-all shrink-0 flex gap-3 items-center shadow-md shadow-black/20"
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
                  </div>
                )}
              </section>
            )}

            {/* Main Catalog Header & Sorting Options */}
            <section className="space-y-4 pt-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-900/60 pb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-cinzel">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>
                      {searchResults ? `Search Results (${filteredAndSortedCatalog.length})` : 'Anime Library'}
                    </span>
                  </h2>
                  <p className="text-xs text-emerald-400/80 mt-0.5">
                    {searchResults
                      ? `Showing titles matching "${searchQuery}"`
                      : 'Ranked by more recent anime releases first (2025 · 2024 · 2023).'}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#030e09] border border-emerald-900/80 rounded-lg px-2.5 py-1 text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-500">Rank:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="bg-transparent text-emerald-200 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="recent" className="bg-[#040e0a] text-white">Newest First</option>
                      <option value="score" className="bg-[#040e0a] text-white">Highest Score</option>
                      <option value="alphabetical" className="bg-[#040e0a] text-white">Title A-Z</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {genresList.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          selectedGenre === genre
                            ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                            : 'bg-[#061710] text-emerald-300/80 hover:text-white hover:bg-emerald-900/60'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid of Anime Cards */}
              {filteredAndSortedCatalog.length === 0 ? (
                <div className="py-16 text-center rounded-2xl border border-emerald-900/60 bg-[#061710]/30">
                  <Film className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
                  <p className="text-sm text-emerald-200 font-medium">No anime matching your filter</p>
                  <button
                    onClick={() => {
                      setSelectedGenre('All');
                      handleClearSearch();
                    }}
                    className="mt-3 px-4 py-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-xs text-emerald-200"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
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
              )}
            </section>
          </div>
        )}

        {/* Tab 2: Manga Archives (MangaDex Integration) */}
        {activeTab === 'manga' && (
          <MangaReaderArchive />
        )}

        {/* Tab 3: Light Novels Shelf */}
        {activeTab === 'novels' && (
          <LightNovelArchive />
        )}

        {/* Tab 4: Demigod's Picks */}
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
              const matched = animeCatalog.find((a) => a.mal_id === malId) || {
                mal_id: malId,
                title,
                images: { jpg: { image_url: '' } },
              } as AnimeItem;
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

      {/* Floating Bottom Nav for Mobile Ergonomics (Open-Otaku style) */}
      <BottomNav
        activeTab={activeTab === 'date-night' || activeTab === 'love-scrolls' ? 'browse' : activeTab}
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

      {/* Refined Footer */}
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
            <button onClick={() => setActiveTab('novels')} className="hover:text-white transition-colors">📖 Light Novels</button>
            <button onClick={() => setActiveTab('demigod-picks')} className="hover:text-white transition-colors">👑 Demigod's Picks</button>
            <button onClick={() => setPoetryDrawerOpen(true)} className="hover:text-amber-300 transition-colors">✨ Vows & Poetry</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
