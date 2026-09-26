'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, BookOpen, Expand, Info, Search, ShieldCheck, Smartphone, X } from 'lucide-react';
import { products, type Product } from '@/data/products';
import { english, localized, manuals, ui, type Language } from '@/data/i18n';
import { ProductDialog } from '@/components/product-dialog';
import { DownloadBlock, detectSystem, type Platform, type VisitorSystem } from '@/components/download-block';

const SOURCE_URL = 'https://github.com/ValBo71/My-Project';

// Search looks at both languages, so "Печат" also finds printing tools on the English page.
const searchText = Object.fromEntries(products.map((product) => {
  const en = english[product.slug];
  return [product.slug, [product.name, product.category, product.description, ...product.features,
    en?.category ?? '', en?.description ?? '', ...(en?.features ?? [])].join(' ').toLocaleLowerCase()];
}));

export default function Home() {
  const [language, setLanguage] = useState<Language>('bg');
  const copy = ui[language];
  const translatedProducts = products.map(product => localized(product, language));
  const categories = [copy.all, ...Array.from(new Set(translatedProducts.map((product) => product.category)))];
  const [category, setCategory] = useState(ui.bg.all);
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState<{ product: Product; slide: number } | null>(null);
  const [system, setSystem] = useState<VisitorSystem>(null);
  // Per product, so starting a second download keeps the first card's instructions
  const [started, setStarted] = useState<Record<string, Platform>>({});
  useEffect(() => { setSystem(detectSystem()); }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return translatedProducts.filter((product) =>
      (category === copy.all || product.category === category) && (!needle || searchText[product.slug].includes(needle))
    );
  }, [category, query, language]);

  // Keep the chosen category when the language changes (the category names differ per language)
  const changeLanguage = (next: Language) => {
    const same = products.find((product) => localized(product, language).category === category);
    setCategory(same && category !== copy.all ? localized(same, next).category : ui[next].all);
    setLanguage(next);
    document.documentElement.lang = next;
  };
  const startedFor = (slug: string) => started[slug] ?? null;
  const download = (product: Product) => ({
    product: localized(product, language), language, system, started: startedFor(product.slug),
    onStart: (platform: Platform) => setStarted((value) => ({ ...value, [product.slug]: platform })),
  });

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ValBo Apps">
          <span className="brand-mark" aria-hidden="true">V</span><span>ValBo <strong>Apps</strong></span>
        </a>
        <div className="header-actions">
          <div className="language-switch" role="group" aria-label="Language">
            <button type="button" aria-pressed={language === 'bg'} className={language === 'bg' ? 'active' : ''} onClick={() => changeLanguage('bg')}>BG</button>
            <button type="button" aria-pressed={language === 'en'} className={language === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')}>EN</button>
          </div>
          <a className="header-link" href="#products"><span className="header-link-text">{copy.products}</span> <ArrowDown aria-hidden="true" size={15} /></a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>{copy.heroA} <em>{copy.heroB}</em></h1>
          <p className="hero-lede">{copy.lede}</p>
          <a className="primary-cta" href="#products">{copy.browse} <ArrowDown aria-hidden="true" size={18} /></a>
        </div>
        <nav className="hero-index" aria-label={copy.products}>
          <ol>
            {translatedProducts.map((product) => (
              <li key={product.slug}>
                <a href={`#${product.slug}`}><strong>{product.name}</strong><span>{product.category}</span></a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <section className="catalog" id="products" aria-labelledby="catalog-title">
        <div className="section-heading">
          <h2 id="catalog-title">{copy.choose}</h2><p>{copy.platform}</p>
        </div>

        <p className="trust-line"><ShieldCheck aria-hidden="true" size={18} /><span>{copy.trustLine} <a href={SOURCE_URL} target="_blank" rel="noopener">{copy.sourceLink}</a></span></p>
        {system === 'mobile' && <p className="mobile-note"><Smartphone aria-hidden="true" size={18} />{copy.mobileNote}</p>}

        <div className="catalog-tools">
          <div className="category-tabs" role="group" aria-label={copy.categoryLabel}>
            {categories.map((item) => <button type="button" aria-pressed={category === item} className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <label className="search-box">
            <Search size={18} aria-hidden="true" /><span className="sr-only">{copy.search}</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} />
            {query && <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label={copy.clearSearch}><X aria-hidden="true" size={16} /></button>}
          </label>
        </div>
        <div className="results-line" aria-live="polite"><span>{visible.length}</span> {visible.length === 1 ? copy.foundOne : copy.found}</div>
        <div className="product-list">
          {visible.map((product, index) => (
            <article className="product-card" key={product.slug} id={product.slug} aria-labelledby={`${product.slug}-title`}>
              <button className="product-visual" type="button" onClick={() => setDialog({ product, slide: 0 })} aria-label={`${copy.openPhotos} ${product.name}`}>
                <img src={product.image} alt={product.imageAlt} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" style={product.imagePosition ? { objectPosition: product.imagePosition } : undefined} />
                <span className="open-gallery"><Expand aria-hidden="true" size={16} /> {copy.photos} · {product.screenshots.length}</span>
              </button>
              <div className="product-info">
                <h3 id={`${product.slug}-title`}>{product.name}</h3>
                <p className="product-meta">{product.category} · {product.version}</p>
                <p className="product-description">{product.description}</p>
                <div className="product-links">
                  <button type="button" className="details-link" onClick={() => setDialog({ product, slide: 0 })}>{copy.details} <ArrowRight aria-hidden="true" size={16} /></button>
                  {manuals[product.slug] && <a className="manual-link" href={manuals[product.slug]![language]} target="_blank" rel="noopener"><BookOpen aria-hidden="true" size={17} />{copy.manual}</a>}
                </div>
                {product.credentials && <p className="credentials-line"><Info aria-hidden="true" size={16} /><span><strong>{copy.login}:</strong> {copy.user} <code>{product.credentials.username}</code> · {copy.password} <code>{product.credentials.password}</code>. {copy.changePassword}</span></p>}
                <DownloadBlock {...download(product)} />
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <div className="empty-state">
              <strong>{query.trim() ? <>{copy.noResultFor} „{query.trim()}“</> : copy.noResult}</strong>
              <div className="empty-actions">
                <span>{copy.tryCategory}</span>
                {categories.filter((item) => item !== copy.all).map((item) => <button type="button" key={item} onClick={() => { setQuery(''); setCategory(item); }}>{item}</button>)}
              </div>
              <button type="button" className="empty-clear" onClick={() => { setCategory(copy.all); setQuery(''); }}>{copy.clear}</button>
            </div>
          )}
        </div>
      </section>

      <footer>
        <span>ValBo Apps</span>
        <div><p>{copy.footer}</p><p className="footer-meta">{copy.author} · <a href={SOURCE_URL} target="_blank" rel="noopener">{copy.sourceLink}</a></p></div>
        <a href="#top">{copy.top} <ArrowUp aria-hidden="true" size={15} /></a>
      </footer>
      {dialog && <ProductDialog product={localized(dialog.product, language)} language={language} initialSlide={dialog.slide} onClose={() => setDialog(null)} download={download(dialog.product)} />}
    </main>
  );
}
