import React, { useState, useEffect } from 'react';
import {
  X,
  Scroll,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Heart,
  Shield,
  Film,
  Award,
  ChevronRight,
  HelpCircle,
  FlaskConical
} from 'lucide-react';

interface ApothecaryDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CaseFile {
  id: string;
  season: string;
  title: string;
  badge: string;
  synopsis: string;
  maomaoDeduction: string;
  chif3nNoteForLeslye: string;
  solvedStatus: string;
  icon: string;
}

const DOSSIER_CASES: CaseFile[] = [
  {
    id: 'powder',
    season: 'Season 1 / Classic',
    title: 'The Imperial Makeup Powder Poisoning',
    badge: 'Solved',
    synopsis: 'Infants of imperial consorts falling mysteriously ill with skin pallor and convulsions in the rear palace.',
    maomaoDeduction: 'Maomao notices the consorts use white face powder containing toxic white lead. By transferring it through skin-to-skin contact and nursing, the infants are poisoned.',
    chif3nNoteForLeslye: 'Just like Maomao saving the Imperial heir, you are the most brilliant, observant, and deeply caring soul in my entire world.',
    solvedStatus: 'Concubines warned via anonymous cloth decrees',
    icon: '🧪'
  },
  {
    id: 'bezoar',
    season: 'Season 2 Highlights',
    title: 'The Ox Bezoar & Flaming Warehouse Conundrum',
    badge: 'Solved',
    synopsis: 'A rare and astronomically valuable ox bezoar (gallstone) goes missing alongside a sudden flour dust explosion inside an inner palace storehouse.',
    maomaoDeduction: 'The fire was not accidental arson but an engineered combustible dust explosion using suspended fine flour, masking the theft of the imperial bezoar.',
    chif3nNoteForLeslye: 'Maomao’s face when she sees rare herbs is identical to your adorable face whenever I surprise you with your favorite snacks!',
    solvedStatus: 'Perpetrators uncovered & bezoar reclaimed',
    icon: '🔥'
  },
  {
    id: 'jinshi-identity',
    season: 'Season 2 Finale',
    title: 'The Phoenix Hairpin & Crown Prince Revelation',
    badge: 'Revealed',
    synopsis: 'The enigmatic master Jinshi bestows his most treasured hairpin onto Maomao during the garden banquet, veiling his royal heritage.',
    maomaoDeduction: 'Jinshi is not a mere eunuch manager of the rear palace, but in truth the Emperor’s imperial brother and Crown Prince Ka Zuigetsu.',
    chif3nNoteForLeslye: 'Jinshi would give up the entire imperial throne just to make Maomao smile. That is the exact way I feel about you, my Queen.',
    solvedStatus: 'Imperial secret unveiled',
    icon: '👑'
  },
  {
    id: 'season-3',
    season: 'Season 3 (October 2026)',
    title: 'The Northern Agricultural Enigma (Light Novel Vol. 5)',
    badge: 'Upcoming Cour',
    synopsis: 'Jinshi and Maomao venture outside the palace walls to investigate uncanny ecological blights and locust omens plaguing northern farming territories.',
    maomaoDeduction: 'Maomao employs agrarian botanical toxicology and ancient herbal remedies to preserve the harvest and expose political saboteurs.',
    chif3nNoteForLeslye: 'Season 3 is our next big watch party milestone! We are going to watch every single episode side-by-side.',
    solvedStatus: 'Broadcasting in split-cour',
    icon: '🌾'
  },
  {
    id: 'movie-2026',
    season: 'Theatrical Film (Dec 11, 2026)',
    title: 'The Apothecary Diaries: The Deceased Empress’ Treasure',
    badge: 'Feature Film',
    synopsis: 'An all-new original theatrical story penned by Natsu Hyūga. Maomao and Jinshi investigate an imperial treasure puzzle left behind by the deceased dowager empress.',
    maomaoDeduction: 'Complex architectural cipher involving celestial astronomy, imperial alchemy, and medicinal seals.',
    chif3nNoteForLeslye: 'We have an official date night booked for this movie! Nothing will keep us from experiencing this cinema masterpiece together.',
    solvedStatus: 'Premiering worldwide in cinemas',
    icon: '🎬'
  }
];

