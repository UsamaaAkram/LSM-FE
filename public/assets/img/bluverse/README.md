# Bluverse custom artwork

Client-supplied images (Google Drive, received 20 Aug 2026). The untouched
originals live in `LSM-FE/design-assets/bluverse-originals/` — regenerate from
those if anything needs reworking.

They are deliberately **outside `public/`**: Vite copies everything in `public/`
verbatim into `dist/`, so leaving 70 MB of originals in here would ship them to
production. `design-assets/` is gitignored.

## Where each image is used

| File | Used by |
|---|---|
| `offer-*.png` (6) | About Us → Offerings cards (`Pages/about-us/section/offerings.tsx`) |
| `problem-*.png` (4) | Home → "The Problem" section (`HomePages/home-one/section/bv-struggling.tsx`) |
| `career-col-*.png` (6) | Career comparison table column headings (`HomePages/home-one/section/bv-compare.tsx`) |
| `career-row-*.png` (5) | Career comparison table row labels (same file) |
| `home-hero-main.jpg` / `.webp` | Home hero (`HomePages/home-one/section/bv-banner.tsx`) |

## Processing applied

The originals were phone/AI exports at 1024–3464px, 1.2–9 MB each (~70 MB
total) — unusable on a web page as-is. Each was trimmed of its transparent
margin, downscaled (icons to 512px, hero to 1200px) and written out as an
optimised PNG plus a WebP. Result: **70 MB → 7 MB PNG / 1.0 MB WebP**.

The hero is a photograph, so it ships as JPEG + WebP rather than PNG.

### Baked-in checkerboard removal

Five files had been exported from a transparent-background *preview*, so the
grey/white checkerboard was present as real pixels. On the site's white
background that renders as a grey checked square behind the artwork.

Affected: `problem-no-monetization`, `problem-ai-confusion`,
`problem-no-roadmap`, `career-col-risk`, `career-row-freelancing`.

Removed with a border-connected flood fill — only light, low-saturation pixels
reachable from the image edge were made transparent, so white highlights *inside*
the artwork (the shield's rim, the laptop keys, the AI badge) were preserved.
Verified by compositing over a saturated background.

If new versions of these five are ever supplied, please export them with a
genuinely transparent background rather than screenshotting the preview.
