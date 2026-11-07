import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2, FileText, Download, Eye, EyeOff, Sparkles, ZoomIn, ZoomOut, Move, Maximize2, Minimize2 } from 'lucide-react';

// Configure matching worker
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl || `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
} catch {
  // fallback if needed
}

interface PdfViewerProps {
  pdfUrl: string;
  pageNumber: number;
  zoomScale?: number;
  readerTheme?: 'ivory' | 'dark' | 'sepia';
  onTotalPagesLoaded?: (total: number) => void;
  title?: string;
  onPageDimensionsLoaded?: (width: number, height: number) => void;
  onZoomChange?: (newScalePercent: number) => void;
  onDoubleClick?: (e?: React.MouseEvent) => void;
  isFullScreenMode?: boolean;
  onToggleFullScreen?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  pageNumber,
  zoomScale = 1.0,
  readerTheme = 'ivory',
  onTotalPagesLoaded,
  title = 'PDF Dokümanı',
  onPageDimensionsLoaded,
  onZoomChange,
  onDoubleClick,
  isFullScreenMode = false,
  onToggleFullScreen
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [showTextLayer, setShowTextLayer] = useState<boolean>(false);
  const [invertNightFilter, setInvertNightFilter] = useState<boolean>(true);

  // Pinch-to-zoom and touch panning state
  const touchStateRef = useRef<{
    initialPinchDist: number;
    initialZoom: number;
    isPinching: boolean;
    touchStartX: number;
    touchStartY: number;
    scrollStartX: number;
    scrollStartY: number;
    isTouchPanning: boolean;
    lastTapTime: number;
  }>({
    initialPinchDist: 0,
    initialZoom: 100,
    isPinching: false,
    touchStartX: 0,
    touchStartY: 0,
    scrollStartX: 0,
    scrollStartY: 0,
    isTouchPanning: false,
    lastTapTime: 0
  });

  // Mouse Drag-to-pan state when zoomed in
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0
  });

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    let loadingTask: any = null;

    async function loadDocument() {
      if (!pdfUrl) return;
      try {
        setLoading(true);
        setError(null);

        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl || `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }

        loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;

        if (!isMounted) return;
        setPdfDoc(pdf);
        if (onTotalPagesLoaded && pdf.numPages) {
          onTotalPagesLoaded(pdf.numPages);
        }
        setLoading(false);
      } catch (err: any) {
        console.warn('PDF load warning:', err);
        if (isMounted) {
          setError(err?.message || 'PDF dosyası doğrudan ayrıştırılamadı. Alternatif görüntüleyici başlatılıyor.');
          setLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
      if (loadingTask) {
        try { loadingTask.destroy(); } catch {}
      }
    };
  }, [pdfUrl]);

  // Render Page to Canvas & Extract Text Content
  useEffect(() => {
    let isMounted = true;
    let renderTask: any = null;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        setLoading(true);
        const safePageNum = Math.min(Math.max(1, pageNumber), pdfDoc.numPages || 1);
        const page = await pdfDoc.getPage(safePageNum);

        if (!isMounted || !canvasRef.current) return;

        // Base 1.0 viewport for CSS pixel sizing & parent dimension reporting
        const baseViewport = page.getViewport({ scale: 1.0 });
        if (onPageDimensionsLoaded) {
          onPageDimensionsLoaded(baseViewport.width, baseViewport.height);
        }

        // High-DPI Sharp Rendering: factor in zoom scale & device pixel ratio
        const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
        const renderScale = zoomScale * pixelRatio;
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (ctx) {
          // Internal canvas bitmap size
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);

          // Visible CSS display size (allows genuine zoom and horizontal/vertical scroll)
          const cssWidth = Math.round(baseViewport.width * zoomScale);
          const cssHeight = Math.round(baseViewport.height * zoomScale);
          canvas.style.width = `${cssWidth}px`;
          canvas.style.height = `${cssHeight}px`;

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };

          renderTask = page.render(renderContext);
          await renderTask.promise;
        }

        // Extract Text Content for selection & quoting
        try {
          const textContent = await page.getTextContent();
          const pageTextStr = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (isMounted) {
            setExtractedText(pageTextStr);
          }
        } catch (textErr) {
          console.warn('Text extraction notice:', textErr);
        }

        if (isMounted) setLoading(false);
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Page render warning:', err);
        }
        if (isMounted) setLoading(false);
      }
    }

    renderPage();

    return () => {
      isMounted = false;
      if (renderTask) {
        try { renderTask.cancel(); } catch {}
      }
    };
  }, [pdfDoc, pageNumber, zoomScale]);

  // Touch: Native Pinch-to-Zoom with Two Fingers & Single Finger Panning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // 1. Double tap detection
      if (e.touches.length === 1) {
        const now = Date.now();
        if (now - touchStateRef.current.lastTapTime < 350) {
          e.preventDefault();
          touchStateRef.current.lastTapTime = 0;
          if (isFullScreenMode && onDoubleClick) {
            onDoubleClick();
            return;
          }
          // Otherwise toggle between fit (100%) and 160%
          const nextZoom = zoomScale > 1.2 ? 100 : 160;
          onZoomChange?.(nextZoom);
          return;
        }
        touchStateRef.current.lastTapTime = now;

        // Single finger panning when zoomed in
        if (zoomScale > 1.0) {
          touchStateRef.current.isTouchPanning = true;
          touchStateRef.current.touchStartX = e.touches[0].clientX;
          touchStateRef.current.touchStartY = e.touches[0].clientY;
          touchStateRef.current.scrollStartX = container.scrollLeft;
          touchStateRef.current.scrollStartY = container.scrollTop;
        }
      }

      // 2. Two fingers: Initialize Pinch-to-Zoom
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStateRef.current.initialPinchDist = dist;
        touchStateRef.current.initialZoom = Math.round(zoomScale * 100);
        touchStateRef.current.isPinching = true;
        touchStateRef.current.isTouchPanning = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Two-Finger Pinch Zooming
      if (e.touches.length === 2 && touchStateRef.current.isPinching) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStateRef.current.initialPinchDist > 0) {
          const factor = dist / touchStateRef.current.initialPinchDist;
          const targetPercent = Math.round(
            Math.max(50, Math.min(350, touchStateRef.current.initialZoom * factor))
          );
          if (onZoomChange) {
            onZoomChange(targetPercent);
          }
        }
        return;
      }

      // Single finger panning when zoomed in
      if (e.touches.length === 1 && touchStateRef.current.isTouchPanning && zoomScale > 1.0) {
        const dx = e.touches[0].clientX - touchStateRef.current.touchStartX;
        const dy = e.touches[0].clientY - touchStateRef.current.touchStartY;
        container.scrollLeft = touchStateRef.current.scrollStartX - dx;
        container.scrollTop = touchStateRef.current.scrollStartY - dy;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStateRef.current.isPinching = false;
      }
      if (e.touches.length === 0) {
        touchStateRef.current.isTouchPanning = false;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [zoomScale, onZoomChange]);

  // Mouse Drag-to-pan handlers for zoomed canvas
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomScale > 1.0 && containerRef.current) {
      if ((e.target as HTMLElement)?.closest('.select-text')) return;
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop
      });
    }
  }, [zoomScale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    containerRef.current.scrollLeft = dragStart.scrollLeft - dx;
    containerRef.current.scrollTop = dragStart.scrollTop - dy;
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Compute Canvas Night & Sepia CSS Filter
  const getCanvasFilter = () => {
    if (!invertNightFilter) return 'none';
    if (readerTheme === 'dark') {
      return 'invert(0.92) hue-rotate(180deg) contrast(1.15) brightness(0.96)';
    }
    if (readerTheme === 'sepia') {
      return 'sepia(0.38) contrast(0.96) brightness(0.97)';
    }
    return 'none';
  };

  const getContainerBg = () => {
    if (readerTheme === 'dark') {
      return 'bg-[#0F1412] text-[#E0E7E5]';
    }
    if (readerTheme === 'sepia') {
      return 'bg-[#EFE8D8] text-[#3D332A]';
    }
    return 'bg-[#F5F2EB] text-slate-800';
  };

  if (error) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#1A1A1A] rounded-2xl border border-black/10">
        <object 
          data={`${pdfUrl}#page=${pageNumber}`} 
          type="application/pdf" 
          className="w-full h-[650px] rounded-xl shadow-lg border border-black/10"
        >
          <div className="text-center space-y-4 p-8">
            <FileText className="w-12 h-12 stroke-1 mx-auto text-[#742C3C]" />
            <h4 className="font-serif-title font-bold text-lg text-slate-800 dark:text-slate-200">{title}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              PDF dosyasını tarayıcınızın dahili okuyucusunda açmak için aşağıdaki düğmeye tıklayabilirsiniz.
            </p>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#742C3C] text-white text-xs font-semibold shadow-md"
            >
              <Download className="w-4 h-4 text-[#B79A63]" />
              <span>PDF Dosyasını Ayrı Pencerede Aç</span>
            </a>
          </div>
        </object>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={(e) => {
        if (onDoubleClick) {
          onDoubleClick(e);
        }
      }}
      className={`w-full h-full flex flex-col items-center overflow-auto p-2 sm:p-4 md:p-6 relative transition-colors duration-200 select-none ${getContainerBg()} ${
        zoomScale > 1.0 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      }`}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/60 dark:bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#742C3C] dark:text-[#B79A63] animate-spin" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Sayfa {pageNumber} Yükleniyor (%{Math.round(zoomScale * 100)})...
          </span>
        </div>
      )}

      {/* Floating Canvas Quick Controls (Gece Filtresi, Metin Katmanı, Dokunmatik İpucu, Tam Ekran) - Hidden in Fullscreen */}
      {!isFullScreenMode && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center justify-center gap-2 mb-3 bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-black/10 dark:border-white/10 text-xs">
          {/* Tam Ekran Okuma Modu Butonu */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#742C3C] hover:bg-[#5a222f] text-white shadow-xs transition-all active:scale-95"
              title="Tam Ekran Okuma Modu (F tuşu veya Çift Tıklama)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Tam Ekran Okuma</span>
            </button>
          )}

          {readerTheme === 'dark' && (
            <button
              onClick={() => setInvertNightFilter(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                invertNightFilter 
                  ? 'bg-amber-400 text-slate-950 shadow-xs' 
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
              title="Gece Filtresi (Sayfayı Karartıp Yazıları Aydınlatır)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gece Filtresi: {invertNightFilter ? 'Açık' : 'Kapalı'}</span>
            </button>
          )}

          {extractedText && (
            <button
              onClick={() => setShowTextLayer(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                showTextLayer 
                  ? 'bg-[#742C3C] text-white' 
                  : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-black/10'
              }`}
              title="Seçilebilir Metin Katmanını Göster/Gizle"
            >
              {showTextLayer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Metin Katmanı {showTextLayer ? 'Açık' : 'Kapalı'}</span>
            </button>
          )}

          {/* Pinch to Zoom Hint badge for mobile */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] opacity-60 text-slate-600 dark:text-slate-400">
            <Move className="w-3 h-3" />
            <span>İki parmakla kıstırıp büyütün • Çift dokunarak sığdırın</span>
          </span>
        </div>
      )}

      {/* PDF Canvas Container */}
      <div className="min-w-fit flex flex-col items-center justify-center my-auto transition-transform duration-100">
        <canvas 
          ref={canvasRef} 
          className="bg-white shadow-2xl rounded-lg border border-black/10 dark:border-white/10 transition-[filter] duration-200"
          style={{ 
            filter: getCanvasFilter()
          }}
        />

        {/* Extracted Text Layer for Copying & Selecting */}
        {showTextLayer && extractedText && (
          <div className="w-full max-w-3xl mt-6 p-4 md:p-6 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-black/10 dark:border-white/10 space-y-2 select-text font-serif text-xs md:text-sm leading-relaxed shadow-lg">
            <div className="flex justify-between items-center text-[11px] font-bold text-[#742C3C] dark:text-[#B79A63] border-b border-black/5 dark:border-white/5 pb-2 select-none">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>PDF Seçilebilir Metin Katmanı (Metin Seç & Alıntı Yap)</span>
              </span>
              <span>Sayfa {pageNumber}</span>
            </div>
            <p className="select-text text-slate-800 dark:text-slate-200 text-justify leading-relaxed whitespace-pre-line">
              {extractedText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
