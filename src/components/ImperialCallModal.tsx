import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  Heart,
  Crown,
  Leaf,
  Volume2,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  CoupleCallSession,
  endCallSession,
  answerCallSession,
  addCallIceCandidate
} from '../services/firebase';

interface ImperialCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: 'chif3n' | 'leslye';
  session: CoupleCallSession | null;
  onStartCall: (type: 'audio' | 'video') => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const ImperialCallModal: React.FC<ImperialCallModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  session,
  onStartCall
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(session?.type === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  const isCaller = session?.callerRole === activeRole;
  const partnerRole = activeRole === 'chif3n' ? 'leslye' : 'chif3n';
  const partnerName = activeRole === 'chif3n' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑';

  // Format call seconds to mm:ss
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // 1. Acquire Media Stream & Initialize WebRTC
  useEffect(() => {
    if (!isOpen || !session || session.status === 'ended') return;

    let isSubscribed = true;

    async function initMediaAndPeer() {
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: session?.type === 'video' ? { facingMode } : false
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mediaErr) {
          console.warn('[Call] Media devices restricted or simulated:', mediaErr);
          // Create dummy silent audio track if permissions fail
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const dst = audioCtx.createMediaStreamDestination();
          osc.connect(dst);
          osc.start();
          stream = dst.stream;
        }

        if (!isSubscribed) return;
        localStreamRef.current = stream;
        if (localVideoRef.current && session?.type === 'video') {
          localVideoRef.current.srcObject = stream;
        }

        // Setup RTCPeerConnection
        if (typeof RTCPeerConnection !== 'undefined') {
          const pc = new RTCPeerConnection(ICE_SERVERS);
          peerConnectionRef.current = pc;

          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });

          pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              addCallIceCandidate(isCaller ? 'caller' : 'receiver', event.candidate.toJSON());
            }
          };
        }
      } catch (e) {
        console.warn('[Call] WebRTC init note:', e);
      }
    }

    initMediaAndPeer();

    return () => {
      isSubscribed = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [isOpen, session?.callId, facingMode]);

  // 2. Call Duration Timer
  useEffect(() => {
    if (session?.status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [session?.status]);

  // 3. Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // 4. Toggle Video Camera
  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      } else {
        try {
          const vStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
          const newTrack = vStream.getVideoTracks()[0];
          localStreamRef.current.addTrack(newTrack);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          setIsVideoEnabled(true);
        } catch (e) {
          console.warn('Could not enable camera:', e);
        }
      }
    }
  };

  // 5. Flip Camera on Mobile
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // 6. Terminate Call
  const handleHangup = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    await endCallSession();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#020a06]/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in">
      {/* Top Bar: Call Status & Title */}
      <div className="w-full max-w-2xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-lg">
            {activeRole === 'chif3n' ? (
              <Crown className="w-5 h-5 text-amber-400" />
            ) : (
              <Leaf className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h2 className="font-cinzel text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>Imperial Sacred Link</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-[11px] font-mono text-emerald-300">
              {session?.status === 'connected' ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected · {formatDuration(callDuration)}
                </span>
              ) : session?.status === 'calling' ? (
                <span className="flex items-center gap-1.5 text-amber-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {isCaller ? `Calling ${partnerName}...` : `Incoming Call from ${partnerName}...`}
                </span>
              ) : (
                'Call Terminated'
              )}
            </p>
          </div>
        </div>

        {/* Call Type Pill */}
        <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-1.5 shadow-md">
          {session?.type === 'video' ? (
            <>
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Imperial Mirror (Video)</span>
            </>
          ) : (
            <>
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Apothecary Scroll (Audio)</span>
            </>
          )}
        </div>
      </div>

      {/* Main Viewport: Video Stream vs Romantic Avatar View */}
      <div className="relative w-full max-w-2xl flex-1 my-4 flex items-center justify-center rounded-3xl overflow-hidden border border-emerald-500/40 bg-gradient-to-b from-[#03140d] via-[#020b07] to-[#010804] shadow-2xl">
        {session?.type === 'video' && isVideoEnabled ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {/* Remote Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local Video Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-28 sm:w-36 aspect-video rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-2xl bg-black">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            </div>
          </div>
        ) : (
          /* Romantic Audio Call Viewport with Glowing Harmonics */
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="relative">
              {/* Pulsing Aura Rings */}
              <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="relative w-32 h-32 rounded-full border-2 border-amber-400/60 bg-gradient-to-br from-[#122b1f] to-[#04120a] p-1 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#03170e] flex flex-col items-center justify-center space-y-1">
                  {partnerRole === 'leslye' ? (
                    <Leaf className="w-12 h-12 text-emerald-400 animate-pulse" />
                  ) : (
                    <Crown className="w-12 h-12 text-amber-400 animate-pulse" />
                  )}
                  <span className="font-cinzel text-xs font-bold text-amber-200">
                    {partnerRole === 'leslye' ? 'Lady Leslye' : 'Sir Chif3n'}
                  </span>
                </div>
              </div>
            </div>

            {/* Poetic Dedicated Banner */}
            <div className="space-y-2 max-w-sm">
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                {partnerName}
              </h3>
              <p className="text-xs sm:text-sm font-serif italic text-emerald-200/90 leading-relaxed">
                "Direct imperial voice connection. Testing all words for sweetest love, completely untainted."
              </p>
            </div>

            {/* Audio Waveform Equalizer */}
            <div className="flex items-center gap-1.5 h-8">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-emerald-500 to-amber-400 transition-all duration-150 animate-pulse"
                  style={{
                    height: session?.status === 'connected' ? `${Math.max(6, ((i * 11) % 24) + 6)}px` : '4px',
                    animationDelay: `${i * 70}ms`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-xl pb-2">
        {session?.status === 'calling' && !isCaller ? (
          /* Incoming Call Action Buttons */
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleHangup}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-cinzel font-bold text-sm flex items-center gap-2 shadow-xl shadow-rose-950/60 active:scale-95 transition-all"
            >
              <PhoneOff className="w-5 h-5" />
              <span>Decline</span>
            </button>

            <button
              onClick={() => answerCallSession({ status: 'connected' })}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-cinzel font-bold text-sm flex items-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-95 transition-all animate-bounce"
            >
              <Phone className="w-5 h-5 fill-black" />
              <span>Accept Sacred Call</span>
            </button>
          </div>
        ) : (
          /* Active Call Controls */
          <div className="flex items-center justify-center gap-3 sm:gap-4 p-3 rounded-3xl bg-[#03150d]/90 border border-emerald-600/40 backdrop-blur-md shadow-2xl">
            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-[#062417] border-emerald-500/60 text-emerald-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${
                !isVideoEnabled
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  : 'bg-[#062417] border-emerald-500/60 text-emerald-300 hover:text-white'
              }`}
              title={isVideoEnabled ? 'Disable Camera' : 'Enable Camera'}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Switch Camera (if video active) */}
            {isVideoEnabled && (
              <button
                onClick={toggleCameraFacing}
                className="p-3.5 rounded-2xl bg-[#062417] border border-emerald-500/60 text-emerald-300 hover:text-white transition-all active:scale-95"
                title="Flip Front/Rear Camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}

            {/* Hang Up Button */}
            <button
              onClick={handleHangup}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-cinzel font-bold text-sm flex items-center gap-2 shadow-xl shadow-rose-950/80 active:scale-95 transition-all"
              title="End Imperial Call"
            >
              <PhoneOff className="w-5 h-5" />
              <span>Hang Up</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
