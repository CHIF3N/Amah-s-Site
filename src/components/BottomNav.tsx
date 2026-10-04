import React from 'react';
import { Tv, BookOpen, Layers, Crown } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'browse' | 'manga' | 'novels' | 'demigod-picks';
  onSelectTab: (tab: 'browse' | 'manga' | 'novels' | 'demigod-picks') => void;
  onOpenChatVault?: () => void;
  onOpenCall?: () => void;
  unreadMessagesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenChatVault,
  onOpenCall,
  unreadMessagesCount = 0
}) => {
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#06150fe0] backdrop-blur-xl border border-emerald-600/40 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around text-xs">
      <button
        onClick={() => onSelectTab('browse')}
        className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
          activeTab === 'browse'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
            : 'text-emerald-400/80 hover:text-emerald-200'
        }`}
      >
        <span className="text-sm">🌿</span>
        <span className="text-[10px] tracking-tight">Anime</span>
      </button>

      <button
        onClick={() => onSelectTab('manga')}
        className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
          activeTab === 'manga'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
            : 'text-emerald-400/80 hover:text-emerald-200'
        }`}
      >
        <span className="text-sm">📜</span>
        <span className="text-[10px] tracking-tight">Manga</span>
      </button>

      <button
        onClick={() => onSelectTab('novels')}
        className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
          activeTab === 'novels'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
            : 'text-emerald-400/80 hover:text-emerald-200'
        }`}
      >
        <span className="text-sm">📖</span>
        <span className="text-[10px] tracking-tight">Novels</span>
      </button>

      <button
        onClick={() => onSelectTab('demigod-picks')}
        className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
          activeTab === 'demigod-picks'
            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-md'
            : 'text-amber-400/80 hover:text-amber-200'
        }`}
      >
        <span className="text-sm">👑</span>
        <span className="text-[10px] tracking-tight">Picks ❤️</span>
      </button>

      {onOpenCall && (
        <button
          onClick={onOpenCall}
          className="flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-1 transition-all text-emerald-300 hover:text-white"
        >
          <span className="text-sm">📞</span>
          <span className="text-[10px] tracking-tight">Call</span>
        </button>
      )}

      {onOpenChatVault && (
        <button
          onClick={onOpenChatVault}
          className="flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-1 transition-all text-rose-300 hover:text-white relative"
        >
          <span className="text-sm">💌</span>
          <span className="text-[10px] tracking-tight">Vault</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-bounce shadow">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      )}
    </nav>
  );
};
