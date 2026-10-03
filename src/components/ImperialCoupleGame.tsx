import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  Leaf,
  RotateCcw,
  Sparkles,
  Trophy,
  Heart,
  X,
  User,
  Zap,
  Coffee,
  CheckCircle,
  HelpCircle,
  Brain,
  FlaskConical,
  Grid,
  Radio,
  Clock,
  Award,
  Layers,
  Check,
  Flame,
  RefreshCw,
  Smartphone,
  Globe,
  Shuffle,
  Eye,
  Send,
  Cloud
} from 'lucide-react';
import {
  subscribeToActiveArcadeSession,
  updateActiveArcadeSession,
  ArcadeCloudState,
  db
} from '../services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface ImperialCoupleGameProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
}

// Telepathy Question Bank
const TELEPATHY_PROMPTS = [
  {
    id: 'tel-1',
    prompt: 'Pick our ultimate date night anime snack craving:',
    options: ['Boba Tea & Mochi 🧋', 'Crispy Popcorn & Melted Butter 🍿', 'Hot Steaming Ramen 🍜', 'Assorted Sushi & Matcha 🍣']
  },
  {
    id: 'tel-2',
    prompt: 'Which Maomao poison-testing habit is the cutest?',
    options: ['Ecstatic blushing when eating venom 🧪', 'Examining Jinshi like a weird bug 🐛', 'Testing Sir Chif3n’s snacks first 👑', 'Hiding mysterious herbs in her sleeves 🌿']
  },
  {
    id: 'tel-3',
    prompt: 'Our next fantasy romantic getaway:',
    options: ['Mountain Onsen Hot Springs ♨️', 'Kyoto Cherry Blossom Alley 🌸', 'Imperial Palace Garden Pavilion 🏯', 'Cozy Starlit Cabin in the Woods 🌌']
  },
  {
    id: 'tel-4',
    prompt: 'If Sir Chif3n casts a demigod blessing on Lady Leslye, what is it?',
    options: ['Instant Stress Relief & Shoulder Massage ✨', 'Infinite Supply of Rare Herbal Teas 🍵', 'Emergency 10-Hour Blanket Burrito 🌯', 'Spoil-Free Anime Viewing Protection 🛡️']
  },
  {
    id: 'tel-5',
    prompt: 'Favorite anime genre for our couple cuddle watch:',
    options: ['Imperial Mystery & Romance 🍵', 'Fantasy & Emotional Journeys 🪄', 'Slice of Life & Comedy 🌸', 'High Octane Shonen & Hype 🔥']
  }
];

// Alchemy Ingredients for Potion Craft
interface PotionIngredient {
  id: string;
  name: string;
  icon: string;
  element: 'Yin' | 'Yang' | 'Wood' | 'Gold';
}

const ALCHEMY_INGREDIENTS: PotionIngredient[] = [
  { id: 'dragon-jade', name: 'Dragon Jade', icon: '🐉', element: 'Yang' },
  { id: 'moon-orchid', name: 'Moon Orchid', icon: '🌸', element: 'Yin' },
  { id: 'phoenix-feather', name: 'Phoenix Feather', icon: '🪶', element: 'Yang' },
  { id: 'golden-lotus', name: 'Golden Lotus', icon: '🪷', element: 'Gold' },
  { id: 'wolfberry', name: 'Wolfberry Root', icon: '🍒', element: 'Wood' },
  { id: 'starlight-dew', name: 'Starlight Dew', icon: '✨', element: 'Yin' }
];

const POTION_RECIPES: Record<string, { name: string; effect: string; color: string }> = {
  'dragon-jade+moon-orchid': { name: 'Remedy of Clarity & Vision', effect: 'Cleanses the mind and restores eyes after 5 hours of anime binge-watching.', color: 'from-emerald-500 to-teal-400' },
  'phoenix-feather+golden-lotus': { name: 'Elixir of Immortal Devotion', effect: 'Binds Sir Chif3n & Lady Leslye in eternal demigod love.', color: 'from-amber-500 to-rose-500' },
  'wolfberry+starlight-dew': { name: 'Maomao’s Herbal Restorative', effect: 'Dissolves all fatigue and unlocks immediate cuddle privileges.', color: 'from-purple-500 to-indigo-400' },
  'dragon-jade+golden-lotus': { name: 'Imperial Sovereignty Draft', effect: 'Grants royal authority over the snack bowl and remote control.', color: 'from-yellow-400 to-amber-600' }
};

