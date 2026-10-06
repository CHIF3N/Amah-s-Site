import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Filter,
  Bell,
  BellRing
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
import { ImperialChatVault } from './components/ImperialChatVault';
import { ImperialCoupleGame } from './components/ImperialCoupleGame';
import { ImperialLoginModal, ImperialRole } from './components/ImperialLoginModal';
import { WatchActivityChart } from './components/WatchActivityChart';
import { AmbientCanvas } from './components/AmbientCanvas';
import { AnimeItem, DateNightItem, WatchHistoryItem, DailyWatchActivity } from './types/anime';
import { CURATED_ANIME, DEMIGOD_SCROLLS, MAOMAO_STATEMENTS_FOR_LESLYE } from './data/curatedData';
import { searchAnime, fetchRecentAnime, sortAnimeByRecent } from './services/jikanApi';
import {
  subscribeToLoveScrolls,
  subscribeToDateNightQueue,
  syncDateNightItemToCloud,
  removeDateNightItemFromCloud
} from './services/firebase';
import { useRealtimeLoveSync } from './hooks/useRealtimeLoveSync';

/**
 * Gentle herbal chime synthesizer using Web Audio API harmonics
 */
function playHerbalChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Harmonics: 587.33Hz (D5), 880Hz (A5), 1174.66Hz (D6)
    const freqs = [587.33, 880, 1174.66];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + idx * 0.07;
      const duration = 0.9;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.08 / (idx + 1), startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.warn('Audio chime warning:', e);
  }
}

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
  const [vaultOpen, setVaultOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  // Imperial Role state
  const [activeRole, setActiveRole] = useState<ImperialRole>(() => {
    try {
      const saved = localStorage.getItem('leslye_active_user');
      if (saved === 'chif3n' || saved === 'leslye') return saved;
    } catch (e) {}
    return 'chif3n';
  });

  // Central Unified Real-time Live Sync (Messages, Whispers, Presence, Typings)
  const {
    messages,
    whispers,
    partnerTyping,
    connectionStatus,
    unreadCount,
    clearUnreadCount,
    addWhisperNote,
    deleteWhisperNote
  } = useRealtimeLoveSync(activeRole);

  // Ambience mode
  const [ambientMode, setAmbientMode] = useState<'stars' | 'sakura' | 'off'>('stars');

  // Rotating poetic dedication index
  const [bannerStatementIdx, setBannerStatementIdx] = useState(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Notification state & Permission Request Function
  const [notificationsActive, setNotificationsActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setToastMessage('⚠️ System notifications are not supported in this browser.');
      setTimeout(() => setToastMessage(null), 4000);
      return false;
    }

    try {
      if (Notification.permission === 'granted') {
        setNotificationsActive(true);
        setToastMessage('🔔 Background alerts are already enabled!');
        setTimeout(() => setToastMessage(null), 3500);
        return true;
      }

      if (Notification.permission === 'denied') {
        setToastMessage('⚠️ Notifications are blocked in browser settings. Please unblock them to receive alerts.');
        setTimeout(() => setToastMessage(null), 5000);
        return false;
      }

      const permission = await Notification.requestPermission();
      const isGranted = permission === 'granted';
      setNotificationsActive(isGranted);

      if (isGranted) {
        setToastMessage('✨ Background love scroll alerts activated!');
        setTimeout(() => setToastMessage(null), 4000);
        try {
          new Notification('Sanctuary Alerts Enabled 🌿', {
            body: 'You will now receive system alerts when love scrolls arrive while the app is in the background.',
            icon: '/favicon.ico',
            silent: true
          });
        } catch (e) {}
      } else {
        setToastMessage('Notification permission was not granted.');
        setTimeout(() => setToastMessage(null), 4000);
      }
      return isGranted;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }, []);

  // Message listener in App.tsx:
  // Tracks new incoming love scrolls, specifically checking for messages not sent by the current user role,
  // and triggers system-level alerts using the Notification API when the app is in the background.
  const prevMessageIdsRef = useRef<Set<string>>(new Set(messages.map((m) => m.id)));
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Skip initial mount so we don't alert on past/seeded scrolls
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevMessageIdsRef.current = new Set(messages.map((m) => m.id));
      return;
    }

    // Identify newly arrived messages
    const incomingMessages = messages.filter((msg) => !prevMessageIdsRef.current.has(msg.id));
    prevMessageIdsRef.current = new Set(messages.map((m) => m.id));

    if (incomingMessages.length === 0) return;

    // Specifically filter for new messages NOT sent by the current user role
    const partnerMessages = incomingMessages.filter((msg) => msg.senderRole !== activeRole);
    if (partnerMessages.length === 0) return;

    // Play celestial chime for partner scroll
    playHerbalChime();

    // Check if the app is currently in the background
    const isAppInBackground =
      typeof document !== 'undefined' &&
      (document.hidden || document.visibilityState === 'hidden' || !document.hasFocus());

    const partnerName = activeRole === 'chif3n' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑';

    // When the app is in the background, trigger system-level Notification API alert!
    if (isAppInBackground) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        partnerMessages.forEach((msg) => {
          let previewText = 'Inscribed a new love decree 💌';
          if (msg.text) {
            previewText = msg.text.length > 100 ? `${msg.text.slice(0, 97)}...` : msg.text;
          } else if (msg.type === 'audio') {
            previewText = 'Recorded a sacred voice potion 🎙️';
          } else if (msg.type === 'image') {
            previewText = msg.caption ? `Shared a photo potion: ${msg.caption}` : 'Shared an apothecary photo 📸';
          }

          try {
            const systemAlert = new Notification(`💌 Love Scroll from ${partnerName}`, {
              body: previewText,
              icon: '/favicon.ico',
              tag: `scroll-${msg.id}`
            });

            systemAlert.onclick = () => {
              window.focus();
              setVaultOpen(true);
              clearUnreadCount();
              systemAlert.close();
            };
          } catch (err) {
            console.warn('[Notification API] Could not create system notification:', err);
          }
        });
      }
    } else if (!vaultOpen) {
      // In foreground and vault is closed: show in-app toast notification
      setToastMessage(`💌 New Love Scroll from ${partnerName}!`);
      setTimeout(() => setToastMessage(null), 4500);
    }
  }, [messages, activeRole, vaultOpen, clearUnreadCount]);

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

  // Sync Date Night Queue with Cloud Firestore in real time across devices
  useEffect(() => {
    const unsubDateNight = subscribeToDateNightQueue((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setDateNightItems((prev) => {
          const map = new Map<number, DateNightItem>();
          for (const item of prev) map.set(item.malId, item);
          for (const item of cloudItems) map.set(item.malId, item);
          return Array.from(map.values());
        });
      }
    });
    return () => unsubDateNight();
  }, []);

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
      removeDateNightItemFromCloud(anime?.mal_id);
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
      syncDateNightItemToCloud({ ...newItem, id: `dn-${newItem.malId}` });
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

      <ImperialCoupleGame
        isOpen={gameModalOpen}
        onClose={() => setGameModalOpen(false)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      {/* Imperial Profile & Persona Login Modal */}
      <ImperialLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        currentRole={activeRole}
        onSelectRole={(role) => {
          setActiveRole(role);
          showToast(`Logged in as ${role === 'leslye' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑'}`);
        }}
      />

      {/* Top Navbar with Branding */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'love-scrolls') {
            setVaultOpen(true);
            clearUnreadCount();
            return;
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSchedule={() => setScheduleModalOpen(true)}
        onOpenGacha={() => setGachaModalOpen(true)}
        onOpenRadio={() => setRadioModalOpen(true)}
        onOpenPoetry={() => setPoetryDrawerOpen(true)}
        onOpenGame={() => setGameModalOpen(true)}
        onOpenChatVault={() => {
          setVaultOpen(true);
          clearUnreadCount();
        }}
        onOpenLogin={() => setLoginModalOpen(true)}
        activeRole={activeRole}
        ambientMode={ambientMode}
        onToggleAmbient={handleToggleAmbient}
        dateNightCount={dateNightItems.length}
        unreadMessagesCount={unreadCount}
        notificationsEnabled={notificationsActive}
        onToggleNotifications={requestNotificationPermission}
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
            onClick={() => setGameModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/50 hover:border-amber-300 text-amber-300 hover:text-white text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start shadow-sm"
          >
            <span>🎮 Couple Duel (IRL Online)</span>
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
            onClick={() => setVaultOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-950/80 via-pink-950/60 to-amber-950/70 border border-rose-500/50 hover:border-rose-400 text-rose-200 hover:text-white text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start shadow-sm active:scale-95"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
            <span>💌 Secret Vault (Private Chat)</span>
          </button>

          <button
            onClick={() => setGameModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-rose-500/20 border border-amber-400/50 hover:border-amber-300 text-amber-300 hover:text-white text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start shadow-sm active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>🎮 Palace Arcade (2-Player IRL)</span>
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
              removeDateNightItemFromCloud(malId);
              showToast('Removed from Date Night Queue');
            }}
            onToggleWatched={(malId) => {
              setDateNightItems((prev) =>
                prev.map((i) => {
                  if (i.malId === malId) {
                    const updated = { ...i, watched: !i.watched };
                    syncDateNightItemToCloud({ ...updated, id: `dn-${updated.malId}` });
                    return updated;
                  }
                  return i;
                })
              );
            }}
            onUpdateComment={(malId, comment) => {
              setDateNightItems((prev) =>
                prev.map((i) => {
                  if (i.malId === malId) {
                    const updated = { ...i, coupleComment: comment };
                    syncDateNightItemToCloud({ ...updated, id: `dn-${updated.malId}` });
                    return updated;
                  }
                  return i;
                })
              );
            }}
            onUpdateRating={(malId, rating) => {
              setDateNightItems((prev) =>
                prev.map((i) => {
                  if (i.malId === malId) {
                    const updated = { ...i, ourRating: rating };
                    syncDateNightItemToCloud({ ...updated, id: `dn-${updated.malId}` });
                    return updated;
                  }
                  return i;
                })
              );
            }}
            onExploreCatalog={() => setActiveTab('browse')}
          />
        )}

        {/* Tab 6: Love Scrolls & Decrees */}
        {activeTab === 'love-scrolls' && (
          <DemigodLoveScrolls
            scrolls={DEMIGOD_SCROLLS}
            leslyeNotes={whispers}
            activeRole={activeRole}
            onRoleChange={(r) => setActiveRole(r)}
            onAddLeslyeNote={(text) => {
              addWhisperNote(text);
              showToast('Whisper inscribed and synced live! 🌿✨');
            }}
            onDeleteLeslyeNote={(id) => {
              deleteWhisperNote(id);
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

      {/* Passcode-Protected Full-Screen Imperial Secret Vault */}
      <ImperialChatVault
        isOpen={vaultOpen}
        onClose={() => setVaultOpen(false)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        overrideRole={activeRole}
        onRoleChange={(r) => setActiveRole(r)}
      />

      {/* Floating Imperial Secret Vault Launcher Button (Bottom Right) */}
      {!vaultOpen && (
        <button
          onClick={() => {
            setVaultOpen(true);
            clearUnreadCount();
          }}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-rose-950/60 border border-rose-400/50 flex items-center gap-2 transition-all active:scale-95 animate-in fade-in"
          title="Open The Imperial Secret Vault"
        >
          <Heart className="w-4 h-4 fill-white animate-pulse" />
          <span className="font-cinzel">Secret Vault 💌</span>
          {unreadCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-600 font-mono text-[10px] font-black animate-bounce">
              {unreadCount}
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-emerald-500" />
          )}
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
