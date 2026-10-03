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
  Globe
} from 'lucide-react';
import { subscribeToArcadeCloud, syncArcadeToCloud } from '../services/firebase';

interface ArcadePresence {
  chif3n: boolean;
  leslye: boolean;
  lastPingChif3n: number;
  lastPingLeslye: number;
}

interface BoardGameState {
  board: (string | null)[][];
  mode: 'tictactoe' | 'gomoku';
  gridSize: number;
  currentTurn: 'chif3n' | 'leslye';
  winner: 'chif3n' | 'leslye' | 'draw' | null;
  scores: { chif3n: number; leslye: number; ties: number };
  lastMove: { row: number; col: number; player: string } | null;
}

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: string;
  funFact: string;
}

interface TriviaGameState {
  questionIndex: number;
  totalQuestions: number;
  currentQuestion: TriviaQuestion;
  answers: { chif3n: number | null; leslye: number | null };
  scores: { chif3n: number; leslye: number };
  revealed: boolean;
  roundWinner: string | null;
}

interface AlchemyCard {
  id: number;
  symbol: string;
  herbName: string;
  isMatched: boolean;
  matchedBy?: string;
}

interface AlchemyGameState {
  cards: AlchemyCard[];
  flippedIndices: number[];
  currentTurn: 'chif3n' | 'leslye';
  scores: { chif3n: number; leslye: number };
  winner: 'chif3n' | 'leslye' | 'draw' | null;
}

interface ArcadeState {
  activeGame: 'board' | 'trivia' | 'alchemy';
  boardGame: BoardGameState;
  triviaGame: TriviaGameState;
  alchemyGame: AlchemyGameState;
  presence: ArcadePresence;
  lastUpdated: number;
}

interface ImperialCoupleGameProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
}

const TRIVIA_BANK: TriviaQuestion[] = [
  {
    id: 't-1',
    question: 'In The Apothecary Diaries, what rare physical trait is Maomao famously known for having on her arm?',
    options: ['A lotus birthmark', 'Scars from deliberate poison testing', 'An imperial jade tattoo', 'A golden dragon burn'],
    correctIndex: 1,
    category: 'The Apothecary Diaries',
    difficulty: 'Imperial Court Hygiene',
    funFact: 'Maomao tested snake venom, powdered mercury, and various herbs directly on herself to study their effects!'
  },
  {
    id: 't-2',
    question: "What is Sir Chif3n's primary demigod duty whenever Lady Leslye is watching an intense cliffhanger episode?",
    options: ['Sample all snacks for poison & give shoulder massages', 'Leave the room silently', 'Pause and spoil the ending', 'Refuse to share popcorn'],
    correctIndex: 0,
    category: 'Couple Sacred Laws',
    difficulty: 'Demigod Protocol',
    funFact: 'Sacred Decree #001 states Sir Chif3n must ensure 100% boba and blanket readiness at all times.'
  },
  {
    id: 't-3',
    question: 'What dangerous substance hidden in face powder was poisoning the imperial consorts and their infants?',
    options: ['Arsenic', 'White Lead', 'Wolfsbane', 'Ground Asbestos'],
    correctIndex: 1,
    category: 'The Apothecary Diaries',
    difficulty: 'Palace Mystery',
    funFact: 'Lead was commonly used in historical cosmetic powders, causing severe toxicity in imperial nurseries.'
  },
  {
    id: 't-4',
    question: "In Frieren: Beyond Journey's End, how many years does Frieren's new journey retrace Himmel's hero party quest?",
    options: ['10 years', '20 years', '50 years', '100 years'],
    correctIndex: 0,
    category: 'Frieren Lore',
    difficulty: 'Heroic Journey',
    funFact: "The original adventure took exactly 10 years, which Frieren initially considered 'only a mere decade'."
  },
  {
    id: 't-5',
    question: 'Whenever Jinshi tries to use his heavenly handsome charms on Maomao, how does she usually react?',
    options: ['She faints from attraction', 'She gazes like inspecting a strange caterpillar or toad', 'She writes a love poem', 'She requests an imperial marriage'],
    correctIndex: 1,
    category: 'The Apothecary Diaries',
    difficulty: 'Rear Palace Comedy',
    funFact: "Jinshi is so accustomed to everyone falling for him that Maomao's cold deadpan disgust completely fascinates him!"
  },
  {
    id: 't-6',
    question: 'What sweet herbal ingredient does Maomao often infuse into soothing teas for throat ailments?',
    options: ['Licorice Root (Gan Cao)', 'Spicy Szechuan Peppercorn', 'Bitter Melon', 'Crushed Pine Needle'],
    correctIndex: 0,
    category: 'Herbal Medicine',
    difficulty: 'Imperial Pharmacology',
    funFact: 'Licorice root naturally sweetens remedies while harmonizing harsh pharmacological properties of other herbs.'
  },
  {
    id: 't-7',
    question: 'When Sir Chif3n claims his love for Lady Leslye has zero toxicity, what is the scientific purity percentage?',
    options: ['99.9%', '100% Pure Celestial Essence', 'Depends on snack supplies', '50/50'],
    correctIndex: 1,
    category: 'Couple Sacred Laws',
    difficulty: 'Demigod Vows',
    funFact: 'Imperial Physician Records confirm Sir Chif3n is permanently and incurably infatuated with Lady Leslye.'
  },
  {
    id: 't-8',
    question: 'In The Apothecary Diaries, what prized delicacy from the South Sea did Maomao analyze at the banquet for food allergies?',
    options: ['Poisoned Pufferfish', 'Sea Cucumber & Prawns', 'Caviar Tartlets', 'Salted Dried Squid'],
    correctIndex: 1,
    category: 'The Apothecary Diaries',
    difficulty: 'Palace Forensics',
    funFact: 'Maomao saved an official by discovering he had a severe crustacean/shellfish anaphylactic reaction, not poison!'
  }
];

