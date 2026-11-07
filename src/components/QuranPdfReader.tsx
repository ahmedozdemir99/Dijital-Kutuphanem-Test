import React, { useEffect, useRef, useState } from 'react';
import { PdfViewer } from './PdfViewer';
import { deleteBookFileFromIDB, getBookFileFromIDB, saveBookFileToIDB } from '../lib/indexedDb';

const FILE_ID = 'dk-local-mushaf-pdf';
const PAGE_KEY = 'dk_local_mushaf_pdf_page';

export function QuranPdfReader() {
  const [file, setFile] = useState<{ name: string; url: string }>();
  const [page, setPage] = useState(() => {
    try { return Math.max(1, Number.parseInt(localStorage.getItem(PAGE_KEY) || '1', 10) || 1); } catch { return 1; }
  });
  const [total, setTotal] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(true);
  const [feedback, setFeedback] = useState('');
  const paneRef = useRef<HTMLDivElement>(null);
  const fitted = useRef(false);

  useEffect(() => {
    let active = true;
    getBookFileFromIDB(FILE_ID).then(saved => {
      if (!active) {
        if (saved) URL.revokeObjectURL(saved.objectUrl);
        return;
      }
      if (saved) setFile({ name: saved.fileName, url: saved.objectUrl });
      setBusy(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => () => { if (file) URL.revokeObjectURL(file.url); }, [file]);
  useEffect(() => {
    if (!expanded) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [expanded]);

  const goToPage = (next: number) => {
    if (!Number.isSafeInteger(next) || next < 1 || (total && next > total)) return;
    setPage(next);
    try { localStorage.setItem(PAGE_KEY, String(next)); } catch {}
  };

  return (
    <section className={expanded ? 'fixed inset-0 z-50 flex flex-col bg-white p-3 dark:bg-[#141414]' : 'rounded-3xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#1E1E1E]'}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <h3 className="mr-auto text-sm font-bold">Kendi Mushaf PDF’im</h3>
        <label className="cursor-pointer rounded-lg border px-2 py-1.5">
          {file ? 'PDF değiştir' : 'PDF ekle'}
          <input type="file" accept=".pdf,application/pdf" aria-label="Mushaf PDF dosyası" disabled={busy} className="sr-only" onChange={async event => {
            const input = event.currentTarget;
            const selected = input.files?.[0];
            if (!selected) return;
            setBusy(true);
            try {
              if (!selected.name.toLowerCase().endsWith('.pdf')) throw new Error();
              const url = await saveBookFileToIDB(FILE_ID, selected, selected.name, 'pdf');
              fitted.current = false;
              setTotal(0);
              goToPage(1);
              setFile({ name: selected.name, url });
              setFeedback('PDF bu cihaza kaydedildi.');
            } catch {
              setFeedback('PDF kaydedilemedi. Dosyayı kontrol edip yeniden dene.');
            } finally {
              setBusy(false);
              input.value = '';
            }
          }} />
        </label>
        {file && <button type="button" className="rounded-lg border px-2 py-1.5" onClick={() => setExpanded(value => !value)}>{expanded ? 'Tam ekrandan çık' : 'Tam ekran'}</button>}
        {file && !expanded && <button type="button" disabled={busy} className="rounded-lg border px-2 py-1.5" onClick={async () => {
          if (!window.confirm('Bu cihazdaki Mushaf PDF dosyası kaldırılsın mı?')) return;
          try {
            await deleteBookFileFromIDB(FILE_ID);
            setFile(undefined);
            setTotal(0);
            goToPage(1);
            setFeedback('PDF kaldırıldı.');
          } catch {
            setFeedback('PDF kaldırılamadı.');
          }
        }}>PDF kaldır</button>}
      </div>
      {feedback && <p role="status" className="mb-2 text-xs">{feedback}</p>}
      {file ? (
        <>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="min-w-0 truncate">{file.name}</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Önceki PDF sayfası">‹</button>
              <span>PDF sayfası {page}{total ? ` / ${total}` : ''}</span>
              <button type="button" disabled={!total || page >= total} onClick={() => goToPage(page + 1)} aria-label="Sonraki PDF sayfası">›</button>
            </div>
          </div>
          <div ref={paneRef} className={expanded ? 'min-h-0 flex-1 overflow-hidden' : 'h-[65dvh] overflow-hidden'}>
            <PdfViewer pdfUrl={file.url} pageNumber={page} zoomScale={zoom} title={file.name}
              isFullScreenMode={expanded} onToggleFullScreen={() => setExpanded(value => !value)} onZoomChange={percent => setZoom(percent / 100)}
              onTotalPagesLoaded={count => { setTotal(count); if (page > count) goToPage(count); }}
              onPageDimensionsLoaded={width => {
                if (fitted.current || !paneRef.current || width < 1) return;
                fitted.current = true;
                setZoom(Math.min(2, Math.max(0.4, (paneRef.current.clientWidth - 12) / width)));
              }} />
          </div>
        </>
      ) : <p className="text-sm text-slate-500">{busy ? 'Bu cihazdaki dosya aranıyor…' : 'Mushaf PDF’ini eklediğinde bu cihazda kaldığın sayfadan devam edebilirsin.'}</p>}
    </section>
  );
}
