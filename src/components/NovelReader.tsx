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
  Menu
} from 'lucide-react';
import { PRELOADED_NOVELS, CuratedNovel, NovelChapter } from '../data/novels';

type ReaderTheme = 'parchment' | 'candlelight' | 'tearoom';

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

  const [selectedNovelId, setSelectedNovelId] = useState<string>('apothecary-diaries');
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [chapterDrawerOpen, setChapterDrawerOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [bookmarkSavedNotice, setBookmarkSavedNotice] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

  const currentNovel = novels.find((n) => n.id === selectedNovelId) || novels[0];
  const chapters = currentNovel?.chapters || [];
  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const currentTheme = THEME_STYLES[settings.theme];

  // Load bookmark on novel select
  useEffect(() => {
    if (!currentNovel) return;
    try {
      const savedProgress = localStorage.getItem(`leslye_bookmark_${currentNovel.id}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (typeof parsed.chapterIndex === 'number' && parsed.chapterIndex < (currentNovel.chapters?.length || 0)) {
          setActiveChapterIndex(parsed.chapterIndex);
        }
      } else {
        setActiveChapterIndex(0);
      }
    } catch (e) {}
  }, [currentNovel?.id]);

  // Restore scroll position
  useEffect(() => {
    if (!currentNovel) return;
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
  }, [activeChapterIndex, currentNovel?.id]);

  // Auto-save scroll position debounced
  const handleScroll = () => {
    if (!contentContainerRef.current || !currentNovel) return;
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
    if (!contentContainerRef.current || !currentNovel) return;
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

    setBookmarkSavedNotice(true);
    setTimeout(() => setBookmarkSavedNotice(false), 3500);
  };

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem('leslye_novel_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Handle local text or epub import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (!rawText) return;

      // Simple auto-splitter by chapters or blocks
      const lines = rawText.split('\n');
      const detectedChapters: NovelChapter[] = [];
      let currentCapTitle = 'Chapter 1: The First Inscription';
      let currentCapLines: string[] = [];
      let capCounter = 1;

      for (const line of lines) {
        if (/^(chapter|ch\.|volume|vol\.|prologue|act)\b/i.test(line.trim())) {
          if (currentCapLines.length > 0) {
            detectedChapters.push({
              id: `imported-ch-${capCounter}`,
              chapterNumber: capCounter,
              title: currentCapTitle,
              content: currentCapLines.join('\n')
            });
            capCounter++;
            currentCapLines = [];
          }
          currentCapTitle = line.trim();
        } else {
          currentCapLines.push(line);
        }
      }

      if (currentCapLines.length > 0) {
        detectedChapters.push({
          id: `imported-ch-${capCounter}`,
          chapterNumber: capCounter,
          title: currentCapTitle,
          content: currentCapLines.join('\n')
        });
      }

      const newNovel: CuratedNovel = {
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: 'Personal Imperial Archive',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        synopsis: `Imported text tome into Leslye's local sanctuary reader with ${detectedChapters.length} chapter(s).`,
        tags: ['Personal Scroll', 'Custom Upload'],
        chif3nNote: 'Imported into Lady Leslye\'s private library. Dedicated to cozy offline reading.',
        novelUpdatesUrl: '',
        chapters: detectedChapters.length > 0 ? detectedChapters : [
          {
            id: 'imported-single',
            chapterNumber: 1,
            title: file.name,
            content: rawText
          }
        ]
      };

      setNovels((prev) => {
        const updated = [...prev, newNovel];
        try {
          const customOnly = updated.filter(n => n.id.startsWith('custom-'));
          localStorage.setItem('leslye_custom_novels', JSON.stringify(customOnly));
        } catch (err) {}
        return updated;
      });

      setSelectedNovelId(newNovel.id);
      setActiveChapterIndex(0);
      alert(`🌿 Successfully imported "${newNovel.title}" into your reader!`);
    };

    reader.readAsText(file);
  };

  const handleNextChapter = () => {
    if (activeChapterIndex < chapters.length - 1) {
      setActiveChapterIndex((prev) => prev + 1);
      if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex((prev) => prev - 1);
      if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <div className={`space-y-5 animate-in fade-in transition-colors duration-300 ${isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6 overflow-y-auto bg-black' : ''}`}>
      {/* Novel Selector Shelf */}
      {!isFullscreen && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-3">
            <div>
              <span className="text-[11px] font-bold text-amber-300 font-cinzel uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>The Imperial Scrolls & Tomes</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel mt-0.5">
                Cozy In-App Novel Reader
              </h2>
              <p className="text-xs text-emerald-400/80">
                Unabridged chapters with zero popups, customizable parchment typography, and persistent bookmarking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.epub,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-[#04140e] border border-emerald-800 hover:border-emerald-500 text-xs text-emerald-200 hover:text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                title="Drop .txt or .epub files to read in the app"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Import Tome (.txt)</span>
              </button>
            </div>
          </div>

          {/* Horizontal Novel Card Picker */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {novels.map((novel) => {
              const isSelected = novel.id === selectedNovelId;
              return (
                <div
                  key={novel.id}
                  onClick={() => setSelectedNovelId(novel.id)}
                  className={`group min-w-[220px] sm:min-w-[260px] max-w-[260px] p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 snap-start flex gap-3 ${
                    isSelected
                      ? 'bg-[#092218] border-amber-400/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30'
                      : 'bg-[#05140e]/80 border-emerald-900/60 hover:border-emerald-600 hover:bg-[#081e15]'
                  }`}
                >
                  <div className="w-14 sm:w-16 aspect-[3/4] rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-950">
                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className={`text-xs font-bold truncate font-cinzel ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {novel.title}
                      </h4>
                      <p className="text-[10px] text-emerald-400/70 truncate mt-0.5">{novel.author}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-emerald-500/80">
                      <span>{novel.chapters?.length || 0} Chapters</span>
                      {isSelected && <span className="text-amber-400 font-semibold">Active Tome</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reader Chamber Container */}
      <div
        className="rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 flex flex-col"
        style={{
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border
        }}
      >
        {/* Top Control Bar */}
        <div
          className="px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            borderColor: currentTheme.border,
            backgroundColor: `${currentTheme.bg}f5`
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setChapterDrawerOpen(true)}
              className="p-1.5 rounded-lg border hover:bg-white/5 transition-colors flex items-center gap-1.5"
              style={{ borderColor: currentTheme.border, color: currentTheme.text }}
              title="Chapter table of contents"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline font-mono">Chapters ({chapters.length})</span>
            </button>

            <div className="truncate">
              <span className="font-cinzel font-bold text-xs truncate block" style={{ color: currentTheme.text }}>
                {currentNovel.title}
              </span>
              <span className="text-[10px] opacity-75 font-mono truncate block" style={{ color: currentTheme.text }}>
                {currentChapter?.title || 'Chapter'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Demigod's Bookmark Button */}
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

            {/* NovelUpdates external link */}
            {currentNovel.novelUpdatesUrl && (
              <a
                href={currentNovel.novelUpdatesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border hover:bg-white/5 transition-colors"
                style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                title="Open on NovelUpdates"
              >
                <ExternalLink className="w-4 h-4" />
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

        {/* Reader Settings Floating Drawer */}
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
                    onClick={() => setSettings({ ...settings, fontSize: Math.min(26, settings.fontSize + 2) })}
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

        {/* Reading Canvas */}
        <div
          ref={contentContainerRef}
          onScroll={handleScroll}
          className="p-6 sm:p-12 md:p-16 max-h-[72vh] overflow-y-auto scrollbar-thin selection:bg-amber-400/30 selection:text-white"
          style={{
            color: currentTheme.text,
            fontFamily: settings.fontFamily === 'serif' ? "'Cinzel', Georgia, serif" : "'Plus Jakarta Sans', sans-serif",
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight
          }}
        >
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
            <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-amber-400/30 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentNovel.chif3nNote}</span>
            </div>
          </div>
        </div>

        {/* Sticky Chapter Navigation Footer */}
        <div
          className="px-4 sm:px-8 py-3.5 border-t flex items-center justify-between gap-4 text-xs font-medium"
          style={{
            borderColor: currentTheme.border,
            backgroundColor: `${currentTheme.bg}f5`
          }}
        >
          <button
            onClick={handlePrevChapter}
            disabled={activeChapterIndex <= 0}
            className="px-4 py-2 rounded-xl border flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5"
            style={{ borderColor: currentTheme.border, color: currentTheme.text }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Chapter</span>
          </button>

          <span className="text-[11px] opacity-75 font-mono hidden sm:inline" style={{ color: currentTheme.text }}>
            Scroll {activeChapterIndex + 1} of {chapters.length}
          </span>

          <button
            onClick={handleNextChapter}
            disabled={activeChapterIndex >= chapters.length - 1}
            className="px-5 py-2 rounded-xl font-bold transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md flex items-center gap-1.5"
            style={{
              backgroundColor: currentTheme.accent,
              color: '#ffffff'
            }}
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
