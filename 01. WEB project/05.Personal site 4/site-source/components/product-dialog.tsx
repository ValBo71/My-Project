'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, CornerDownRight, X } from 'lucide-react';
import type { Product } from '@/data/products';
import { manuals, ui, type Language } from '@/data/i18n';
import { DownloadBlock, InstallFacts } from '@/components/download-block';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function ProductDialog({ product, language, initialSlide, onClose, download }: { product: Product; language: Language; initialSlide: number; onClose: () => void; download: Parameters<typeof DownloadBlock>[0] }) {
  const copy = ui[language];
  const [slide, setSlide] = useState(initialSlide);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Kept in a ref so a new onClose from a parent re-render does not re-run the modal setup
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const current = product.screenshots[slide];
  const hasSeveral = product.screenshots.length > 1;
  const previous = () => setSlide((slide - 1 + product.screenshots.length) % product.screenshots.length);
  const next = () => setSlide((slide + 1) % product.screenshots.length);

  // Modal behaviour: the rest of the page becomes inert, focus moves into the dialog and
  // stays there (Tab / Shift+Tab wrap), and returns to the control that opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const backdrop = backdropRef.current;
    const siblings = backdrop?.parentElement ? Array.from(backdrop.parentElement.children).filter((el) => el !== backdrop) : [];
    siblings.forEach((el) => el.setAttribute('inert', ''));
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key === 'ArrowLeft' && hasSeveral) setSlide((value) => (value - 1 + product.screenshots.length) % product.screenshots.length);
      if (event.key === 'ArrowRight' && hasSeveral) setSlide((value) => (value + 1) % product.screenshots.length);
      if (event.key === 'Tab' && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', onKey);
      siblings.forEach((el) => el.removeAttribute('inert'));
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [hasSeveral, product.screenshots.length]);

  return (
    <div ref={backdropRef} className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <button ref={closeRef} type="button" className="dialog-close" onClick={onClose} aria-label={copy.close}><X aria-hidden="true" /></button>
        <div className="dialog-gallery">
          <div className="dialog-image-wrap">
            <img src={current.src} alt={current.alt} />
            {hasSeveral && <>
              <button type="button" className="gallery-arrow previous" onClick={previous} aria-label={copy.previous}><ChevronLeft aria-hidden="true" /></button>
              <button type="button" className="gallery-arrow next" onClick={next} aria-label={copy.next}><ChevronRight aria-hidden="true" /></button>
            </>}
          </div>
          <div className="image-caption" aria-live="polite"><span>{String(slide + 1).padStart(2, '0')} / {String(product.screenshots.length).padStart(2, '0')}</span><div><strong>{current.title}</strong><p>{current.caption}</p></div></div>
          {hasSeveral && <div className="gallery-thumbs">{product.screenshots.map((image, index) => <button type="button" aria-pressed={index === slide} className={index === slide ? 'active' : ''} key={image.src} onClick={() => setSlide(index)} aria-label={`${copy.show} ${index + 1}: ${image.title}`}><img src={image.src} alt="" loading="lazy" decoding="async" /></button>)}</div>}
        </div>
        <div className="dialog-copy">
          <h2 id="dialog-title">{product.name}</h2>
          <p className="product-meta">{product.category} · {product.version}</p>
          <p className="dialog-description" id="dialog-description">{product.details}</p>
          <h3>{copy.get}</h3>
          <ul className="feature-list">{product.features.map((feature) => <li key={feature}><CornerDownRight aria-hidden="true" size={16} strokeWidth={2.4} />{feature}</li>)}</ul>
          <h3>{copy.setup}</h3>
          <InstallFacts product={product} language={language} />
          {manuals[product.slug] && <a className="manual-link" href={manuals[product.slug]![language]} target="_blank" rel="noopener"><BookOpen aria-hidden="true" size={17} />{copy.manual}</a>}
          {product.credentials && <div className="dialog-login"><strong>{copy.login}</strong><span>{copy.user}: <code>{product.credentials.username}</code></span><span>{copy.password}: <code>{product.credentials.password}</code></span></div>}
          {/* Downloads right where the requirements are read; a bar at the bottom on small screens */}
          <div className="dialog-downloads"><DownloadBlock {...download} /></div>
        </div>
      </section>
    </div>
  );
}