export const ApothecaryDossierModal: React.FC<ApothecaryDossierModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedCase, setSelectedCase] = useState<CaseFile>(DOSSIER_CASES[0]);
  const [activeTab, setActiveTab] = useState<'cases' | 'countdowns' | 'relations'>('cases');

  // Movie countdown calculation (Dec 11, 2026)
  const [movieTimeLeft, setMovieTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({
    days: 0,
    hours: 0,
    minutes: 0
  });

  useEffect(() => {
    const movieTarget = new Date('2026-12-11T00:00:00Z').getTime();
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, movieTarget - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setMovieTimeLeft({ days, hours, minutes });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-[#041a11] via-[#02110b] to-[#010905] border border-emerald-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#03150d] border-b border-emerald-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-400/50 flex items-center justify-center">
              <Scroll className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>The Imperial Palace Incident Dossier</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 font-mono">
                  The Apothecary Diaries Archive
                </span>
              </h2>
              <p className="text-xs text-emerald-400/80 font-serif italic">
                Compiled with demigod devotion for Lady Leslye by Sir Chif3n
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-400 hover:text-white bg-emerald-950/60 border border-emerald-900 hover:border-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 py-2.5 bg-[#020e08] border-b border-emerald-950 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              activeTab === 'cases'
                ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold'
                : 'bg-transparent border-transparent text-emerald-400/70 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>Solved Incidents & Mysteries</span>
          </button>

          <button
            onClick={() => setActiveTab('countdowns')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              activeTab === 'countdowns'
                ? 'bg-amber-600/30 border-amber-400 text-white font-bold'
                : 'bg-transparent border-transparent text-emerald-400/70 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Season 3 & Movie Premiere Countdown</span>
          </button>

          <button
            onClick={() => setActiveTab('relations')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              activeTab === 'relations'
                ? 'bg-rose-600/30 border-rose-400 text-white font-bold'
                : 'bg-transparent border-transparent text-emerald-400/70 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Character Lineage & Palace Web</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: Incident Cases */}
          {activeTab === 'cases' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Cases List */}
              <div className="md:col-span-5 space-y-2">
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Imperial Case Log:
                </h3>
                {DOSSIER_CASES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCase(item)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      selectedCase.id === item.id
                        ? 'bg-gradient-to-r from-emerald-950/80 to-[#042416] border-emerald-400 text-white shadow-lg'
                        : 'bg-[#02100a] border-emerald-950 hover:border-emerald-800 text-emerald-300/80 hover:text-white'
                    }`}
                  >
                    <span className="text-xl p-1 bg-black/40 rounded-xl shrink-0">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono text-amber-300 font-bold">{item.season}</span>
                        <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="font-cinzel text-xs font-bold truncate">{item.title}</h4>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Case Inspection */}
              <div className="md:col-span-7 bg-[#020f09] border border-emerald-800/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedCase.icon}</span>
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">{selectedCase.season}</span>
                      <h3 className="font-cinzel text-base font-bold text-white">{selectedCase.title}</h3>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#03170e] border border-emerald-900/60">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">
                        Incident Synopsis:
                      </span>
                      <p className="text-emerald-200/90 leading-relaxed font-serif">
                        {selectedCase.synopsis}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                      <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase flex items-center gap-1.5 mb-1">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Maomao's Empirical Deduction:</span>
                      </span>
                      <p className="text-emerald-100 leading-relaxed font-serif">
                        {selectedCase.maomaoDeduction}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-[#041d13] border border-rose-500/40">
                      <span className="text-[10px] font-mono text-rose-300 font-bold uppercase flex items-center gap-1.5 mb-1">
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                        <span>Sir Chif3n's Dedication to Leslye:</span>
                      </span>
                      <p className="text-rose-100 italic leading-relaxed font-serif">
                        "{selectedCase.chif3nNoteForLeslye}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <span>Status: {selectedCase.solvedStatus}</span>
                  <span className="text-amber-300">Verified Apothecary Imperial File</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Countdown Clocks */}
          {activeTab === 'countdowns' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Feature Film Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-[#041d12] to-[#02100a] border border-amber-500/60 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 uppercase">Original Theatrical Anime Film</span>
                      <h4 className="font-cinzel text-sm sm:text-base font-bold text-white">
                        The Deceased Empress' Treasure
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-amber-100/90 font-serif leading-relaxed">
                    Written by original author Natsu Hyūga! Scheduled to premiere in cinemas worldwide on <strong>December 11, 2026</strong>.
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30">
                      <span className="font-mono text-2xl font-bold text-amber-300">{movieTimeLeft.days}</span>
                      <span className="text-[10px] font-mono text-amber-200/70 block uppercase">Days</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30">
                      <span className="font-mono text-2xl font-bold text-amber-300">{movieTimeLeft.hours}</span>
                      <span className="text-[10px] font-mono text-amber-200/70 block uppercase">Hours</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30">
                      <span className="font-mono text-2xl font-bold text-amber-300">{movieTimeLeft.minutes}</span>
                      <span className="text-[10px] font-mono text-amber-200/70 block uppercase">Mins</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-serif text-amber-200/80 italic text-center">
                    🎟️ "Reserved for Sir Chif3n & Lady Leslye's Royal Date Night"
                  </div>
                </div>

                {/* Season 3 Broadcast Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#031d13] to-[#02100a] border border-emerald-500/60 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-[10px] font-mono text-emerald-300 uppercase">Season 3 Split-Cour Broadcast</span>
                      <h4 className="font-cinzel text-sm sm:text-base font-bold text-white">
                        The Northern Enigma (Volume 5)
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100/90 font-serif leading-relaxed">
                    Season 3 premiered as a split-cour with cour 2 arriving in Spring 2027. Full streaming integration available directly inside Leslye's Realm!
                  </p>

                  <div className="p-4 rounded-xl bg-black/40 border border-emerald-600/40 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400">Episode Resolution:</span>
                      <span className="text-white font-bold">1080p Ultra Clear</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400">Couple Streaming Mode:</span>
                      <span className="text-amber-300 font-bold">Synchronized Watch Party</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400">Dub / Sub Options:</span>
                      <span className="text-white">Japanese + English Dub</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Character Relationship Web */}
          {activeTab === 'relations' && (
            <div className="space-y-4">
              <p className="text-xs text-emerald-300 font-serif leading-relaxed">
                The intricate ties of the Imperial Palace, annotated with Sir Chif3n’s notes for his beloved Lady Leslye:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                
                <div className="p-3.5 rounded-2xl bg-[#031910] border border-emerald-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-bold text-emerald-200">Maomao (猫猫)</span>
                    <span className="text-sm">🌿</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 block">The Apothecary Empress (Leslye)</span>
                  <p className="text-emerald-300/80 font-serif text-[11px]">
                    Unmatched deductive brilliance, obsession with rare medicinal roots, and immunity to subtle palace poisons.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#031910] border border-amber-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-bold text-amber-200">Jinshi (壬氏)</span>
                    <span className="text-sm">👑</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 block">Crown Prince Ka Zuigetsu (Chif3n)</span>
                  <p className="text-emerald-300/80 font-serif text-[11px]">
                    Incomparable court grace, fiercely loyal, and completely powerless against Maomao's bewitching intelligence.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#031910] border border-emerald-800/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-bold text-white">Gaoshun (高順)</span>
                    <span className="text-sm">🛡️</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 block">Imperial Right Hand</span>
                  <p className="text-emerald-300/80 font-serif text-[11px]">
                    Ever-suffering attendant whose calm discipline keeps Jinshi from causing chaos when chasing after Maomao.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#031910] border border-emerald-800/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-bold text-white">Consort Gyokuyo (玉葉妃)</span>
                    <span className="text-sm">💎</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 block">Jade Pavilion Empress</span>
                  <p className="text-emerald-300/80 font-serif text-[11px]">
                    Warm, wise, and deeply protective of Maomao after she saved Princess Lingli from poison face powder.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#031910] border border-emerald-800/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-bold text-white">Lakan (漢羅漢)</span>
                    <span className="text-sm">🎲</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 block">The Eccentric Strategist</span>
                  <p className="text-emerald-300/80 font-serif text-[11px]">
                    Prosopagnosic military genius who sees people as Go pieces, but loves his estranged daughter Maomao with intense longing.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#031910] border border-rose-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-bold text-rose-300">Fengxian (鳳仙)</span>
                    <span className="text-sm">🌸</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-300 block">The Legendary Courtesan</span>
                  <p className="text-emerald-300/80 font-serif text-[11px]">
                    Maomao’s mother, renowned for her supreme Xiangqi skill and tragic romance with Lakan, redeemed in Season 1.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
