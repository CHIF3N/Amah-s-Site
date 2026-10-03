import React, { useState } from 'react';
import { Crown, Leaf, Heart, Sparkles, X, ShieldCheck, Check, User, KeyRound } from 'lucide-react';

export type ImperialRole = 'chif3n' | 'leslye';

interface ImperialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: ImperialRole;
  onSelectRole: (role: ImperialRole) => void;
}

export const ImperialLoginModal: React.FC<ImperialLoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole
}) => {
  const [selectedRole, setSelectedRole] = useState<ImperialRole>(currentRole);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogin = (roleToSet: ImperialRole) => {
    setSelectedRole(roleToSet);
    onSelectRole(roleToSet);
    try {
      localStorage.setItem('leslye_active_user', roleToSet);
      localStorage.setItem('leslye_game_role', roleToSet);
      localStorage.setItem(
        'leslye_chat_sender',
        roleToSet === 'leslye' ? 'Lady Leslye (Apothecary Empress) 🌿' : 'Sir Chif3n (Demigod) 👑'
      );
    } catch (e) {}

    setLoginSuccess(true);
    setTimeout(() => {
      setLoginSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-[#041a12] via-[#03110b] to-[#0a1e16] border border-amber-400/50 p-6 sm:p-7 shadow-2xl text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-emerald-500/20 border border-amber-400/40 flex items-center justify-center mx-auto shadow-lg">
            <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <span className="font-cinzel text-xs uppercase tracking-widest text-amber-300 font-bold block">
            Imperial Chamber Gate
          </span>
          <h3 className="font-cinzel text-xl sm:text-2xl font-extrabold text-white">
            Choose Your Imperial Persona
          </h3>
          <p className="text-xs text-emerald-300/80 max-w-xs mx-auto">
            Switch identity to sync your moves in the Imperial Arcade and sign your Live Love Scrolls.
          </p>
        </div>

        {/* Profile Selection Cards */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Sir Chif3n Profile */}
          <button
            onClick={() => handleConfirmLogin('chif3n')}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between space-y-3 ${
              selectedRole === 'chif3n'
                ? 'bg-amber-400/15 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                : 'bg-[#020b07] border-emerald-900/80 hover:border-amber-400/60'
            }`}
          >
            {selectedRole === 'chif3n' && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-cinzel text-sm font-bold text-white">Sir Chif3n</h4>
              <span className="text-[10px] text-amber-300/90 font-mono block">Demigod Protector 👑</span>
            </div>
            <div className="text-[10px] text-zinc-400 border-t border-emerald-950 pt-2">
              Ready to challenge Leslye in Tic-Tac-Toe & Trivia
            </div>
          </button>

          {/* Lady Leslye Profile */}
          <button
            onClick={() => handleConfirmLogin('leslye')}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between space-y-3 ${
              selectedRole === 'leslye'
                ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                : 'bg-[#020b07] border-emerald-900/80 hover:border-emerald-500/60'
            }`}
          >
            {selectedRole === 'leslye' && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-400 text-black flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-cinzel text-sm font-bold text-white">Lady Leslye</h4>
              <span className="text-[10px] text-emerald-300/90 font-mono block">Apothecary Empress 🌿</span>
            </div>
            <div className="text-[10px] text-zinc-400 border-t border-emerald-950 pt-2">
              Master mind, herb expert & ruler of this sanctuary
            </div>
          </button>
        </div>

        {/* Status announcement */}
        {loginSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-mono animate-in zoom-in-95 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Welcome, {selectedRole === 'leslye' ? 'Lady Leslye' : 'Sir Chif3n'}! Persona synced.</span>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 text-[11px] text-emerald-500/80 font-mono border-t border-emerald-950 flex items-center justify-between">
          <span>Active Persona: <strong className="text-white">{currentRole === 'leslye' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑'}</strong></span>
          <span className="text-amber-300/80">Sanctuary Sync: 100%</span>
        </div>
      </div>
    </div>
  );
};
