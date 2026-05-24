# DevFlash — User Guide

How to use DevFlash: install on your phone, create decks, study, and configure intervals.

**Live app:** [dev-flash.netlify.app](https://dev-flash.netlify.app/decks)

---

## Install on your phone

1. Open the app URL in **Chrome** (Android) or **Safari** (iOS).
2. **Android:** use “Add to Home Screen” from the menu or install banner.
3. **iOS:** Share → **Add to Home Screen**.

After installation, the app loads from cache and works without a network connection for study sessions (once assets and data are local).

---

## Creating decks

### Import from CSV

Create a spreadsheet with these columns and export as `.csv`:

```csv
question,answer,notes,tags
"What is Big-O notation?","A mathematical notation describing an algorithm's growth rate upper bound","Also called asymptotic notation","algorithms,complexity"
"What is a hash table?","A data structure mapping keys to values via a hash function","Average O(1) get/set","data-structures"
```

| Column | Required | Notes |
|--------|----------|-------|
| `question` | Yes | Markdown and code fences supported |
| `answer` | Yes | Markdown and code fences supported |
| `notes` | No | Extra context; hidden during review by default |
| `tags` | No | Comma-separated, e.g. `"algorithms,sorting"` |

**Code in a cell** — use markdown fences inside the quoted field:

```csv
"What does this do?","```js\nconst x = [1,2,3].map(n => n * 2);\n```","Returns [2,4,6]","javascript"
```

In the app: **Import** (nav) → select file → preview rows → confirm import.

Skipped rows and warnings are shown before anything is written to storage.

### Add cards manually

Open a deck → browse or add → fill question, answer, and optional notes/tags.

---

## Studying

1. Open a deck → **Study** (or use the **Study** tab for decks with due cards).
2. Read the question.
3. Tap **Show answer** (or tap the card) when ready.
4. Rate how well you knew it:

| Button | Meaning | Next review |
|--------|---------|-------------|
| **Again** | Didn't know it | Same session — card returns later in the queue |
| **Hard** | Knew it but struggled | After `hardInterval` sessions (default **1**) |
| **Good** | Knew it well | After `goodInterval` sessions (default **3**) |
| **Easy** | Knew it immediately | After `easyInterval` sessions (default **5**) |

5. After the answer is shown, open **notes** if you need extra context (optional field on the card).
6. Finish the session → view the **summary** (counts and breakdown).

Cards are “due” when `nextSession` is less than or equal to the deck’s completed session count. New cards (`nextSession = 0`) appear until you rate them out of the current session.

---

## Tags

Tags help you filter in the card browser and spot topics on each card during study.

Examples:

- `algorithms` `data-structures` `complexity`
- `system-design` `databases` `networking`
- `oop` `design-patterns` `solid`
- `behavioral` `javascript` `python`

Use the browser’s tag chips to narrow the list before editing or reviewing specific areas.

---

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Hard interval | 1 | Sessions before a Hard-rated card returns |
| Good interval | 3 | Sessions before a Good-rated card returns |
| Easy interval | 5 | Sessions before an Easy-rated card returns |

Settings also show **local storage usage** (decks, cards, review log size) and a **reset** action that wipes all data on the device. Export/import of JSON backups is planned.

---

## Tips

- Build large decks in a spreadsheet — faster than one-by-one entry.
- Use short tags consistently so filters stay useful.
- Rate honestly: **Again** is for cards you want to see again *today*, not a failure state.
- Adjust intervals in Settings if sessions feel too dense or too sparse.
