import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Layers,
  ExternalLink,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  CheckCircle,
  Eye,
  Maximize2
} from 'lucide-react';
import { MangaItem, MangaChapter } from '../types/anime';
import {
  COMPLETE_POPULAR_MANGA,
  searchMangaDex,
  fetchMangaChapters,
  fetchChapterPages
} from '../services/mangaDexApi';

export const MangaReaderArchive: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mangaList, setMangaList] = useState<MangaItem[]>(COMPLETE_POPULAR_MANGA);
  const [selectedManga, setSelectedManga] = useState<MangaItem | null>(COMPLETE_POPULAR_MANGA[0]);
  
  // Chapter viewer state
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [activeChapter, setActiveChapter] = useState<MangaChapter | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Load first manga's chapters automatically
  useEffect(() => {
    if (selectedManga) {
      loadMangaChapters(selectedManga);
    }
  }, []);

  const loadMangaChapters = async (manga: MangaItem) => {
    setLoadingChapters(true);
    try {
      const chs = await fetchMangaChapters(manga.id);
      setChapters(chs);
      if (chs.length > 0) {
        handleOpenChapter(chs[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setMangaList(COMPLETE_POPULAR_MANGA);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchMangaDex(searchQuery);
      setMangaList(results.length > 0 ? results : COMPLETE_POPULAR_MANGA);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectManga = (manga: MangaItem) => {
    setSelectedManga(manga);
    loadMangaChapters(manga);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleOpenChapter = async (chapter: MangaChapter) => {
    setActiveChapter(chapter);
    setLoadingPages(true);
    try {
      const pgs = await fetchChapterPages(chapter.id);
      setPages(pgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPages(false);
    }
  };

  const currentChapterIdx = chapters.findIndex((c) => c.id === activeChapter?.id);

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      handleOpenChapter(chapters[currentChapterIdx - 1]);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIdx >= 0 && currentChapterIdx < chapters.length - 1) {
      handleOpenChapter(chapters[currentChapterIdx + 1]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#06241a] via-[#04150f] to-[#0c261c] border border-emerald-500/30 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
            📜 Imperial Scrolls & Manga Archives
          </span>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
            Complete Popular Manga & Webtoon Reader
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 leading-relaxed">
            Curated 5+ complete popular manga series including The Apothecary Diaries, Frieren, Solo Leveling, Dandadan, Spy x Family, and Horimiya. Read vertical chapter pages with zero popups!
          </p>

          <form onSubmit={handleSearch} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search manga (e.g. Apothecary Diaries, Frieren, Dandadan, Solo Leveling)..."
                className="w-full bg-[#030e09]/90 border border-emerald-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSearching ? 'Reading...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Active Manga Details & In-App Reader */}
      {selectedManga && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#061710]/95 border border-emerald-500/40 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-20 sm:w-28 aspect-[3/4] rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-800 shadow-md">
                <img src={selectedManga.coverUrl} alt={selectedManga.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">{selectedManga.title}</h3>
                {selectedManga.altTitle && (
                  <p className="text-xs text-emerald-400/80 mt-0.5">{selectedManga.altTitle}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedManga.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <a
                    href={`https://mangadex.org/title/${selectedManga.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <span>MangaDex Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://mangafire.to/filter?keyword=${encodeURIComponent(selectedManga.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    <span>MangaFire Mirror</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedManga(null)}
              className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chapters Picker */}
          <div className="border-t border-emerald-900/60 pt-3">
            <h4 className="text-xs uppercase font-mono text-emerald-400 font-semibold mb-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Chapters ({chapters.length}):</span>
            </h4>

            {loadingChapters ? (
              <p className="text-xs text-emerald-500 py-3">Fetching translation scrolls...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleOpenChapter(ch)}
                    className={`p-2 rounded-lg text-xs text-left truncate border transition-all ${
                      activeChapter?.id === ch.id
                        ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-md'
                        : 'bg-[#04140e] text-emerald-200 border-emerald-900 hover:border-emerald-600'
                    }`}
                  >
                    <span className="block font-mono text-[10px] text-emerald-500">Ch. {ch.chapter}</span>
                    <span className="truncate block">{ch.title || `Chapter ${ch.chapter}`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vertical Reader Canvas */}
          {activeChapter && (
            <div className="mt-4 p-4 rounded-xl bg-black border border-emerald-800 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/80 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-300 font-cinzel">
                    Reading: Chapter {activeChapter.chapter} · {activeChapter.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevChapter}
                    disabled={currentChapterIdx <= 0}
                    className="px-2.5 py-1 rounded bg-[#071911] border border-emerald-800 text-[11px] text-emerald-200 hover:text-white disabled:opacity-30"
                  >
                    ← Prev Ch.
                  </button>
                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapterIdx >= chapters.length - 1}
                    className="px-2.5 py-1 rounded bg-[#071911] border border-emerald-800 text-[11px] text-emerald-200 hover:text-white disabled:opacity-30"
                  >
                    Next Ch. →
                  </button>
                </div>
              </div>

              {loadingPages ? (
                <p className="text-xs text-emerald-400 py-8 text-center animate-pulse">Loading chapter pages...</p>
              ) : pages.length > 0 ? (
                <div className="space-y-3 max-h-[85vh] overflow-y-auto max-w-2xl mx-auto scrollbar-thin">
                  {pages.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`Page ${idx + 1}`}
                      loading="lazy"
                      className="w-full object-contain rounded-lg shadow-xl"
                      onError={(e) => {
                        // Fallback image if hotlinking fails
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80';
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-emerald-400">Pages protected by remote server rate limits.</p>
                  <a
                    href={`https://mangadex.org/chapter/${activeChapter.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold"
                  >
                    <span>Read on MangaDex Mirror</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Complete Popular Manga Grid (5+ Manga) */}
      <div className="space-y-2">
        <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Complete Popular Manga Library ({mangaList.length} Series)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {mangaList.map((manga) => (
            <div
              key={manga.id}
              onClick={() => handleSelectManga(manga)}
              className="group relative flex flex-col bg-[#071711]/60 border border-emerald-900/40 rounded-xl overflow-hidden hover:border-emerald-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/40 cursor-pointer"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                <img
                  src={manga.coverUrl}
                  alt={manga.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                {manga.chif3nNote && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-amber-300 border border-amber-500/40">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Demigod's Pick ❤️</span>
                  </div>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-emerald-50 group-hover:text-amber-300 transition-colors line-clamp-1 font-cinzel">
                    {manga.title}
                  </h4>
                  <p className="text-[11px] text-emerald-400/70 line-clamp-2 mt-1">
                    {manga.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-emerald-900/50 flex items-center justify-between text-xs text-amber-400 font-medium">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>Read Now</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
