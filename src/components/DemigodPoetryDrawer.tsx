import React, { useState } from 'react';
import { Scroll, Heart, Sparkles, X, ChevronRight, Quote, Feather, Download, Check } from 'lucide-react';
import { DEMIGOD_POEMS_AND_VOWS } from '../data/curatedData';
import { generateAndDownloadQuoteImage } from '../utils/quoteImageGenerator';

interface DemigodPoetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemigodPoetryDrawer: React.FC<DemigodPoetryDrawerProps> = ({ isOpen, onClose }) => {
  const [activePoemIndex, setActivePoemIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPoem = DEMIGOD_POEMS_AND_VOWS[activePoemIndex];

  const handleDownloadPoem = async () => {
    setIsDownloading(true);
    try {
      await generateAndDownloadQuoteImage({
        quote: currentPoem.verse,
        author: 'Sir Chif3n',
        title: currentPoem.title,
        decree: currentPoem.dedication,
        source: "Sir Chif3n's Vows for Queen Leslye",
        theme: 'antique-parchment'
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-gradient-to-br from-[#062016] via-[#04140e] to-[#071c14] border border-amber-400/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-cinzel text-xs uppercase tracking-widest text-amber-300 font-bold block">
                Sir Chif3n's Imperial Archive
              </span>
              <h3 className="text-lg font-bold text-white font-cinzel">Demigod's Vows & Poetry</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poem Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DEMIGOD_POEMS_AND_VOWS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActivePoemIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                activePoemIndex === idx
                  ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-sm'
                  : 'bg-[#030e09] text-emerald-200 border-emerald-900 hover:border-emerald-600'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Parchment Verse Display */}
        <div className="p-6 rounded-xl bg-[#040e0a] border border-amber-500/30 text-center space-y-4 shadow-inner relative overflow-hidden">
          <div className="absolute top-2 left-3 opacity-20 pointer-events-none">
            <Quote className="w-12 h-12 text-amber-300" />
          </div>
          <h4 className="font-cinzel text-base font-bold text-amber-300">
            {DEMIGOD_POEMS_AND_VOWS[activePoemIndex].title}
          </h4>
          <p className="font-serif text-sm sm:text-base text-emerald-100 whitespace-pre-line leading-relaxed italic">
            "{DEMIGOD_POEMS_AND_VOWS[activePoemIndex].verse}"
          </p>
          <div className="pt-3 border-t border-emerald-950 flex items-center justify-center gap-1.5 text-xs text-amber-400/90 font-medium">
            <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{DEMIGOD_POEMS_AND_VOWS[activePoemIndex].dedication}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 text-xs text-emerald-400/80">
          <button
            onClick={handleDownloadPoem}
            disabled={isDownloading}
            className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-emerald-950 text-amber-300 border border-amber-500/50 hover:border-amber-400 font-medium transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            title="Download this poem as a keepsake parchment image"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-cinzel font-bold text-emerald-400">Saved Image!</span>
              </>
            ) : (
              <>
                <Download className={`w-3.5 h-3.5 text-amber-400 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span className="text-[11px] font-cinzel font-bold">Download Poem Image</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium"
          >
            Close Scroll
          </button>
        </div>
      </div>
    </div>
  );
};