const ALCHEMY_BASE_HERBS = [
  { symbol: '🧪', herbName: 'Angelica Root' },
  { symbol: '🌸', herbName: 'Royal Lotus' },
  { symbol: '🌿', herbName: 'Sweet Licorice' },
  { symbol: '🍄', herbName: 'Snow Fungus' },
  { symbol: '🍂', herbName: 'Osmanthus' },
  { symbol: '🏺', herbName: 'Ox-Bezoar' }
];

function generateShuffledCards(): AlchemyCard[] {
  const pairs = ALCHEMY_BASE_HERBS.flatMap((h, i) => [
    { id: i * 2, symbol: h.symbol, herbName: h.herbName, isMatched: false },
    { id: i * 2 + 1, symbol: h.symbol, herbName: h.herbName, isMatched: false }
  ]);
  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

function checkBoardWinner(board: (string | null)[][], size: number, winLength: number): 'chif3n' | 'leslye' | 'draw' | null {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const p = board[r][c];
      if (!p) continue;

      // Horizontal
      if (c + winLength <= size) {
        let win = true;
        for (let k = 0; k < winLength; k++) if (board[r][c + k] !== p) { win = false; break; }
        if (win) return p as any;
      }
      // Vertical
      if (r + winLength <= size) {
        let win = true;
        for (let k = 0; k < winLength; k++) if (board[r + k][c] !== p) { win = false; break; }
        if (win) return p as any;
      }
      // Diagonal down-right
      if (r + winLength <= size && c + winLength <= size) {
        let win = true;
        for (let k = 0; k < winLength; k++) if (board[r + k][c + k] !== p) { win = false; break; }
        if (win) return p as any;
      }
      // Diagonal up-right
      if (r - winLength + 1 >= 0 && c + winLength <= size) {
        let win = true;
        for (let k = 0; k < winLength; k++) if (board[r - k][c + k] !== p) { win = false; break; }
        if (win) return p as any;
      }
    }
  }
  const isFull = board.every((row) => row.every((cell) => cell !== null));
  if (isFull) return 'draw';
  return null;
}

const DEFAULT_ARCADE_STATE: ArcadeState = {
  activeGame: 'board',
  boardGame: {
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    mode: 'tictactoe',
    gridSize: 3,
    currentTurn: 'chif3n',
    winner: null,
    scores: { chif3n: 0, leslye: 0, ties: 0 },
    lastMove: null
  },
  triviaGame: {
    questionIndex: 0,
    totalQuestions: TRIVIA_BANK.length,
    currentQuestion: TRIVIA_BANK[0],
    answers: { chif3n: null, leslye: null },
    scores: { chif3n: 0, leslye: 0 },
    revealed: false,
    roundWinner: null
  },
  alchemyGame: {
    cards: generateShuffledCards(),
    flippedIndices: [],
    currentTurn: 'chif3n',
    scores: { chif3n: 0, leslye: 0 },
    winner: null
  },
  presence: {
    chif3n: true,
    leslye: true,
    lastPingChif3n: Date.now(),
    lastPingLeslye: Date.now()
  },
  lastUpdated: Date.now()
};

