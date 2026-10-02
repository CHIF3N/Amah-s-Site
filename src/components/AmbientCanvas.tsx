import React, { useEffect, useRef } from 'react';

interface AmbientCanvasProps {
  enabled: boolean;
  mode: 'stars' | 'sakura' | 'off';
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({ enabled, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || mode === 'off') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Glowing Jade Fireflies & Stars
    const fireflyCount = 45;
    const fireflies = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.7 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      direction: Math.random() > 0.5 ? 1 : -1,
    }));

    // Floating Lotus & Herb Petals
    const herbCount = 24;
    const petals = Array.from({ length: herbCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 6 + 4,
      speedX: Math.random() * 0.8 - 0.2,
      speedY: Math.random() * 0.9 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.4 + 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (mode === 'stars') {
        // Jade & Gold Celestial Fireflies
        for (const f of fireflies) {
          f.x += f.speedX;
          f.y += f.speedY;
          if (f.x < 0) f.x = width;
          if (f.x > width) f.x = 0;
          if (f.y < 0) f.y = height;
          if (f.y > height) f.y = 0;

          f.alpha += f.pulseSpeed * f.direction;
          if (f.alpha > 0.9) f.direction = -1;
          if (f.alpha < 0.2) f.direction = 1;

          // Soft green glow
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3);
          gradient.addColorStop(0, `rgba(110, 231, 183, ${f.alpha})`);
          gradient.addColorStop(0.5, `rgba(52, 211, 153, ${f.alpha * 0.5})`);
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(f.x, f.y, f.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Floating Herbal & Lotus Petals
        for (const p of petals) {
          p.x += p.speedX + Math.sin(p.y * 0.006) * 0.5;
          p.y += p.speedY;
          p.rotation += p.rotationSpeed;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = `rgba(167, 243, 208, ${p.alpha})`;

          // Draw graceful lotus/herbal leaf
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, mode]);

  if (!enabled || mode === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-700 opacity-60"
      aria-hidden="true"
    />
  );
};
