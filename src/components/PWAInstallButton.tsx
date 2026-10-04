import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Crown, Sparkles, Check, Info, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedGuideTab, setSelectedGuideTab] = useState<'chrome' | 'ios'>(() => {
    return typeof navigator !== 'undefined' && /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
      ? 'ios'
      : 'chrome';
  });

  // If running as standalone app, hide the install button
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleCopyCurrentLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 group"
        title="Install Leslye's Realm directly to your Phone Home Screen as an App"
      >
        <Download className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span>Install App</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#03150d] border border-emerald-500/60 p-6 shadow-2xl text-emerald-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white">Install to Phone (PWA)</h3>
                <span className="text-[10px] font-mono text-emerald-400">Direct Home Screen Web App</span>
              </div>
            </div>

            <p className="text-xs text-emerald-200/90 mb-3 font-serif">
              Install <strong>Leslye's Realm</strong> directly to your Android Chrome or iPhone home screen. Enjoy full-screen anime streaming, zero address bar distractions, offline caching, and real-time love alerts!
            </p>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
              <button
                onClick={() => setSelectedGuideTab('chrome')}
                className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  selectedGuideTab === 'chrome'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-[#020e09] border-emerald-950 text-emerald-400/70 hover:text-white'
                }`}
              >
                <span>Android / Chrome</span>
              </button>
              <button
                onClick={() => setSelectedGuideTab('ios')}
                className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  selectedGuideTab === 'ios'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-[#020e09] border-emerald-950 text-emerald-400/70 hover:text-white'
                }`}
              >
                <span>iPhone / Safari</span>
              </button>
            </div>

            {selectedGuideTab === 'chrome' ? (
              <div className="space-y-3 text-xs bg-[#010c07] p-4 rounded-2xl border border-emerald-900/60 font-mono">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                  <span>Open this link in <strong>Google Chrome</strong> on your phone. Tap the <strong>Three Dots (⋮)</strong> menu in the top right.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                  <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                  <span>Tap <strong>Install</strong>. Leslye's Realm will appear as an app icon with Maomao's emblem on your phone home screen!</span>
                </div>

                <div className="pt-2 border-t border-emerald-950 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-400">In an in-app browser? Copy link:</span>
                  <button
                    onClick={handleCopyCurrentLink}
                    className="px-2 py-1 rounded bg-[#04140e] border border-emerald-800 text-[10px] text-emerald-300 flex items-center gap-1 active:scale-95"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copied URL!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs bg-[#010c07] p-4 rounded-2xl border border-emerald-900/60 font-mono">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-900 border border-emerald-500 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                  <span>Tap the <strong>Share icon</strong> (square with arrow pointing up) at the bottom of Safari.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-900 border border-emerald-500 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                  <span>Scroll down and select <strong>"Add to Home Screen"</strong> (➕).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-900 border border-emerald-500 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner. Complete full-screen immersion!</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-cinzel font-bold text-xs tracking-wider shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tap to Install Web App</span>
                </button>
              )}
              <button
                onClick={() => setShowGuideModal(false)}
                className="py-2.5 px-4 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 font-cinzel font-bold text-xs active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Mobile-specific floating action invitation banner that gently prompts Lady Leslye to install to her phone
 */
export const PWAMobileFloatingBanner: React.FC = () => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showModal, setShowModal] = useState(false);

  if (isInstalled || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch (e) {}
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="md:hidden fixed top-16 left-3 right-3 z-30 p-2.5 rounded-2xl bg-[#03150dee]/95 backdrop-blur-md border border-amber-400/50 shadow-2xl flex items-center justify-between gap-2.5 animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-cinzel font-bold text-white truncate">
              Install to Phone Home Screen
            </div>
            <div className="text-[10px] font-mono text-emerald-400 truncate">
              Fullscreen Anime & Real-Time Alerts
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-mono text-[11px] font-bold shadow-md active:scale-95"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-emerald-400/80 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showModal && <PWAInstallButton />}
    </>
  );
};
