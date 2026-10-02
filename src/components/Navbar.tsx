import React, { useState } from 'react';
import { Sparkles, Heart, Menu, X, Leaf, FlaskConical } from 'lucide-react';

interface NavbarProps {
  activeTab: 'browse' | 'demigod-picks' | 'date-night' | 'love-scrolls';
  onSelectTab: (tab: 'browse' | 'demigod-picks' | 'date-night' | 'love-scrolls') => void;
  onSurpriseMe: () => void;
  ambientMode: 'stars' | 'sakura' | 'off';
  onToggleAmbient: () => void;
  dateNightCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onSurpriseMe,
  ambientMode,
  onToggleAmbient,
  dateNightCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#040e0a]/90 backdrop-blur-md border-b border-emerald-900/60 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('browse');
          }}
          className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 hover:opacity-90 transition-opacity flex items-center gap-2 select-none"
        >
          <Leaf className="w-5 h-5 text-emerald-400 inline" />
          <span>LESLYE'S APOTHECARY</span>
        </a>

        {/* Zone 2: Clean text navigation links (No static pills, clean hover underlines) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-emerald-100/80">
          <button
            onClick={() => onSelectTab('browse')}
            className={`transition-colors relative py-1 hover:text-white ${
              activeTab === 'browse'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-emerald-400'
                : 'text-emerald-300/70'
            }`}
          >
            Recent Catalog
          </button>

          <button
            onClick={() => onSelectTab('demigod-picks')}
            className={`transition-colors relative py-1 hover:text-white ${
              activeTab === 'demigod-picks'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber-400'
                : 'text-emerald-300/70'
            }`}
          >
            Maomao's Herbs & Picks
          </button>

          <button
            onClick={() => onSelectTab('date-night')}
            className={`transition-colors relative py-1 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'date-night'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-400'
                : 'text-emerald-300/70'
            }`}
          >
            <span>Date Night Queue</span>
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
            Imperial Love Scrolls
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Ambience Lotus/Fireflies Switcher */}
          <button
            onClick={onToggleAmbient}
            title={`Ambience effect: currently ${ambientMode}`}
            className="p-2 rounded-lg border border-emerald-900/60 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-200 transition-colors flex items-center gap-1.5 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline capitalize">{ambientMode}</span>
          </button>

          {/* Demigod Poison Tester / Surprise button */}
          <button
            onClick={onSurpriseMe}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Taste Test Anime</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/60"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-2 border-t border-emerald-900/60 mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => {
              onSelectTab('browse');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm ${
              activeTab === 'browse' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            Recent Anime Catalog
          </button>

          <button
            onClick={() => {
              onSelectTab('demigod-picks');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm ${
              activeTab === 'demigod-picks' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            Maomao's Herbs & Picks for Leslye
          </button>

          <button
            onClick={() => {
              onSelectTab('date-night');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ${
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
            className={`w-full text-left px-3 py-2 rounded text-sm ${
              activeTab === 'love-scrolls' ? 'bg-emerald-900/60 text-white font-medium' : 'text-emerald-300/80'
            }`}
          >
            Imperial Love Scrolls
          </button>
        </div>
      )}
    </header>
  );
};
