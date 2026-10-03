/**
 * Imperial Quote Card Image Generator
 * Renders high-resolution, pixel-perfect decorative quote cards on an HTML5 canvas
 * and triggers an immediate high-DPI PNG image download.
 */

export interface QuoteCardOptions {
  quote: string;
  author?: string;
  title?: string;
  herb?: string;
  temperament?: string;
  decree?: string;
  source?: string;
  theme?: 'imperial-jade' | 'royal-amber' | 'rose-romance' | 'antique-parchment';
}

export function generateAndDownloadQuoteImage(options: QuoteCardOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const width = 1200;
      const height = 800;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      // Themes configuration
      const themes = {
        'imperial-jade': {
          bgGradStart: '#04170f',
          bgGradMid: '#062619',
          bgGradEnd: '#020b07',
          borderOuter: '#0d4029',
          borderInner: '#d4af37',
          accentGold: '#f59e0b',
          accentLight: '#10b981',
          textMain: '#ffffff',
          textSub: '#a7f3d0',
          sealColor: '#b91c1c'
        },
        'royal-amber': {
          bgGradStart: '#140c03',
          bgGradMid: '#241605',
          bgGradEnd: '#0a0601',
          borderOuter: '#3b2408',
          borderInner: '#f59e0b',
          accentGold: '#fbbf24',
          accentLight: '#d97706',
          textMain: '#ffffff',
          textSub: '#fde68a',
          sealColor: '#991b1b'
        },
        'rose-romance': {
          bgGradStart: '#18070f',
          bgGradMid: '#2b0b1a',
          bgGradEnd: '#0d0308',
          borderOuter: '#4a152d',
          borderInner: '#fb7185',
          accentGold: '#f43f5e',
          accentLight: '#fda4af',
          textMain: '#ffffff',
          textSub: '#fecdd3',
          sealColor: '#be123c'
        },
        'antique-parchment': {
          bgGradStart: '#130f0a',
          bgGradMid: '#1f1911',
          bgGradEnd: '#0d0a07',
          borderOuter: '#382e21',
          borderInner: '#d97706',
          accentGold: '#eab308',
          accentLight: '#fde047',
          textMain: '#fef3c7',
          textSub: '#d4d4d8',
          sealColor: '#9a3412'
        }
      };

      const t = themes[options.theme || 'imperial-jade'];

      // 1. Luxury Dark Gradient Background
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, t.bgGradMid);
      bgGrad.addColorStop(0.65, t.bgGradStart);
      bgGrad.addColorStop(1, t.bgGradEnd);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric celestial particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 40; i++) {
        const px = (Math.sin(i * 99) * 0.5 + 0.5) * width;
        const py = (Math.cos(i * 33) * 0.5 + 0.5) * height;
        const pr = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Outer Ornate Golden Border
      ctx.lineWidth = 3;
      ctx.strokeStyle = t.borderInner;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // Inner hairline border
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.strokeRect(46, 46, width - 92, height - 92);

      // 3. Corner Flourishes
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angle * Math.PI) / 180);

        ctx.strokeStyle = t.borderInner;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, 24);
        ctx.lineTo(0, 0);
        ctx.lineTo(24, 0);
        ctx.stroke();

        ctx.fillStyle = t.accentGold;
        ctx.beginPath();
        ctx.arc(8, 8, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      drawCorner(46, 46, 0);
      drawCorner(width - 46, 46, 90);
      drawCorner(width - 46, height - 46, 180);
      drawCorner(46, height - 46, 270);

      // 4. Imperial Seal in Top-Right
      ctx.save();
      const sealX = width - 110;
      const sealY = 65;
      const sealSize = 56;

      ctx.fillStyle = t.sealColor;
      ctx.fillRect(sealX, sealY, sealSize, sealSize);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sealX + 4, sealY + 4, sealSize - 8, sealSize - 8);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Cinzel", "Songti SC", "SimSun", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('御賜', sealX + sealSize / 2, sealY + sealSize / 2 - 8);
      ctx.font = 'bold 13px "Cinzel", "Songti SC", "SimSun", Georgia, serif';
      ctx.fillText('聖愛', sealX + sealSize / 2, sealY + sealSize / 2 + 10);
      ctx.restore();

      // 5. Header Banner
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Crown / Emblem
      ctx.fillStyle = t.accentGold;
      ctx.font = '22px sans-serif';
      ctx.fillText('👑', width / 2, 60);

      // Title & Sanctum Name
      ctx.fillStyle = t.accentGold;
      ctx.font = 'bold 14px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('THE IMPERIAL APOTHECARY SANCTUARY', width / 2, 94);

      ctx.fillStyle = t.textSub;
      ctx.font = 'italic 13px Georgia, serif';
      ctx.fillText('Dedicated with Infinite Love to Lady Leslye from Sir Chif3n ❤️', width / 2, 118);

      // 6. Ornamental Divider Line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 180, 146);
      ctx.lineTo(width / 2 + 180, 146);
      ctx.stroke();

      ctx.fillStyle = t.accentGold;
      ctx.beginPath();
      ctx.arc(width / 2, 146, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 7. Decorative Opening Quote
      ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.font = 'bold 90px Georgia, serif';
      ctx.fillText('“', width / 2, 170);

      // 8. Multi-line Word-Wrapped Quote Body
      const quoteText = options.quote.replace(/^["“]|["”]$/g, '').trim();

      // Determine font size based on text length to ensure optimal aesthetics
      let fontSize = 32;
      let lineHeight = 46;
      if (quoteText.length > 220) {
        fontSize = 24;
        lineHeight = 36;
      } else if (quoteText.length > 140) {
        fontSize = 28;
        lineHeight = 42;
      }

      ctx.fillStyle = t.textMain;
      ctx.font = `italic ${fontSize}px "Cinzel", Georgia, serif`;
      ctx.textAlign = 'center';

      // Word wrapping helper
      const maxLineWidth = width - 240;
      const words = quoteText.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && i > 0) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      // Center vertically in main area
      const textBlockHeight = lines.length * lineHeight;
      const startY = Math.max(260, 360 - textBlockHeight / 2);

      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
      });

      // 9. Prescription / Herbal Decree Badges
      const badgeY = Math.min(height - 180, startY + textBlockHeight + 40);

      if (options.herb || options.decree || options.temperament) {
        const badgeText = [
          options.herb ? `🌿 ${options.herb}` : null,
          options.temperament ? `✨ ${options.temperament}` : null,
          options.decree ? `📜 ${options.decree}` : null
        ]
          .filter(Boolean)
          .join('   ·   ');

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        const badgeMetrics = ctx.measureText(badgeText);
        const padX = 24;
        const padY = 8;
        ctx.fillRect(
          width / 2 - badgeMetrics.width / 2 - padX,
          badgeY - padY,
          badgeMetrics.width + padX * 2,
          28 + padY * 2
        );

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          width / 2 - badgeMetrics.width / 2 - padX,
          badgeY - padY,
          badgeMetrics.width + padX * 2,
          28 + padY * 2
        );

        ctx.fillStyle = t.accentGold;
        ctx.font = 'bold 14px "Cinzel", monospace';
        ctx.fillText(badgeText, width / 2, badgeY);
      }

      // 10. Footer Section
      const footerY = height - 90;

      // Bottom divider
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.beginPath();
      ctx.moveTo(120, footerY);
      ctx.lineTo(width - 120, footerY);
      ctx.stroke();

      ctx.fillStyle = t.textSub;
      ctx.font = '12px "Cinzel", Georgia, serif';
      ctx.fillText(
        options.source
          ? `Source: ${options.source} · Sir Chif3n's Vow for Lady Leslye`
          : `Sir Chif3n's Eternal Decree · The Apothecary Diaries Sanctuary`,
        width / 2,
        footerY + 16
      );

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '10px monospace';
      ctx.fillText(
        `Preserved in the Imperial Archive · ${new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}`,
        width / 2,
        footerY + 36
      );

      // 11. Export as Data URL & Trigger Download
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const filename = `apothecary-imperial-quote-${Date.now()}.png`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resolve(dataUrl);
    } catch (err) {
      reject(err);
    }
  });
}
