import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { Loader2, AlertCircle, BookOpen, FileText } from 'lucide-react';

interface EpubViewerProps {
  epubUrl: string;
  chapterIndex: number; // 1-indexed
  fontSize?: number;
  lineHeight?: number;
  onTotalChaptersLoaded?: (total: number) => void;
  title?: string;
}

interface Chapter {
  id: string;
  title: string;
  contentHtml: string;
  textOnly: string;
}

const EPUB_TEXT_ELEMENTS = new Set([
  'p', 'div', 'span', 'article', 'section', 'aside', 'header', 'footer',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'strong', 'b',
  'em', 'i', 'u', 's', 'small', 'sup', 'sub', 'ol', 'ul', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'figure', 'figcaption', 'br', 'hr',
]);

function sanitizeChapter(body: HTMLElement): string {
  const document = body.ownerDocument;
  const output = document.createElement('div');
  const append = (node: Node, parent: HTMLElement) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.append(document.createTextNode(node.textContent || ''));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    const tag = element.localName;
    if (['script', 'style', 'iframe', 'object', 'embed', 'template'].includes(tag)) return;
    if (EPUB_TEXT_ELEMENTS.has(tag)) {
      const clean = document.createElement(tag);
      const dir = element.getAttribute('dir');
      if (dir === 'rtl' || dir === 'ltr' || dir === 'auto') clean.dir = dir;
      parent.append(clean);
      for (const child of node.childNodes) append(child, clean);
    } else {
      for (const child of node.childNodes) append(child, parent);
    }
  };
  for (const child of body.childNodes) append(child, output);
  return output.innerHTML;
}

export const EpubViewer: React.FC<EpubViewerProps> = ({
  epubUrl,
  chapterIndex,
  fontSize = 18,
  lineHeight = 1.6,
  onTotalChaptersLoaded,
  title = 'EPUB Kitabı'
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function parseEpub() {
      if (!epubUrl) return;
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(epubUrl);
        if (!res.ok) throw new Error('EPUB dosyası açılamadı.');
        const blob = await res.blob();
        const zip = await JSZip.loadAsync(blob);

        // 1. Locate container.xml
        const containerFile = zip.file('META-INF/container.xml');
        if (!containerFile) throw new Error('Geçersiz EPUB dosyası: container.xml bulunamadı.');

        const containerXmlText = await containerFile.async('text');
        const parser = new DOMParser();
        const containerDoc = parser.parseFromString(containerXmlText, 'text/xml');
        const rootfile = containerDoc.querySelector('rootfile');
        const opfPath = rootfile?.getAttribute('full-path') || 'content.opf';

        // 2. Read OPF manifest & spine
        const opfFile = zip.file(opfPath);
        if (!opfFile) throw new Error(`OPF dosyası bulunamadı: ${opfPath}`);

        const opfText = await opfFile.async('text');
        const opfDoc = parser.parseFromString(opfText, 'text/xml');

        const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

        const manifestItems = Array.from(opfDoc.querySelectorAll('manifest > item'));
        const itemMap = new Map<string, string>();
        manifestItems.forEach(item => {
          const id = item.getAttribute('id');
          const href = item.getAttribute('href');
          if (id && href) {
            const resolved = new URL(href, `https://epub.local/${opfDir}`);
            if (resolved.origin === 'https://epub.local') itemMap.set(id, resolved.pathname.slice(1));
          }
        });

        const spineItems = Array.from(opfDoc.querySelectorAll('spine > itemref'));
        const chapterList: Chapter[] = [];

        for (let i = 0; i < spineItems.length; i++) {
          const idref = spineItems[i].getAttribute('idref');
          if (!idref) continue;
          const href = itemMap.get(idref);
          if (!href) continue;

          const chapterFile = zip.file(href) || zip.file(decodeURIComponent(href));
          if (chapterFile) {
            const chapterHtml = await chapterFile.async('text');
            const chapDoc = parser.parseFromString(chapterHtml, 'text/html');

            const chapTitle = chapDoc.querySelector('h1, h2, h3, title')?.textContent?.trim() || `Bölüm ${i + 1}`;
            const bodyHtml = sanitizeChapter(chapDoc.body);
            const textOnly = chapDoc.body ? chapDoc.body.textContent || '' : '';

            chapterList.push({
              id: idref,
              title: chapTitle,
              contentHtml: bodyHtml,
              textOnly: textOnly.trim()
            });
          }
        }

        if (!isMounted) return;

        if (chapterList.length === 0) {
          throw new Error('EPUB dosyası içinde okunabilir bölüm metni çıkarılamadı.');
        }

        setChapters(chapterList);
        if (onTotalChaptersLoaded) {
          onTotalChaptersLoaded(chapterList.length);
        }
        setLoading(false);

      } catch (err: any) {
        console.warn('EPUB parsing error:', err);
        if (isMounted) {
          setError(err?.message || 'EPUB dosyası ayrıştırılamadı.');
          setLoading(false);
        }
      }
    }

    parseEpub();

    return () => { isMounted = false; };
  }, [epubUrl]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="w-8 h-8 text-[#742C3C] dark:text-[#B79A63] animate-spin" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">EPUB Kitabı Okumaya Hazırlanıyor...</span>
      </div>
    );
  }

  if (error || chapters.length === 0) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h4 className="font-serif-title font-bold text-lg">{title}</h4>
        <p className="text-xs opacity-70 max-w-sm mx-auto">
          {error || 'EPUB metni okunamadı.'}
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, chapterIndex - 1), chapters.length - 1);
  const currentChap = chapters[safeIndex];

  return (
    <div 
      className="w-full max-w-3xl bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl p-6 md:p-12 min-h-[680px] flex flex-col justify-between border border-black/5 dark:border-white/5 transition-all select-text"
      style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
    >
      {/* Chapter Title Header */}
      <div className="flex justify-between items-center text-xs opacity-50 border-b border-black/5 dark:border-white/5 pb-3 mb-6 select-none font-serif-title">
        <span className="truncate pr-4 font-bold">{currentChap.title}</span>
        <span className="shrink-0">Bölüm {safeIndex + 1} / {chapters.length}</span>
      </div>

      {/* EPUB HTML Body Content with Native Text Selection */}
      <div 
        className="flex-1 font-serif text-justify leading-relaxed space-y-4 epub-content select-text"
        dangerouslySetInnerHTML={{ __html: currentChap.contentHtml }}
      />

      {/* Chapter Footer Progress */}
      <div className="flex justify-between items-center text-xs opacity-50 border-t border-black/5 dark:border-white/5 pt-3 mt-8 select-none font-mono">
        <span>EPUB Dijital Okuyucu</span>
        <span>İlerleme: %{Math.round(((safeIndex + 1) / chapters.length) * 100)}</span>
      </div>
    </div>
  );
};
