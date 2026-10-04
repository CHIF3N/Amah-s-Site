import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Heart,
  Menu,
  X,
  Leaf,
  Radio,
  Dice5,
  Calendar,
  BookOpen,
  Feather,
  Crown,
  Gamepad2,
  Bell,
  BellRing,
  Camera,
  Scroll,
  ChevronDown,
  Settings,
  Download,
  Film,
  Layers,
  Sparkle,
  Phone
} from 'lucide-react';
import { MoodHerbPill } from './MoodHerbPill';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'browse' | 'airing' | 'manga' | 'novels' | 'demigod-picks' | 'date-night' | 'love-scrolls';
  onSelectTab: (tab: 'browse' | 'airing' | 'manga' | 'novels' | 'demigod-picks' | 'date-night' | 'love-scrolls') => void;
  onOpenSchedule: () => void;
  onOpenGacha: () => void;
  onOpenRadio: () => void;
  onOpenPoetry: () => void;
  onOpenGame?: () => void;
  onOpenLogin?: () => void;
  onOpenChatVault?: () => void;
  onOpenCall?: () => void;
  onOpenDossier?: () => void;
  onOpenScrapbook?: () => void;
  activeRole?: 'chif3n' | 'leslye';
  ambientMode: 'stars' | 'sakura' | 'off';
  onToggleAmbient: () => void;
  dateNightCount: number;
  unreadMessagesCount?: number;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSchedule,
  onOpenGacha,
  onOpenRadio,
  onOpenPoetry,
  onOpenGame,
  onOpenLogin,
  onOpenChatVault,
  onOpenCall,
  onOpenDossier,
  onOpenScrapbook,
  activeRole = 'chif3n',
  ambientMode,
  onToggleAmbient,
  dateNightCount,
  unreadMessagesCount = 0,
  notificationsEnabled = false,
  onToggleNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'lore' | 'arcade' | 'settings' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: 'lore' | 'arcade' | 'settings') => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <header className="sticky top-0 z-40 bg-[#040e0a]/95 backdrop-blur-md border-b border-emerald-900/60 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('browse');
            }}
            className="flex items-center gap-2 group select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-500 p-[1.5px] shadow-md shadow-emerald-950/60">
              <div className="w-full h-full bg-[#04110a] rounded-[10px] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-amber-300">
                  LESLYE'S REALM
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider bg-gradient-to-r from-rose-950/80 to-amber-950/80 text-rose-300 border border-rose-500/40 shadow-sm">
                  Demigod's Sanctuary ❤️
                </span>
              </div>
              <span className="text-[10px] font-serif text-emerald-400/80 tracking-widest block -mt-0.5">
                宮廷の薬草聖域 (Imperial Herbal Sanctuary)
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Grouped Navigation Hub */}
        <div ref={dropdownRef} className="hidden lg:flex items-center gap-2">
          
          {/* Primary Media Switcher */}
          <div className="flex items-center bg-[#021008] p-1 rounded-2xl border border-emerald-900/70 text-xs font-medium">
            <button
              onClick={() => onSelectTab('browse')}
              className={`px-3 py-1 rounded-xl transition-all ${
                activeTab === 'browse' || activeTab === 'airing'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              🌿 Anime
            </button>
            <button
              onClick={() => onSelectTab('manga')}
              className={`px-3 py-1 rounded-xl transition-all ${
                activeTab === 'manga'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              📜 Manga
            </button>
            <button
              onClick={() => onSelectTab('novels')}
              className={`px-3 py-1 rounded-xl transition-all ${
                activeTab === 'novels'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              📖 Novels
            </button>
            <button
              onClick={() => onSelectTab('demigod-picks')}
              className={`px-3 py-1 rounded-xl transition-all ${
                activeTab === 'demigod-picks'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-amber-300/80 hover:text-white'
              }`}
            >
              👑 Picks ❤️
            </button>
          </div>

          {/* Group 1: 🌸 Pavilions & Lore Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('lore')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                activeDropdown === 'lore'
                  ? 'bg-emerald-950 border-emerald-400 text-white'
                  : 'bg-[#04140e] border-emerald-900/80 hover:border-emerald-600 text-emerald-200'
              }`}
            >
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
              <span>Pavilions & Lore</span>
              <ChevronDown className={`w-3 h-3 text-emerald-400 transition-transform ${activeDropdown === 'lore' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'lore' && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#03150d] border border-emerald-500/50 rounded-2xl p-2 shadow-2xl space-y-1 z-50 animate-in fade-in slide-in-from-top-2">
                {onOpenDossier && (
                  <button
                    onClick={() => {
                      onOpenDossier();
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-950 text-xs font-medium text-emerald-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Incident Dossier</div>
                      <div className="text-[10px] text-zinc-400">Season 3 & Movie Countdown</div>
                    </div>
                  </button>
                )}

                {onOpenScrapbook && (
                  <button
                    onClick={() => {
                      onOpenScrapbook();
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-950 text-xs font-medium text-emerald-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Bamboo Scrapbook</div>
                      <div className="text-[10px] text-zinc-400">Photo Polaroid & Time Capsules</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenPoetry();
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-950 text-xs font-medium text-rose-300 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Feather className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Vows & Poetry</div>
                    <div className="text-[10px] text-zinc-400">Sir Chif3n's sacred verses</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenSchedule();
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-950 text-xs font-medium text-emerald-200 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Broadcast Schedule</div>
                    <div className="text-[10px] text-zinc-400">Weekly simulcast air times</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenGacha();
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-950 text-xs font-medium text-amber-300 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Dice5 className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Gacha Altar</div>
                    <div className="text-[10px] text-zinc-400">Summon tonight's anime fate</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Group 2: 🎮 Arcade & Lo-Fi Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('arcade')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                activeDropdown === 'arcade'
                  ? 'bg-amber-950 border-amber-400 text-white'
                  : 'bg-[#04140e] border-emerald-900/80 hover:border-amber-500 text-amber-300'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Arcade & Lo-Fi</span>
              <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform ${activeDropdown === 'arcade' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'arcade' && (
              <div className="absolute top-full left-0 mt-1.5 w-60 bg-[#03150d] border border-amber-500/50 rounded-2xl p-2 shadow-2xl space-y-1 z-50 animate-in fade-in slide-in-from-top-2">
                {onOpenGame && (
                  <button
                    onClick={() => {
                      onOpenGame();
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-950/60 text-xs font-medium text-amber-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <Gamepad2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Palace Arcade Duel</div>
                      <div className="text-[10px] text-zinc-400">7 Real-Time Online Games</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenRadio();
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-950 text-xs font-medium text-emerald-200 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Lo-Fi Soundscape Studio</div>
                    <div className="text-[10px] text-zinc-400">Rain, chimes & sleep timer</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Group 3: 💌 Secret Vault & Mood Herb (High Priority Quick-Trigger) */}
          <div className="flex items-center gap-1.5">
            {onOpenCall && (
              <button
                onClick={onOpenCall}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-emerald-900/60 hover:border-emerald-400 text-emerald-200 hover:text-white text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title={activeRole === 'chif3n' ? 'Call Lady Leslye' : 'Call Sir Chif3n'}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call {activeRole === 'chif3n' ? 'Leslye 🌿' : 'Chif3n 👑'}</span>
              </button>
            )}

            {onOpenChatVault && (
              <button
                onClick={onOpenChatVault}
                className="relative px-3 py-1.5 rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-950/70 via-pink-950/50 to-amber-950/60 hover:border-rose-400 text-rose-200 hover:text-white text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="Open The Imperial Secret Vault"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
                <span>Vault 💌</span>
                {unreadMessagesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold shadow-md animate-bounce">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            <MoodHerbPill currentRole={activeRole} />
          </div>

          {/* Group 4: ⚙️ Palace Settings & Preferences Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('settings')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all shadow-sm ${
                activeDropdown === 'settings'
                  ? 'bg-emerald-950 border-emerald-400 text-white'
                  : 'bg-[#04140e] border-emerald-900/80 hover:border-emerald-600 text-emerald-300'
              }`}
              title="Palace Preferences & Settings"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <ChevronDown className={`w-3 h-3 text-emerald-400 transition-transform ${activeDropdown === 'settings' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'settings' && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-[#03150d] border border-emerald-500/50 rounded-2xl p-2.5 shadow-2xl space-y-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs font-mono">
                
                {/* Persona Switcher */}
                {onOpenLogin && (
                  <button
                    onClick={() => {
                      onOpenLogin();
                      setActiveDropdown(null);
                    }}
                    className="w-full p-2 rounded-xl bg-[#020e08] border border-emerald-900 flex items-center justify-between text-left hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {activeRole === 'leslye' ? <Leaf className="w-3.5 h-3.5 text-emerald-400" /> : <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="font-bold text-white">{activeRole === 'leslye' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑'}</span>
                    </div>
                    <span className="text-[10px] text-amber-300 underline">Switch</span>
                  </button>
                )}

                {/* Notifications Alert Toggle */}
                {onToggleNotifications && (
                  <button
                    onClick={onToggleNotifications}
                    className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-colors ${
                      notificationsEnabled
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : 'bg-[#020e08] border-emerald-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {notificationsEnabled ? <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Bell className="w-3.5 h-3.5 text-amber-400" />}
                      <span>Background Alerts</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {notificationsEnabled ? 'Active' : 'Enable'}
                    </span>
                  </button>
                )}

                {/* Ambience Toggle */}
                <button
                  onClick={onToggleAmbient}
                  className="w-full p-2 rounded-xl bg-[#020e08] border border-emerald-900 flex items-center justify-between text-left hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ambience Canvas</span>
                  </div>
                  <span className="text-[10px] font-bold capitalize text-amber-300">
                    {ambientMode}
                  </span>
                </button>

                {/* Date Night Watchlist Link */}
                <button
                  onClick={() => {
                    onSelectTab('date-night');
                    setActiveDropdown(null);
                  }}
                  className="w-full p-2 rounded-xl bg-[#020e08] border border-emerald-900 flex items-center justify-between text-left hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>Date Night Watchlist</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300">
                    {dateNightCount} saved
                  </span>
                </button>

                {/* In-App PWA Install Button */}
                <div className="pt-1 border-t border-emerald-950">
                  <PWAInstallButton />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu triggers */}
        <div className="flex items-center gap-2 lg:hidden">
          {onOpenChatVault && (
            <button
              onClick={onOpenChatVault}
              className="p-2 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-300 relative"
              title="Open Secret Vault"
            >
              <Heart className="w-4 h-4 fill-rose-400" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          )}

          {onOpenGame && (
            <button
              onClick={onOpenGame}
              className="p-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300"
              title="Play Couple Game"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-emerald-300 hover:text-white bg-emerald-950/80 border border-emerald-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Cleanly Grouped Sections) */}
      {mobileMenuOpen && (
        <div className="lg:hidden pt-3 pb-2 border-t border-emerald-900/60 mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 text-xs">
          
          {/* Section 1: Couple's Sanctum */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold px-1">
              💌 Couple's Sanctum
            </span>

            {onOpenCall && (
              <button
                onClick={() => {
                  onOpenCall();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border border-emerald-500/60 font-bold text-emerald-200 flex items-center justify-between shadow-sm active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Sacred Call ({activeRole === 'chif3n' ? 'Call Lady Leslye 🌿' : 'Call Sir Chif3n 👑'})</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300">Live Voice & Video</span>
              </button>
            )}

            {onOpenChatVault && (
              <button
                onClick={() => {
                  onOpenChatVault();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-pink-950/60 to-amber-950/70 border border-rose-500/50 font-bold text-rose-200 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
                  <span>The Imperial Secret Vault (Chat & Voice)</span>
                </div>
                {unreadMessagesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold shadow-md animate-bounce">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {onOpenGame && (
              <button
                onClick={() => {
                  onOpenGame();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-amber-500/20 border border-amber-400 font-bold text-amber-300 flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Palace Arcade (2-Player Online Duel) 🎮</span>
              </button>
            )}
          </div>

          {/* Section 2: Pavilions & Lore */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-1">
              🌸 Imperial Pavilions & Lore
            </span>

            <div className="grid grid-cols-2 gap-2">
              {onOpenDossier && (
                <button
                  onClick={() => {
                    onOpenDossier();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-[#041910] border border-amber-500/40 text-amber-200 flex items-center gap-2"
                >
                  <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Incident Dossier</span>
                </button>
              )}

              {onOpenScrapbook && (
                <button
                  onClick={() => {
                    onOpenScrapbook();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-[#041910] border border-emerald-500/40 text-emerald-200 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Scrapbook</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenPoetry();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#041910] border border-rose-500/40 text-rose-300 flex items-center gap-2"
              >
                <Feather className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Vows & Poetry</span>
              </button>

              <button
                onClick={() => {
                  onOpenRadio();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#041910] border border-emerald-800 text-emerald-200 flex items-center gap-2"
              >
                <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lo-Fi Studio</span>
              </button>

              <button
                onClick={() => {
                  onOpenSchedule();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#041910] border border-emerald-800 text-emerald-200 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Schedule</span>
              </button>

              <button
                onClick={() => {
                  onOpenGacha();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#041910] border border-amber-500/40 text-amber-300 flex items-center gap-2"
              >
                <Dice5 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Gacha Altar</span>
              </button>
            </div>
          </div>

          {/* Section 3: Media Archives Navigation */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-1">
              📜 Imperial Archives
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectTab('browse');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left ${
                  activeTab === 'browse' ? 'bg-emerald-900/60 text-white font-bold' : 'bg-[#020e08] text-emerald-300/80'
                }`}
              >
                🌿 Anime Realm
              </button>

              <button
                onClick={() => {
                  onSelectTab('manga');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left ${
                  activeTab === 'manga' ? 'bg-emerald-900/60 text-white font-bold' : 'bg-[#020e08] text-emerald-300/80'
                }`}
              >
                📜 Manga Scrolls
              </button>

              <button
                onClick={() => {
                  onSelectTab('novels');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left ${
                  activeTab === 'novels' ? 'bg-emerald-900/60 text-white font-bold' : 'bg-[#020e08] text-emerald-300/80'
                }`}
              >
                📖 Imperial Tomes
              </button>

              <button
                onClick={() => {
                  onSelectTab('demigod-picks');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left ${
                  activeTab === 'demigod-picks' ? 'bg-amber-500/20 border border-amber-400 text-amber-300 font-bold' : 'bg-[#020e08] text-amber-300/80'
                }`}
              >
                👑 Demigod's Picks ❤️
              </button>
            </div>
          </div>

          {/* Section 4: Preferences, PWA & Profile */}
          <div className="pt-2 border-t border-emerald-950 space-y-2">
            {onOpenLogin && (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between shadow-sm ${
                  activeRole === 'leslye'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                    : 'bg-amber-950 border-amber-500 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {activeRole === 'leslye' ? <Leaf className="w-4 h-4 text-emerald-400" /> : <Crown className="w-4 h-4 text-amber-400" />}
                  <span>Persona: {activeRole === 'leslye' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑'}</span>
                </div>
                <span className="text-[10px] text-amber-300 underline font-mono">Switch Profile</span>
              </button>
            )}

            {onToggleNotifications && (
              <button
                onClick={onToggleNotifications}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-between transition-all ${
                  notificationsEnabled
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-[#04140e] border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-emerald-400" />
                  <span>Background Push Alerts</span>
                </div>
                <span className="text-[10px]">{notificationsEnabled ? 'Active' : 'Enable'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onSelectTab('date-night');
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-[#04140e] border border-rose-900/60 text-rose-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-400" />
                <span>Date Night Queue</span>
              </div>
              <span className="text-xs font-mono text-amber-300">{dateNightCount} saved</span>
            </button>

            {/* PWA Install */}
            <PWAInstallButton />
          </div>
        </div>
      )}
    </header>
  );
};
