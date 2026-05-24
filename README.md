# DevFlash

A focused flashcard PWA for developers preparing for technical interviews.
Works offline. No account needed. Runs on your phone.

**Live app:** [dev-flash.netlify.app](https://dev-flash.netlify.app/decks)

---

## Why DevFlash?

Anki is powerful but complex. DevFlash is built for one thing: helping developers study programming concepts efficiently, with just the features that matter.

- **Session-based scheduling** — Again / Hard / Good / Easy ratings control when a card comes back (measured in sessions, not days)
- **Code-aware cards** — questions and answers render syntax-highlighted code blocks
- **CSV import** — build decks in Excel or Google Sheets and import in seconds
- **100% offline** — install it on your phone, study anywhere
- **No backend** — your data stays on your device, no account needed

---

## Getting Started

### Prerequisites

- Node.js 18+
- Use `pnpm` install in your environment
- Angular CLI: `pnpm add -g @angular/cli`

### Install & Run

```bash
git clone <repo>
cd dev-flash
pnpm install
pnpm start
```

Open `http://localhost:4200` in your browser.

### Build for Production (PWA)

```bash
pnpm build --configuration production
```

Deploy the `dist/` folder to any static host (GitHub Pages, Netlify, Vercel — all free).

---

## Installing on Your Phone

1. Open the app URL in Chrome (Android) or Safari (iOS)
2. Android: tap the "Add to Home Screen" banner or browser menu
3. iOS: tap Share → "Add to Home Screen"

The app will work fully offline once installed.

---

## Creating Decks

### Option 1: Import a CSV

Create a spreadsheet with these columns and export as `.csv`:

```
question,answer,notes,tags
"What is Big-O notation?","A mathematical notation describing an algorithm's growth rate upper bound","Also called asymptotic notation","algorithms,complexity"
"What is a hash table?","A data structure mapping keys to values via a hash function","Average O(1) get/set","data-structures"
```

**Column rules:**
| Column | Required | Notes |
|---|---|---|
| `question` | Yes | Supports markdown and code blocks |
| `answer` | Yes | Supports markdown and code blocks |
| `notes` | No | Extra context, hidden during review by default |
| `tags` | No | Comma-separated: `"algorithms,sorting"` |

**Code blocks in cells** — use markdown fences:
```
"What does this do?","```js\nconst x = [1,2,3].map(n => n * 2);\n```","Returns [2,4,6]","javascript"
```

Then in the app: tap **+** → **Import CSV** → select your file → preview → import.

### Option 2: Add cards manually

Tap any deck → **Add Card** → fill in question, answer, and optional notes/tags.

---

## Studying

1. Tap a deck → **Study Now**
2. Read the question
3. Tap **Show Answer** when ready
4. Rate how well you knew it:

| Button | Meaning | Next review |
|---|---|---|
| **Again** | Didn't know it | Re-queued later in this session |
| **Hard** | Knew it, struggled | After `hardInterval` sessions (default 1) |
| **Good** | Knew it well | After `goodInterval` sessions (default 3) |
| **Easy** | Knew it immediately | After `easyInterval` sessions (default 5) |

5. After the answer is revealed, tap **Show notes** for extra context (hidden by default)
6. Finish the session → see your summary

The app tracks how many sessions each card needs before it returns. Cards rated **Again** stay in the current session; everything else is scheduled by session offset.

---

## Tags

Tag your cards to filter and study by topic:

- `algorithms` `data-structures` `complexity`
- `system-design` `databases` `networking`
- `oop` `design-patterns` `solid`
- `behavioral` `javascript` `python`

You can filter by tag in the Card Browser to study a specific area.

---

## Settings

| Setting | Default | Description |
|---|---|---|
| Hard interval | 1 | Sessions before a Hard-rated card comes back |
| Good interval | 3 | Sessions before a Good-rated card comes back |
| Easy interval | 5 | Sessions before an Easy-rated card comes back |

Settings also show local storage usage (decks, cards, review log) and a danger-zone reset that wipes all data from the device.

---

## Lighthouse Metrics

![Lighthouse metrics](./docs/lighthouse.png)

---

## Tech Stack

- **Angular 21** — standalone, signal-native
- **Dexie.js** — IndexedDB wrapper for offline storage
- **PapaParse** — CSV parsing
- **highlight.js** — syntax highlighting for code blocks
- **marked.js** — Markdown rendering
- **@angular/pwa** — service worker & installability
- **Angular Material 3** — UI components

---

## Contributing

This project is intentionally simple. Before adding a feature, ask: *does this make studying easier, or does it add friction?*

---

## License

MIT — use it, fork it, share it.
