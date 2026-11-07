import React, { useState } from 'react';

interface BookCoverImageProps {
  src?: string;
  alt: string;
  title: string;
  author?: string;
  category?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  isMultiVolume?: boolean;
  volumeNumber?: number;
  progressPercent?: number; // 0 to 100
  isCompleted?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  "Din ve İlahiyat": { bg: "from-emerald-900 to-teal-950", text: "text-emerald-100", accent: "#D4AF37" },
  "Felsefe": { bg: "from-amber-900 to-yellow-950", text: "text-amber-100", accent: "#F59E0B" },
  "Tarih": { bg: "from-amber-950 to-[#4A2616]", text: "text-amber-200", accent: "#B79A63" },
  "Edebiyat": { bg: "from-[#742C3C] to-[#3B121C]", text: "text-rose-100", accent: "#B79A63" },
  "Şiir": { bg: "from-indigo-950 to-purple-950", text: "text-indigo-100", accent: "#A5B4FC" },
  "Psikoloji": { bg: "from-cyan-950 to-blue-950", text: "text-cyan-100", accent: "#38BDF8" },
  "Sosyoloji": { bg: "from-slate-900 to-stone-900", text: "text-slate-200", accent: "#94A3B8" },
  "Kültür, Sanat ve Medeniyet": { bg: "from-[#5C2432] to-[#2A0E16]", text: "text-amber-100", accent: "#D4AF37" }
};

export const BookCoverImage: React.FC<BookCoverImageProps> = ({
  src,
  alt,
  title,
  author,
  category = 'Edebiyat',
  className = 'w-full h-full object-cover',
  loading,
  isMultiVolume,
  volumeNumber,
  progressPercent = 0,
  isCompleted = false
}) => {
  const [hasError, setHasError] = useState(false);

  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS["Edebiyat"];

  const coverContent = (!src || hasError) ? (
    <div className={`w-full h-full bg-gradient-to-br ${colors.bg} p-3 flex flex-col justify-between relative overflow-hidden book-spine-effect select-none shadow-md ${className}`}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
      
      {/* Top Header Label */}
      <div className="relative z-10 flex justify-between items-start">
        <span className="text-[9px] font-bold tracking-widest uppercase opacity-80 truncate max-w-[80%]" style={{ color: colors.accent }}>
          {category}
        </span>
        {isMultiVolume && (
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-black/40 text-white border border-white/20">
            Cilt {volumeNumber || 1}
          </span>
        )}
      </div>

      {/* Center Title & Author */}
      <div className="relative z-10 my-auto text-center px-1">
        <h4 className="font-serif-title font-bold text-xs leading-tight text-white line-clamp-3 mb-1 drop-shadow-sm">
          {title}
        </h4>
        {author && (
          <p className="text-[10px] font-medium opacity-85 line-clamp-1 italic" style={{ color: colors.accent }}>
            {author}
          </p>
        )}
      </div>

      {/* Bottom Emblem */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-1.5 text-[8px] opacity-70 text-white">
        <span>DİJİTAL KÜTÜPHANEM</span>
        <span className="font-bold">✦</span>
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt || title}
      onError={() => setHasError(true)}
      className={className}
      loading={loading}
      decoding={loading === 'lazy' ? 'async' : undefined}
      referrerPolicy="no-referrer"
    />
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
      {coverContent}

      {/* Graceful Fill-Level Watermark Overlay */}
      {progressPercent > 0 && !isCompleted && (
        <div 
          className="absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-700 ease-out z-10" 
          style={{ height: `${Math.max(12, progressPercent)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#742C3C]/45 via-[#742C3C]/15 to-transparent backdrop-blur-[0.5px]" />
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-[#B79A63] to-emerald-500 shadow-sm" />
        </div>
      )}

      {/* Multi-volume badge */}
      {isMultiVolume && (
        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[#B79A63] text-[9px] font-extrabold rounded backdrop-blur-sm border border-white/10 z-20">
          Cilt {volumeNumber || 1}
        </span>
      )}
    </div>
  );
};
