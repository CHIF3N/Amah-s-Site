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
  Flame
} from 'lucide-react';

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

interface TriviaGameState {
  questionIndex: number;
  totalQuestions: number;
  currentQuestion: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    category: string;
    difficulty: string;
    funFact: string;
  };
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
}

export const ImperialCoupleGame: React.FC<ImperialCoupleGameProps> = ({ isOpen, onClose }) => {
  const [arcade, setArcade] = useState<ArcadeState | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'trivia' | 'alchemy'>('board');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Player identity
  const [myRole, setMyRole] = useState<'chif3n' | 'leslye'>(() => {
    try {
      const saved = localStorage.getItem('leslye_game_role');
      if (saved === 'chif3n' || saved === 'leslye') return saved;
    } catch (e) {}
    return 'chif3n';
  });

  // Pass and play toggle for when playing together on one phone
  const [passAndPlay, setPassAndPlay] = useState<boolean>(false);

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
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
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

  // Fetch latest state from server
  const fetchArcadeState = async () => {
    try {
      const res = await fetch('/api/game');
      if (res.ok) {
        const json = await res.json();
        if (json.arcade) {
          setArcade(json.arcade);
          if (json.arcade.activeGame) {
            setActiveTab(json.arcade.activeGame);
          }
        }
      }
    } catch (e) {}
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

  // Setup WebSocket connection and polling fallback
  useEffect(() => {
    if (!isOpen) return;

    fetchArcadeState();
    sendPresencePing();

    const interval = setInterval(() => {
      fetchArcadeState();
      sendPresencePing();
    }, 1500);

    // WebSocket connection for instant 0ms latency moves across phones
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'arcade_update' && data.arcade) {
            setArcade(data.arcade);
            if (data.arcade.activeGame) {
              setActiveTab(data.arcade.activeGame);
            }
          } else if (data.type === 'init' && data.arcade) {
            setArcade(data.arcade);
          }
        } catch (err) {}
      };
    } catch (err) {}

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [isOpen, myRole]);

  const handleSelectRole = (role: 'chif3n' | 'leslye') => {
    setMyRole(role);
    try {
      localStorage.setItem('leslye_game_role', role);
    } catch (e) {}
    sendPresencePing();
  };

  const handleSwitchTab = async (gameType: 'board' | 'trivia' | 'alchemy') => {
    setActiveTab(gameType);
    try {
      await fetch('/api/game/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType })
      });
    } catch (e) {}
  };

  // -------------------------
  // GAME 1: Board Game Move
  // -------------------------
  const handleBoardCellClick = async (row: number, col: number) => {
    if (!arcade) return;
    const bg = arcade.boardGame;
    if (bg.winner !== null || bg.board[row][col] !== null) return;
    if (!passAndPlay && bg.currentTurn !== myRole) return;

    const movingPlayer = passAndPlay ? bg.currentTurn : myRole;

    // Optimistic local update
    const updated = bg.board.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? movingPlayer : c))
    );
    setArcade((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        boardGame: {
          ...prev.boardGame,
          board: updated,
          currentTurn: movingPlayer === 'chif3n' ? 'leslye' : 'chif3n'
        }
      };
    });

    playSfx('move');
    setIsSyncing(true);

    try {
      const res = await fetch('/api/game/board/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, col, player: movingPlayer })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.arcade) {
          setArcade(json.arcade);
          if (json.arcade.boardGame.winner) playSfx('win');
        }
      }
    } catch (e) {
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetBoard = async () => {
    try {
      const res = await fetch('/api/game/board/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.arcade) setArcade(json.arcade);
      }
    } catch (e) {}
  };

  const handleToggleBoardMode = async (mode: 'tictactoe' | 'gomoku') => {
    try {
      const res = await fetch('/api/game/board/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.arcade) setArcade(json.arcade);
      }
    } catch (e) {}
  };

  // -------------------------
  // GAME 2: Trivia Answers
  // -------------------------
  const handleAnswerTrivia = async (answerIndex: number) => {
    if (!arcade) return;
    const tg = arcade.triviaGame;
    if (tg.revealed) return;

    const answeringPlayer = passAndPlay ? (tg.answers.chif3n === null ? 'chif3n' : 'leslye') : myRole;

    playSfx('trivia');
    try {
      const res = await fetch('/api/game/trivia/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: answeringPlayer, answerIndex })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.arcade) {
          setArcade(json.arcade);
          if (json.arcade.triviaGame.revealed) playSfx('match');
        }
      }
    } catch (e) {}
  };

  const handleNextTrivia = async () => {
    try {
      const res = await fetch('/api/game/trivia/next', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.arcade) setArcade(json.arcade);
      }
    } catch (e) {}
  };

  // -------------------------
  // GAME 3: Alchemy Card Flip
  // -------------------------
  const handleAlchemyFlip = async (cardIndex: number) => {
    if (!arcade) return;
    const ag = arcade.alchemyGame;
    if (ag.winner !== null) return;
    if (!passAndPlay && ag.currentTurn !== myRole) return;
    if (ag.cards[cardIndex].isMatched || ag.flippedIndices.includes(cardIndex)) return;

    const flippingPlayer = passAndPlay ? ag.currentTurn : myRole;

    playSfx('move');
    try {
      const res = await fetch('/api/game/alchemy/flip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIndex, player: flippingPlayer })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.arcade) {
          setArcade(json.arcade);
          if (json.arcade.alchemyGame.winner) playSfx('win');
        }
      }
    } catch (e) {}
  };

  const handleResetAlchemy = async () => {
    try {
      const res = await fetch('/api/game/alchemy/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.arcade) setArcade(json.arcade);
      }
    } catch (e) {}
  };

  if (!isOpen) return null;

  const boardGame = arcade?.boardGame;
  const triviaGame = arcade?.triviaGame;
  const alchemyGame = arcade?.alchemyGame;
  const presence = arcade?.presence;

  const isMyBoardTurn = boardGame ? (passAndPlay || boardGame.currentTurn === myRole) && boardGame.winner === null : false;
  const isMyAlchemyTurn = alchemyGame ? (passAndPlay || alchemyGame.currentTurn === myRole) && alchemyGame.winner === null : false;

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
                  Live 2-Player IRL
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
            <span className="text-[11px] text-emerald-400 font-mono">Playing as:</span>
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

          {/* Online Presence Status */}
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${presence?.chif3n ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
              <span className={presence?.chif3n ? 'text-emerald-300' : 'text-zinc-500'}>
                Chif3n {presence?.chif3n ? 'Online' : 'Offline'}
              </span>
            </div>
            <span className="text-zinc-600">·</span>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${presence?.leslye ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
              <span className={presence?.leslye ? 'text-emerald-300' : 'text-zinc-500'}>
                Leslye {presence?.leslye ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
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
        {activeTab === 'board' && boardGame && (
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

              {/* Pass and Play local toggle */}
              <button
                onClick={() => setPassAndPlay(!passAndPlay)}
                className={`text-[10px] px-2 py-1 rounded-md border font-mono transition-all ${
                  passAndPlay
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                    : 'bg-[#030e08] text-zinc-500 border-zinc-800'
                }`}
              >
                {passAndPlay ? '📱 Single-Device Mode' : '🌐 Real-Time 2 Phones'}
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
              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className={isMyBoardTurn ? 'text-amber-300 font-bold' : 'text-emerald-400/80'}>
                  {isMyBoardTurn
                    ? 'Your turn! Tap an empty tile to place your royal token.'
                    : `Waiting for ${boardGame.currentTurn === 'chif3n' ? 'Sir Chif3n' : 'Lady Leslye'} to move...`}
                </span>
              </div>
            )}

            {/* Board Grid */}
            <div
              className={`grid gap-1.5 p-3 rounded-2xl bg-[#030c08] border border-emerald-900/80 mx-auto shadow-inner ${
                boardGame.gridSize === 6
                  ? 'grid-cols-6 max-w-[340px] aspect-square'
                  : 'grid-cols-3 max-w-[280px] aspect-square'
              }`}
            >
              {boardGame.board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isChif3n = cell === 'chif3n';
                  const isLeslye = cell === 'leslye';

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleBoardCellClick(rIdx, cIdx)}
                      disabled={cell !== null || boardGame.winner !== null || !isMyBoardTurn}
                      className={`rounded-xl border transition-all flex items-center justify-center select-none ${
                        boardGame.gridSize === 6 ? 'text-base p-1' : 'text-3xl'
                      } ${
                        cell === null
                          ? isMyBoardTurn
                            ? 'border-emerald-800/80 hover:border-amber-400 hover:bg-emerald-950/40 cursor-pointer active:scale-95'
                            : 'border-emerald-950 opacity-60 cursor-not-allowed'
                          : isChif3n
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md'
                          : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                      }`}
                    >
                      {isChif3n && <Crown className={`${boardGame.gridSize === 6 ? 'w-5 h-5' : 'w-8 h-8'} text-amber-300 fill-amber-300/40`} />}
                      {isLeslye && <Leaf className={`${boardGame.gridSize === 6 ? 'w-5 h-5' : 'w-8 h-8'} text-emerald-400 fill-emerald-400/40`} />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Reset Board Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[10px] text-emerald-500 font-mono">
                {boardGame.mode === 'gomoku' ? 'Connect 4 in a row to win' : 'Classic 3 in a row'}
              </span>
              <button
                onClick={handleResetBoard}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{boardGame.winner ? 'Next Round' : 'Reset Grid'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GAME 2: DEMIGOD & ANIME TRIVIA SHOWDOWN                  */}
        {/* ======================================================== */}
        {activeTab === 'trivia' && triviaGame && (
          <div className="space-y-3.5 animate-in fade-in text-left">
            {/* Trivia Header & Scoreboard */}
            <div className="flex items-center justify-between bg-[#030e08] p-2.5 rounded-xl border border-rose-900/60">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-500/40">
                  Question #{triviaGame.questionIndex + 1} / {triviaGame.totalQuestions}
                </span>
                <span className="text-xs text-amber-300 font-cinzel">
                  {triviaGame.currentQuestion.category}
                </span>
              </div>

              {/* Live Scores */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-amber-300 font-bold">Chif3n: {triviaGame.scores.chif3n} pts</span>
                <span className="text-zinc-600">|</span>
                <span className="text-emerald-300 font-bold">Leslye: {triviaGame.scores.leslye} pts</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-xl bg-[#04120a] border border-amber-400/40 space-y-2">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">
                [ {triviaGame.currentQuestion.difficulty} ]
              </span>
              <h4 className="font-serif text-sm sm:text-base text-white font-semibold leading-relaxed">
                "{triviaGame.currentQuestion.question}"
              </h4>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {triviaGame.currentQuestion.options.map((option, optIdx) => {
                const isCorrect = optIdx === triviaGame.currentQuestion.correctIndex;
                const myAnswer = triviaGame.answers[myRole];
                const isSelectedByMe = myAnswer === optIdx;
                const chif3nPick = triviaGame.answers.chif3n === optIdx;
                const leslyePick = triviaGame.answers.leslye === optIdx;

                let btnStyle = "bg-[#030c08] border-emerald-900/80 text-emerald-100 hover:border-amber-400 hover:bg-emerald-950/40";
                if (triviaGame.revealed) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600/30 border-emerald-400 text-emerald-200 font-bold";
                  } else if (isSelectedByMe) {
                    btnStyle = "bg-rose-950/40 border-rose-500 text-rose-300";
                  } else {
                    btnStyle = "bg-[#030c08] border-zinc-900 text-zinc-500 opacity-60";
                  }
                } else if (isSelectedByMe) {
                  btnStyle = "bg-amber-400/20 border-amber-400 text-amber-200 font-bold";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswerTrivia(optIdx)}
                    disabled={triviaGame.revealed || myAnswer !== null}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                  >
                    <span>{option}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {triviaGame.revealed && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {chif3nPick && <span title="Chif3n's Pick"><Crown className="w-3.5 h-3.5 text-amber-300" /></span>}
                      {leslyePick && <span title="Leslye's Pick"><Leaf className="w-3.5 h-3.5 text-emerald-400" /></span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Revealed Fun Fact & Next CTA */}
            {triviaGame.revealed ? (
              <div className="p-3 rounded-xl bg-[#06180f] border border-emerald-500/50 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apothecary Lore & Fun Fact:</span>
                  </span>
                  <button
                    onClick={handleNextTrivia}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold text-xs shadow-md active:scale-95"
                  >
                    Next Question ➔
                  </button>
                </div>
                <p className="text-xs text-emerald-200 italic font-serif leading-relaxed">
                  {triviaGame.currentQuestion.funFact}
                </p>
              </div>
            ) : (
              <div className="text-center text-xs font-mono text-emerald-400/80 pt-1">
                {triviaGame.answers[myRole] !== null
                  ? "✓ Answer locked in! Waiting for your partner's answer to reveal scores..."
                  : "Pick your answer! +10 Points for the correct answer."}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* GAME 3: HERBAL ALCHEMY MEMORY DUEL                       */}
        {/* ======================================================== */}
        {activeTab === 'alchemy' && alchemyGame && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Header & Scoreboard */}
            <div className="flex items-center justify-between bg-[#030e08] p-2.5 rounded-xl border border-emerald-900/60 text-xs">
              <span className="text-[11px] text-emerald-300 font-cinzel">
                Apothecary Potion Alchemy
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-amber-300 font-bold">Chif3n: {alchemyGame.scores.chif3n} 🧪</span>
                <span className="text-zinc-600">|</span>
                <span className="text-emerald-300 font-bold">Leslye: {alchemyGame.scores.leslye} 🧪</span>
              </div>
            </div>

            {/* Turn Announcement */}
            {alchemyGame.winner ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-amber-400/50">
                <span className="font-cinzel text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>
                    {alchemyGame.winner === 'draw'
                      ? "Equal Potion Masters! A perfect tie."
                      : `${alchemyGame.winner === 'chif3n' ? 'Sir Chif3n' : 'Lady Leslye'} is the Supreme Imperial Apothecary!`}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className={isMyAlchemyTurn ? 'text-amber-300 font-bold' : 'text-emerald-400/80'}>
                  {isMyAlchemyTurn
                    ? "Your turn! Flip 2 imperial herb tiles to brew a potion match."
                    : `Waiting for ${alchemyGame.currentTurn === 'chif3n' ? 'Sir Chif3n' : 'Lady Leslye'} to flip...`}
                </span>
              </div>
            )}

            {/* 16-Card Memory Grid (4x4) */}
            <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto">
              {alchemyGame.cards.map((card, idx) => {
                const isFlipped = alchemyGame.flippedIndices.includes(idx) || card.isMatched;

                return (
                  <button
                    key={card.id}
                    onClick={() => handleAlchemyFlip(idx)}
                    disabled={card.isMatched || alchemyGame.flippedIndices.includes(idx) || !isMyAlchemyTurn}
                    className={`aspect-square rounded-xl border transition-all flex flex-col items-center justify-center select-none text-2xl shadow-md ${
                      isFlipped
                        ? card.isMatched
                          ? card.matchedBy === 'chif3n'
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                            : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-emerald-950/80 border-amber-400/80 text-white'
                        : isMyAlchemyTurn
                        ? 'bg-[#030e08] border-emerald-900 hover:border-amber-400 cursor-pointer active:scale-95'
                        : 'bg-[#020a06] border-emerald-950 opacity-60'
                    }`}
                  >
                    {isFlipped ? (
                      <>
                        <span>{card.symbol}</span>
                        <span className="text-[8px] font-mono text-emerald-300 truncate max-w-full px-1">
                          {card.herbName}
                        </span>
                      </>
                    ) : (
                      <span className="text-emerald-700 text-lg">🧪</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reset Alchemy Deck */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[10px] text-emerald-500 font-mono">
                Match pairs to brew potions & score +10 pts
              </span>
              <button
                onClick={handleResetAlchemy}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reshuffle Potions</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer couple note */}
        <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-xs">
          <span className="text-[10px] text-emerald-400/80 font-mono">
            Synced live via WebSocket across both phones
          </span>

          <span className="text-[10px] text-amber-300/80 font-mono flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>Loser owes a royal cuddle!</span>
          </span>
        </div>
      </div>
    </div>
  );
};
