import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Radio,
  Sparkles,
  CloudRain,
  Music,
  X,
  ChevronDown
} from 'lucide-react';

interface Station {
  id: string;
  name: string;
  sub: string;
  icon: string;
  baseFreqs: number[];
  mood: string;
}

const STATIONS: Station[] = [
  {
    id: 'maomao-porch',
    name: "Maomao's Rainy Herbal Porch",
    sub: 'Rain & Bamboo Wind Chime Lo-Fi',
    icon: '🌿',
    baseFreqs: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25], // C Major Pentatonic
    mood: 'Soothing rain and gentle herbal chords'
  },
  {
    id: 'ghibli-teahouse',
    name: 'Ghibli Palace Tea House',
    sub: 'Warm Nostalgic Rhodes & Tape Flutter',
    icon: '🍵',
    baseFreqs: [220.0, 261.63, 293.66, 349.23, 392.0, 440.0], // F / Dm Pentatonic
    mood: 'Afternoon tea in the imperial gardens'
  },
  {
    id: 'celestial-night',
    name: 'Sir Chif3n Starlight Chill',
    sub: 'Dreamy Ambient Synth & Celestial Bell',
    icon: '✨',
    baseFreqs: [196.0, 246.94, 293.66, 369.99, 440.0, 493.88], // G Major 7th ethereal
    mood: 'Starry sky date night overlooking the capital'
  }
];

export const LoFiRadio: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStationIdx, setCurrentStationIdx] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.35);
  const [rainEnabled, setRainEnabled] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
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

      // Create pink noise for rain/tape hiss
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

      // Lowpass filter for cozy muffled rain
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(800, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(rainEnabled ? 0.12 : 0, ctx.currentTime);

      noiseSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(master);
      noiseSource.start();

      rainGainRef.current = rainGain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Play a soft bell/chord tone
  const playChordNote = (freq: number, duration: number, delay: number) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    // Warm vintage tape filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime + delay);
    filter.Q.setValueAtTime(2, ctx.currentTime + delay);

    noteGain.gain.setValueAtTime(0, ctx.currentTime + delay);
    noteGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.1);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(masterGainRef.current);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  };

  // Sequence gentle pentatonic melody loop
  useEffect(() => {
    if (!isPlaying) {
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);
      return;
    }

    initAudio();

    const triggerArpeggio = () => {
      const freqs = currentStation.baseFreqs;
      // Pick 3-4 soft notes from the pentatonic scale
      const numNotes = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numNotes; i++) {
        const randFreq = freqs[Math.floor(Math.random() * freqs.length)];
        const octaveShift = Math.random() > 0.6 ? 2 : 1;
        const delay = i * 0.45;
        playChordNote(randFreq * octaveShift, 3.2, delay);
      }
    };

    triggerArpeggio();
    chordTimerRef.current = setInterval(triggerArpeggio, 3600);

    return () => {
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);
    };
  }, [isPlaying, currentStationIdx]);

  // Adjust volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Adjust rain
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
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-80 sm:w-96 rounded-2xl bg-[#06150fe6] border border-amber-400/40 p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-cinzel text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
              Imperial Ambient Synth
            </span>
            <h3 className="font-cinzel text-sm font-bold text-white">OST Lo-Fi Radio</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Station Selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-mono text-emerald-500">Select Chamber:</span>
        <div className="grid grid-cols-1 gap-1.5">
          {STATIONS.map((stn, idx) => (
            <button
              key={stn.id}
              onClick={() => setCurrentStationIdx(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                currentStationIdx === idx
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-semibold'
                  : 'bg-[#04120c] border-emerald-900/70 text-emerald-200 hover:border-emerald-600'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-base">{stn.icon}</span>
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

      {/* Play Controls & Volume */}
      <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between gap-3">
        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          <span>{isPlaying ? 'Pause Melody' : 'Play Lo-Fi'}</span>
        </button>

        {/* Rain Toggle */}
        <button
          onClick={() => setRainEnabled(!rainEnabled)}
          className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs ${
            rainEnabled
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-[#030e09] border-emerald-900 text-zinc-500'
          }`}
          title="Toggle cozy rain background noise"
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">Rain</span>
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-1.5 flex-1 max-w-[100px]">
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

      <p className="text-[10px] text-emerald-500/80 text-center italic">
        "Curated background soundscape for Leslye's study & relax sessions"
      </p>
    </div>
  );
};
