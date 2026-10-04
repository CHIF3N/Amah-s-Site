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
  BellRing,
  Scroll,
  Gamepad2,
  Phone,
  PhoneOff
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
import { ApothecaryDossierModal } from './components/ApothecaryDossierModal';
import { ImperialScrapbookModal } from './components/ImperialScrapbookModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAMobileFloatingBanner } from './components/PWAInstallButton';
import { ImperialCallModal } from './components/ImperialCallModal';
import { AnimeItem, DateNightItem, WatchHistoryItem, DailyWatchActivity } from './types/anime';
import { CURATED_ANIME, DEMIGOD_SCROLLS, MAOMAO_STATEMENTS_FOR_LESLYE } from './data/curatedData';
import { searchAnime, fetchRecentAnime, sortAnimeByRecent } from './services/jikanApi';
import {
  subscribeToLoveScrolls,
  subscribeToCallSession,
  startCallSession,
  answerCallSession,
  endCallSession,
  CoupleCallSession
} from './services/firebase';

/**
 * Gentle herbal chime synthesizer using Web Audio API harmonics
 */
function playHerbalChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

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
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [scrapbookModalOpen, setScrapbookModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<CoupleCallSession | null>(null);
  const [activeRole, setActiveRole] = useState<ImperialRole>(() => {
    try {
      const saved = localStorage.getItem('leslye_active_user');
      if (saved === 'chif3n' || saved === 'leslye') return saved;
    } catch (e) {}
    return 'chif3n';
  });

  const [dailyWidgetsOpen, setDailyWidgetsOpen] = useState(true);

  // Subscribe to real-time WebRTC audio & video call sessions
  useEffect(() => {
    const unsubscribe = subscribeToCallSession((session) => {
      setActiveCallSession(session);
      if (session && session.status === 'calling') {
        if (session.receiverRole === activeRole) {
          playHerbalChime();
          setCallModalOpen(true);
        }
      } else if (session?.status === 'ended' || session?.status === 'declined') {
        setCallModalOpen(false);
      }
    });
    return () => unsubscribe();
  }, [activeRole]);

  const handleStartCall = async (type: 'audio' | 'video' = 'audio') => {
    const partnerRole = activeRole === 'chif3n' ? 'leslye' : 'chif3n';
    const callerName = activeRole === 'chif3n' ? 'Sir Chif3n (Demigod) 👑' : 'Lady Leslye (Apothecary Empress) 🌿';
    await startCallSession({
      callId: `call-${Date.now()}`,
      callerRole: activeRole,
      callerName,
      receiverRole: partnerRole,
      type,
      status: 'calling'
    });
    setCallModalOpen(true);
  };

  // Listen for service worker notification click message
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'OPEN_SECRET_VAULT') {
          setVaultOpen(true);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  // Ambience mode
  const [ambientMode, setAmbientMode] = useState<'stars' | 'sakura' | 'off'>('stars');

  // Rotating poetic dedication index
  const [bannerStatementIdx, setBannerStatementIdx] = useState(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notification states & refs
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });
  const [unreadScrollCount, setUnreadScrollCount] = useState<number>(0);
  const [incomingAlert, setIncomingAlert] = useState<{
    id: string;
    sender: string;
    preview: string;
    timestamp: number;
  } | null>(null);

  const appStartTimeRef = useRef<number>(Date.now());
  const lastNotifiedMessageIdRef = useRef<string | null>(null);

  // Request browser notification permission
  const handleToggleNotifications = async () => {
    // Always play chime on user gesture
    playHerbalChime();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
        showToast('🔔 Background alerts are active! Test chime dispatched.');
        try {
          new Notification('🌿 Imperial Alerts Active', {
            body: 'You are now tuned in to real-time love scrolls & watch parties!',
            icon: '/pwa-192x192.png'
          });
        } catch (e) {}
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          showToast('🌿 Imperial Notifications Enabled! Test chime dispatched.');
          try {
            new Notification('🌿 Imperial Alerts Enabled', {
              body: 'You will receive real-time chimes for love scrolls and watch parties!',
              icon: '/pwa-192x192.png'
            });
          } catch (e) {}
        } else {
          setToastMessage('Browser notification permission not granted. Audio chimes will still play in-app!');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      showToast('🔔 Audio chimes are active for in-app alerts!');
    }
  };

  // Reset unread count and dismiss floating banner when opening vault
  useEffect(() => {
    if (vaultOpen) {
      setUnreadScrollCount(0);
      setIncomingAlert(null);
    }
  }, [vaultOpen]);

  // Real-Time Message Listener Notification Trigger (Two-Tier)
  useEffect(() => {
    const unsubscribe = subscribeToLoveScrolls((scrolls) => {
      if (!scrolls || scrolls.length === 0) return;

      const latest = scrolls[scrolls.length - 1];
      if (!latest || !latest.id) return;

      // Avoid double-notifying the exact same message
      if (lastNotifiedMessageIdRef.current === latest.id) return;

      // Freshness check: received within the last 15 seconds AND timestamp > appStartTimeRef.current - 5000
      const isFresh = latest.timestamp > appStartTimeRef.current - 5000 && Date.now() - latest.timestamp < 15000;
      const isFromOtherPerson = latest.senderRole !== activeRole;

      if (isFresh && isFromOtherPerson) {
        lastNotifiedMessageIdRef.current = latest.id;

        const senderTitle = latest.senderRole === 'chif3n' ? 'Sir Chif3n' : 'Lady Leslye';
        const preview =
          latest.type === 'audio'
            ? 'Sent a voice note 🎙️'
            : latest.type === 'image'
            ? 'Sent an image 📷'
            : latest.text || 'Sent a love decree ✨';

        const notifTitle = latest.senderRole === 'chif3n' ? '🌿 Message from Sir Chif3n' : '🌸 Message from Lady Leslye';
        const notifOptions = {
          body: preview,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [200, 100, 200],
          tag: 'love-scroll-notification',
          data: { url: '/' }
        };

        const dispatchPushNotification = () => {
          if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

          // Service Worker showNotification is the standard method for Android Chrome
          if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready
              .then((reg) => {
                reg.showNotification(notifTitle, notifOptions);
              })
              .catch(() => {
                try {
                  new Notification(notifTitle, notifOptions);
                } catch (e) {}
              });
          } else {
            try {
              new Notification(notifTitle, notifOptions);
            } catch (err) {
              console.warn('System Notification error:', err);
            }
          }
        };

        // Case A: Tab is Minimized or in Background (document.hidden === true)
        if (typeof document !== 'undefined' && document.hidden) {
          dispatchPushNotification();
        } else {
          // Case B: App is Active on Screen
          // 1. Play gentle herbal chime sound
          playHerbalChime();

          // 2. Slide down floating frosted glass banner at the top of the screen
          setIncomingAlert({
            id: latest.id,
            sender: senderTitle,
            preview,
            timestamp: latest.timestamp
          });

          // 3. Increment unread badge pill on chat icon/button
          if (!vaultOpen) {
            setUnreadScrollCount((prev) => prev + 1);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [activeRole, vaultOpen]);

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

  // Mark watched in history and increment weekly activity (memoized to prevent re-render loop)
  const handleRecordHistory = useCallback((malId: number, ep: number) => {
    setWatchHistory((prev) => {
      const top = prev[0];
      if (top && top.malId === malId && top.episode === ep) {
        return prev; // already recorded, no state update needed
      }
      const anime = currentPlayingAnime;
      const filtered = prev.filter((item) => item.malId !== malId);
      const poster = anime?.images?.webp?.image_url || anime?.images?.jpg?.image_url || '';
      const updated: WatchHistoryItem = {
        malId,
        title: anime?.title_english || anime?.title || 'Anime Stream',
        image: poster,
        episode: ep,
        totalEpisodes: anime?.episodes || null,
        lastWatchedAt: Date.now(),
        server: 'VidLink / Imperial Resolver',
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
  }, [currentPlayingAnime]);

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

      {/* Offline Indicator & Mobile PWA Installation Banner */}
      <OfflineIndicator />
      <PWAMobileFloatingBanner />

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
        activeRole={activeRole}
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
        onOpenChatVault={() => setVaultOpen(true)}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenDossier={() => setDossierModalOpen(true)}
        onOpenScrapbook={() => setScrapbookModalOpen(true)}
        onOpenCall={() => handleStartCall('audio')}
        activeRole={activeRole}
        ambientMode={ambientMode}
        onToggleAmbient={handleToggleAmbient}
        dateNightCount={dateNightItems.length}
        unreadMessagesCount={unreadScrollCount}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      {/* Incoming Call Real-Time Floating Banner */}
      {activeCallSession && activeCallSession.status === 'calling' && activeCallSession.receiverRole === activeRole && !callModalOpen && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#03150dee] backdrop-blur-xl border-2 border-emerald-400 shadow-2xl flex items-center justify-between gap-3 text-white animate-bounce">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                  <span>📞 Incoming {activeCallSession.type === 'video' ? 'Video' : 'Voice'} Call</span>
                </div>
                <p className="text-xs font-serif text-emerald-200 truncate mt-0.5 font-bold">
                  {activeCallSession.callerName} is calling you!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => endCallSession()}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-cinzel font-bold shadow-md active:scale-95 transition-all"
                title="Decline Call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCallModalOpen(true);
                  answerCallSession({ status: 'connected' });
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-black text-xs font-cinzel font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 fill-black" />
                <span>Answer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Frosted Glass Banner for Active App Screen */}
      {incomingAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#03150dcc] backdrop-blur-xl border border-rose-500/60 shadow-2xl flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                  <span>💌 New Love Scroll from {incomingAlert.sender}</span>
                </div>
                <p className="text-xs font-serif text-emerald-200 truncate mt-0.5">
                  "{incomingAlert.preview}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setVaultOpen(true);
                  setIncomingAlert(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-cinzel text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Open Vault
              </button>
              <button
                onClick={() => setIncomingAlert(null)}
                className="p-1.5 text-zinc-400 hover:text-white"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

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
            activeRole={activeRole}
          />
        )}

        {/* 1. Primary Media Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x border-b border-emerald-950 pb-2.5">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start border ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-950/60'
                : 'bg-[#05170f] text-emerald-300/80 border-emerald-900/80 hover:text-white hover:border-emerald-700'
            }`}
          >
            <span>🌿 Anime Streams</span>
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
            <span>⚡ Airing Today</span>
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
            <span>📖 Imperial Tomes</span>
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
            <span>👑 Demigod's Picks ❤️</span>
          </button>

          <button
            onClick={() => setActiveTab('date-night')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start border ${
              activeTab === 'date-night'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400 shadow-md'
                : 'bg-[#05170f] text-rose-300/80 border-rose-900/50 hover:text-white hover:border-rose-600'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Date Night Watchlist ({dateNightItems.length})</span>
          </button>
        </div>

        {/* 2. Grouped Palace Sanctuaries & Activities Hub (3 Clean Thematic Pavilions) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pavilion 1: 🌸 Lore & Memory Capsules */}
          <div className="p-3 rounded-2xl bg-[#03150d]/90 border border-emerald-900/80 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Scroll className="w-3.5 h-3.5 text-amber-400" />
                <span>Lore & Memories</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-500">Pavilion I</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
              <button
                onClick={() => setDossierModalOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-[#051d12] hover:bg-[#08291b] border border-amber-500/40 text-amber-300 hover:text-white text-[11px] truncate transition-colors text-center"
                title="Apothecary Incident Dossier & Movie"
              >
                📜 Dossier
              </button>
              <button
                onClick={() => setScrapbookModalOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-[#051d12] hover:bg-[#08291b] border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] truncate transition-colors text-center"
                title="Bamboo Photo Scrapbook & Capsules"
              >
                📷 Scrapbook
              </button>
              <button
                onClick={() => setPoetryDrawerOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-[#051d12] hover:bg-[#08291b] border border-rose-500/40 text-rose-300 hover:text-white text-[11px] truncate transition-colors text-center"
                title="Sir Chif3n's Vows and Poems"
              >
                🪶 Poetry
              </button>
            </div>
          </div>

          {/* Pavilion 2: 🎮 Palace Arcade & Lo-Fi Studio */}
          <div className="p-3 rounded-2xl bg-[#03150d]/90 border border-emerald-900/80 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Palace Arcade & Sound</span>
              </span>
              <span className="text-[10px] font-mono text-amber-500">Pavilion II</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
              <button
                onClick={() => setGameModalOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 border border-amber-400/50 text-amber-200 hover:text-white text-[11px] font-bold truncate transition-all text-center"
                title="Play 2-Player Online Duel"
              >
                🎮 Duel (Online)
              </button>
              <button
                onClick={() => setRadioModalOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-[#051d12] hover:bg-[#08291b] border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] truncate transition-colors text-center"
                title="Lo-Fi Soundscape Studio"
              >
                📻 Lo-Fi Studio
              </button>
              <button
                onClick={() => setGachaModalOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-[#051d12] hover:bg-[#08291b] border border-amber-500/40 text-amber-300 hover:text-white text-[11px] truncate transition-colors text-center"
                title="Summon Anime Gacha Fate"
              >
                🎲 Gacha
              </button>
            </div>
          </div>

          {/* Pavilion 3: 💌 Secret Vault & Broadcast Schedule */}
          <div className="p-3 rounded-2xl bg-[#03150d]/90 border border-emerald-900/80 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Secret Vault & Airings</span>
              </span>
              <span className="text-[10px] font-mono text-rose-500">Pavilion III</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              <button
                onClick={() => setVaultOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-rose-950/80 via-pink-950/60 to-amber-950/70 hover:from-rose-900 border border-rose-500/50 text-rose-200 hover:text-white text-[11px] font-bold truncate transition-all flex items-center justify-center gap-1"
                title="Private Correspondence & Voice Notes"
              >
                <span>💌 Secret Vault</span>
                {unreadScrollCount > 0 && (
                  <span className="px-1 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px]">
                    {unreadScrollCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-[#051d12] hover:bg-[#08291b] border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] truncate transition-colors text-center"
                title="Broadcast Schedule"
              >
                📅 Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Anime Catalog (Browse & Airing) */}
        {(activeTab === 'browse' || activeTab === 'airing') && (
          <div className="space-y-6">
            {/* Collapsible Daily Decree & Cuddle Planning Section */}
            {!searchResults && !currentPlayingAnime && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="font-cinzel text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Demigod's Daily Decree & Cuddle Planning</span>
                  </span>
                  <button
                    onClick={() => setDailyWidgetsOpen(!dailyWidgetsOpen)}
                    className="text-[11px] font-mono text-emerald-400 hover:text-white flex items-center gap-1 underline"
                  >
                    <span>{dailyWidgetsOpen ? 'Collapse Pavilion' : 'Expand Pavilion'}</span>
                  </button>
                </div>

                {dailyWidgetsOpen && (
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
          <div className="space-y-6">
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
        onOpenChatVault={() => setVaultOpen(true)}
        onOpenCall={() => handleStartCall('audio')}
        unreadMessagesCount={unreadScrollCount}
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
        onStartCall={handleStartCall}
      />

      {/* Imperial Voice & Video Call Modal */}
      <ImperialCallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        activeRole={activeRole}
        session={activeCallSession}
        onStartCall={handleStartCall}
      />

      {/* The Apothecary Incident Dossier (Season 2, Season 3 & Movie) */}
      <ApothecaryDossierModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
      />

      {/* Imperial Scrapbook & Time-Locked Capsules */}
      <ImperialScrapbookModal
        isOpen={scrapbookModalOpen}
        onClose={() => setScrapbookModalOpen(false)}
        activeRole={activeRole}
      />

      {/* PWA Offline Indicator Banner */}
      <OfflineIndicator />

      {/* Floating Imperial Secret Vault Launcher Button (Bottom Right) */}
      {!vaultOpen && (
        <button
          onClick={() => setVaultOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-rose-950/60 border border-rose-400/50 flex items-center gap-2 transition-all active:scale-95 animate-in fade-in"
          title="Open The Imperial Secret Vault"
        >
          <Heart className="w-4 h-4 fill-white animate-pulse" />
          <span className="font-cinzel">Secret Vault 💌</span>
          {unreadScrollCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-600 font-mono text-[10px] font-black animate-bounce shadow">
              {unreadScrollCount}
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
