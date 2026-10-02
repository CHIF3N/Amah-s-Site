import React, { useState } from 'react';
import { BookOpen, ExternalLink, Sparkles, ChevronRight, X, Heart, Shield } from 'lucide-react';
import { LightNovelItem } from '../types/anime';
import { CURATED_LIGHT_NOVELS } from '../data/curatedData';

export const LightNovelArchive: React.FC = () => {
  const [selectedNovel, setSelectedNovel] = useState<LightNovelItem | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#06241a] via-[#04150f] to-[#0c261c] border border-emerald-500/30 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
            📖 Imperial Tomes & Light Novels
          </span>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
            Consecrated Novels & Reading Chambers
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 leading-relaxed">
            Distraction-free typography, curated chapters, and direct references to official NovelUpdates archives. No popups or subscription walls.
          </p>
        </div>
      </div>

      {/* Reader Modal / Drawer */}
      {selectedNovel && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#061710]/95 border border-emerald-500/50 shadow-2xl space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-emerald-900/60 pb-3">
            <div>
              <span className="text-[10px] text-amber-300 font-mono uppercase">Imperial Reading Chamber</span>
              <h3 className="text-lg sm:text-xl font-bold text-white font-cinzel">{selectedNovel.title}</h3>
              <p className="text-xs text-emerald-400 mt-0.5">Author: {selectedNovel.author} · {selectedNovel.status}</p>
            </div>

            <div className="flex items-center gap-2">
              {selectedNovel.novelUpdatesUrl && (
                <a
                  href={selectedNovel.novelUpdatesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#04140e] border border-emerald-800 text-xs text-amber-300 hover:border-emerald-500 flex items-center gap-1"
                >
                  <span>NovelUpdates</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => setSelectedNovel(null)}
                className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapter Selector */}
          {selectedNovel.sampleChapters && selectedNovel.sampleChapters.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {selectedNovel.sampleChapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                    activeChapterIndex === idx
                      ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-sm'
                      : 'bg-[#04140e] text-emerald-200 border-emerald-900 hover:border-emerald-700'
                  }`}
                >
                  {ch.chapterNum}
                </button>
              ))}
            </div>
          )}

          {/* Reading Typography Canvas */}
          {selectedNovel.sampleChapters && selectedNovel.sampleChapters[activeChapterIndex] && (
            <div className="p-5 sm:p-8 rounded-xl bg-[#040e0a] border border-emerald-900 max-w-3xl mx-auto shadow-inner space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-amber-300 font-cinzel border-b border-emerald-950 pb-2">
                {selectedNovel.sampleChapters[activeChapterIndex].title}
              </h4>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-serif whitespace-pre-line tracking-wide">
                {selectedNovel.sampleChapters[activeChapterIndex].content}
              </p>
              
              <div className="pt-4 border-t border-emerald-950 flex items-center justify-between text-xs text-emerald-500 italic">
                <span>Sanctuary Reading Mode</span>
                <span className="text-amber-400">Curated solely for Leslye</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Novel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {CURATED_LIGHT_NOVELS.map((novel) => (
          <div
            key={novel.id}
            onClick={() => {
              setSelectedNovel(novel);
              setActiveChapterIndex(0);
            }}
            className="group relative flex flex-col bg-[#071711]/60 border border-emerald-900/40 rounded-xl overflow-hidden hover:border-emerald-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/40 cursor-pointer"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />
              
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-amber-300 border border-amber-500/40">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Demigod's Pick ❤️</span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-emerald-50 group-hover:text-amber-300 transition-colors line-clamp-1 font-cinzel">
                  {novel.title}
                </h4>
                <span className="text-[11px] text-emerald-400/70 font-mono block mt-0.5">
                  {novel.author} · {novel.status}
                </span>
                <p className="text-xs text-emerald-300/80 line-clamp-2 mt-2">
                  {novel.synopsis}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-emerald-900/50 flex items-center justify-between text-xs text-amber-400 font-medium">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Tome</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
