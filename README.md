# DevFlash

[![Live Demo](https://img.shields.io/badge/demo-dev--flash.netlify.app-00C7B7?style=flat-square)](https://dev-flash.netlify.app/decks)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Offline-first flashcard PWA for developers preparing for technical interviews. Import CSV decks, study with session-based scheduling, and keep all data on your device — no account, no backend.

**[Try the live app →](https://dev-flash.netlify.app/decks)**

---

## Why DevFlash?

Anki is powerful but heavy. DevFlash focuses on one workflow: review programming concepts efficiently on mobile or desktop, with only the features that matter for interview prep.

| Feature | What it gives you |
|--------|-------------------|
| **Session-based SRS** | Again / Hard / Good / Easy control when cards return (by study session, not calendar days) |
| **Code-aware cards** | Questions and answers support markdown and fenced code blocks |
| **CSV import** | Build decks in a spreadsheet, validate, preview, then import |
| **Local-first storage** | IndexedDB via Dexie — data never leaves the browser |
| **Mobile shell** | Bottom nav on small screens, side nav on desktop |

---

## Project highlights

Built as a portfolio-quality Angular 21 app with deliberate architecture boundaries:

- **Zoneless change detection** — `provideZonelessChangeDetection()` for signal-driven updates without Zone.js overhead
- **Standalone components** — no NgModules; lazy-loaded feature routes
- **Signal-native UI** — `input()` / `output()` / `signal()` / `computed()` throughout features
- **Layered services** — `DbService` owns all persistence; `SchedulerService` is pure scheduling logic; features stay presentational
- **Strict TypeScript** — path aliases (`@models`, `@features/*`, …) and readonly domain models
- **Path-alias layout** — `core` / `features` / `layout` / `shared` separation for scalable growth

See **[Architecture](docs/ARCHITECTURE.md)** for diagrams, data flow, and design rules.

---

## Screenshots & quality

![Lighthouse metrics](./docs/lighthouse.png)

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Angular 21 (standalone, signals) |
| Storage | Dexie.js → IndexedDB |
| UI | Angular Material 3 + CSS custom properties (`--df-*`) |
| CSV | PapaParse + `ImportService` validation |
| Markdown / code | marked.js, highlight.js (integration in progress) |
| Package manager | pnpm |

---

## Quick start

**Prerequisites:** Node.js 18+, [pnpm](https://pnpm.io/installation)

```bash
git clone https://github.com/bernarth/dev-flash.git
cd dev-flash
pnpm install
pnpm start
```

Open [http://localhost:4202](http://localhost:4202) (dev server port is configured in `package.json`).

---

## Documentation

| Doc | Audience |
|-----|----------|
| [Architecture](docs/ARCHITECTURE.md) | Developers — structure, routing, data model, SRS, services |
| [User guide](docs/USER_GUIDE.md) | End users — CSV format, studying, tags, settings |
| [Development](docs/DEVELOPMENT.md) | Contributors — conventions, scripts, path aliases |

Agent-oriented project notes live in [`CLAUDE.md`](CLAUDE.md) (not required for using the app).

---

## Color design

DevFlash uses a warm, low-strain palette designed for prolonged reading sessions.

### Principles

- **No pure black or white.** Pure #000000 on #FFFFFF creates the harshest contrast the eye can perceive, causing faster fatigue on long sessions. A warm off-white background (#F9F7F3) and dark charcoal text (#222222) retain readability while softening the visual load.
- **Warm background.** A slight warm bias (F9F7F3 vs FAFAFA) reduces the blue-light emission of the screen's white point, which is the main source of eye strain under artificial light.
- **Muted, desaturated accents.** Saturated vibrant colors demand more from the eye's color receptors. Accent colors (primary, SRS buttons) are desaturated by ≈30% from their equivalent Material defaults.
- **WCAG AA contrast.** Every text/background pair targets a contrast ratio ≥ 4.5:1 (body text) or ≥ 3:1 (large UI labels) as required by WCAG 2.1 AA.

### Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#F9F7F3` | Page background |
| Text | `#222222` | Body and heading text |
| Primary | Slate blue (M3 blue palette, light) | Buttons, active states, links |
| `--df-again` | `#C0444E` | "Again" rating button |
| `--df-hard` | `#C47C2B` | "Hard" rating button |
| `--df-good` | `#4A9E68` | "Good" rating button |
| `--df-easy` | `#2A9DB5` | "Easy" rating button |

Code syntax tokens use darker variants of the standard programmer-palette hues (purple for keywords, blue for functions, green for strings, orange for numbers) so they remain legible on white/near-white surfaces.

### References

- [Creating accessible colors for human eyes](https://uxdesign.cc/creating-accessible-colors-for-human-eyes-66ed6a083230) — UX Collective
- [WCAG 2.1 — Contrast minimum (AA)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

## Roadmap

- Service worker / installable PWA (`@angular/pwa`)
- Shared presentational library (`card-flip`, `markdown-viewer`, `rating-buttons`, central `df-icon`)
- Theme service + JSON export/restore
- Markdown sanitization and syntax highlighting wired through shared viewers

---

## Contributing

Keep the scope focused: *does this make studying easier, or add friction?* See [Development](docs/DEVELOPMENT.md) before opening a PR.

---

## License

MIT — use it, fork it, share it.