function getInitialArcadeState(): ArcadeState {
  try {
    const saved = localStorage.getItem('imperial_arcade_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.boardGame && parsed.triviaGame && parsed.alchemyGame) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_ARCADE_STATE;
}

export const ImperialCoupleGame: React.FC<ImperialCoupleGameProps> = ({
  isOpen,
  onClose,
  onOpenLoginModal
}) => {
  // Always initialize with guaranteed state so games load immediately with ZERO blank screens
  const [arcade, setArcade] = useState<ArcadeState>(() => getInitialArcadeState());
  const [activeTab, setActiveTab] = useState<'board' | 'trivia' | 'alchemy'>(() => arcade.activeGame || 'board');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('Ready');

  // Player identity
  const [myRole, setMyRole] = useState<'chif3n' | 'leslye'>(() => {
    try {
      const saved = localStorage.getItem('leslye_active_user') || localStorage.getItem('leslye_game_role');
      if (saved === 'chif3n' || saved === 'leslye') return saved;
    } catch (e) {}
    return 'chif3n';
  });

  // Pass and play toggle for when playing together on one phone
  const [passAndPlay, setPassAndPlay] = useState<boolean>(true);

  // Broadcast channel for instantaneous cross-tab/cross-window local sync
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Web Audio sound synthesizer
  const playSfx = (type: 'move' | 'win' | 'match' | 'trivia') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'match') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'trivia') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {}
  };

  // Save arcade state to local storage, broadcast channel, and Cloud Firestore!
  const persistAndBroadcast = (newState: ArcadeState) => {
    setArcade(newState);
    try {
      localStorage.setItem('imperial_arcade_state', JSON.stringify(newState));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'arcade_update', arcade: newState });
      }
    } catch (e) {}

    // Worldwide cloud sync to her phone/laptop via Cloud Firestore
    syncArcadeToCloud(newState).then((ok) => {
      if (ok) setSyncStatus('Cloud Live');
    });
  };

  // Fetch latest state from server (with graceful error handling)
  const fetchArcadeState = async () => {
    try {
      const res = await fetch('/api/game');
      if (res.ok) {
        const text = await res.text();
        // Guard against html response from 404 or SPA redirects
        if (text.startsWith('{')) {
          const json = JSON.parse(text);
          if (json.arcade) {
            setArcade(json.arcade);
            try {
              localStorage.setItem('imperial_arcade_state', JSON.stringify(json.arcade));
            } catch (e) {}
            setSyncStatus('Cloud Live');
          }
        }
      }
    } catch (e) {
      // Offline or Netlify static fallback is fully supported!
      setSyncStatus('Local Sanctum');
    }
  };

  // Ping online presence
  const sendPresencePing = async () => {
    try {
      await fetch('/api/game/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: myRole })
      });
    } catch (e) {}
  };

  // Setup broadcast channel, background sync & fallback
  useEffect(() => {
    if (!isOpen) return;

    // 1. Initialize BroadcastChannel for 0ms same-origin multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('imperial_couple_game_channel');
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === 'arcade_update' && event.data.arcade) {
          setArcade(event.data.arcade);
        }
      };
    }

    // 2. Real-time Cloud Firestore subscription: Updates instantly across different phones & laptops
    const unsubscribeCloud = subscribeToArcadeCloud((cloudArcade) => {
      if (cloudArcade && cloudArcade.boardGame) {
        setArcade((prev) => {
          if (!prev || (cloudArcade.lastUpdated && cloudArcade.lastUpdated >= (prev.lastUpdated || 0))) {
            return cloudArcade;
          }
          return prev;
        });
        setSyncStatus('Cloud Live');
      }
    });

    // 3. Fetch from backend if available
    fetchArcadeState();
    sendPresencePing();

    const interval = setInterval(() => {
      if (!passAndPlay) {
        fetchArcadeState();
      }
    }, 2000);

    return () => {
      unsubscribeCloud();
      clearInterval(interval);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [isOpen, passAndPlay]);

  const handleSelectRole = (role: 'chif3n' | 'leslye') => {
    setMyRole(role);
    try {
      localStorage.setItem('leslye_active_user', role);
      localStorage.setItem('leslye_game_role', role);
    } catch (e) {}
    sendPresencePing();
  };

  const handleSwitchTab = (gameType: 'board' | 'trivia' | 'alchemy') => {
    setActiveTab(gameType);
    const updated: ArcadeState = {
      ...arcade,
      activeGame: gameType,
      lastUpdated: Date.now()
    };
    persistAndBroadcast(updated);

    try {
      fetch('/api/game/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType })
      }).catch(() => {});
    } catch (e) {}
  };

  // ==========================================
  // GAME 1: BOARD DUEL (TIC-TAC-TOE & GOMOKU)
  // ==========================================
  const handleBoardCellClick = (row: number, col: number) => {
    const bg = arcade.boardGame;
    if (bg.winner !== null || bg.board[row][col] !== null) return;
    if (!passAndPlay && bg.currentTurn !== myRole) return;

    const movingPlayer = passAndPlay ? bg.currentTurn : myRole;
    playSfx('move');

    // Create updated board
    const newBoard = bg.board.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? movingPlayer : c))
    );

    const winLength = bg.mode === 'gomoku' ? 4 : 3;
    const winner = checkBoardWinner(newBoard, bg.gridSize, winLength);

    const newScores = { ...bg.scores };
    if (winner === 'chif3n') {
      newScores.chif3n += 1;
      playSfx('win');
    } else if (winner === 'leslye') {
      newScores.leslye += 1;
      playSfx('win');
    } else if (winner === 'draw') {
      newScores.ties += 1;
      playSfx('match');
    }

    const nextTurn = movingPlayer === 'chif3n' ? 'leslye' : 'chif3n';

    const updatedState: ArcadeState = {
      ...arcade,
      boardGame: {
        ...bg,
        board: newBoard,
        currentTurn: nextTurn,
        winner,
        scores: newScores,
        lastMove: { row, col, player: movingPlayer }
      },
      lastUpdated: Date.now()
    };

    persistAndBroadcast(updatedState);

    // Optional sync to server
    try {
      fetch('/api/game/board/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, col, player: movingPlayer })
      }).catch(() => {});
    } catch (e) {}
  };

  const handleResetBoard = () => {
    const size = arcade.boardGame.gridSize;
    const cleanBoard = Array.from({ length: size }, () => Array(size).fill(null));

    const updated: ArcadeState = {
      ...arcade,
      boardGame: {
        ...arcade.boardGame,
        board: cleanBoard,
        winner: null,
        lastMove: null
      },
      lastUpdated: Date.now()
    };
    persistAndBroadcast(updated);

    try {
      fetch('/api/game/board/reset', { method: 'POST' }).catch(() => {});
    } catch (e) {}
  };

  const handleToggleBoardMode = (mode: 'tictactoe' | 'gomoku') => {
    const size = mode === 'gomoku' ? 6 : 3;
    const cleanBoard = Array.from({ length: size }, () => Array(size).fill(null));

    const updated: ArcadeState = {
      ...arcade,
      boardGame: {
        ...arcade.boardGame,
        mode,
        gridSize: size,
        board: cleanBoard,
        winner: null,
        lastMove: null
      },
      lastUpdated: Date.now()
    };
    persistAndBroadcast(updated);

    try {
      fetch('/api/game/board/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      }).catch(() => {});
    } catch (e) {}
  };

  // ==========================================
  // GAME 2: ANIME & APOTHECARY TRIVIA
  // ==========================================
  const handleAnswerTrivia = (answerIndex: number) => {
    const tg = arcade.triviaGame;
    if (tg.revealed) return;

    playSfx('trivia');

    const answeringPlayer = passAndPlay
      ? tg.answers.chif3n === null
        ? 'chif3n'
        : 'leslye'
      : myRole;

    const newAnswers = { ...tg.answers, [answeringPlayer]: answerIndex };
    let revealed = false;
    let roundWinner = null;
    const newScores = { ...tg.scores };

    // In pass and play or when both answered, reveal!
    if (passAndPlay) {
      if (newAnswers.chif3n !== null && newAnswers.leslye !== null) {
        revealed = true;
      }
    } else {
      if (newAnswers.chif3n !== null && newAnswers.leslye !== null) {
        revealed = true;
      }
    }

    if (revealed) {
      const correct = tg.currentQuestion.correctIndex;
      if (newAnswers.chif3n === correct && newAnswers.leslye === correct) {
        newScores.chif3n += 10;
        newScores.leslye += 10;
        roundWinner = 'tie';
        playSfx('win');
      } else if (newAnswers.chif3n === correct) {
        newScores.chif3n += 10;
        roundWinner = 'chif3n';
        playSfx('win');
      } else if (newAnswers.leslye === correct) {
        newScores.leslye += 10;
        roundWinner = 'leslye';
        playSfx('win');
      } else {
        roundWinner = 'none';
      }
    }

    const updated: ArcadeState = {
      ...arcade,
      triviaGame: {
        ...tg,
        answers: newAnswers,
        scores: newScores,
        revealed,
        roundWinner
      },
      lastUpdated: Date.now()
    };

    persistAndBroadcast(updated);

    try {
      fetch('/api/game/trivia/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: answeringPlayer, answerIndex })
      }).catch(() => {});
    } catch (e) {}
  };

  const handleNextTrivia = () => {
    const tg = arcade.triviaGame;
    const nextIdx = (tg.questionIndex + 1) % TRIVIA_BANK.length;

    const updated: ArcadeState = {
      ...arcade,
      triviaGame: {
        ...tg,
        questionIndex: nextIdx,
        currentQuestion: TRIVIA_BANK[nextIdx],
        answers: { chif3n: null, leslye: null },
        revealed: false,
        roundWinner: null
      },
      lastUpdated: Date.now()
    };
    persistAndBroadcast(updated);

    try {
      fetch('/api/game/trivia/next', { method: 'POST' }).catch(() => {});
    } catch (e) {}
  };

  // ==========================================
  // GAME 3: ALCHEMY HERB MEMORY MATCH-2
  // ==========================================
  const handleAlchemyFlip = (cardIndex: number) => {
    const ag = arcade.alchemyGame;
    if (ag.winner !== null) return;
    if (!passAndPlay && ag.currentTurn !== myRole) return;
    if (ag.cards[cardIndex].isMatched || ag.flippedIndices.includes(cardIndex)) return;
    if (ag.flippedIndices.length >= 2) return;

    playSfx('move');

    const flippingPlayer = passAndPlay ? ag.currentTurn : myRole;
    const newFlipped = [...ag.flippedIndices, cardIndex];

    const updatedAg: AlchemyGameState = {
      ...ag,
      flippedIndices: newFlipped
    };

    // If 2 cards are now flipped, evaluate match!
    if (newFlipped.length === 2) {
      const [idx1, idx2] = newFlipped;
      const card1 = ag.cards[idx1];
      const card2 = ag.cards[idx2];

      if (card1.symbol === card2.symbol) {
        // MATCH!
        playSfx('match');
        const updatedCards = ag.cards.map((c, i) =>
          i === idx1 || i === idx2 ? { ...c, isMatched: true, matchedBy: flippingPlayer } : c
        );
        const newScores = {
          ...ag.scores,
          [flippingPlayer]: ag.scores[flippingPlayer] + 10
        };

        let winner: 'chif3n' | 'leslye' | 'draw' | null = null;
        if (updatedCards.every((c) => c.isMatched)) {
          if (newScores.chif3n > newScores.leslye) winner = 'chif3n';
          else if (newScores.leslye > newScores.chif3n) winner = 'leslye';
          else winner = 'draw';
          playSfx('win');
        }

        updatedAg.cards = updatedCards;
        updatedAg.scores = newScores;
        updatedAg.flippedIndices = [];
        updatedAg.winner = winner;
      } else {
        // NO MATCH: flip back after 1.1s
        setTimeout(() => {
          setArcade((prev) => {
            const nextTurn = flippingPlayer === 'chif3n' ? 'leslye' : 'chif3n';
            const state: ArcadeState = {
              ...prev,
              alchemyGame: {
                ...prev.alchemyGame,
                flippedIndices: [],
                currentTurn: nextTurn
              },
              lastUpdated: Date.now()
            };
            persistAndBroadcast(state);
            return state;
          });
        }, 1100);
      }
    }

    const updatedState: ArcadeState = {
      ...arcade,
      alchemyGame: updatedAg,
      lastUpdated: Date.now()
    };
    persistAndBroadcast(updatedState);
  };

  const handleResetAlchemy = () => {
    const updated: ArcadeState = {
      ...arcade,
      alchemyGame: {
        cards: generateShuffledCards(),
        flippedIndices: [],
        currentTurn: 'chif3n',
        scores: { chif3n: 0, leslye: 0 },
        winner: null
      },
      lastUpdated: Date.now()
    };
    persistAndBroadcast(updated);
  };

  if (!isOpen) return null;

  const boardGame = arcade.boardGame;
  const triviaGame = arcade.triviaGame;
  const alchemyGame = arcade.alchemyGame;
  const presence = arcade.presence;

  const isMyBoardTurn = (passAndPlay || boardGame.currentTurn === myRole) && boardGame.winner === null;
  const isMyAlchemyTurn = (passAndPlay || alchemyGame.currentTurn === myRole) && alchemyGame.winner === null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-gradient-to-br from-[#0c2419] via-[#05140e] to-[#140b17] border border-amber-400/50 p-5 sm:p-6 shadow-2xl space-y-4 text-center overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Close */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div className="flex items-center gap-2.5 text-left">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                  Imperial Palace Arcade 🎮
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-900/80 text-emerald-300 border border-emerald-600/40">
                  {syncStatus}
                </span>
              </div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                Demigod Chif3n vs Apothecary Leslye
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presence & Role Switcher */}
        <div className="p-2.5 rounded-xl bg-[#04120a] border border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Identity */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-[11px] text-emerald-400 font-mono">You are:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSelectRole('chif3n')}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                  myRole === 'chif3n'
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                    : 'bg-[#030e08] text-amber-300/70 border-emerald-900 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Sir Chif3n 👑</span>
              </button>
              <button
                onClick={() => handleSelectRole('leslye')}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                  myRole === 'leslye'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                    : 'bg-[#030e08] text-emerald-300/70 border-emerald-900 hover:text-white'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Lady Leslye 🌿</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher: Single Device vs Dual Phone */}
          <button
            onClick={() => setPassAndPlay(!passAndPlay)}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] transition-all flex items-center gap-1 ${
              passAndPlay
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-bold'
                : 'bg-emerald-950 text-emerald-300 border-emerald-700'
            }`}
            title="Toggle between playing on one phone vs 2 different phones"
          >
            {passAndPlay ? (
              <>
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>📱 1-Phone (Take Turns)</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>🌐 Dual-Phone Sync</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Games Navigation Pill Row */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#030e08] border border-emerald-900/60 text-xs">
          <button
            onClick={() => handleSwitchTab('board')}
            className={`py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'board'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-md'
                : 'text-zinc-400 hover:text-emerald-200 hover:bg-emerald-950/40'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="truncate">Board Duel ⚔️</span>
          </button>

          <button
            onClick={() => handleSwitchTab('trivia')}
            className={`py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'trivia'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-rose-200 hover:bg-emerald-950/40'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="truncate">Anime Trivia 🧠</span>
          </button>

          <button
            onClick={() => handleSwitchTab('alchemy')}
            className={`py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'alchemy'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-emerald-200 hover:bg-emerald-950/40'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="truncate">Herb Memory 🧪</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* GAME 1: IMPERIAL BOARD DUEL (TIC-TAC-TOE & GOMOKU)       */}
        {/* ======================================================== */}
        {activeTab === 'board' && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Mode & Scores */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#030e08] p-1 rounded-lg border border-emerald-900/60 text-xs">
                <button
                  onClick={() => handleToggleBoardMode('tictactoe')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    boardGame.mode === 'tictactoe'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  3x3 Quick Duel
                </button>
                <button
                  onClick={() => handleToggleBoardMode('gomoku')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    boardGame.mode === 'gomoku'
                      ? 'bg-amber-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  6x6 Grand Gomoku (4-in-a-row)
                </button>
              </div>

              <button
                onClick={handleResetBoard}
                className="px-2.5 py-1 rounded-lg bg-[#04120a] hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800 text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Grid</span>
              </button>
            </div>

            {/* Scoreboard */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-[#06180f] border border-amber-400/40">
                <span className="text-[10px] text-amber-300 font-cinzel block">Sir Chif3n 👑</span>
                <span className="text-xl font-bold font-mono text-white">{boardGame.scores.chif3n}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#04100b] border border-emerald-900">
                <span className="text-[10px] text-emerald-400 font-cinzel block">Ties 🤝</span>
                <span className="text-xl font-bold font-mono text-zinc-300">{boardGame.scores.ties}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#06180f] border border-emerald-500/40">
                <span className="text-[10px] text-emerald-300 font-cinzel block">Lady Leslye 🌿</span>
                <span className="text-xl font-bold font-mono text-white">{boardGame.scores.leslye}</span>
              </div>
            </div>

            {/* Turn or Winner Announcement */}
            {boardGame.winner ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-rose-500/20 border border-amber-400/50 animate-in zoom-in-95">
                <span className="font-cinzel text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {boardGame.winner === 'draw'
                      ? 'Sacred Stalemate! Equal apothecary intellects.'
                      : boardGame.winner === 'chif3n'
                      ? 'Sir Chif3n Wins! Lady Leslye owes him a cozy cuddle.'
                      : 'Lady Leslye Wins! Sir Chif3n must brew her fresh tea & snacks!'}
                  </span>
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-[#05170e] border border-emerald-800/80 text-xs font-mono flex items-center justify-center gap-2">
                <span>Current Turn:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  boardGame.currentTurn === 'chif3n' ? 'text-amber-300' : 'text-emerald-400'
                }`}>
                  {boardGame.currentTurn === 'chif3n' ? '👑 Sir Chif3n' : '🌿 Lady Leslye'}
                  {passAndPlay ? '(Take Turn)' : isMyBoardTurn ? '· YOUR TURN!' : '· Waiting...'}
                </span>
              </div>
            )}

            {/* Board Grid */}
            <div
              className={`grid gap-2 mx-auto ${
                boardGame.gridSize === 3 ? 'grid-cols-3 max-w-[280px]' : 'grid-cols-6 max-w-[340px]'
              }`}
            >
              {boardGame.board.map((row, rIdx) =>
                row.map((cell, cIdx) => (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => handleBoardCellClick(rIdx, cIdx)}
                    disabled={cell !== null || boardGame.winner !== null || (!passAndPlay && !isMyBoardTurn)}
                    className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${
                      cell === null
                        ? 'bg-[#030e08]/90 border-emerald-800/70 hover:border-amber-400/80 hover:bg-[#061e12] active:scale-95'
                        : cell === 'chif3n'
                        ? 'bg-amber-400/20 border-amber-400 shadow-md shadow-amber-950/40'
                        : 'bg-emerald-500/20 border-emerald-400 shadow-md shadow-emerald-950/40'
                    }`}
                  >
                    {cell === 'chif3n' && (
                      <span className="text-2xl sm:text-3xl animate-in zoom-in-75">👑</span>
                    )}
                    {cell === 'leslye' && (
                      <span className="text-2xl sm:text-3xl animate-in zoom-in-75">🌿</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GAME 2: ANIME & APOTHECARY TRIVIA                        */}
        {/* ======================================================== */}
        {activeTab === 'trivia' && (
          <div className="space-y-4 animate-in fade-in text-left">
            {/* Header / Category & Score */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-900/60">
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-cinzel text-amber-300 font-bold">
                  {triviaGame.currentQuestion.category} · Question {triviaGame.questionIndex + 1}/{triviaGame.totalQuestions}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-amber-300">Chif3n: {triviaGame.scores.chif3n}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-emerald-400">Leslye: {triviaGame.scores.leslye}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-xl bg-[#04120a] border border-emerald-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-emerald-500 font-bold block">
                {triviaGame.currentQuestion.difficulty}
              </span>
              <p className="font-serif text-sm sm:text-base text-white leading-relaxed font-semibold">
                "{triviaGame.currentQuestion.question}"
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-2">
              {triviaGame.currentQuestion.options.map((opt, idx) => {
                const isCorrect = idx === triviaGame.currentQuestion.correctIndex;
                const isSelectedByChif3n = triviaGame.answers.chif3n === idx;
                const isSelectedByLeslye = triviaGame.answers.leslye === idx;

                let optStyle = 'bg-[#030e08] border-emerald-900/80 hover:border-emerald-600 text-emerald-100';
                if (triviaGame.revealed) {
                  if (isCorrect) {
                    optStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 font-bold ring-1 ring-emerald-400';
                  } else if (isSelectedByChif3n || isSelectedByLeslye) {
                    optStyle = 'bg-rose-950/40 border-rose-600/60 text-rose-300 line-through opacity-70';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerTrivia(idx)}
                    disabled={triviaGame.revealed}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${optStyle}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 h-5 rounded-md bg-black/60 border border-emerald-900 flex items-center justify-center font-mono text-[10px] shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>

                    {/* Reveal badging */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isSelectedByChif3n && <span className="text-xs" title="Chif3n Chose This">👑</span>}
                      {isSelectedByLeslye && <span className="text-xs" title="Leslye Chose This">🌿</span>}
                      {triviaGame.revealed && isCorrect && (
                        <Check className="w-4 h-4 text-emerald-400 ml-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Reveal Fun Fact & Next Question Button */}
            {triviaGame.revealed && (
              <div className="p-3.5 rounded-xl bg-[#061e12] border border-amber-400/50 space-y-2 animate-in zoom-in-95">
                <div className="flex items-center gap-2 text-amber-300 font-cinzel text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {triviaGame.roundWinner === 'tie'
                      ? 'Both Got It Right! +10 Points to Both ❤️'
                      : triviaGame.roundWinner === 'chif3n'
                      ? 'Sir Chif3n Scored! +10 Points 👑'
                      : triviaGame.roundWinner === 'leslye'
                      ? 'Lady Leslye Scored! +10 Points 🌿'
                      : 'Neither got it! The palace mystery remains deep.'}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-serif italic">
                  💡 {triviaGame.currentQuestion.funFact}
                </p>
                <div className="pt-2 text-right">
                  <button
                    onClick={handleNextTrivia}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-xs shadow-md"
                  >
                    Next Question →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* GAME 3: ALCHEMY HERB MEMORY MATCH-2                      */}
        {/* ======================================================== */}
        {activeTab === 'alchemy' && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Header & Scores */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-900/60">
              <span className="font-cinzel text-amber-300 font-bold">
                12-Herb Match-2 Sanctuary Duel
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-amber-300">Chif3n: {alchemyGame.scores.chif3n}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-emerald-400">Leslye: {alchemyGame.scores.leslye}</span>
              </div>
            </div>

            {/* Winner or Current Turn */}
            {alchemyGame.winner ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-rose-500/20 border border-amber-400/50 animate-in zoom-in-95">
                <span className="font-cinzel text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {alchemyGame.winner === 'draw'
                      ? 'Tie! Both are master herbalists.'
                      : alchemyGame.winner === 'chif3n'
                      ? 'Sir Chif3n Mastered the Herbs! 👑'
                      : 'Lady Leslye Reigns Supreme! 🌿'}
                  </span>
                </span>
                <button
                  onClick={handleResetAlchemy}
                  className="mt-2 px-3 py-1 rounded-lg bg-amber-400 text-black font-bold text-xs"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#05170e] border border-emerald-800 text-xs font-mono">
                <span>Turn:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  alchemyGame.currentTurn === 'chif3n' ? 'text-amber-300' : 'text-emerald-400'
                }`}>
                  {alchemyGame.currentTurn === 'chif3n' ? '👑 Sir Chif3n' : '🌿 Lady Leslye'}
                  {passAndPlay ? '(Tap 2 Cards)' : isMyAlchemyTurn ? '· YOUR TURN!' : '· Waiting...'}
                </span>
                <button
                  onClick={handleResetAlchemy}
                  className="text-zinc-400 hover:text-white text-[10px]"
                >
                  Reshuffle
                </button>
              </div>
            )}

            {/* 12 Cards Grid (3x4) */}
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
              {alchemyGame.cards.map((card, idx) => {
                const isFlipped = alchemyGame.flippedIndices.includes(idx) || card.isMatched;

                return (
                  <button
                    key={card.id}
                    onClick={() => handleAlchemyFlip(idx)}
                    disabled={isFlipped || (!passAndPlay && !isMyAlchemyTurn) || alchemyGame.winner !== null}
                    className={`aspect-square rounded-xl border p-1 flex flex-col items-center justify-center transition-all ${
                      card.isMatched
                        ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
                        : isFlipped
                        ? 'bg-amber-400/20 border-amber-400 text-white animate-in zoom-in-75'
                        : 'bg-[#03110a] border-emerald-900/80 hover:border-emerald-600 hover:bg-[#051e12] active:scale-95'
                    }`}
                  >
                    {isFlipped ? (
                      <>
                        <span className="text-2xl">{card.symbol}</span>
                        <span className="text-[8px] font-mono truncate max-w-full text-emerald-300 mt-0.5">
                          {card.herbName.split(' ')[0]}
                        </span>
                      </>
                    ) : (
                      <div className="w-full h-full rounded-lg border border-dashed border-emerald-800/60 flex items-center justify-center text-emerald-700 font-serif text-sm">
                        🌿
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 text-[10px] text-emerald-500/80 font-mono border-t border-emerald-950 flex items-center justify-between">
          <span>Active Role: <strong className="text-white">{myRole === 'leslye' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑'}</strong></span>
          <button
            onClick={onOpenLoginModal}
            className="text-amber-300 underline font-semibold hover:text-white"
          >
            Switch Profile
          </button>
        </div>
      </div>
    </div>
  );
};
