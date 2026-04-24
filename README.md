# DevFlash

A focused flashcard PWA for developers preparing for technical interviews.
Works offline. No account needed. Runs on your phone.

---

## Why DevFlash?

Anki is powerful but complex. DevFlash is built for one thing: helping developers study programming concepts efficiently, with just the features that matter.

- **Spaced repetition** — Again / Hard / Good / Easy scheduling that adapts to you
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

First clone this repository

```bash
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

### Option 2: Ask Claude to generate a CSV

Prompt Claude (claude.ai) with something like:

> "Generate a DevFlash CSV deck on the topic of system design fundamentals. Include 20 cards. Use the format: question, answer, notes, tags. Output as a CSV code block."

Copy the CSV, save as a `.csv` file, and import it into the app.

### Option 3: Add cards manually

Tap any deck → **Add Card** → fill in question, answer, and optional notes/tags.

---

## Studying

1. Tap a deck → **Study Now**
2. Read the question
3. Tap **Show Answer** when ready
4. Rate how well you knew it:

| Button | Meaning | Next review |
|---|---|---|
| **Again** | Didn't know it | Later today |
| **Hard** | Knew it, struggled | Slightly sooner |
| **Good** | Knew it well | Standard interval |
| **Easy** | Knew it immediately | Longer interval |

5. After the answer is revealed, tap **Show notes** for extra context (hidden by default)
6. Finish the session → see your summary

The app remembers your ratings and schedules each card individually. Cards you find hard come back sooner. Cards you know well come back later.

---

## Card Format — Code Blocks

Questions and answers support full Markdown, including syntax-highlighted code:

````
What is the time complexity of this operation?

```python
def find(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
```
````

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
| New cards per day | 10 | Max new cards introduced per day |
| Max reviews per day | 50 | Cap on total reviews per day |
| Starting ease | 2.5 | Initial scheduling ease factor |

You can also export your data as JSON (backup) or import a previous backup.

---

## Suggested Topics to Build Decks For

| Topic | Study focus |
|---|---|
| Big-O / Complexity | Time and space complexity of common operations |
| Data Structures | Arrays, linked lists, trees, graphs, heaps, tries |
| Algorithms | Sorting, searching, dynamic programming, recursion |
| System Design | CAP theorem, load balancing, caching, databases |
| OOP & Design Patterns | SOLID, factory, singleton, observer, etc. |
| Databases | SQL vs NoSQL, indexing, transactions, normalization |
| Networking | HTTP, REST, WebSockets, DNS, TCP/IP |
| Behavioral | STAR method, common behavioral questions |
| Language-specific | JavaScript quirks, Python built-ins, C# features |

---

## Sharing Decks with Colleagues

1. Export your deck as a CSV (or just share the original file)
2. Your colleague opens the app, imports the CSV
3. Their progress is tracked independently on their own device

No server. No sync. No accounts. Just a file.

---

## Data & Privacy

All your data is stored locally in your browser's IndexedDB. Nothing is sent to any server. To back up or move your data, use **Settings → Export JSON**.

The plan in the future is to update and use a BaaS like Supabase and finally a dedicated backend.

---

## Tech Stack

- **Angular** — frontend framework
- **Dexie.js** — IndexedDB wrapper for offline storage
- **PapaParse** — CSV parsing
- **highlight.js** — syntax highlighting for code blocks
- **marked.js** — Markdown rendering
- **@angular/pwa** — service worker & installability
- **Angular Material** — UI components

---

## Contributing

This project is intentionally simple. Before adding a feature, ask: *does this make studying easier, or does it add friction?*

```bash
pnpm test          # run unit tests
pnpm build         # production build
```

---

## License

MIT — use it, fork it, share it.
