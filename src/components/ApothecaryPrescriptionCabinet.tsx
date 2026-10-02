import React, { useState } from 'react';
import { Sparkles, Heart, FlaskConical, Leaf, Play, Quote, ChevronRight, Shield, Award } from 'lucide-react';
import { APOTHECARY_PRESCRIPTIONS, MAOMAO_STATEMENTS_FOR_LESLYE } from '../data/curatedData';
import { ApothecaryPrescription, AnimeItem } from '../types/anime';

interface ApothecaryPrescriptionCabinetProps {
  onSelectAnimeByName: (animeTitle: string) => void;
}

export const ApothecaryPrescriptionCabinet: React.FC<ApothecaryPrescriptionCabinetProps> = ({
  onSelectAnimeByName,
}) => {
  const [activePrescription, setActivePrescription] = useState<ApothecaryPrescription>(APOTHECARY_PRESCRIPTIONS[0]);
  const [statementIndex, setStatementIndex] = useState(0);

  const handleNextStatement = () => {
    setStatementIndex((prev) => (prev + 1) % MAOMAO_STATEMENTS_FOR_LESLYE.length);
  };

  return (
    <section className="space-y-6 animate-in fade-in">
      {/* Imperial Jade & Silk Header Statement Box */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#06241a] via-[#04150f] to-[#0d2a1f] border border-emerald-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span className="font-cinzel text-xs uppercase tracking-widest text-emerald-300 font-bold">
                Imperial Court Apothecary
              </span>
              <span className="text-emerald-700">·</span>
              <span className="text-xs text-amber-300">Dedicated to Lady Leslye from Sir Chif3n</span>
            </div>

            <button
              onClick={handleNextStatement}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next Statement for Leslye</span>
            </button>
          </div>

          {/* Maomao & Jinshi Inspired Statement for Leslye */}
          <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-emerald-500/20 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5 opacity-80" />
              <div>
                <p className="font-cinzel text-base sm:text-lg text-emerald-100 font-medium leading-relaxed italic">
                  {MAOMAO_STATEMENTS_FOR_LESLYE[statementIndex]}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-300/90 font-medium">
                  <Heart className="w-3 h-3 fill-amber-300" />
                  <span>From your devoted demigod boyfriend, Sir Chif3n</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maomao's Herbal Medicine Cabinet & Prescriptions */}
      <div className="rounded-2xl p-5 sm:p-6 bg-[#06140e]/70 border border-emerald-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-3">
          <div>
            <h3 className="font-cinzel text-lg font-bold text-emerald-100 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Maomao's Herbal Love Prescriptions</span>
            </h3>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Select a medicine jar from the apothecary drawer to reveal Sir Chif3n's cure and tonight's anime remedy.
            </p>
          </div>
          <span className="text-[11px] text-amber-300/80 font-mono">
            5 Rare Elixirs In Stock
          </span>
        </div>

        {/* Jar Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {APOTHECARY_PRESCRIPTIONS.map((rx) => {
            const isSelected = activePrescription.id === rx.id;
            return (
              <button
                key={rx.id}
                onClick={() => setActivePrescription(rx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-900/60 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]'
                    : 'bg-[#081a13] border-emerald-900/60 text-emerald-300/70 hover:bg-emerald-950/60 hover:text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <FlaskConical className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-emerald-600'}`} />
                  {isSelected && <span className="text-[10px] text-amber-300 font-bold uppercase">Active</span>}
                </div>
                <h4 className="text-xs font-semibold truncate leading-tight">
                  {rx.remedyName}
                </h4>
                <p className="text-[10px] text-emerald-500/80 truncate mt-1">
                  For: {rx.recommendedAnime}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Prescription Open Scroll */}
        <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-[#041a12] via-[#052217] to-[#041a12] border border-emerald-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs uppercase tracking-wider text-amber-400 font-bold">
                Prescription: {activePrescription.remedyName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p className="text-emerald-300/90">
                <strong className="text-emerald-100">Diagnosis:</strong> {activePrescription.symptom}
              </p>
              <p className="text-emerald-300/90">
                <strong className="text-emerald-100">Imperial Ingredients:</strong> {activePrescription.ingredient}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black/30 border border-emerald-500/20 text-xs sm:text-sm text-emerald-100 italic">
              "{activePrescription.statementFromChif3n}"
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0">
            <div className="text-right hidden md:block">
              <span className="text-[11px] text-emerald-400 block">Recommended Remedy</span>
              <span className="text-xs font-semibold text-white">{activePrescription.recommendedAnime}</span>
            </div>

            <button
              onClick={() => onSelectAnimeByName(activePrescription.recommendedAnime)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Dispense & Stream Anime</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
