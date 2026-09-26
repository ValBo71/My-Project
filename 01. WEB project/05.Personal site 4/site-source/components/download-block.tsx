'use client';

import { Apple, Download, Info, Monitor, ShieldCheck } from 'lucide-react';
import type { Product } from '@/data/products';
import { ui, type Language } from '@/data/i18n';

export type Platform = 'windows' | 'macos';
export type VisitorSystem = Platform | 'mobile' | null;

// The installers of a product live next to its SHA256SUMS.txt
export const checksumsUrl = (href: string) => `${href.slice(0, href.lastIndexOf('/'))}/SHA256SUMS.txt`;

export function detectSystem(): VisitorSystem {
  if (typeof navigator === 'undefined') return null;
  const agent = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(agent)) return 'mobile';
  if (/Mac/i.test(agent)) return 'macos';
  if (/Win/i.test(agent)) return 'windows';
  return null;
}

function PlatformButton({ href, platform, size, suggested, label, onStart }: { href: string; platform: Platform; size: string; suggested: boolean; label: string; onStart: () => void }) {
  const Icon = platform === 'windows' ? Monitor : Apple;
  return (
    <a className={`platform-button${suggested ? ' is-suggested' : ''}`} href={href} download onClick={onStart}>
      <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
      <span><strong>{platform === 'windows' ? 'Windows' : 'macOS'}</strong><small>{size}{suggested && <> · <em>{label}</em></>}</small></span>
      <Download aria-hidden="true" className="download-icon" size={17} />
    </a>
  );
}

export function DownloadBlock({ product, language, system, started, onStart }: {
  product: Product; language: Language; system: VisitorSystem; started: Platform | null; onStart: (platform: Platform) => void;
}) {
  const copy = ui[language];
  return (
    <div className="download-block">
      <div className="downloads" role="group" aria-label={`${copy.download} ${product.name}`}>
        <PlatformButton {...product.downloads.windows} platform="windows" suggested={system === 'windows'} label={copy.yourSystem} onStart={() => onStart('windows')} />
        <PlatformButton {...product.downloads.macos} platform="macos" suggested={system === 'macos'} label={copy.yourSystem} onStart={() => onStart('macos')} />
      </div>
      <p className="install-note"><Info aria-hidden="true" size={15} /><span>{product.installNote} <a href={checksumsUrl(product.downloads.windows.href)} target="_blank" rel="noopener"><ShieldCheck aria-hidden="true" size={14} />{copy.checksums}</a></span></p>
      <div className="download-status" aria-live="polite">
        {started && <><p>{started === 'windows' ? copy.startedWindows : copy.startedMac}</p><p className="download-verify">{copy.verifyShort}</p></>}
      </div>
    </div>
  );
}

// How it runs / what installing needs / what comes after – the same facts in every place they are shown
export function InstallFacts({ product, language }: { product: Product; language: Language }) {
  const copy = ui[language];
  return (
    <dl className="install-facts">
      <div><dt>{copy.runsLabel}</dt><dd>{product.runs}</dd></div>
      <div><dt>{copy.installLabel}</dt><dd>{product.installNote}</dd></div>
      <div><dt>{copy.afterLabel}</dt><dd>{product.afterInstall}</dd></div>
    </dl>
  );
}