// Anime Silhouette Characters
const SILHOUETTE_TARGETS = [
  {
    id: 'maomao',
    name: 'Maomao',
    anime: 'The Apothecary Diaries',
    hints: [
      'Obsessed with tasting toxins and rare herbs',
      'Works in the imperial rear palace',
      'Has deliberate chemical scars on her left arm',
      'Looks at handsome officials with profound deadpan pity'
    ]
  },
  {
    id: 'frieren',
    name: 'Frieren',
    anime: "Frieren: Beyond Journey's End",
    hints: [
      'An elven mage who defeated the Demon King',
      'Loves collecting useless folk magic grimoires',
      'Wakes up past noon and gets eaten by mimics',
      'Traveled with hero Himmel for 10 years'
    ]
  },
  {
    id: 'jinshi',
    name: 'Jinshi',
    anime: 'The Apothecary Diaries',
    hints: [
      'Has celestial, breathtaking good looks that charm anyone',
      'Secretly holds immense royal imperial bloodline rank',
      'Constantly teased and ignored by an apothecary girl',
      'Accompanied by faithful guard Gaoshun'
    ]
  }
];

// Anime Trivia Questions
const TRIVIA_QUESTIONS = [
  {
    id: 't-1',
    question: 'In The Apothecary Diaries, what rare physical trait is Maomao famously known for having on her arm?',
    options: ['A golden dragon brand', 'Chemical scars from self-administered poison testing', 'An imperial lotus tattoo', 'A jade phoenix birthmark'],
    correct: 1,
    funFact: 'Maomao tested snake venom, powdered mercury, and various herbs directly on herself to study their effects!'
  },
  {
    id: 't-2',
    question: "What is Sir Chif3n's primary demigod duty whenever Lady Leslye has had a tiring mortal week?",
    options: ['Provide emergency blanket burrito & test all snacks for poison', 'Ignore her and play video games', 'Tell her to do chores', 'Spoil the anime ending'],
    correct: 0,
    funFact: 'Sacred Law #001 states Sir Chif3n must ensure 100% boba and blanket readiness at all times.'
  },
  {
    id: 't-3',
    question: "In Frieren: Beyond Journey's End, what flower was hero Himmel's hometown known for?",
    options: ['Mirrored Lotus', 'Blue Moon Grass', 'Dragon Orchid', 'Starlight Rose'],
    correct: 0,
    funFact: 'Himmel chose the Mirrored Lotus ring for Frieren, which symbolises eternal, unending devotion.'
  },
  {
    id: 't-4',
    question: 'When Jinshi attempts to use his heavenly handsome charms on Maomao, how does she look at him?',
    options: ['With profound deadpan disgust, like inspecting a slug', 'She faints from attraction', 'She writes a love poem', 'She requests an imperial marriage'],
    correct: 0,
    funFact: 'Maomao’s cold deadpan disgust completely captivates Jinshi since no one else treats him like a bug!'
  },
  {
    id: 't-5',
    question: 'What dangerous cosmetic substance was poisoning the imperial concubines and their infants?',
    options: ['Powdered White Lead', 'Nightshade Berries', 'Wolfsbane Incense', 'Ground Asbestos'],
    correct: 0,
    funFact: 'Lead powder was commonly used for imperial porcelain-white skin cosmetics in ancient courts.'
  }
];

// Initial Cloud Arcade State
const DEFAULT_CLOUD_STATE: ArcadeCloudState = {
  gameId: 'tic-tac-toe',
  turn: 'Chif3n',
  scores: { Chif3n: 0, Leslye: 0 },
  winner: null,
  lastMove: { player: 'System', action: 'Session Initialized', timestamp: Date.now() },
  boardState: {
    // TicTacToe / Gomoku board
    grid: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    // Telepathy state
    telepathyPromptIdx: 0,
    telepathyChoices: { Chif3n: null, Leslye: null },
    telepathyRevealed: false,
    // Potion Craft state
    potionSlots: [],
    craftedPotion: null,
    // Silhouette state
    silhouetteIdx: 0,
    revealedHintCount: 1,
    silhouetteSolved: false,
    // Trivia state
    triviaQuestionIdx: 0,
    triviaAnswers: { Chif3n: null, Leslye: null },
    triviaRevealed: false
  }
};

