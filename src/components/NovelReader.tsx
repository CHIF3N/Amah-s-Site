import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  ExternalLink,
  Upload,
  Settings,
  X,
  Type,
  Maximize2,
  Minimize2,
  FileText,
  Heart,
  CheckCircle,
  Menu,
  Compass,
  Layers,
  FolderOpen,
  Globe,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  ArrowLeft,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PRELOADED_NOVELS, CuratedNovel, NovelChapter } from '../data/novels';

// Set up pdfjs worker from verified cdn
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ReaderTheme = 'parchment' | 'candlelight' | 'tearoom';
type NovelCategory = 'all' | 'light-novel' | 'facebook-story' | 'imported';

interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: number; // in px
  lineHeight: number; // 1.6, 1.8, 2.0
  fontFamily: 'serif' | 'sans';
}

const THEME_STYLES: Record<ReaderTheme, { bg: string; text: string; border: string; accent: string; name: string; icon: string }> = {
  parchment: {
    bg: '#0c1510',
    text: '#f4efe6',
    border: '#1b382b',
    accent: '#10b981',
    name: 'Herbal Parchment',
    icon: '📜'
  },
  candlelight: {
    bg: '#050806',
    text: '#fbbf24',
    border: '#2e240e',
    accent: '#f59e0b',
    name: 'Imperial Candlelight',
    icon: '🕯️'
  },
  tearoom: {
    bg: '#15110d',
    text: '#e8dcc4',
    border: '#3b2f23',
    accent: '#d97706',
    name: 'Palace Tea Room',
    icon: '🍵'
  }
};

