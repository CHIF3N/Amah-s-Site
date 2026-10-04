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
  Wind,
  Bell,
  Clock,
  Sliders,
  Moon
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

  // Multi-layer fader volumes
  const [rainVol, setRainVol] = useState<number>(0.25);
  const [chimesVol, setChimesVol] = useState<number>(0.20);
  const [hearthVol, setHearthVol] = useState<number>(0.15);
  const [cricketsVol, setCricketsVol] = useState<number>(0.10);

  // Sleep timer states (in seconds)
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'stations' | 'mixer'>('stations');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const chimesGainRef = useRef<GainNode | null>(null);
  const hearthGainRef = useRef<GainNode | null>(null);
  const cricketsGainRef = useRef<GainNode | null>(null);

  const chordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chimesTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStation = STATIONS[currentStationIdx];

  // Initialize Web Audio Graph
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
      rainGain.gain.setValueAtTime(rainVol, ctx.currentTime);

      noiseSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(master);
      noiseSource.start();
      rainGainRef.current = rainGain;

      // 2. Chimes Master Gain
      const chimesGain = ctx.createGain();
      chimesGain.gain.setValueAtTime(chimesVol, ctx.currentTime);
      chimesGain.connect(master);
      chimesGainRef.current = chimesGain;

      // 3. Hearth Crackle Master Gain
      const hearthGain = ctx.createGain();
      hearthGain.gain.setValueAtTime(hearthVol, ctx.currentTime);
      hearthGain.connect(master);
      hearthGainRef.current = hearthGain;

      // 4. Crickets Master Gain
      const cricketsGain = ctx.createGain();
      cricketsGain.gain.setValueAtTime(cricketsVol, ctx.currentTime);
      cricketsGain.connect(master);
      cricketsGainRef.current = cricketsGain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Trigger synthesized bamboo wind chime
  const playWindChime = (freq: number) => {
    if (!audioCtxRef.current || !chimesGainRef.current || chimesVol <= 0.01) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const dur = 1.8;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(chimesGainRef.current);
    osc.start(now);
    osc.stop(now + dur);
  };

  // Play piano note
  const playPianoNote = (freq: number, duration: number, delay: number) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime + delay;

    const oscMain = ctx.createOscillator();
    const oscOvertone = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscMain.type = currentStation.waveform;
    oscMain.frequency.setValueAtTime(freq, now);

    oscOvertone.type = 'sine';
    oscOvertone.frequency.setValueAtTime(freq * 2 + (Math.random() * 0.4 - 0.2), now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(currentStation.filterFreq, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

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

  // Sequencer loop
  useEffect(() => {
    if (!isPlaying) {
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);
      if (chimesTimerRef.current) clearInterval(chimesTimerRef.current);
      return;
    }

    initAudio();

    // 1. Piano sequence
    chordTimerRef.current = setInterval(() => {
      const freqs = currentStation.baseFreqs;
      const count = Math.random() > 0.4 ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const randFreq = freqs[Math.floor(Math.random() * freqs.length)];
        const delay = i * (0.18 + Math.random() * 0.08);
        const dur = 2.4 + Math.random() * 1.5;
        playPianoNote(randFreq, dur, delay);
      }
    }, 2800);

    // 2. Wind chimes periodic burst
    chimesTimerRef.current = setInterval(() => {
      if (Math.random() > 0.3) {
        const chimeFreqs = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
        const burstCount = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < burstCount; j++) {
          const f = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
          setTimeout(() => playWindChime(f), j * 160);
        }
      }
    }, 5500);

    return () => {
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);
      if (chimesTimerRef.current) clearInterval(chimesTimerRef.current);
    };
  }, [isPlaying, currentStationIdx]);

  // Master volume sync
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Multi-layer volume sync
  useEffect(() => {
    if (rainGainRef.current && audioCtxRef.current) {
      rainGainRef.current.gain.setValueAtTime(rainVol, audioCtxRef.current.currentTime);
    }
  }, [rainVol]);

  useEffect(() => {
    if (chimesGainRef.current && audioCtxRef.current) {
      chimesGainRef.current.gain.setValueAtTime(chimesVol, audioCtxRef.current.currentTime);
    }
  }, [chimesVol]);

  useEffect(() => {
    if (hearthGainRef.current && audioCtxRef.current) {
      hearthGainRef.current.gain.setValueAtTime(hearthVol, audioCtxRef.current.currentTime);
    }
  }, [hearthVol]);

  useEffect(() => {
    if (cricketsGainRef.current && audioCtxRef.current) {
      cricketsGainRef.current.gain.setValueAtTime(cricketsVol, audioCtxRef.current.currentTime);
    }
  }, [cricketsVol]);

  // Sleep timer ticker
  useEffect(() => {
    if (sleepTimerSeconds === null) return;
    if (sleepTimerSeconds <= 0) {
      setIsPlaying(false);
      setSleepTimerSeconds(null);
      return;
    }

    const timer = setInterval(() => {
      setSleepTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerSeconds]);

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
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-80 sm:w-[420px] rounded-2xl bg-[#03150deb] border border-amber-400/60 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 space-y-4 text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-cinzel text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
              Imperial Lo-Fi Studio
            </span>
            <h3 className="font-cinzel text-sm font-bold text-white">Palace Soundscape Chamber</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('stations')}
          className={`py-1.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'stations'
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
              : 'bg-[#02100a] border-emerald-950 text-emerald-400/70 hover:text-white'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Melody Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('mixer')}
          className={`py-1.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'mixer'
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
              : 'bg-[#02100a] border-emerald-950 text-emerald-400/70 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Atmosphere Mixer</span>
        </button>
      </div>

      {/* Tab 1: Stations */}
      {activeTab === 'stations' && (
        <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-thin pr-1">
          {STATIONS.map((stn, idx) => (
            <button
              key={stn.id}
              onClick={() => setCurrentStationIdx(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between w-full ${
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
      )}

      {/* Tab 2: Atmosphere Mixer */}
      {activeTab === 'mixer' && (
        <div className="p-3 rounded-2xl bg-[#020e08] border border-emerald-900/80 space-y-3 text-xs font-mono">
          <div>
            <div className="flex justify-between text-emerald-300 mb-1">
              <span>🌧️ Courtyard Summer Rain</span>
              <span>{Math.round(rainVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={rainVol}
              onChange={(e) => setRainVol(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 h-1 bg-emerald-950 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-amber-300 mb-1">
              <span>🎐 Bamboo Wind Chimes</span>
              <span>{Math.round(chimesVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={chimesVol}
              onChange={(e) => setChimesVol(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-1 bg-emerald-950 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-rose-300 mb-1">
              <span>🪵 Crackling Hearth Fire</span>
              <span>{Math.round(hearthVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={hearthVol}
              onChange={(e) => setHearthVol(parseFloat(e.target.value))}
              className="w-full accent-rose-400 h-1 bg-emerald-950 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-teal-300 mb-1">
              <span>🦗 Night Palace Crickets</span>
              <span>{Math.round(cricketsVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={cricketsVol}
              onChange={(e) => setCricketsVol(parseFloat(e.target.value))}
              className="w-full accent-teal-400 h-1 bg-emerald-950 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Sleep Timer Bar */}
      <div className="p-2.5 rounded-xl bg-[#020e08] border border-emerald-900/60 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Moon className="w-3.5 h-3.5 text-amber-400" />
          <span>Sleep Timer:</span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { label: 'Off', val: null },
            { label: '15m', val: 15 * 60 },
            { label: '30m', val: 30 * 60 },
            { label: '60m', val: 60 * 60 }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => setSleepTimerSeconds(preset.val)}
              className={`px-2 py-0.5 rounded-md border text-[10px] transition-all ${
                sleepTimerSeconds === preset.val || (preset.val === null && sleepTimerSeconds === null)
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-[#03150d] border-emerald-950 text-emerald-500'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {sleepTimerSeconds !== null && (
          <span className="text-[10px] text-amber-300 font-bold">
            {Math.floor(sleepTimerSeconds / 60)}:{(sleepTimerSeconds % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Master Controls */}
      <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between gap-3">
        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          <span>{isPlaying ? 'Pause Studio' : 'Play Studio'}</span>
        </button>

        <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
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