export const ImperialCoupleGame: React.FC<ImperialCoupleGameProps> = ({
  isOpen,
  onClose,
  onOpenLoginModal
}) => {
  // Active player role on this device
  const [myRole, setMyRole] = useState<'Chif3n' | 'Leslye'>(() => {
    try {
      const saved = localStorage.getItem('leslye_active_user');
      if (saved === 'leslye') return 'Leslye';
    } catch (e) {}
    return 'Chif3n';
  });

  const [passAndPlay, setPassAndPlay] = useState<boolean>(false);
  const [session, setSession] = useState<ArcadeCloudState>(DEFAULT_CLOUD_STATE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sound generator
  const playSound = (freq = 440, type: OscillatorType = 'sine', duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Subscribe to Cloud Firestore globalSharedSession
  useEffect(() => {
    if (!isOpen) return;

    const docRef = doc(db, 'coupleArcade', 'globalSharedSession');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as ArcadeCloudState;
          if (data && data.gameId) {
            setSession(data);
            playSound(523, 'triangle', 0.1);
          }
        } else {
          // Initialize shared room document if it doesn't exist yet
          setDoc(docRef, DEFAULT_CLOUD_STATE).catch((err) =>
            console.warn('Initial session bootstrap warning:', err)
          );
        }
      },
      (error) => {
        console.warn('globalSharedSession subscription warning:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const isMyTurn = passAndPlay || session.turn === myRole;

  // Generic Cloud Dispatcher to single constant shared Firestore document
  const dispatchStateUpdate = async (nextState: Partial<ArcadeCloudState>) => {
    const merged: ArcadeCloudState = {
      ...session,
      ...nextState,
      lastMove: {
        player: myRole,
        action: nextState.lastMove?.action || 'Move Made',
        timestamp: Date.now()
      }
    };

    setSession(merged);
    setIsSyncing(true);
    try {
      const docRef = doc(db, 'coupleArcade', 'globalSharedSession');
      await setDoc(docRef, { ...merged, lastUpdated: Date.now() }, { merge: true });
    } catch (err) {
      console.error('Failed to sync to globalSharedSession:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch Game Mode
  const switchGame = async (gameId: string) => {
    let newBoardState = { ...session.boardState };

    if (gameId === 'tic-tac-toe') {
      newBoardState.grid = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ];
    } else if (gameId === 'gomoku') {
      newBoardState.grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    } else if (gameId === 'couples-telepathy') {
      newBoardState.telepathyChoices = { Chif3n: null, Leslye: null };
      newBoardState.telepathyRevealed = false;
    } else if (gameId === 'potion-craft') {
      newBoardState.potionSlots = [];
      newBoardState.craftedPotion = null;
    } else if (gameId === 'silhouette-duel') {
      newBoardState.revealedHintCount = 1;
      newBoardState.silhouetteSolved = false;
    } else if (gameId === 'trivia') {
      newBoardState.triviaAnswers = { Chif3n: null, Leslye: null };
      newBoardState.triviaRevealed = false;
    }

    await dispatchStateUpdate({
      gameId,
      turn: 'Chif3n',
      winner: null,
      boardState: newBoardState,
      lastMove: { player: myRole, action: `Started ${gameId}`, timestamp: Date.now() }
    });
  };

  // --- 1. TIC-TAC-TOE & GOMOKU LOGIC ---
  const handleBoardClick = async (r: number, c: number) => {
    if (!isMyTurn || session.winner || session.boardState.grid[r][c] !== null) return;

    const newGrid = session.boardState.grid.map((row: any[]) => [...row]);
    const mark = session.turn === 'Chif3n' ? '👑' : '🌿';
    newGrid[r][c] = mark;

    // Check winner
    const winLength = session.gameId === 'gomoku' ? 5 : 3;
    const winnerMark = checkBoardWinner(newGrid, winLength);

    let nextTurn: 'Chif3n' | 'Leslye' = session.turn === 'Chif3n' ? 'Leslye' : 'Chif3n';
    let winner: string | null = null;
    let scores = { ...session.scores };

    if (winnerMark) {
      if (winnerMark === 'draw') {
        winner = 'Draw';
      } else {
        winner = winnerMark === '👑' ? 'Chif3n' : 'Leslye';
        scores[winner as 'Chif3n' | 'Leslye'] += 1;
        playSound(659, 'triangle', 0.3);
      }
    } else {
      playSound(440, 'sine', 0.12);
    }

    await dispatchStateUpdate({
      boardState: { ...session.boardState, grid: newGrid },
      turn: nextTurn,
      winner,
      scores,
      lastMove: { player: myRole, action: `Placed mark at (${r+1}, ${c+1})`, timestamp: Date.now() }
    });
  };

  const checkBoardWinner = (grid: any[][], winLen: number): string | null => {
    const size = grid.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const p = grid[r][c];
        if (!p) continue;
        // Horizontal
        if (c + winLen <= size && grid[r].slice(c, c + winLen).every((cell: any) => cell === p)) return p;
        // Vertical
        if (r + winLen <= size) {
          let win = true;
          for (let k = 0; k < winLen; k++) if (grid[r + k][c] !== p) { win = false; break; }
          if (win) return p;
        }
        // Diagonal Down-Right
        if (r + winLen <= size && c + winLen <= size) {
          let win = true;
          for (let k = 0; k < winLen; k++) if (grid[r + k][c + k] !== p) { win = false; break; }
          if (win) return p;
        }
        // Diagonal Up-Right
        if (r - winLen + 1 >= 0 && c + winLen <= size) {
          let win = true;
          for (let k = 0; k < winLen; k++) if (grid[r - k][c + k] !== p) { win = false; break; }
          if (win) return p;
        }
      }
    }
    const isFull = grid.every((row: any[]) => row.every((cell) => cell !== null));
    return isFull ? 'draw' : null;
  };

  const resetBoard = async () => {
    const size = session.gameId === 'gomoku' ? 8 : 3;
    const newGrid = Array.from({ length: size }, () => Array(size).fill(null));
    await dispatchStateUpdate({
      boardState: { ...session.boardState, grid: newGrid },
      turn: 'Chif3n',
      winner: null
    });
  };

  // --- 2. COUPLES' TELEPATHY LOGIC ---
  const handleTelepathyChoice = async (optIdx: number) => {
    const currentChoices = { ...session.boardState.telepathyChoices, [myRole]: optIdx };
    const bothSubmitted = currentChoices.Chif3n !== null && currentChoices.Leslye !== null;

    let scores = { ...session.scores };
    let winner: string | null = null;

    if (bothSubmitted) {
      if (currentChoices.Chif3n === currentChoices.Leslye) {
        scores.Chif3n += 1;
        scores.Leslye += 1;
        winner = 'Telepathic Soulmates! 100% Match! 💖';
        playSound(784, 'triangle', 0.4);
      } else {
        winner = 'Cute Contrast! Opposite Desires 🌸';
        playSound(392, 'sine', 0.2);
      }
    } else {
      playSound(523, 'sine', 0.15);
    }

    await dispatchStateUpdate({
      boardState: {
        ...session.boardState,
        telepathyChoices: currentChoices,
        telepathyRevealed: bothSubmitted
      },
      scores,
      winner
    });
  };

  const nextTelepathyPrompt = async () => {
    const nextIdx = (session.boardState.telepathyPromptIdx + 1) % TELEPATHY_PROMPTS.length;
    await dispatchStateUpdate({
      boardState: {
        ...session.boardState,
        telepathyPromptIdx: nextIdx,
        telepathyChoices: { Chif3n: null, Leslye: null },
        telepathyRevealed: false
      },
      winner: null
    });
  };

  // --- 3. POTION CRAFT (ALCHEMY CO-OP) ---
  const handleAddIngredient = async (ingredientId: string) => {
    if (!isMyTurn) return;
    const slots = [...(session.boardState.potionSlots || [])];
    if (slots.length >= 2) return;

    slots.push(ingredientId);
    let craftedPotion = null;
    let winner = null;
    let scores = { ...session.scores };

    if (slots.length === 2) {
      const comboKey1 = `${slots[0]}+${slots[1]}`;
      const comboKey2 = `${slots[1]}+${slots[0]}`;
      craftedPotion = POTION_RECIPES[comboKey1] || POTION_RECIPES[comboKey2] || {
        name: 'Mysterious Sparking Draught',
        effect: 'A bubbly, experimental potion with sweet notes of peach and starlight.',
        color: 'from-pink-500 to-rose-400'
      };
      scores.Chif3n += 1;
      scores.Leslye += 1;
      winner = 'Masterpiece Potion Brewed! 🍵✨';
      playSound(659, 'triangle', 0.4);
    } else {
      playSound(440, 'sine', 0.15);
    }

    const nextTurn: 'Chif3n' | 'Leslye' = session.turn === 'Chif3n' ? 'Leslye' : 'Chif3n';

    await dispatchStateUpdate({
      boardState: {
        ...session.boardState,
        potionSlots: slots,
        craftedPotion
      },
      turn: nextTurn,
      winner,
      scores
    });
  };

  const resetCauldron = async () => {
    await dispatchStateUpdate({
      boardState: {
        ...session.boardState,
        potionSlots: [],
        craftedPotion: null
      },
      turn: 'Chif3n',
      winner: null
    });
  };

  // --- 4. SILHOUETTE MYSTERY DUEL ---
  const handleRevealNextHint = async () => {
    const current = session.boardState.revealedHintCount || 1;
    if (current < 4) {
      await dispatchStateUpdate({
        boardState: {
          ...session.boardState,
          revealedHintCount: current + 1
        }
      });
      playSound(523, 'sine', 0.15);
    }
  };

  const handleSolveSilhouette = async () => {
    let scores = { ...session.scores };
    scores[myRole] += 2;
    playSound(784, 'triangle', 0.4);

    await dispatchStateUpdate({
      boardState: {
        ...session.boardState,
        silhouetteSolved: true,
        revealedHintCount: 4
      },
      scores,
      winner: `${myRole} Deciphered The Silhouette!`
    });
  };

  const nextSilhouette = async () => {
    const nextIdx = (session.boardState.silhouetteIdx + 1) % SILHOUETTE_TARGETS.length;
    await dispatchStateUpdate({
      boardState: {
        ...session.boardState,
        silhouetteIdx: nextIdx,
        revealedHintCount: 1,
        silhouetteSolved: false
      },
      winner: null
    });
  };

  // --- 5. ANIME TRIVIA DUEL ---
  const handleTriviaAnswer = async (optIdx: number) => {
    const currentAnswers = { ...session.boardState.triviaAnswers, [myRole]: optIdx };
    const bothAnswered = currentAnswers.Chif3n !== null && currentAnswers.Leslye !== null;

    let scores = { ...session.scores };
    let winner: string | null = null;
    const currentQ = TRIVIA_QUESTIONS[session.boardState.triviaQuestionIdx || 0];

    if (bothAnswered) {
      const chif3nCorrect = currentAnswers.Chif3n === currentQ.correct;
      const leslyeCorrect = currentAnswers.Leslye === currentQ.correct;

      if (chif3nCorrect) scores.Chif3n += 1;
      if (leslyeCorrect) scores.Leslye += 1;

      if (chif3nCorrect && leslyeCorrect) {
        winner = 'Both Sir Chif3n & Lady Leslye Answered Correctly! 🏆';
        playSound(784, 'triangle', 0.4);
      } else if (chif3nCorrect) {
        winner = 'Sir Chif3n Scored The Correct Answer! 👑';
        playSound(659, 'triangle', 0.3);
      } else if (leslyeCorrect) {
        winner = 'Lady Leslye Scored The Correct Answer! 🌿';
        playSound(659, 'triangle', 0.3);
      } else {
        winner = 'Both Missed! The Court Physician Chuckles 🍵';
        playSound(330, 'sine', 0.2);
      }
    } else {
      playSound(523, 'sine', 0.15);
    }

    await dispatchStateUpdate({
      boardState: {
        ...session.boardState,
        triviaAnswers: currentAnswers,
        triviaRevealed: bothAnswered
      },
      scores,
      winner
    });
  };

  const nextTriviaQuestion = async () => {
    const nextIdx = (session.boardState.triviaQuestionIdx + 1) % TRIVIA_QUESTIONS.length;
    await dispatchStateUpdate({
      boardState: {
        ...session.boardState,
        triviaQuestionIdx: nextIdx,
        triviaAnswers: { Chif3n: null, Leslye: null },
        triviaRevealed: false
      },
      winner: null
    });
  };

  if (!isOpen) return null;

  const currentTelepathy = TELEPATHY_PROMPTS[session.boardState.telepathyPromptIdx || 0];
  const currentSilhouette = SILHOUETTE_TARGETS[session.boardState.silhouetteIdx || 0];

  return (
    <div className="fixed inset-0 z-50 bg-[#020906]/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[92vh] bg-gradient-to-b from-[#05170f] via-[#03100a] to-[#020805] border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="px-5 py-3.5 bg-[#03110b] border-b border-emerald-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/50 flex items-center justify-center shadow">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wide">
                  Imperial Palace Arcade
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Firestore Live Sync</span>
                </span>
              </div>
              <p className="text-[10px] font-mono text-emerald-400/80">
                Playing as: <span className="font-bold text-amber-300">{myRole === 'Chif3n' ? 'Sir Chif3n 👑' : 'Lady Leslye 🌿'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pass and Play Toggle */}
            <button
              onClick={() => setPassAndPlay(!passAndPlay)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono border transition-all ${
                passAndPlay
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-[#04140e] border-emerald-900 text-emerald-400'
              }`}
              title="Toggle Same-Device Pass & Play"
            >
              {passAndPlay ? '📱 Single Screen' : '🌐 Multi-Device Sync'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Game Mode Selector Tabs */}
        <nav className="px-4 py-2 bg-[#020b06] border-b border-emerald-950 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', icon: Grid },
            { id: 'gomoku', name: 'Gomoku (8x8)', icon: Layers },
            { id: 'couples-telepathy', name: 'Couples Telepathy', icon: Heart },
            { id: 'potion-craft', name: 'Potion Craft Co-op', icon: FlaskConical },
            { id: 'trivia', name: 'Anime Trivia Duel', icon: Brain },
            { id: 'silhouette-duel', name: 'Silhouette Duel', icon: Eye }
          ].map((g) => {
            const Icon = g.icon;
            const isSelected = session.gameId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => switchGame(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-md ring-1 ring-amber-300'
                    : 'bg-[#04160e] text-emerald-300 border border-emerald-900/80 hover:border-emerald-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{g.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Turn & Score Banner */}
        <div className="px-5 py-2.5 bg-[#03130c] border-b border-emerald-900/60 flex items-center justify-between text-xs shrink-0">
          {/* Turn Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-500 uppercase tracking-wider">Turn:</span>
            <div
              className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shadow-sm ${
                session.turn === 'Chif3n'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
              }`}
            >
              {session.turn === 'Chif3n' ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Leaf className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{session.turn === 'Chif3n' ? 'Sir Chif3n 👑' : 'Lady Leslye 🌿'}</span>
              {isMyTurn && <span className="text-[9px] bg-emerald-900 px-1.5 py-0.2 rounded-full text-emerald-200">Your Move!</span>}
            </div>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-amber-400 font-bold">Chif3n: {session.scores.Chif3n}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-bold">Leslye: {session.scores.Leslye}</span>
          </div>
        </div>

        {/* Active Game Canvas */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-b from-[#020a06] via-[#03120b] to-[#010704]">
          {/* Winner Celebration Banner */}
          {session.winner && (
            <div className="mb-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/60 text-center animate-in zoom-in-95 duration-200">
              <span className="font-cinzel text-sm sm:text-base font-bold text-amber-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{session.winner}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </span>
            </div>
          )}

          {/* GAME 1 & 2: TIC-TAC-TOE / GOMOKU */}
          {(session.gameId === 'tic-tac-toe' || session.gameId === 'gomoku') && (
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`grid gap-1.5 sm:gap-2 p-3 bg-[#03150d] rounded-2xl border border-emerald-900/80 shadow-2xl ${
                  session.gameId === 'gomoku' ? 'grid-cols-8' : 'grid-cols-3'
                }`}
              >
                {session.boardState.grid.map((row: any[], r: number) =>
                  row.map((cell, c) => (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleBoardClick(r, c)}
                      disabled={!isMyTurn || session.winner !== null || cell !== null}
                      className={`rounded-xl flex items-center justify-center font-bold transition-all ${
                        session.gameId === 'gomoku'
                          ? 'w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base'
                          : 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl'
                      } ${
                        cell
                          ? 'bg-[#042013] border border-emerald-500/50 shadow-inner'
                          : 'bg-[#020f08] border border-emerald-950 hover:border-emerald-600 hover:bg-[#052818]'
                      }`}
                    >
                      {cell}
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={resetBoard}
                className="px-4 py-2 rounded-xl bg-[#04160e] hover:bg-[#072517] border border-emerald-700 text-emerald-300 text-xs font-cinzel font-bold flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Grid</span>
              </button>
            </div>
          )}

          {/* GAME 3: COUPLES' TELEPATHY */}
          {session.gameId === 'couples-telepathy' && (
            <div className="w-full max-w-lg space-y-5 text-center">
              <div className="p-4 rounded-2xl bg-[#03150d] border border-emerald-800/80 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                  Synchronicity Prompt #{session.boardState.telepathyPromptIdx + 1}
                </span>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                  "{currentTelepathy.prompt}"
                </h3>
              </div>

              {/* Status of Both Players */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#021009] border border-amber-500/40 flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-200">
                    Chif3n: {session.boardState.telepathyChoices?.Chif3n !== null ? 'Locked In! 🔒' : 'Thinking... 💭'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#021009] border border-emerald-500/40 flex items-center justify-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-200">
                    Leslye: {session.boardState.telepathyChoices?.Leslye !== null ? 'Locked In! 🔒' : 'Thinking... 💭'}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTelepathy.options.map((opt, idx) => {
                  const isMySelection = session.boardState.telepathyChoices?.[myRole] === idx;
                  const isRevealed = session.boardState.telepathyRevealed;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleTelepathyChoice(idx)}
                      disabled={isRevealed}
                      className={`p-4 rounded-2xl text-xs sm:text-sm font-serif font-bold text-left transition-all ${
                        isMySelection
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg ring-2 ring-amber-300'
                          : 'bg-[#03170e] hover:bg-[#052618] border border-emerald-900 text-emerald-200 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {session.boardState.telepathyRevealed && (
                <button
                  onClick={nextTelepathyPrompt}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-cinzel font-bold text-xs shadow-lg active:scale-95 transition-all"
                >
                  Next Telepathy Card →
                </button>
              )}
            </div>
          )}

          {/* GAME 4: POTION CRAFT (ALCHEMY CO-OP) */}
          {session.gameId === 'potion-craft' && (
            <div className="w-full max-w-lg space-y-5 text-center">
              <div className="p-4 rounded-2xl bg-[#03150d] border border-emerald-800/80 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                  Imperial Cauldron of Synergy
                </span>
                <p className="text-xs font-serif text-emerald-300">
                  Take turns dropping 2 mystical ingredients into the cauldron to synthesize a demigod remedy!
                </p>
              </div>

              {/* The Cauldron Display */}
              <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-b from-[#0a281a] via-[#051c11] to-[#020d07] border-4 border-amber-400/60 shadow-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="text-4xl animate-bounce mb-1">
                  {session.boardState.potionSlots?.length === 2 ? '✨' : '🍵'}
                </div>
                <div className="flex gap-2">
                  {session.boardState.potionSlots?.map((slotId: string, i: number) => {
                    const ing = ALCHEMY_INGREDIENTS.find((a) => a.id === slotId);
                    return (
                      <span key={i} className="text-2xl" title={ing?.name}>
                        {ing?.icon}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Crafted Potion Reveal */}
              {session.boardState.craftedPotion && (
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-r ${session.boardState.craftedPotion.color} text-black font-cinzel shadow-xl animate-in zoom-in-95`}
                >
                  <h4 className="font-bold text-base">{session.boardState.craftedPotion.name}</h4>
                  <p className="text-xs font-serif mt-1 font-semibold">
                    {session.boardState.craftedPotion.effect}
                  </p>
                </div>
              )}

              {/* Ingredient Picker Grid */}
              <div className="grid grid-cols-3 gap-2">
                {ALCHEMY_INGREDIENTS.map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => handleAddIngredient(ing.id)}
                    disabled={!isMyTurn || session.boardState.potionSlots?.length >= 2}
                    className="p-3 rounded-2xl bg-[#03180e] hover:bg-[#062c1b] border border-emerald-900/80 hover:border-emerald-500 text-left transition-all active:scale-95 disabled:opacity-40"
                  >
                    <div className="text-2xl mb-1">{ing.icon}</div>
                    <div className="font-cinzel text-xs font-bold text-white truncate">{ing.name}</div>
                    <div className="text-[9px] font-mono text-emerald-400">{ing.element}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={resetCauldron}
                className="px-4 py-2 rounded-xl bg-[#04160e] hover:bg-[#072517] border border-emerald-700 text-emerald-300 text-xs font-cinzel font-bold flex items-center gap-2 mx-auto transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Cauldron</span>
              </button>
            </div>
          )}

          {/* GAME 5: ANIME TRIVIA DUEL */}
          {session.gameId === 'trivia' && (
            <div className="w-full max-w-lg space-y-5 text-center">
              <div className="p-4 rounded-2xl bg-[#03150d] border border-emerald-800/80 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                  Imperial Quiz Question #{session.boardState.triviaQuestionIdx + 1}
                </span>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                  "{TRIVIA_QUESTIONS[session.boardState.triviaQuestionIdx || 0].question}"
                </h3>
              </div>

              {/* Status of Both Players */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#021009] border border-amber-500/40 flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-200">
                    Chif3n: {session.boardState.triviaAnswers?.Chif3n !== null ? 'Answer Locked! 🔒' : 'Pondering... 💭'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#021009] border border-emerald-500/40 flex items-center justify-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-200">
                    Leslye: {session.boardState.triviaAnswers?.Leslye !== null ? 'Answer Locked! 🔒' : 'Pondering... 💭'}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRIVIA_QUESTIONS[session.boardState.triviaQuestionIdx || 0].options.map((opt, idx) => {
                  const isMySelection = session.boardState.triviaAnswers?.[myRole] === idx;
                  const isRevealed = session.boardState.triviaRevealed;
                  const isCorrect = idx === TRIVIA_QUESTIONS[session.boardState.triviaQuestionIdx || 0].correct;

                  let btnStyle = 'bg-[#03170e] hover:bg-[#052618] border border-emerald-900 text-emerald-200 hover:text-white';
                  if (isRevealed) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-lg';
                    } else if (isMySelection) {
                      btnStyle = 'bg-rose-900/60 text-rose-200 border-rose-500';
                    }
                  } else if (isMySelection) {
                    btnStyle = 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg ring-2 ring-amber-300';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleTriviaAnswer(idx)}
                      disabled={isRevealed}
                      className={`p-4 rounded-2xl text-xs sm:text-sm font-serif font-bold text-left transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {session.boardState.triviaRevealed && (
                <div className="space-y-3">
                  <p className="text-xs font-serif text-amber-200 bg-amber-950/40 p-3 rounded-xl border border-amber-600/40">
                    📜 {TRIVIA_QUESTIONS[session.boardState.triviaQuestionIdx || 0].funFact}
                  </p>
                  <button
                    onClick={nextTriviaQuestion}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-cinzel font-bold text-xs shadow-lg active:scale-95 transition-all"
                  >
                    Next Trivia Scroll →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME 6: SILHOUETTE MYSTERY DUEL */}
          {session.gameId === 'silhouette-duel' && (
            <div className="w-full max-w-lg space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-[#03150d] border border-emerald-800/80 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                  Anime Silhouette Mystery
                </span>
                <p className="text-xs font-serif text-emerald-300">
                  Uncover clues together or guess the character to claim victory!
                </p>
              </div>

              {/* Obscured Portrait */}
              <div className="w-36 h-36 mx-auto rounded-3xl bg-[#020f08] border-2 border-emerald-500/60 flex items-center justify-center shadow-xl overflow-hidden relative">
                <div
                  className={`text-6xl transition-all duration-500 ${
                    session.boardState.silhouetteSolved ? 'filter-none scale-100' : 'filter brightness-0 contrast-200 blur-sm scale-110'
                  }`}
                >
                  🎭
                </div>
              </div>

              {/* Clues */}
              <div className="space-y-2 text-left">
                {currentSilhouette.hints.map((hint, idx) => {
                  const isRevealed = idx < (session.boardState.revealedHintCount || 1);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs font-serif transition-all ${
                        isRevealed
                          ? 'bg-[#042013] border-emerald-600 text-emerald-100'
                          : 'bg-[#020c06] border-emerald-950 text-zinc-600'
                      }`}
                    >
                      <span className="font-mono text-emerald-400 font-bold mr-2">Clue #{idx + 1}:</span>
                      {isRevealed ? hint : 'Locked behind the imperial veil...'}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {!session.boardState.silhouetteSolved && (
                  <>
                    <button
                      onClick={handleRevealNextHint}
                      disabled={session.boardState.revealedHintCount >= 4}
                      className="px-4 py-2 rounded-xl bg-[#04160e] hover:bg-[#072517] border border-emerald-700 text-emerald-300 text-xs font-cinzel font-bold disabled:opacity-40"
                    >
                      Unlock Next Clue
                    </button>
                    <button
                      onClick={handleSolveSilhouette}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-cinzel font-bold shadow-md"
                    >
                      I Know Who It Is!
                    </button>
                  </>
                )}

                {session.boardState.silhouetteSolved && (
                  <button
                    onClick={nextSilhouette}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-cinzel font-bold text-xs shadow-lg"
                  >
                    Next Mystery Target →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
