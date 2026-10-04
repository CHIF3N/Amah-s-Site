import React, { useMemo, memo } from 'react';

interface AmbientCanvasProps {
  enabled: boolean;
  mode: 'stars' | 'sakura' | 'off';
}

interface FireflyData {
  id: string;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  floatX: number;
  floatY: number;
}

interface PetalData {
  id: string;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

const AmbientCanvasComponent: React.FC<AmbientCanvasProps> = ({ enabled, mode }) => {
  if (!enabled || mode === 'off') return null;

  // Stable seeded particle positions that never shift or flicker across parent re-renders
  const fireflies = useMemo<FireflyData[]>(() => {
    if (mode !== 'stars') return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: `firefly-${i}`,
      left: `${(i * 17.3 + 5) % 94}%`,
      top: `${(i * 23.7 + 7) % 92}%`,
      size: (i % 3) * 2 + 3,
      duration: 4 + (i % 5) * 1.5,
      delay: (i % 7) * 0.7,
      floatX: ((i % 4) - 2) * 18,
      floatY: ((i % 3) - 1.5) * 25,
    }));
  }, [mode]);

  const petals = useMemo<PetalData[]>(() => {
    if (mode !== 'sakura') return [];
    return Array.from({ length: 22 }, (_, i) => ({
      id: `petal-${i}`,
      left: `${(i * 13.9 + 3) % 96}%`,
      top: `${(i * 19.1 + 2) % 95}%`,
      size: 8 + (i % 4) * 3,
      duration: 7 + (i % 4) * 2,
      delay: (i % 6) * 0.9,
      rotation: (i * 45) % 360,
    }));
  }, [mode]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none"
      style={{
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        contain: 'strict',
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes fireflyPulse {
          0%, 100% {
            opacity: 0.2;
            transform: translate3d(0, 0, 0) scale(0.9);
          }
          50% {
            opacity: 0.75;
            transform: translate3d(var(--tx, 15px), var(--ty, -20px), 0) scale(1.15);
          }
        }
        @keyframes petalDrift {
          0% {
            transform: translate3d(0, -10px, 0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            opacity: 0.55;
            transform: translate3d(25px, 20px, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(50px, 50px, 0) rotate(360deg);
            opacity: 0.2;
          }
        }
      `}</style>

      {mode === 'stars' &&
        fireflies.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background:
                'radial-gradient(circle, rgba(110, 231, 183, 0.9) 0%, rgba(52, 211, 153, 0.4) 60%, rgba(16, 185, 129, 0) 100%)',
              boxShadow: '0 0 10px rgba(110, 231, 183, 0.5)',
              willChange: 'transform, opacity',
              animation: `fireflyPulse ${p.duration}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay}s`,
              ['--tx' as any]: `${p.floatX}px`,
              ['--ty' as any]: `${p.floatY}px`,
            }}
          />
        ))}

      {mode === 'sakura' &&
        petals.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size * 0.6}px`,
              borderRadius: '50% 0 50% 0',
              backgroundColor: 'rgba(167, 243, 208, 0.45)',
              boxShadow: '0 0 6px rgba(167, 243, 208, 0.3)',
              willChange: 'transform, opacity',
              animation: `petalDrift ${p.duration}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
    </div>
  );
};

// Memoize AmbientCanvas to prevent any re-renders when parent state updates in App.tsx
export const AmbientCanvas = memo(AmbientCanvasComponent, (prevProps, nextProps) => {
  return prevProps.enabled === nextProps.enabled && prevProps.mode === nextProps.mode;
});
