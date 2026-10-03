import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Radio,
  Sparkles,
  CloudRain,
  Music,
  X,
  ChevronDown,
  Flame,
  Wind
} from 'lucide-react';

interface Station {
  id: string;
  name: string;
  sub: string;
  icon: string;
  baseFreqs: number[];
  mood: string;
  waveform: OscillatorType;
  filterFreq: number;
}

const STATIONS: Station[] = [
  {
    id: 'felt-moonlight',
    name: "Maomao's Moonlight Felt Piano",
    sub: 'Intimate Felt Grand Piano & Tape Flutter (Hisaishi Style)',
    icon: '🎹',
    baseFreqs: [220.0, 261.63, 293.66, 349.23, 392.0, 440.0, 523.25], // D minor / F Major Pentatonic
    mood: 'Warm felt hammer strikes and nostalgic palace reflections',
    waveform: 'triangle',
    filterFreq: 1100
  },
  {
    id: 'ghibli-afternoon',
    name: 'Ghibli Summer Afternoon Piano',
    sub: 'Bright Nostalgic Grand Chords & Sunny Breezes',
    icon: '🍃',
    baseFreqs: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33], // C Major Pentatonic
    mood: 'Rolling green hills and quiet clouds drifting over the countryside',
    waveform: 'triangle',
    filterFreq: 1600
  },
  {
    id: 'shinkai-starlight',
    name: 'Makoto Shinkai Starlight Arpeggios',
    sub: 'Lyrical Ethereal Piano & Reverb Trails',
    icon: '✨',
    baseFreqs: [196.0, 246.94, 293.66, 369.99, 440.0, 493.88, 587.33], // G Major 7th Sparkle
    mood: 'Starry skies and intertwined destiny across light-years',
    waveform: 'sine',
    filterFreq: 2200
  },
  {
    id: 'rainy-window',
    name: 'Rainy Windowpane Piano Study',
    sub: 'Mellow Rhodes & Soft Upright Piano with Steady Drizzle',
    icon: '🌧️',
    baseFreqs: [174.61, 220.0, 261.63, 329.63, 392.0, 440.0], // F Major 7th Jazz
    mood: 'Watching rain beads roll down glass while wrapped in a blanket',
    waveform: 'triangle',
    filterFreq: 950
  },
  {
    id: 'chif3n-lullaby',
    name: "Sir Chif3n's Lullaby for Leslye",
    sub: 'Tender Romantic Piano & Celestial Bell Chimes',
    icon: '💖',
    baseFreqs: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25], // C Major 7th
    mood: 'Composed with demigod devotion for deep sweet dreams',
    waveform: 'sine',
    filterFreq: 1400
  },
  {
    id: 'tea-garden',
    name: 'Imperial Palace Tea Garden Serenade',
    sub: 'Traditional Pentatonic Piano & Silk Flute Resonance',
    icon: '🍵',
    baseFreqs: [220.0, 246.94, 293.66, 349.23, 440.0, 493.88], // A Minor Eastern Pentatonic
    mood: 'Steaming green tea overlooking quiet koi ponds',
    waveform: 'triangle',
    filterFreq: 1250
  },
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves & Warm Cocoa Piano',
    sub: 'Gentle Jazz Ballad Progression & Vinyl Crackle',
    icon: '🍂',
    baseFreqs: [196.0, 246.94, 293.66, 329.63, 392.0, 440.0, 493.88], // Em Pentatonic
    mood: 'Cozy late night study session with fireplace warmth',
    waveform: 'triangle',
    filterFreq: 1050
  }
];

