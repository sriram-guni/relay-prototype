# Relay — Good stuff. New semester.

**The dorm essentials you need, from the students who don't.**

Relay is a clickable prototype of a campus marketplace that connects UIUC students moving *out* of residence halls with students moving *in*. It was built for the TE 200 Idea Fair (December 4, 2026).

> This is a prototype. All listings, people, ratings, pickups and claims are simulated. Nothing is bought, sold or reserved. Relay is not affiliated with or endorsed by University Housing.

---

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
```

```bash
npm run dev
```

The app opens in your browser at `http://localhost:5173`.

**For the booth**, use the production build. It is faster and needs no internet once installed:

```bash
npm run build
```

```bash
npm run preview
```

Then open `http://localhost:4173`.

- No backend, accounts, API keys or Wi-Fi needed. Fonts, images and icons are bundled.
- Refreshing the page also resets the demo.
- Best viewed in a laptop browser at full screen (the phone-style app sits next to the brand panel). On a phone, it becomes a normal full-screen app.

## Other commands

| Command | What it does |
| --- | --- |
| `npm test` | Automated end-to-end check of every demo flow (35 checks) in headless Edge or Chrome |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Type check + production build into `dist/` |
| `npm run assets` | Regenerates the poster images in `poster-assets/` |

`npm test` and `npm run assets` use your installed Microsoft Edge (or Google Chrome); they download nothing.

## What's in the app

| Screen | What it shows |
| --- | --- |
| **Discover** | Search, residence-area filters (ISR, FAR, PAR, Ikenberry), category chips, price sort, 12 seeded listings, a featured Relay-checked ISR mini fridge |
| **Item detail** | Seller rating, condition, a category-specific *Cleaned. Checked. Ready.* checklist, the proposed pickup point, and the **Claim for move-in day** flow |
| **List an item** | Full listing form with a required cleaning checklist, soft-goods restriction, Free / Set price toggle, optional photo upload, and a **Try sample** shortcut |
| **My claims** | Reserved → Picked up → Complete, with pickup confirmation and a 5-star rating |

The **AR** avatar (top right of Discover) opens **Reset demo**, which restores listings, claims, ratings, filters, the form and the current screen.

See [DEMO.md](DEMO.md) for the 30-second walkthrough, pitch notes and judge Q&A.

## Poster assets

Everything is in [`poster-assets/`](poster-assets):

| File | Use |
| --- | --- |
| `A-discover-phone.png`, `A-discover-screen.png` | Discover screen (framed cutout / full-bleed phone screen) |
| `B-fridge-detail-phone.png`, `B-fridge-checklist-phone.png`, `B-fridge-detail-full-screen.png` | The ISR fridge listing, its cleaning checklist, and a full-length scroll |
| `C-claim-date-phone.png`, `C-claim-success-phone.png`, `C-my-claims-phone.png` | Picking a move-in day, "It's yours!", and the move-in lineup |
| `E-list-item-phone.png`, `E-list-checklist-phone.png` | The listing form and its required checklist |
| `D-process-cream.png`, `D-process-navy.png`, `D-process-transparent.png` | LIST → CLAIM → PICK UP graphic |
| `relay-logo.svg`, `relay-logo-on-navy.svg`, `relay-mark.svg`, `relay-app-icon.svg` (+ PNGs) | Vector logo (wordmark converted to outlines, so it prints correctly anywhere) |
| `booth-desktop-view.png` | The full laptop composition, as judges will see it |

Phone screenshots are 3× resolution with transparent corners, so they stay crisp printed at 4–6 inches tall.

## Brand

| Token | Hex |
| --- | --- |
| Navy (type) | `#14213D` |
| Cream (background) | `#F7F4EC` |
| Orange (actions) | `#F28C28` |
| Trust green | `#287A5A` |
| Muted ink | `#657083` |

Type: **Space Grotesk** (headings) and **DM Sans** (interface), both open-source (SIL OFL) and bundled locally.

## Code map

```
src/
  App.tsx                 desktop presentation shell + app frame + navigation
  state/store.tsx         listings, claims, ratings (React reducer, no backend)
  data/seed.ts            12 fictional listings and sellers
  data/campus.ts          halls, pickup points, cleaning checklists, move-in dates, soft-goods rules
  screens/                Discover, ItemDetail, ListItem, MyClaims
  components/             ListingCard, ClaimSheet, Logo, ProcessSteps, BottomNav, ui (badges, sheet, toast, rating...)
  art/ProductArt.tsx      SVG "studio photos" of each product
scripts/qa.mjs            end-to-end test
scripts/poster-assets.mjs poster image export
```

Built with React, TypeScript, Vite, Tailwind CSS and Lucide icons.
