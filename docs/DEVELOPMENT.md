# DevFlash — Development

Conventions and commands for contributors and local development.

---

## Prerequisites

- **Node.js** 18+
- **pnpm** — this repo uses `pnpm` only (`packageManager` in `package.json`). Do not commit `package-lock.json` or `yarn.lock`.

```bash
corepack enable   # optional: use the pnpm version pinned by the project
pnpm install
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Dev server at [http://localhost:4202](http://localhost:4202) |
| `pnpm build` | Production build -> `dist/` |
| `pnpm test` | Unit tests (Vitest via Angular CLI) |
| `pnpm watch` | Development build in watch mode |

Verify production builds before merging:

```bash
pnpm build
```

---

## Path aliases

Defined in `tsconfig.json`:

| Alias | Maps to |
|-------|---------|
| `@core/*` | `src/app/core/*` |
| `@models` | `src/app/core/models/index.ts` |
| `@models/*` | `src/app/core/models/*` |
| `@services/*` | `src/app/core/services/*` |
| `@utils/*` | `src/app/core/utils/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@layout/*` | `src/app/layout/*` |

Use aliases instead of deep relative imports (`../../../`).

---

## Code conventions (summary)

Full agent-oriented spec: [`CLAUDE.md`](../CLAUDE.md). Highlights:

### Angular 21

- Standalone components only — no NgModules
- `input()` / `output()` / `model()` — not decorator `@Input` / `@Output`
- `inject()` — not constructor injection
- `signal()` / `computed()` for reactive state; avoid `effect()` unless necessary (comment why)
- Lazy `loadComponent()` for every feature route
- Signal queries (`viewChild`, …) — not `@ViewChild`
- `host: { '(event)': 'handler($event)' }` — not `@HostListener`
- Signal forms for multi-field validation; simple controls use `signal` + `[value]` binding

### Architecture

- **Only `DbService`** talks to Dexie
- **`SchedulerService`** is pure — no DB, no DOM
- **Features** orchestrate; **shared** is presentational only
- **No cross-feature imports**
- Readonly models — spread/update, never mutate in place

### Async

- Prefer `async/await` for Dexie and one-shot work
- RxJS when operators add value (debounce, cancel, HTTP pipelines)
- Fire-and-forget: `void db.updateCard(...)` when UI already moved on

### Styling

- Use `--df-font-size-*` and `--df-font-weight-*` from `src/styles/variables.scss`
- Icons: `--df-icon-size-*`
- No `@angular/animations` — CSS `transition` / `transform` only

### Components

- One component per file
- Selector prefix: `df-` (e.g. `df-study-session`)
- Icons: central `df-icon` when added — do not inline duplicate SVGs

---

## Adding a feature route

1. Generate under `src/app/features/<area>/<name>/`.
2. Register in `app.routes.ts` with `loadComponent: () => import('@features/...')`.
3. Call existing services — extend `DbService` if new persistence is required.
4. Add shared UI only after the second duplicate (DRY).

Example:

```bash
pnpm ng generate component features/decks/deck-list --standalone
```

---

## Testing

Tests use Vitest through `@angular/build:unit-test`. Place specs next to components (`*.spec.ts`).

Focus tests on:

- `SchedulerService` interval math
- `ImportService` validation edge cases
- `DbService` transactional behavior (mock IndexedDB / Dexie where needed)

---

## Deployment

Build artifacts are static files suitable for Netlify, Vercel, GitHub Pages, or any CDN.

```bash
pnpm build --configuration production
```

Publish the application output directory from `dist/dev-flash/browser`.

---

## Documentation map

| File | Purpose |
|------|---------|
| [README.md](../README.md) | Portfolio landing, quick start |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and data flow |
| [USER_GUIDE.md](./USER_GUIDE.md) | End-user instructions |
| [CLAUDE.md](../CLAUDE.md) | Maintainer / AI session source of truth |
