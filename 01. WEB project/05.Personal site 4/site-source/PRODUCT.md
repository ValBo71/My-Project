# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who come to download and use one specific application: print-shop and prepress staff (Spine & Creep Calculator, InDesign Booklet Creep, Printing Catalog), learners (Dictionary), job seekers (Observer V2) and car owners (Car Maintenance). They usually arrive looking for one tool, often from a Windows or macOS desktop, and need to tell quickly whether it does their job and which installer to take.

## Product Purpose

ValBo Apps is the download catalog for Valentin Bogdanov's practical desktop applications. A visit succeeds when the visitor understands what an application does – from its description, screenshots and PDF manual – and downloads the right installer for their system.

## Positioning

A small, hands-on collection of finished tools built for real work in specific trades (printing, learning, job search, car upkeep), each with its own Windows and macOS installer, real screenshots and a bilingual manual, free and without an account.

## Operating Context

- Six products, each with separate Windows and macOS installers under `/install/<product>/` and a SHA256SUMS.txt; sizes are shown next to each download.
- Car Maintenance's installers are small download installers: they fetch the app package from a GitHub Release at install time (internet needed during installation).
- Each product has BG and EN PDF manuals in `/manuals/`.
- Printing Catalog shows its public first login (admin / admin) on the site on purpose; changing it after the first login is recommended, not forced.
- Static site: source in `site-source` (vinext / React 19), built and copied to the site folder with `scripts/copy_to_target.ps1`; checked with `scripts/qa_site.py`.

## Capabilities and Constraints

- Bilingual: Bulgarian (default) and English; every product text, category and manual link switches with the language.
- Browse by category, search by name, description and features, product details dialog with a screenshot gallery.
- All applications are free and download directly, with no registration or account.
- The installers are unsigned: Windows and macOS may ask for confirmation – say so honestly, never hide it.
- Adding a product is one entry in `data/products.ts`; the English text and the manual are optional per product.

## Brand Commitments

- Name: ValBo Apps, with the "V" mark.

## Evidence on Hand

- Real screenshots of every application in `public/images/`, real PDF manuals in `public/manuals/`, real installers with checksums in `install/`.
- There are no testimonials, customer names, download statistics, ratings or press. Do not invent any.

## Product Principles

1. The right installer in seconds: platform, size and what happens during installation are clear before the click.
2. Show the real product: actual screenshots and manuals, not marketing illustrations or claims.
3. Honest about trade-offs: unsigned installers, internet needed for some installations, public default passwords.
4. Equal in both languages: nothing is Bulgarian-only or English-only.
5. Free and direct: no sign-up, no gate between the visitor and the download.

## Accessibility & Inclusion

WCAG 2.1 AA: contrast, visible keyboard focus, a modal dialog that keeps focus, 44px touch targets, reduced-motion support (established in the 26.09.2026 audit fixes).