export const LoFiRadio: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStationIdx, setCurrentStationIdx] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.35);
  const [rainEnabled, setRainEnabled] = useState<boolean>(true);
  const [crackleEnabled, setCrackleEnabled] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const crackleGainRef = useRef<GainNode | null>(null);
  const chordTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStation = STATIONS[currentStationIdx];

  // Initialize Web Audio graph
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(volume, ctx.currentTime);
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;

      // 1. Rain noise generator
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(750, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(rainEnabled ? 0.12 : 0, ctx.currentTime);

      noiseSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(master);
      noiseSource.start();
      rainGainRef.current = rainGain;

      // 2. Vinyl crackle generator
      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(crackleEnabled ? 0.04 : 0, ctx.currentTime);
      crackleGain.connect(master);
      crackleGainRef.current = crackleGain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Play rich resonant acoustic piano note
  const playPianoNote = (freq: number, duration: number, delay: number) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime + delay;

    // Dual oscillator for rich piano hammer overtones
    const oscMain = ctx.createOscillator();
    const oscOvertone = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscMain.type = currentStation.waveform;
    oscMain.frequency.setValueAtTime(freq, now);

    // Overtone 2nd harmonic with slight detune for warm acoustic chorusing
    oscOvertone.type = 'sine';
    oscOvertone.frequency.setValueAtTime(freq * 2 + (Math.random() * 0.4 - 0.2), now);

    // Dynamic lowpass filter (piano hammer dynamics)
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(currentStation.filterFreq, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    // Piano strike envelope: fast attack, natural acoustic decay
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.09, now + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscMain.connect(filter);
    oscOvertone.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(masterGainRef.current);

    oscMain.start(now);
    oscOvertone.start(now);
    oscMain.stop(now + duration);
    oscOvertone.stop(now + duration);
  };

  // Sequence piano progression loop
  useEffect(() => {
    if (!isPlaying) {
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);
      return;
    }

    initAudio();

    const triggerPianoChords = () => {
      const freqs = currentStation.baseFreqs;
      // Arpeggiate 3 to 5 notes
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const randFreq = freqs[Math.floor(Math.random() * freqs.length)];
        const octave = Math.random() > 0.4 ? 1 : 2;
        const noteDelay = i * 0.45;
        playPianoNote(randFreq * octave, 3.8, noteDelay);
      }
    };

    triggerPianoChords();
    chordTimerRef.current = setInterval(triggerPianoChords, 3500);

    return () => {
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);
    };
  }, [isPlaying, currentStationIdx]);

  // Volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Rain
  useEffect(() => {
    if (rainGainRef.current && audioCtxRef.current) {
      rainGainRef.current.gain.setValueAtTime(rainEnabled ? 0.12 : 0, audioCtxRef.current.currentTime);
    }
  }, [rainEnabled]);

  const togglePlay = () => {
    if (!isPlaying) {
      initAudio();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-80 sm:w-96 rounded-2xl bg-[#06150fe6] border border-amber-400/50 p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-cinzel text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
              Imperial Synthesized Chamber
            </span>
            <h3 className="font-cinzel text-sm font-bold text-white">OST & Piano Sanctuary</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Station Selector with 7 Piano Channels */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
        <span className="text-[10px] uppercase font-mono text-emerald-500">
          Select Piano Melodic Chamber ({STATIONS.length} Channels):
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {STATIONS.map((stn, idx) => (
            <button
              key={stn.id}
              onClick={() => setCurrentStationIdx(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                currentStationIdx === idx
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-semibold shadow-md'
                  : 'bg-[#04120c] border-emerald-900/70 text-emerald-200 hover:border-emerald-600'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-base shrink-0">{stn.icon}</span>
                <div className="truncate">
                  <span className="text-xs truncate block font-cinzel">{stn.name}</span>
                  <span className="text-[10px] opacity-75 truncate block font-mono">{stn.sub}</span>
                </div>
              </div>
              {currentStationIdx === idx && isPlaying && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Mini Piano Keys (Tap to play notes) */}
      <div className="p-2 rounded-xl bg-[#030d08] border border-emerald-900/80 space-y-1">
        <span className="text-[9px] uppercase font-mono text-emerald-500 block text-center">
          Tap Keys to Play Along with the Chamber 🎹
        </span>
        <div className="flex justify-center gap-1">
          {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note, idx) => {
            const freq = 261.63 * Math.pow(2, idx / 12 * 2);
            return (
              <button
                key={note}
                onClick={() => {
                  initAudio();
                  playPianoNote(freq, 2.5, 0);
                }}
                className="w-8 h-14 rounded-b-md bg-gradient-to-b from-white to-zinc-200 hover:from-amber-200 hover:to-amber-100 text-black text-[10px] font-bold pb-1 flex flex-col justify-end items-center shadow-inner active:scale-95 transition-all"
              >
                <span>{note}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Play Controls & Ambience Toggles */}
      <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between gap-3">
        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          <span>{isPlaying ? 'Pause Melody' : 'Play Piano'}</span>
        </button>

        {/* Rain Toggle */}
        <button
          onClick={() => setRainEnabled(!rainEnabled)}
          className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs ${
            rainEnabled
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-[#030e09] border-emerald-900 text-zinc-500'
          }`}
          title="Toggle soft rainfall sound"
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">Rain</span>
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-1.5 flex-1 max-w-[90px]">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-1 bg-emerald-950 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
