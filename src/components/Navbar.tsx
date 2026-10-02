import React, { useState } from 'react';
import { Sparkles, Heart, Menu, X, Leaf, BookOpen, Feather } from 'lucide-react';

interface NavbarProps {
  activeTab: 'browse' | 'manga' | 'novels' | 'demigod-picks' | 'date-night' | 'love-scrolls';
  onSelectTab: (tab: 'browse' | 'manga' | 'novels' | 'demigod-picks' | 'date-night' | 'love-scrolls') => void;
  onOpenPoetry: () => void;
  ambientMode: 'stars' | 'sakura' | 'off';
  onToggleAmbient: () => void;
  dateNightCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenPoetry,
  ambientMode,
  onToggleAmbient,
  dateNightCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#040e0a]/92 backdrop-blur-md border-b border-emerald-900/60 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('browse');
          }}
          className="font-cinzel text-base sm:text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 hover:opacity-90 transition-opacity flex items-center gap-1.5 select-none"
        >
          <Leaf className="w-4 h-4 text-emerald-400 inline" />
          <span>LESLYE'S REALM</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-medium text-emerald-100/80">
          <button
            onClick={() => onSelectTab('browse')}
            className={`transition-colors relative py-1 hover:text-white ${
              activeTab === 'browse'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-emerald-400'
                : 'text-emerald-300/70'
            }`}
          >
            🌿 Anime
          </button>

          <button
            onClick={() => onSelectTab('manga')}
            className={`transition-colors relative py-1 hover:text-white ${
              activeTab === 'manga'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-emerald-400'
                : 'text-emerald-300/70'
            }`}
          >
            📜 Manga
          </button>

          <button
            onClick={() => onSelectTab('novels')}
            className={`transition-colors relative py-1 hover:text-white ${
              activeTab === 'novels'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-emerald-400'
                : 'text-emerald-300/70'
            }`}
          >
            📖 Novels
          </button>

          <button
            onClick={() => onSelectTab('demigod-picks')}
            className={`transition-colors relative py-1 hover:text-white ${
              activeTab === 'demigod-picks'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber-400'
                : 'text-emerald-300/70'
            }`}
          >
            👑 Demigod's Picks
          </button>

          <button
            onClick={() => onSelectTab('date-night')}
            className={`transition-colors relative py-1 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'date-night'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-400'
                : 'text-emerald-300/70'
            }`}
          >
            <span>Date Night</span>
            {dateNightCount > 0 && (
              <span className="text-[11px] font-mono text-amber-300 tabular-nums">
                ({dateNightCount})
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('love-scrolls')}
            className={`transition-colors relative py-1 hover:text-white ${
              activeTab === 'love-scrolls'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-emerald-400'
                : 'text-emerald-300/70'
            }`}
          >
            Love Scrolls
          </button>
        </nav>

        {/* Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Demigod Poetry Modal Trigger */}
          <button
            onClick={onOpenPoetry}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Read Sir Chif3n's Vows and Poems"
          >
            <Feather className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Vows & Poetry</span>
          </button>

          {/* Ambience Switcher */}
          <button
            onClick={onToggleAmbient}
            title={`Ambience effect: currently ${ambientMode}`}
            className="p-1.5 sm:p-2 rounded-lg border border-emerald-900/60 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-200 transition-colors flex items-center gap-1 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline capitalize">{ambientMode}</span>
          </button>

          {/* Mobile drawer toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/60"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden pt-3 pb-2 border-t border-emerald-900/60 mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => {
              onSelectTab('browse');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs sm:text-sm ${
              activeTab === 'browse' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            🌿 Anime Streaming
          </button>

          <button
            onClick={() => {
              onSelectTab('manga');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs sm:text-sm ${
              activeTab === 'manga' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            📜 Manga (MangaDex)
          </button>

          <button
            onClick={() => {
              onSelectTab('novels');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs sm:text-sm ${
              activeTab === 'novels' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            📖 Light Novels
          </button>

          <button
            onClick={() => {
              onSelectTab('demigod-picks');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs sm:text-sm ${
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
            className={`w-full text-left px-3 py-2 rounded text-xs sm:text-sm flex items-center justify-between ${
              activeTab === 'date-night' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
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
              onSelectTab('love-scrolls');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-xs sm:text-sm ${
              activeTab === 'love-scrolls' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            Love Scrolls & Decrees
          </button>
        </div>
      )}
    </header>
  );
};