export const NovelReader: React.FC = () => {
  const [novels, setNovels] = useState<CuratedNovel[]>(() => {
    try {
      const stored = localStorage.getItem('leslye_custom_novels');
      if (stored) {
        const parsed = JSON.parse(stored);
        return [...PRELOADED_NOVELS, ...parsed];
      }
    } catch (e) {
      console.warn(e);
    }
    return PRELOADED_NOVELS;
  });

  // Library vs Reader viewMode: default to library so the user can browse all different novels!
  const [isReading, setIsReading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<NovelCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNovelId, setSelectedNovelId] = useState<string>('apothecary-diaries');
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [chapterDrawerOpen, setChapterDrawerOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [bookmarkSavedNotice, setBookmarkSavedNotice] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // react-pdf State for Client-Side PDF Novel Rendering
  const [pdfFile, setPdfFile] = useState<File | string | null>(null);
  const [numPdfPages, setNumPdfPages] = useState<number | null>(null);
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.1);

  // Settings
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('leslye_novel_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      theme: 'parchment',
      fontSize: 18,
      lineHeight: 1.8,
      fontFamily: 'serif'
    };
  });

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter novels by category and search query
  const filteredNovels = novels.filter((n) => {
    // Category match
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'imported'
        ? n.id.startsWith('custom-') || n.category === 'imported'
        : n.category === activeCategory;

    if (!matchesCategory) return false;

    // Search query match
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      n.title.toLowerCase().includes(q) ||
      (n.japaneseTitle && n.japaneseTitle.toLowerCase().includes(q)) ||
      n.author.toLowerCase().includes(q) ||
      n.synopsis.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const currentNovel = novels.find((n) => n.id === selectedNovelId) || novels[0];
  const chapters = currentNovel?.chapters || [];
  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const currentTheme = THEME_STYLES[settings.theme];

  // Open a specific novel into the reading chamber
  const handleOpenNovel = (novelId: string, chapterIdx = 0) => {
    setSelectedNovelId(novelId);
    const target = novels.find((n) => n.id === novelId);

    // If it's a PDF novel, setup PDF
    if (novelId.startsWith('custom-pdf-')) {
      // PDF stays active
    } else {
      setPdfFile(null);
    }

    // Load saved bookmark
    try {
      const savedProgress = localStorage.getItem(`leslye_bookmark_${novelId}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (typeof parsed.chapterIndex === 'number' && parsed.chapterIndex < (target?.chapters?.length || 0)) {
          setActiveChapterIndex(parsed.chapterIndex);
        } else {
          setActiveChapterIndex(chapterIdx);
        }
      } else {
        setActiveChapterIndex(chapterIdx);
      }
    } catch (e) {
      setActiveChapterIndex(chapterIdx);
    }

    setIsReading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to the Library / Shelf
  const handleBackToLibrary = () => {
    setIsReading(false);
    setIsFullscreen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore scroll position when reading
  useEffect(() => {
    if (!currentNovel || pdfFile || !isReading) return;
    try {
      const savedProgress = localStorage.getItem(`leslye_bookmark_${currentNovel.id}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed.chapterIndex === activeChapterIndex && parsed.scrollTop && contentContainerRef.current) {
          setTimeout(() => {
            if (contentContainerRef.current) {
              contentContainerRef.current.scrollTop = parsed.scrollTop;
            }
          }, 100);
        }
      }
    } catch (e) {}
  }, [activeChapterIndex, currentNovel?.id, pdfFile, isReading]);

  // Auto-save scroll position
  const handleScroll = () => {
    if (!contentContainerRef.current || !currentNovel || pdfFile) return;
    const scrollTop = contentContainerRef.current.scrollTop;
    try {
      localStorage.setItem(
        `leslye_bookmark_${currentNovel.id}`,
        JSON.stringify({
          chapterIndex: activeChapterIndex,
          scrollTop,
          timestamp: Date.now()
        })
      );
    } catch (e) {}
  };

  // Explicit bookmark save button
  const handleSaveBookmark = () => {
    if (!currentNovel) return;
    if (pdfFile) {
      try {
        localStorage.setItem(`leslye_pdf_page_${currentNovel.id}`, currentPdfPage.toString());
      } catch (e) {}
    } else if (contentContainerRef.current) {
      const scrollTop = contentContainerRef.current.scrollTop;
      try {
        localStorage.setItem(
          `leslye_bookmark_${currentNovel.id}`,
          JSON.stringify({
            chapterIndex: activeChapterIndex,
            scrollTop,
            timestamp: Date.now()
          })
        );
      } catch (e) {}
    }

    setBookmarkSavedNotice(true);
    setTimeout(() => setBookmarkSavedNotice(false), 3500);
  };

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem('leslye_novel_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Multi-Format File Upload Input (.PDF, .TXT, .EPUB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const fileName = file.name;
    const isPdf = fileName.toLowerCase().endsWith('.pdf');

    try {
      if (isPdf) {
        setPdfFile(file);
        setCurrentPdfPage(1);

        const newNovel: CuratedNovel = {
          id: `custom-pdf-${Date.now()}`,
          title: fileName.replace(/\.[^/.]+$/, ''),
          author: 'Imported PDF Document',
          category: 'imported',
          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
          synopsis: `Imported PDF novel document (${(file.size / (1024 * 1024)).toFixed(1)} MB). Rendered with high-fidelity canvas.`,
          tags: ['PDF Novel', 'Client Sanctuary', 'Uploaded'],
          chif3nNote: 'Imported PDF novel loaded for Lady Leslye. Read with cozy comfort! 📖✨',
          chapters: [
            {
              id: 'pdf-doc',
              chapterNumber: 1,
              title: fileName,
              content: 'Rendering via react-pdf client-side document viewer...'
            }
          ]
        };

        setNovels((prev) => [newNovel, ...prev]);
        setSelectedNovelId(newNovel.id);
        setIsReading(true);
      } else {
        setPdfFile(null);
        const text = await file.text();
        const lines = text.split('\n');
        const title = lines[0]?.trim() || fileName.replace(/\.[^/.]+$/, '');
        const paragraphs = lines.slice(1).join('\n').trim();

        const newNovel: CuratedNovel = {
          id: `custom-txt-${Date.now()}`,
          title: title.length > 50 ? title.substring(0, 50) + '...' : title,
          author: 'Local File / Imported',
          category: 'imported',
          coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
          synopsis: `Custom light novel imported from local file: ${fileName}.`,
          tags: ['Custom Import', 'Personal Vault'],
          chif3nNote: 'Imported by Lady Leslye into our sanctuary. 🌿',
          chapters: [
            {
              id: 'import-ch1',
              chapterNumber: 1,
              title: title,
              content: paragraphs || 'No text content detected.'
            }
          ]
        };

        setNovels((prev) => [newNovel, ...prev]);
        setSelectedNovelId(newNovel.id);
        setActiveChapterIndex(0);
        setIsReading(true);
      }
    } catch (err) {
      console.error('File import error:', err);
      alert('Could not read the document. Please try a valid .pdf or .txt file.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleNextChapter = () => {
    if (pdfFile) {
      if (numPdfPages && currentPdfPage < numPdfPages) {
        setCurrentPdfPage((prev) => prev + 1);
      }
    } else if (activeChapterIndex < chapters.length - 1) {
      setActiveChapterIndex((prev) => prev + 1);
      if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
    }
  };

  const handlePrevChapter = () => {
    if (pdfFile) {
      if (currentPdfPage > 1) {
        setCurrentPdfPage((prev) => prev - 1);
      }
    } else if (activeChapterIndex > 0) {
      setActiveChapterIndex((prev) => prev - 1);
      if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
    }
  };

  // Counts for categories
  const lnCount = novels.filter((n) => n.category === 'light-novel').length;
  const fbCount = novels.filter((n) => n.category === 'facebook-story').length;
  const impCount = novels.filter((n) => n.id.startsWith('custom-') || n.category === 'imported').length;

  return (
    <div className="space-y-6 animate-in fade-in transition-colors duration-300">
      {/* Hidden File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.epub,.md"
        onChange={handleFileUpload}
        className="hidden"
        id="pdf-novel-upload-input"
      />

      {/* ========================================================================= */}
      {/* 1. LIBRARY VIEW: BROWSE DIFFERENT NOVELS & CLICK TO OPEN                 */}
      {/* ========================================================================= */}
      {!isReading && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-[#06241a] via-[#04150f] to-[#120815] border border-amber-500/40 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-cinzel text-[10px] font-bold text-amber-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/60 border border-amber-500/40 shadow-sm flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>The Imperial Library · {novels.length} Works</span>
                  </span>
                  <span className="text-emerald-700">·</span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Complete Light Novels & Facebook Drama Sagas
                  </span>
                </div>

                <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wide">
                  Imperial Tomes & Story Sanctuary
                </h1>

                <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-serif">
                  Select any light novel or viral Facebook drama below to open the dedicated in-app reader chamber. You can also import your own external PDF novels anytime.
                </p>
              </div>

              {/* Upload PDF Button */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-cinzel font-bold text-xs flex items-center gap-2 shadow-xl shadow-amber-950/60 active:scale-95 transition-all disabled:opacity-50"
                  title="Upload external .pdf or .txt novel"
                >
                  <Upload className="w-4 h-4 text-black" />
                  <span>{isImporting ? 'Reading PDF...' : 'Import PDF Novel'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#04120a] p-3 rounded-2xl border border-emerald-900/60">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, tag, or drama..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#020a06] border border-emerald-900/80 focus:border-amber-400 text-xs text-white placeholder-emerald-700 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeCategory === 'all'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                    : 'bg-[#030e08] text-emerald-300/80 border-emerald-900/80 hover:text-white'
                }`}
              >
                🌸 All Works ({novels.length})
              </button>

              <button
                onClick={() => setActiveCategory('light-novel')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeCategory === 'light-novel'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                    : 'bg-[#030e08] text-emerald-300/80 border-emerald-900/80 hover:text-white'
                }`}
              >
                📜 Light Novels ({lnCount})
              </button>

              <button
                onClick={() => setActiveCategory('facebook-story')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeCategory === 'facebook-story'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-400 shadow-sm font-bold'
                    : 'bg-[#030e08] text-rose-300/90 border-rose-950 hover:text-white'
                }`}
              >
                📱 Facebook Stories ({fbCount})
              </button>

              {impCount > 0 && (
                <button
                  onClick={() => setActiveCategory('imported')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    activeCategory === 'imported'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                      : 'bg-[#030e08] text-emerald-300/80 border-emerald-900/80 hover:text-white'
                  }`}
                >
                  📂 Uploaded ({impCount})
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          {searchQuery && (
            <div className="text-xs text-emerald-400/90 font-mono">
              Found {filteredNovels.length} {filteredNovels.length === 1 ? 'tome' : 'tomes'} matching "{searchQuery}"
            </div>
          )}

          {/* Grid of Different Novels (Click any novel to open) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredNovels.map((novel) => {
              const isFbStory = novel.category === 'facebook-story';
              const isImported = novel.category === 'imported' || novel.id.startsWith('custom-');
              const totalWords = novel.chapters.reduce((acc, c) => acc + (c.wordCount || 1000), 0);

              return (
                <div
                  key={novel.id}
                  onClick={() => handleOpenNovel(novel.id)}
                  className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${
                    isFbStory
                      ? 'bg-[#0f070d] border-rose-950 hover:border-rose-400/80 hover:shadow-rose-950/40'
                      : isImported
                      ? 'bg-[#091510] border-emerald-900/80 hover:border-amber-400/80 hover:shadow-emerald-950/40'
                      : 'bg-[#05140e] border-emerald-950 hover:border-emerald-500/80 hover:shadow-emerald-950/50'
                  }`}
                >
                  <div>
                    {/* Top Image Banner & Badges */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-black/60">
                      <img
                        src={novel.coverUrl}
                        alt={novel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05140e] via-transparent to-black/60" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider shadow-md ${
                            isFbStory
                              ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                              : isImported
                              ? 'bg-amber-950/90 text-amber-300 border border-amber-500/50'
                              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {isFbStory ? '📱 Viral Facebook Story' : isImported ? '📂 Uploaded Tome' : '📜 Imperial Light Novel'}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/70 text-emerald-200 border border-emerald-800">
                          {novel.chapters.length} {novel.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                        </span>
                      </div>
                    </div>

                    {/* Novel Metadata */}
                    <div className="p-4 space-y-2.5">
                      {novel.japaneseTitle && (
                        <span className="text-[10px] font-serif text-emerald-400/80 block -mb-1 truncate">
                          {novel.japaneseTitle}
                        </span>
                      )}

                      <h3 className="font-cinzel text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {novel.title}
                      </h3>

                      <div className="flex items-center gap-2 text-[11px] text-emerald-400/80 font-mono">
                        <span>By {novel.author}</span>
                        {novel.illustrator && (
                          <>
                            <span>·</span>
                            <span className="text-zinc-500 truncate">Art: {novel.illustrator}</span>
                          </>
                        )}
                      </div>

                      {/* Synopsis */}
                      <p className="font-serif text-xs text-emerald-100/70 leading-relaxed line-clamp-3">
                        {novel.synopsis}
                      </p>

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {novel.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Demigod Dedication */}
                      {novel.chif3nNote && (
                        <div className="p-2 rounded-xl bg-black/40 border border-rose-900/30 text-[10px] text-rose-300/90 italic flex items-start gap-1.5 mt-2">
                          <Heart className="w-3 h-3 text-rose-400 shrink-0 mt-0.5 fill-rose-400/30" />
                          <span className="line-clamp-2">{novel.chif3nNote}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 pt-2 border-t border-emerald-900/40 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-emerald-500 font-mono">
                      ~{totalWords.toLocaleString()} words
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNovel(novel.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md group-hover:scale-105 active:scale-95 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Tome ➔</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNovels.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#04120a] border border-emerald-900/60 space-y-3">
              <BookOpen className="w-8 h-8 text-emerald-500 mx-auto opacity-60" />
              <h3 className="font-cinzel text-lg font-bold text-white">No Tomes Found</h3>
              <p className="text-xs text-emerald-400/80 max-w-md mx-auto">
                No stories match your current search or filter. You can upload an external PDF novel or clear the filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. READING CHAMBER: DEDICATED IN-APP NOVEL READER                        */}
      {/* ========================================================================= */}
      {isReading && (
        <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6 overflow-y-auto bg-black' : ''}`}>
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleBackToLibrary}
              className="px-4 py-2 rounded-xl bg-[#04140e] hover:bg-emerald-950 border border-emerald-700/60 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 group"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span className="font-cinzel">← Back to Tomes Library</span>
            </button>

            <span className="text-xs font-mono text-emerald-400/80 hidden sm:inline">
              Reading: <span className="text-white font-bold">{currentNovel.title}</span>
            </span>
          </div>

          {/* Reader Chamber Container */}
          <div
            className="rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 flex flex-col"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border
            }}
          >
            {/* Top Control Bar inside Reader */}
            <div
              className="px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
              style={{
                borderColor: currentTheme.border,
                backgroundColor: `${currentTheme.bg}f5`
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                {!pdfFile && (
                  <button
                    onClick={() => setChapterDrawerOpen(true)}
                    className="p-1.5 rounded-lg border hover:bg-white/5 transition-colors flex items-center gap-1.5"
                    style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                    title="Chapter table of contents"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="hidden sm:inline font-mono">Chapters ({chapters.length})</span>
                  </button>
                )}

                <div className="truncate">
                  <span className="font-cinzel font-bold text-xs truncate block" style={{ color: currentTheme.text }}>
                    {currentNovel.title}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono truncate block" style={{ color: currentTheme.text }}>
                    {pdfFile ? `PDF Page ${currentPdfPage} of ${numPdfPages || '...'}` : currentChapter?.title || 'Chapter'}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {/* PDF Zoom Controls if PDF is active */}
                {pdfFile && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPdfScale((s) => Math.max(0.6, s - 0.15))}
                      className="p-1.5 rounded-lg border hover:bg-white/5 transition-colors"
                      style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPdfScale((s) => Math.min(2.0, s + 0.15))}
                      className="p-1.5 rounded-lg border hover:bg-white/5 transition-colors"
                      style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Bookmark Button */}
                <button
                  onClick={handleSaveBookmark}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  style={{
                    borderColor: currentTheme.accent,
                    backgroundColor: `${currentTheme.accent}20`,
                    color: currentTheme.text
                  }}
                  title="Save exact position for Leslye"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden md:inline">Save Bookmark</span>
                </button>

                {/* Reader Settings Toggle */}
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-1.5 rounded-lg border hover:bg-white/5 transition-colors"
                  style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                  title="Typography & theme options"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Fullscreen toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-lg border hover:bg-white/5 transition-colors"
                  style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Reading Mode'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Free Community Mirror (100% Free, Zero Paywalls) */}
                {currentNovel.freeReadUrl && (
                  <a
                    href={currentNovel.freeReadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border hover:bg-white/5 transition-colors flex items-center gap-1 text-emerald-300"
                    style={{ borderColor: currentTheme.border }}
                    title="Read additional volumes on free open webnovel archives (No paywalls or logins)"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="hidden lg:inline text-[10px] font-mono">Free Web Archive</span>
                  </a>
                )}
              </div>
            </div>

            {/* Bookmark Saved Notice Pill */}
            {bookmarkSavedNotice && (
              <div className="bg-emerald-950/95 border-b border-emerald-600/50 py-2 px-4 text-center text-xs text-emerald-200 flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium font-cinzel">
                  Demigod's Bookmark: Page saved with love for Leslye 🌿
                </span>
              </div>
            )}

            {/* Reader Settings Drawer */}
            {settingsOpen && (
              <div
                className="p-4 sm:p-5 border-b text-xs space-y-4 animate-in fade-in"
                style={{
                  backgroundColor: `${currentTheme.bg}f8`,
                  borderColor: currentTheme.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-cinzel font-bold uppercase tracking-wider text-amber-300">
                    Reading Comfort & Typography
                  </span>
                  <button onClick={() => setSettingsOpen(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Theme Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] opacity-75 font-mono">Theme Ambience</label>
                    <div className="flex gap-2">
                      {(['parchment', 'candlelight', 'tearoom'] as ReaderTheme[]).map((thm) => {
                        const tObj = THEME_STYLES[thm];
                        const active = settings.theme === thm;
                        return (
                          <button
                            key={thm}
                            onClick={() => setSettings({ ...settings, theme: thm })}
                            className={`flex-1 py-1.5 px-2 rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${
                              active ? 'border-amber-400 font-bold scale-105' : 'border-zinc-800 opacity-70'
                            }`}
                            style={{ backgroundColor: tObj.bg, color: tObj.text }}
                          >
                            <span>{tObj.icon}</span>
                            <span className="text-[10px] hidden md:inline">{tObj.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] opacity-75 font-mono">Text Size: {settings.fontSize}px</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSettings({ ...settings, fontSize: Math.max(14, settings.fontSize - 2) })}
                        className="flex-1 py-1.5 rounded-lg border text-center hover:bg-white/10"
                        style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                      >
                        A-
                      </button>
                      <button
                        onClick={() => setSettings({ ...settings, fontSize: Math.min(28, settings.fontSize + 2) })}
                        className="flex-1 py-1.5 rounded-lg border text-center hover:bg-white/10"
                        style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  {/* Font Family & Spacing */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] opacity-75 font-mono">Font & Line Spacing</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSettings({ ...settings, fontFamily: settings.fontFamily === 'serif' ? 'sans' : 'serif' })}
                        className="flex-1 py-1.5 rounded-lg border text-center hover:bg-white/10"
                        style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                      >
                        {settings.fontFamily === 'serif' ? 'Serif (Classic)' : 'Sans (Modern)'}
                      </button>
                      <button
                        onClick={() => {
                          const nextSpacing = settings.lineHeight === 1.6 ? 1.8 : settings.lineHeight === 1.8 ? 2.0 : 1.6;
                          setSettings({ ...settings, lineHeight: nextSpacing });
                        }}
                        className="flex-1 py-1.5 rounded-lg border text-center hover:bg-white/10"
                        style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                      >
                        {settings.lineHeight}x Spacing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter Table of Contents Drawer */}
            {chapterDrawerOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
                onClick={() => setChapterDrawerOpen(false)}
              >
                <div
                  className="w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col"
                  style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.border }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: currentTheme.border }}>
                    <span className="font-cinzel text-sm font-bold text-amber-300">
                      Chapters of {currentNovel.title}
                    </span>
                    <button onClick={() => setChapterDrawerOpen(false)} style={{ color: currentTheme.text }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-2 flex-1 scrollbar-thin pr-1">
                    {chapters.map((ch, idx) => (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setActiveChapterIndex(idx);
                          setChapterDrawerOpen(false);
                          if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          activeChapterIndex === idx
                            ? 'border-amber-400 bg-amber-400/20 font-bold'
                            : 'border-white/5 hover:border-emerald-600/40 hover:bg-white/5'
                        }`}
                        style={{ color: currentTheme.text }}
                      >
                        <div>
                          <span className="block font-mono text-[10px] opacity-75">
                            Chapter {ch.chapterNumber}
                          </span>
                          <span className="text-sm font-cinzel">{ch.title}</span>
                        </div>
                        {ch.wordCount && (
                          <span className="text-[10px] opacity-60 font-mono">{ch.wordCount} words</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reading Canvas: Handles Both Client-Side react-pdf and Pure Text Novels */}
            <div
              ref={contentContainerRef}
              onScroll={handleScroll}
              className="p-6 sm:p-12 md:p-16 max-h-[75vh] overflow-y-auto scrollbar-thin selection:bg-amber-400/30 selection:text-white"
              style={{
                color: currentTheme.text,
                fontFamily: settings.fontFamily === 'serif' ? "'Cinzel', Georgia, serif" : "'Plus Jakarta Sans', sans-serif",
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight
              }}
            >
              {pdfFile ? (
                // Client-Side react-pdf Rendering
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Document
                    file={pdfFile}
                    onLoadSuccess={({ numPages }) => setNumPdfPages(numPages)}
                    loading={
                      <div className="py-12 text-center text-xs text-amber-300 animate-pulse font-mono">
                        Rendering PDF document with react-pdf...
                      </div>
                    }
                    error={
                      <div className="py-12 text-center text-xs text-rose-400 font-mono">
                        Could not render PDF. Please verify the document is valid.
                      </div>
                    }
                  >
                    <div className="shadow-2xl rounded-lg overflow-hidden border border-emerald-900/60 bg-white">
                      <Page
                        pageNumber={currentPdfPage}
                        scale={pdfScale}
                        renderTextLayer={true}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  </Document>

                  <div className="flex items-center gap-3 pt-3 text-xs font-mono">
                    <button
                      onClick={() => setCurrentPdfPage((p) => Math.max(1, p - 1))}
                      disabled={currentPdfPage <= 1}
                      className="px-3 py-1 rounded-lg border hover:bg-white/10 disabled:opacity-40"
                      style={{ borderColor: currentTheme.border }}
                    >
                      ← Prev Page
                    </button>
                    <span>
                      Page {currentPdfPage} of {numPdfPages || '...'}
                    </span>
                    <button
                      onClick={() => setCurrentPdfPage((p) => (numPdfPages ? Math.min(numPdfPages, p + 1) : p + 1))}
                      disabled={numPdfPages !== null && currentPdfPage >= numPdfPages}
                      className="px-3 py-1 rounded-lg border hover:bg-white/10 disabled:opacity-40"
                      style={{ borderColor: currentTheme.border }}
                    >
                      Next Page →
                    </button>
                  </div>
                </div>
              ) : (
                // Text Novel Rendering
                <>
                  {/* Chapter Title Banner */}
                  <div className="max-w-3xl mx-auto mb-8 pb-6 border-b text-center space-y-2" style={{ borderColor: currentTheme.border }}>
                    <span className="text-xs uppercase font-mono tracking-widest text-amber-400/90 block">
                      {currentNovel.title} · Chapter {currentChapter?.chapterNumber}
                    </span>
                    <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight font-cinzel">
                      {currentChapter?.title}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-xs opacity-75 pt-1">
                      <span>{currentNovel.author}</span>
                      <span>·</span>
                      <span className="text-amber-400 italic">Curated for Lady Leslye</span>
                    </div>
                  </div>

                  {/* Chapter Text Body */}
                  <div className="max-w-3xl mx-auto space-y-6 text-justify leading-relaxed tracking-wide">
                    {currentChapter?.content ? (
                      currentChapter.content.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} className="indent-4 sm:indent-8 first:indent-0">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-center opacity-70">Scroll content loading...</p>
                    )}
                  </div>

                  {/* Demigod Dedication Sign-off at Chapter End */}
                  <div className="max-w-3xl mx-auto mt-12 pt-8 border-t text-center space-y-3" style={{ borderColor: currentTheme.border }}>
                    <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-amber-400/30 text-xs text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentNovel.chif3nNote}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sticky Chapter Navigation Footer with Back to Shelf Button */}
            <div
              className="px-4 sm:px-8 py-3.5 border-t flex items-center justify-between gap-2 sm:gap-4 text-xs font-medium"
              style={{
                borderColor: currentTheme.border,
                backgroundColor: `${currentTheme.bg}f5`
              }}
            >
              <button
                onClick={handlePrevChapter}
                disabled={pdfFile ? currentPdfPage <= 1 : activeChapterIndex <= 0}
                className="px-3 sm:px-4 py-2 rounded-xl border flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5"
                style={{ borderColor: currentTheme.border, color: currentTheme.text }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{pdfFile ? 'Prev Page' : 'Previous Chapter'}</span>
                <span className="sm:hidden">Prev</span>
              </button>

              {/* Middle Back to Library Button */}
              <button
                onClick={handleBackToLibrary}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-800/80 hover:border-amber-400 text-amber-300 hover:text-white transition-all flex items-center gap-1.5 font-cinzel text-[11px]"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>All Tomes</span>
              </button>

              <button
                onClick={handleNextChapter}
                disabled={pdfFile ? (numPdfPages !== null && currentPdfPage >= numPdfPages) : activeChapterIndex >= chapters.length - 1}
                className="px-4 sm:px-5 py-2 rounded-xl font-bold transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md flex items-center gap-1.5"
                style={{
                  backgroundColor: currentTheme.accent,
                  color: '#ffffff'
                }}
              >
                <span className="hidden sm:inline">{pdfFile ? 'Next Page' : 'Next Chapter'}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
