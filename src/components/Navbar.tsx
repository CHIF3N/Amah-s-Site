import React, { useState } from 'react';
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
  BellRing
} from 'lucide-react';

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
  activeRole = 'chif3n',
  ambientMode,
  onToggleAmbient,
  dateNightCount,
  unreadMessagesCount = 0,
  notificationsEnabled = false,
  onToggleNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#040e0a]/95 backdrop-blur-md border-b border-emerald-900/60 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Header with Japanese Sub-label & Demigod's Sanctuary badge */}
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

        {/* Desktop Quick Triggers & Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Active Persona / Login Switcher */}
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                activeRole === 'leslye'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 hover:border-emerald-400'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/60 hover:border-amber-400'
              }`}
              title="Imperial Profile & Persona Gate"
            >
              {activeRole === 'leslye' ? (
                <>
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lady Leslye 🌿</span>
                </>
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sir Chif3n 👑</span>
                </>
              )}
            </button>
          )}

          {/* Couple Game Trigger */}
          {onOpenGame && (
            <button
              onClick={onOpenGame}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/50 hover:border-amber-300 text-xs text-amber-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Play Real-Time Couple Game across different phones"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Couple Duel 🎮</span>
            </button>
          )}

          {/* Schedule Trigger */}
          <button
            onClick={onOpenSchedule}
            className="px-3 py-1.5 rounded-xl bg-[#04140e] border border-emerald-800/80 hover:border-emerald-500 text-xs text-emerald-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Schedule</span>
          </button>

          {/* Gacha Altar Trigger */}
          <button
            onClick={onOpenGacha}
            className="px-3 py-1.5 rounded-xl bg-[#04140e] border border-amber-500/40 hover:border-amber-400 text-xs text-amber-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-400" />
            <span>Gacha</span>
          </button>

          {/* Lo-Fi Piano & Radio Trigger */}
          <button
            onClick={onOpenRadio}
            className="px-3 py-1.5 rounded-xl bg-[#04140e] border border-emerald-800/80 hover:border-emerald-500 text-xs text-emerald-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Piano & Lo-Fi</span>
          </button>

          {/* Vows & Poetry Modal Trigger */}
          <button
            onClick={onOpenPoetry}
            className="px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Read Sir Chif3n's Vows and Poems"
          >
            <Feather className="w-3.5 h-3.5 text-rose-400" />
            <span>Vows & Poetry</span>
          </button>

          {/* Web Notification Alert Toggle */}
          {onToggleNotifications && (
            <button
              onClick={onToggleNotifications}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                notificationsEnabled
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-[#04140e] border-emerald-800/60 hover:border-amber-400 text-zinc-400 hover:text-amber-300'
              }`}
              title={notificationsEnabled ? 'Alerts Active (Receiving Chimes & Push Notifications)' : 'Click to Enable Background Alerts for New Messages'}
            >
              {notificationsEnabled ? (
                <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden xl:inline">
                {notificationsEnabled ? 'Alerts Active' : 'Enable Alerts'}
              </span>
            </button>
          )}

          {/* Imperial Secret Vault (Chat) */}
          {onOpenChatVault && (
            <button
              onClick={onOpenChatVault}
              className="relative px-3 py-1.5 rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-950/70 via-pink-950/50 to-amber-950/60 hover:border-rose-400 text-rose-200 hover:text-white text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Open The Imperial Secret Vault (Passcode Protected Chat)"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
              <span>Secret Vault 💌</span>
              {unreadMessagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold shadow-md animate-bounce">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          )}

          {/* Date Night Pill */}
          <button
            onClick={() => onSelectTab('date-night')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'date-night'
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-[#03110b] text-rose-300 border-rose-900/60 hover:border-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${dateNightCount > 0 ? 'fill-rose-400' : ''}`} />
            <span>Date Night</span>
            {dateNightCount > 0 && (
              <span className="text-[10px] font-mono bg-rose-950 px-1.5 py-0.2 rounded text-amber-300">
                {dateNightCount}
              </span>
            )}
          </button>

          {/* Ambience Switcher */}
          <button
            onClick={onToggleAmbient}
            title={`Ambience effect: currently ${ambientMode}`}
            className="p-1.5 rounded-xl border border-emerald-900/60 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-200 transition-colors flex items-center gap-1 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{ambientMode}</span>
          </button>
        </div>

        {/* Mobile menu triggers */}
        <div className="flex items-center gap-2 lg:hidden">
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
            onClick={onOpenRadio}
            className="p-2 rounded-xl bg-[#04140e] border border-emerald-800 text-emerald-300"
            title="Open Piano & Lo-Fi"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-emerald-300 hover:text-white bg-emerald-950/80 border border-emerald-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden pt-3 pb-2 border-t border-emerald-900/60 mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-2">
          {onOpenChatVault && (
            <button
              onClick={() => {
                onOpenChatVault();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-pink-950/60 to-amber-950/70 border border-rose-500/50 text-xs font-bold text-rose-200 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
                <span>💌 The Imperial Secret Vault (Private Chat)</span>
              </div>
              {unreadMessagesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold shadow-md animate-bounce">
                  {unreadMessagesCount} New
                </span>
              )}
            </button>
          )}

          {onToggleNotifications && (
            <button
              onClick={() => {
                onToggleNotifications();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                notificationsEnabled
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-[#04140e] border-emerald-800/60 text-amber-300'
              }`}
            >
              {notificationsEnabled ? (
                <BellRing className="w-4 h-4 text-emerald-400" />
              ) : (
                <Bell className="w-4 h-4 text-amber-400" />
              )}
              <span>{notificationsEnabled ? '🔔 Background Alerts Active' : '🔔 Enable Background Alerts'}</span>
            </button>
          )}

          {onOpenGame && (
            <button
              onClick={() => {
                onOpenGame();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400 text-xs font-bold text-amber-300 flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>🎮 Play Real-Time Couple Duel (IRL Online)</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 pb-2">
            {onOpenLogin && (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className={`col-span-2 p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 shadow-sm ${
                  activeRole === 'leslye'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                    : 'bg-amber-950 border-amber-500 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {activeRole === 'leslye' ? (
                    <Leaf className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Crown className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Persona: {activeRole === 'leslye' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑'}</span>
                </div>
                <span className="text-[10px] text-amber-300 underline font-mono">Switch Profile</span>
              </button>
            )}

            {onOpenGame && (
              <button
                onClick={() => {
                  onOpenGame();
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-rose-500/20 border border-amber-400/50 text-xs text-amber-300 font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Palace Arcade (2-Player IRL Duel) 🎮</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenSchedule();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#061710] border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Broadcast Schedule</span>
            </button>

            <button
              onClick={() => {
                onOpenGacha();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#061710] border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2"
            >
              <Dice5 className="w-4 h-4 text-amber-400" />
              <span>Gacha Altar</span>
            </button>

            {onToggleNotifications && (
              <button
                onClick={() => {
                  onToggleNotifications();
                  setMobileMenuOpen(false);
                }}
                className={`col-span-2 p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  notificationsEnabled
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                    : 'bg-[#061710] border-emerald-800 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {notificationsEnabled ? (
                    <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
                  ) : (
                    <Bell className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{notificationsEnabled ? 'System Alerts: Enabled' : 'Enable System Alerts'}</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">
                  {notificationsEnabled ? 'Active 🔔' : 'Tap to Allow'}
                </span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onSelectTab('browse');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm ${
              activeTab === 'browse' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            🌿 Realm Home
          </button>

          <button
            onClick={() => {
              onSelectTab('manga');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm ${
              activeTab === 'manga' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            📜 Manga Scrolls (5+ Complete Series)
          </button>

          <button
            onClick={() => {
              onSelectTab('novels');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm ${
              activeTab === 'novels' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            📖 Imperial Tomes & Facebook Sagas (20 Novels)
          </button>

          <button
            onClick={() => {
              onSelectTab('demigod-picks');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm ${
              activeTab === 'demigod-picks' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            👑 Demigod's Picks ❤️
          </button>

          <button
            onClick={() => {
              onSelectTab('date-night');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between ${
              activeTab === 'date-night' ? 'bg-rose-900/60 text-white font-medium' : 'text-rose-300/80'
            }`}
          >
            <span>Date Night Watchlist</span>
            {dateNightCount > 0 && (
              <span className="text-xs font-mono text-amber-300">
                {dateNightCount} saved
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onOpenPoetry();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm text-amber-300 hover:text-white"
          >
            ✨ Demigod's Vows & Poetry
          </button>
        </div>
      )}
    </header>
  );
};
