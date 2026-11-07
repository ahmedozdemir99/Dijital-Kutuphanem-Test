import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Palette, Sparkles, Check, Square, Circle } from 'lucide-react';
import { Poem } from '../types';

interface PoemPosterModalProps {
  poem: Poem;
  poetName: string;
  onClose: () => void;
}

type PosterTheme = 'gold' | 'burgundy' | 'midnight' | 'parchment';
type CornerStyle = 'rounded' | 'square';

export const PoemPosterModal: React.FC<PoemPosterModalProps> = ({
  poem,
  poetName,
  onClose
}) => {
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme>('gold');
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>('rounded');
  const [downloading, setDownloading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper function to draw rounded rect path on canvas
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Render poster onto Canvas
  const renderPosterCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // Theme Background Colors
    if (selectedTheme === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0F3223');
      grad.addColorStop(0.5, '#044B35');
      grad.addColorStop(1, '#02281C');
      ctx.fillStyle = grad;
    } else if (selectedTheme === 'burgundy') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#4B1E2B');
      grad.addColorStop(0.5, '#742C3C');
      grad.addColorStop(1, '#2E1019');
      ctx.fillStyle = grad;
    } else if (selectedTheme === 'midnight') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#141414');
      grad.addColorStop(1, '#050505');
      ctx.fillStyle = grad;
    } else { // parchment
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#FDFBF7');
      grad.addColorStop(1, '#F3ECE0');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    // Color Palettes
    const isDark = selectedTheme !== 'parchment';
    const primaryColor = isDark ? '#D4AF37' : '#742C3C'; // Gold or Burgundy
    const textColor = isDark ? '#FFFFFF' : '#2C2523';
    const subTextColor = isDark ? '#E2C068' : '#B79A63';

    // Draw Decorative Borders with Corner Style
    ctx.strokeStyle = primaryColor;
    if (cornerStyle === 'rounded') {
      ctx.lineWidth = 6;
      drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 36);
      ctx.stroke();

      ctx.lineWidth = 2;
      drawRoundedRect(ctx, 55, 55, width - 110, height - 110, 24);
      ctx.stroke();
    } else {
      ctx.lineWidth = 6;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, width - 110, height - 110);
    }

    // Corner Ornaments
    const drawCornerOrnament = (x: number, y: number) => {
      ctx.save();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    if (cornerStyle === 'rounded') {
      drawCornerOrnament(85, 85);
      drawCornerOrnament(width - 85, 85);
      drawCornerOrnament(85, height - 85);
      drawCornerOrnament(width - 85, height - 85);
    } else {
      drawCornerOrnament(80, 80);
      drawCornerOrnament(width - 80, 80);
      drawCornerOrnament(80, height - 80);
      drawCornerOrnament(width - 80, height - 80);
    }

    // Header Title: DİJİTAL KÜTÜPHANEM
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('D İ J İ T A L   K Ü T Ü P H A N E M', width / 2, 130);

    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText('Edebiyat ve Şiir Arşivi', width / 2, 165);

    // Decorative Line
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, 190);
    ctx.lineTo(width / 2 + 120, 190);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Poem Title
    ctx.fillStyle = isDark ? '#FFFFFF' : '#742C3C';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText(poem.title, width / 2, 280);

    // Poet Name
    ctx.font = 'italic 28px Georgia, serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText(`— ${poetName}`, width / 2, 330);

    // Big Quote Marks Graphic
    ctx.font = 'bold 120px Georgia, serif';
    ctx.fillStyle = isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(116, 44, 60, 0.12)';
    ctx.fillText('“', width / 2 - 320, 430);

    // Poem Stanzas / Text Body
    ctx.fillStyle = textColor;
    ctx.font = '28px Georgia, serif';
    const lines = poem.content.split('\n');

    let currentY = 480;
    const maxLinesToShow = Math.min(18, lines.length);

    for (let i = 0; i < maxLinesToShow; i++) {
      const line = lines[i].trim();
      if (line === '') {
        currentY += 24;
      } else {
        ctx.fillText(line, width / 2, currentY);
        currentY += 42;
      }
    }

    if (lines.length > 18) {
      ctx.font = 'italic 22px Georgia, serif';
      ctx.fillStyle = subTextColor;
      ctx.fillText('...', width / 2, currentY + 10);
    }

    // Footer Watermark
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText('DİJİTAL KÜTÜPHANEM · 40 YILLIK OKUMA MÜFREDATI', width / 2, height - 120);

    ctx.font = '14px Georgia, serif';
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    ctx.fillText('https://dijitalkutuphanem.app', width / 2, height - 90);
  };

  useEffect(() => {
    renderPosterCanvas();
  }, [poem, poetName, selectedTheme, cornerStyle]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeTitle = poem.title.replace(/[^a-zA-Z0-9-çğıöşüÇĞİÖŞÜ]/g, '_');
      const safePoet = poetName.replace(/[^a-zA-Z0-9-çğıöşüÇĞİÖŞÜ]/g, '_');
      link.download = `${safePoet}_${safeTitle}_Poster.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-black/10 dark:border-white/10 my-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B79A63]" />
            <h3 className="font-serif-title font-bold text-xl text-[#742C3C] dark:text-[#B79A63]">
              Şiir Poster Kartı (PNG)
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Selectors: Theme & Corner Style */}
        <div className="mb-6 space-y-4">
          {/* Theme Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Palette className="w-4 h-4 text-[#B79A63]" />
              <span>Poster Teması:</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedTheme('gold')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedTheme === 'gold' 
                    ? 'border-[#D4AF37] bg-[#0F3223] text-[#D4AF37] ring-2 ring-[#D4AF37]/50' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Zümrüt & Altın</span>
                {selectedTheme === 'gold' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setSelectedTheme('burgundy')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedTheme === 'burgundy' 
                    ? 'border-[#B79A63] bg-[#742C3C] text-white ring-2 ring-[#742C3C]/50' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Bordo Büyü</span>
                {selectedTheme === 'burgundy' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setSelectedTheme('midnight')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedTheme === 'midnight' 
                    ? 'border-slate-500 bg-[#141414] text-white ring-2 ring-white/20' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Gece Zifir</span>
                {selectedTheme === 'midnight' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setSelectedTheme('parchment')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedTheme === 'parchment' 
                    ? 'border-[#742C3C] bg-[#FDFBF7] text-[#2C2523] ring-2 ring-[#742C3C]/50' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Parşömen</span>
                {selectedTheme === 'parchment' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Corner Style Selector (Yuvarlak vs Köşeli) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Square className="w-4 h-4 text-[#B79A63]" />
              <span>Poster Çerçeve Köşe Şekli:</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCornerStyle('rounded')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  cornerStyle === 'rounded' 
                    ? 'border-[#742C3C] dark:border-[#B79A63] bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63] ring-2 ring-[#742C3C]/30' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Circle className="w-4 h-4 fill-current opacity-60" />
                <span>Yuvarlak Köşeli Çerçeve</span>
                {cornerStyle === 'rounded' && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>

              <button
                onClick={() => setCornerStyle('square')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  cornerStyle === 'square' 
                    ? 'border-[#742C3C] dark:border-[#B79A63] bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63] ring-2 ring-[#742C3C]/30' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Square className="w-4 h-4" />
                <span>Keskin / Dik Köşeli Çerçeve</span>
                {cornerStyle === 'square' && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live Poster Preview */}
        <div className="flex justify-center bg-slate-900 p-4 rounded-2xl mb-6 shadow-inner max-h-[420px] overflow-y-auto">
          <canvas 
            ref={canvasRef} 
            className={`max-w-full h-auto shadow-2xl border border-white/10 ${cornerStyle === 'rounded' ? 'rounded-2xl' : 'rounded-none'}`}
            style={{ maxHeight: '380px' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors hover:bg-slate-300"
          >
            Vazgeç
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="flex-1 py-3 rounded-2xl bg-[#742C3C] hover:bg-[#4B1E2B] text-white font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#B79A63]" />
            <span>{downloading ? 'Hazırlanıyor...' : 'PNG Olarak İndir (HD)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
