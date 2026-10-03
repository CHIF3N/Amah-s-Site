import React, { useState } from 'react';
import { Scroll, Heart, Sparkles, Send, ShieldCheck, Crown, Leaf, FlaskConical, Quote, MessageCircle, Download, Check } from 'lucide-react';
import { DemigodScroll } from '../types/anime';
import { MAOMAO_STATEMENTS_FOR_LESLYE } from '../data/curatedData';
import { LiveLoveScrollChatbox } from './LiveLoveScrollChatbox';
import { generateAndDownloadQuoteImage } from '../utils/quoteImageGenerator';

interface DemigodLoveScrollsProps {
  scrolls: DemigodScroll[];
  leslyeNotes: Array<{ id: string; text: string; date: string }>;
  onAddLeslyeNote: (text: string) => void;
  onDeleteLeslyeNote: (id: string) => void;
}

export const DemigodLoveScrolls: React.FC<DemigodLoveScrollsProps> = ({
  scrolls,
  leslyeNotes,
  onAddLeslyeNote,
  onDeleteLeslyeNote,
}) => {
  const [newNote, setNewNote] = useState('');
  const [activeStatementIndex, setActiveStatementIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleNextStatement = () => {
    setActiveStatementIndex((prev) => (prev + 1) % MAOMAO_STATEMENTS_FOR_LESLYE.length);
  };

  const handleDownloadStatement = async () => {
    setIsDownloading(true);
    try {
      const activeQuote = MAOMAO_STATEMENTS_FOR_LESLYE[activeStatementIndex];
      await generateAndDownloadQuoteImage({
        quote: activeQuote,
        author: 'Sir Chif3n',
        source: 'The Imperial Love Scrolls',
        decree: `Imperial Decree #${100 + activeStatementIndex}`,
        theme: 'rose-romance'
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddLeslyeNote(newNote.trim());
    setNewNote('');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Imperial Jade & Silk Scroll Chamber */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#06241a] via-[#04150f] to-[#0c261c] border border-emerald-500/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-cinzel text-xs uppercase tracking-widest text-amber-300 font-bold">
              The Imperial Apothecary Archives
            </span>
            <span className="text-emerald-700">·</span>
            <span className="text-xs text-emerald-300">Dedicated to Lady Leslye from Sir Chif3n</span>
          </div>

          <h1 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide">
            Imperial Decrees & Apothecary Vows
          </h1>

          <p className="text-sm text-emerald-200/90 mt-2 leading-relaxed">
            Sealed with the imperial jade stamp. To my brilliant Maomao, Leslye: you have conquered this demigod's heart without needing a single drop of medicine.
          </p>

          {/* Maomao & Jinshi Statement Oracle */}
          <div className="mt-5 p-4 rounded-xl bg-black/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Quote className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="font-cinzel text-sm sm:text-base text-emerald-100 italic leading-relaxed">
                {MAOMAO_STATEMENTS_FOR_LESLYE[activeStatementIndex]}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={handleDownloadStatement}
                disabled={isDownloading}
                className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-emerald-950 text-amber-300 border border-amber-500/50 hover:border-amber-400 text-xs font-medium transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                title="Download this love decree as an imperial image"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-cinzel font-bold text-emerald-400">Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className={`w-3.5 h-3.5 text-amber-400 ${isDownloading ? 'animate-bounce' : ''}`} />
                    <span className="text-[11px] font-cinzel font-bold">Save Image</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextStatement}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Next Statement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Imperial Vow Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-900/60 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Rear Palace Status: Under Divine Guard</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-200">
            <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Love Diagnosis: 100% Incurable</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-200">
            <Leaf className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Official Title: Imperial Empress Leslye</span>
          </div>
        </div>
      </div>

      {/* Real-time Live Love Scroll Chatbox (Synced in Real Time across all devices) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-amber-400" />
            <h3 className="font-cinzel text-base font-bold text-white">
              Live Real-Time Love Scrolls (Instant Messaging)
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono">
            ● Real-Time WebSocket Link Active
          </span>
        </div>
        <p className="text-xs text-emerald-300/80">
          Messages sent here appear instantaneously on both Sir Chif3n's and Lady Leslye's screens in real time.
        </p>

        <LiveLoveScrollChatbox />
      </section>

      {/* The Consecrated Scrolls Grid */}
      <div>
        <h3 className="text-base font-semibold text-emerald-100 mb-3 flex items-center gap-2">
          <Scroll className="w-4 h-4 text-amber-400" />
          <span>The Consecrated Apothecary Scrolls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scrolls.map((scroll) => (
            <div
              key={scroll.id}
              className="p-5 rounded-xl bg-[#061710]/70 border border-emerald-900/60 hover:border-emerald-500/40 transition-all space-y-3 shadow-lg shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{scroll.title}</span>
                </span>
                <span className="text-[11px] text-emerald-400/70 font-mono">
                  {scroll.dateStr}
                </span>
              </div>

              <p className="text-sm text-emerald-100 leading-relaxed font-normal">
                "{scroll.content}"
              </p>

              <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-400/80">
                <span className="text-[11px] italic text-amber-300">From your demigod, Sir Chif3n</span>
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leslye's Imperial Diary & Memory Chamber */}
      <div className="rounded-2xl p-6 bg-[#061710]/70 border border-emerald-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Lady Leslye's Herbal Diary & Whispers</span>
            </h3>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Record sweet thoughts, anime requests, or secret notes for Sir Chif3n in your personal apothecary journal.
            </p>
          </div>
        </div>

        <form onSubmit={handleSendNote} className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Inscribe a private herbal thought for Sir Chif3n..."
            className="flex-1 bg-[#030e08] border border-emerald-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Save Whisper</span>
          </button>
        </form>

        <div className="space-y-2 pt-2">
          {leslyeNotes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl bg-[#04120a] border border-emerald-900/70 flex items-center justify-between text-xs"
            >
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-emerald-100 italic">"{note.text}"</p>
                <span className="text-[10px] text-emerald-500 font-mono mt-1 block">{note.date}</span>
              </div>
              <button
                onClick={() => onDeleteLeslyeNote(note.id)}
                className="text-emerald-600 hover:text-rose-400 text-xs transition-colors shrink-0"
                title="Delete note"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
