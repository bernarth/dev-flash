# CLAUDE.md — DevFlash

Source of truth for Claude Code. Read fully before every session.
Update the checklist and decisions log as the project evolves.

---

## What This App Is

**DevFlash** — offline-first PWA flashcard app for programming interview prep.
Angular 21 · No backend · IndexedDB via Dexie.js · Mobile-first · No accounts.
Users import their own CSV decks. No login, no server, no cost.

---

## Package Manager

**pnpm only.** Never npm or yarn. Delete any `package-lock.json` or `yarn.lock` if found.

```bash
pnpm install / pnpm add <pkg> / pnpm add -D <pkg> / pnpm run <script>
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Angular 21 (standalone, signal-native) |
| Language | TypeScript strict, zero `any` |
| Storage | Dexie.js (IndexedDB) |
| Styling | Angular Material 3 + CSS custom properties |
| Code highlight | highlight.js |
| Markdown | marked.js (always sanitize output) |
| PWA | @angular/pwa |
| CSV | PapaParse + custom validation layer (ImportService) |

---

## Angular 21 — Non-Negotiable Patterns

- **Standalone only.** Zero NgModules. 
- **`input()` / `output()` / `model()`** — never `@Input()` / `@Output()` decorators.
- **`inject()`** — never constructor injection.
- **`signal()` / `computed()` / `effect()`** for all reactive state.
- **`resource()`** for component-level async data loading (experimental, intentionally chosen).
- **No `async/await` anywhere.** Use RxJS (`from()`, `switchMap`, etc.) for Dexie calls in services. Use `resource()` in components.
- **`loadComponent()`** for all feature routes — never eagerly import feature components.
- Services: `providedIn: 'root'`, injected with `inject()`.
- RxJS only where operators are genuinely needed (e.g. debounced search). Signals for everything else.

```typescript
// Correct Angular 21 style
export class CardViewerComponent {
  private srs = inject(SrsService);
  card = input.required<Card>();
  rated = output<Rating>();
  isFlipped = signal(false);
  showNotes = signal(false);
}
```

---

## App Shell and Layout Architecture

AppComponent is a thin shell. Navigation persists across all routes via LayoutComponent.

```
AppComponent
  └── LayoutComponent            (persistent shell — nav never re-mounts)
        ├── <nav>                (bottom nav mobile / sidenav desktop)
        └── <router-outlet>      (feature pages swap here)
```

```typescript
// app.routes.ts
{
  path: '',
  component: LayoutComponent,        // eagerly loaded shell
  children: [
    { path: 'decks',            loadComponent: () => import(...) },
    { path: 'decks/:id/study',  loadComponent: () => import(...) },
    { path: 'decks/:id/browse', loadComponent: () => import(...) },
    { path: 'settings',         loadComponent: () => import(...) },
    { path: '', redirectTo: 'decks', pathMatch: 'full' },
  ]
}
```

Layout behavior:
- Mobile (< 768px): bottom navigation bar — 4 icons: Decks, Study, Browse, Settings
- Desktop (>= 768px): collapsible side nav
- Active route highlighted via routerLinkActive
- Study session hides nav (full-screen focus mode)

---

## Project Structure

```
src/app/
  core/
    models/           # card, deck, review-log, settings, rating type
    services/
      db.service.ts         # ALL Dexie/IndexedDB access
      srs.service.ts        # pure SM-2 logic, no DB, no side effects
      import.service.ts     # PapaParse + schema validation
      export.service.ts     # JSON backup / restore
      theme.service.ts      # system / light / dark
      settings.service.ts   # AppSettings persisted to IndexedDB
    tokens/

  layout/
    layout.component.ts     # persistent shell with router-outlet
    bottom-nav/
    side-nav/

  features/
    decks/
      deck-list/
      deck-create/
      deck-import/
    study/
      study-session/
      study-summary/
    cards/
      card-browser/
      card-editor/
    settings/

  shared/
    components/
      card-flip/
      code-block/
      markdown-viewer/
      tag-chip-list/
      rating-buttons/
      session-progress-bar/
      empty-state/
      confirm-dialog/
    pipes/
      relative-date.pipe.ts
```

Architecture rules:
1. Only DbService accesses Dexie. Features call service methods only.
2. Shared components are purely presentational — no business logic.
3. Features are lazy-loaded. No cross-feature imports.
4. SrsService is pure: applyRating(card, rating) => Partial<Card>.
5. Models are readonly interfaces — never mutate, always create new objects.
6. One component per file.

---

## Data Models

```typescript
export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface Deck {
  id?: number;
  name: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id?: number;
  deckId: number;
  question: string;      // Markdown + fenced code blocks
  answer: string;        // Markdown + fenced code blocks
  notes?: string;        // Optional — hidden in review by default
  tags: string[];
  interval: number;
  easeFactor: number;    // starts at 2.5
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate?: Date;
}

export interface ReviewLog {
  id?: number;
  cardId: number;
  deckId: number;
  rating: Rating;
  reviewedAt: Date;
}

export interface AppSettings {
  newCardsPerDay: number;       // default 10
  maxReviewsPerDay: number;     // default 50
  startingEaseFactor: number;   // default 2.5
  theme: 'system' | 'light' | 'dark';
}
```

---

## SRS — Simplified SM-2

SrsService.applyRating(card, rating): Partial<Card> — pure, no side effects.

```
again  interval=1, repetitions=0, ease=max(1.3, ease-0.20)
hard   interval=ceil(interval x 1.2), ease=max(1.3, ease-0.15)
good   interval=ceil(interval x ease)
easy   interval=ceil(interval x ease x 1.3), ease=min(2.5, ease+0.10)

nextReviewDate = today + interval days (at midnight)
```

Session queue: new cards first (capped at newCardsPerDay) then due cards
(nextReviewDate <= today, total <= maxReviewsPerDay). "Again" cards re-queued at end.

---

## CSV Format and Validation

```csv
question,answer,notes,tags
"What is Big-O?","Upper bound of growth rate","Optional context","algorithms,complexity"
```

ImportService validation rules:

| Rule | On failure |
|---|---|
| Extension must be .csv | Reject, show error |
| Header must have question + answer columns | Reject file |
| Unknown columns | Warn, ignore, continue |
| Empty question or answer in a row | Skip row, log reason |
| Bad tags format | Sanitize, never reject |

```typescript
export interface ImportResult {
  imported: Omit<Card, 'id'>[];
  skipped: { row: number; reason: string }[];
  warnings: string[];
}
```

Always show ImportResult preview. User confirms -> DbService.bulkAddCards(). Cancel -> nothing written.

---

## Theming

- System default via prefers-color-scheme. User override in Settings.
- All colors via CSS custom properties with --df- prefix.
- highlight.js: github (light) / github-dark (dark), toggled by ThemeService.
- Card flip: CSS 3D transform (perspective + rotateY) — no JS animation.
- Design: clean, developer-focused. Monospace for code. No decorative chrome.

---

## Key Screens

Deck List — deck cards showing name, count, due today, last studied. FAB to create or import.

Study Session — question -> "Show Answer" -> flip -> rating buttons (Again/Hard/Good/Easy).
Progress bar at top. "Show notes" toggle after flip (hidden by default).
Keyboard shortcuts: Space=flip, 1-4=rate. Nav hidden in this screen (focus mode).

Study Summary — reviewed count, rating breakdown, next session estimate.

Card Browser — paginated list, tag filter chips, debounced text search, FAB to add card.

Card Editor — Question / Answer / Notes textareas + tag chip input. Live preview panel.

CSV Import Wizard — file picker -> row preview (5 rows) -> ImportResult summary -> confirm.

Settings — sliders for new/day, reviews/day, ease. Theme toggle. Export/import JSON. Reset all.

---

## PWA

- @angular/pwa with ngsw-config.json
- Precache: app shell + static assets + highlight.js CSS
- Manifest: name=DevFlash, short_name=DevFlash, display=standalone
- Icons: assets/icons/icon-192.png, assets/icons/icon-512.png

---

## Progress Checklist

- [ ] Angular 21 project scaffolded
- [ ] pnpm only (pnpm-lock.yaml present, no package-lock.json)
- [ ] @angular/pwa configured
- [ ] @angular/material M3 custom theme
- [ ] Dexie.js, PapaParse, highlight.js, marked.js installed
- [ ] Core models
- [ ] DbService
- [ ] SrsService (pure)
- [ ] ImportService
- [ ] ExportService
- [ ] ThemeService
- [ ] SettingsService
- [ ] LayoutComponent + bottom-nav + side-nav
- [ ] app.routes.ts with layout shell + lazy children
- [ ] Shared components (card-flip, code-block, markdown-viewer, tag-chip-list, rating-buttons)
- [ ] Deck List
- [ ] Study Session
- [ ] Study Summary
- [ ] Card Browser
- [ ] Card Editor
- [ ] CSV Import wizard
- [ ] Settings
- [ ] PWA manifest + service worker tuned
- [ ] Keyboard shortcuts (desktop)
- [ ] Offline tested Android Chrome
- [ ] Offline tested iOS Safari

---

## Decisions Log

| Decision | Rationale |
|---|---|
| No async/await | RxJS in services, resource() in components |
| resource() experimental | Signal-native, intentional — update if API changes |
| Angular 21 standalone | No NgModules, signal APIs throughout |
| pnpm | Strict hoisting, faster installs |
| No backend | IndexedDB only. Supabase if sync ever needed. |
| PapaParse + custom validation | Handles CSV edge cases; ImportService owns schema rules |
| No Web Worker for CSV | Files are small; revisit for 10k+ row bulk import |
| No difficulty labels on cards | SRS ratings handle this implicitly |
| Layout shell pattern | Nav persists across routes, no re-mount flicker |

---

## Commands

```bash
pnpm install
pnpm start
pnpm build
pnpm test
ng generate component features/decks/deck-list --standalone
```
## Task ending

Before reporting any task as completed, first run:

```bash
pnpm build
```

If the build fails correct all errors.

<!-- autoskills:start -->

Summary generated by `autoskills`. Check the full files inside `.claude/skills`.

## Angular Developer Guidelines

Generates Angular code and provides architectural guidance. Trigger when creating projects, components, or services, or for best practices on reactivity (signals, linkedSignal, resource), forms, dependency injection, routing, SSR, accessibility (ARIA), animations, styling (component styles, Tailw...

- `.claude/skills/angular-developer/SKILL.md`
- `.claude/skills/angular-developer/references/angular-animations.md`: When animating elements in Angular, **first analyze the project's Angular version** in `package.json`. For modern applications (**Angular v20.2 and above**), prefer using native CSS with `animate.enter` and `animate.leave`. For older applications, you may need to use the deprecated `@angular/anim...
- `.claude/skills/angular-developer/references/angular-aria.md`: Angular Aria (`@angular/aria`) is a collection of headless, accessible directives that implement common WAI-ARIA patterns. These directives handle keyboard interactions, ARIA attributes, focus management, and screen reader support.
- `.claude/skills/angular-developer/references/cli.md`: The Angular CLI (`ng`) is the primary tool for managing an Angular workspace. Always prefer CLI commands over manual file creation or generic `npm` commands when modifying project structure or adding Angular-specific dependencies.
- `.claude/skills/angular-developer/references/component-harnesses.md`: Component harnesses are the standard, preferred way to interact with components in tests. They provide a robust, user-centric API that makes tests less brittle and easier to read by insulating them from changes to a component's internal DOM structure.
- `.claude/skills/angular-developer/references/component-styling.md`: Angular components can define styles that apply specifically to their template, enabling encapsulation and modularity.
- `.claude/skills/angular-developer/references/components.md`: Angular components are the fundamental building blocks of an application. Each component consists of a TypeScript class with behaviors, an HTML template, and a CSS selector.
- `.claude/skills/angular-developer/references/creating-services.md`: Services in Angular are reusable pieces of code that handle data fetching, business logic, or state management that multiple components or other services need to access.
- `.claude/skills/angular-developer/references/data-resolvers.md`: Data resolvers fetch data before a route activates, ensuring components have the necessary data upon rendering.
- `.claude/skills/angular-developer/references/define-routes.md`: Routes are objects that define which component should render for a specific URL path.
- `.claude/skills/angular-developer/references/defining-providers.md`: Angular offers automatic and manual ways to provide dependencies to its Dependency Injection (DI) system.
- `.claude/skills/angular-developer/references/di-fundamentals.md`: Dependency Injection (DI) is a design pattern used to organize and share code across an application by allowing you to "inject" features into different parts. This improves code maintainability, scalability, and testability.
- `.claude/skills/angular-developer/references/e2e-testing.md`: This project uses [Cypress](https://www.cypress.io/) for end-to-end (E2E) testing, which simulates real user interactions in a browser. The E2E tests are located primarily within the `devtools/` package.
- `.claude/skills/angular-developer/references/effects.md`: In Angular, an **effect** is an operation that runs whenever one or more signal values it tracks change.
- `.claude/skills/angular-developer/references/hierarchical-injectors.md`: Angular's dependency injection system is hierarchical, meaning services can be scoped to different levels of the application.
- `.claude/skills/angular-developer/references/host-elements.md`: The **host element** is the DOM element that matches a component's selector. The component's template renders inside this element.
- `.claude/skills/angular-developer/references/injection-context.md`: The `inject()` function can only be used when code is executing within an **injection context**.
- `.claude/skills/angular-developer/references/inputs.md`: Inputs allow data to flow from a parent component to a child component. Angular recommends using the signal-based `input` API for modern applications.
- `.claude/skills/angular-developer/references/linked-signal.md`: The `linkedSignal` function lets you create writable state that is intrinsically linked to some other state. It is perfect for state that needs a default value derived from an input or another signal, but can still be independently modified by the user.
- `.claude/skills/angular-developer/references/loading-strategies.md`: Angular supports two main strategies for loading routes and components to balance initial load time and navigation responsiveness.
- `.claude/skills/angular-developer/references/mcp.md`: The Angular CLI includes a Model Context Protocol (MCP) server that enables AI assistants (like Cursor, Gemini CLI, JetBrains AI, etc.) to interact directly with the Angular CLI. It provides tools for code generation, modernizing code, fetching examples, and running builds/tests.
- `.claude/skills/angular-developer/references/navigate-to-routes.md`: Angular provides both declarative and programmatic ways to navigate between routes.
- `.claude/skills/angular-developer/references/outputs.md`: Outputs allow a child component to emit custom events that a parent component can listen to. Angular recommends using the new `output()` function for modern applications.
- `.claude/skills/angular-developer/references/reactive-forms.md`: Reactive forms provide a model-driven approach to handling form inputs. They are built around observable streams and provide synchronous access to the data model, making them more scalable and testable than template-driven forms.
- `.claude/skills/angular-developer/references/rendering-strategies.md`: Angular supports multiple rendering strategies to optimize for SEO, performance, and interactivity.
- `.claude/skills/angular-developer/references/resource.md`: A `Resource` incorporates asynchronous data fetching into Angular's signal-based reactivity. It executes an async loader function whenever its dependencies change, exposing the status and result as synchronous signals.
- `.claude/skills/angular-developer/references/route-animations.md`: Angular Router supports the browser's **View Transitions API** for smooth visual transitions between routes.
- `.claude/skills/angular-developer/references/route-guards.md`: Route guards control whether a user can navigate to or leave a route.
- `.claude/skills/angular-developer/references/router-lifecycle.md`: Angular Router emits events through the `Router.events` observable, allowing you to track the navigation lifecycle from start to finish.
- `.claude/skills/angular-developer/references/router-testing.md`: When testing components that involve routing, it is crucial **not to mock the Router or related services**. Instead, use the `RouterTestingHarness`, which provides a robust and reliable way to test routing logic in an environment that closely mirrors a real application.
- `.claude/skills/angular-developer/references/show-routes-with-outlets.md`: The `RouterOutlet` directive is a placeholder where Angular renders the component for the current URL.
- `.claude/skills/angular-developer/references/signal-forms.md`: Signal Forms are the recommended approach for handling forms in modern Angular applications (v21+). They provide a reactive, type-safe, and model-driven way to manage form state using Angular Signals.
- `.claude/skills/angular-developer/references/signals-overview.md`: Signals are the foundation of reactivity in modern Angular applications. A **signal** is a wrapper around a value that notifies interested consumers when that value changes.
- `.claude/skills/angular-developer/references/tailwind-css.md`: Tailwind CSS is a utility-first CSS framework that integrates seamlessly with Angular.
- `.claude/skills/angular-developer/references/template-driven-forms.md`: Template-driven forms use two-way data binding (`[(ngModel)]`) to update the data model in the component as changes are made in the template and vice versa. They are ideal for simple forms and use directives in the HTML template to manage form state and validation.
- `.claude/skills/angular-developer/references/testing-fundamentals.md`: This guide covers the fundamental principles and practices for writing unit tests in this repository, which uses Vitest as the test runner.

## Angular Core (`packages/core`) Mental Model

Explains the mental model and architecture of the code under `packages/core`. You MUST use this skill any time you plan to work with code in `packages/core`

- `.claude/skills/reference-core/SKILL.md`

## Signal Forms Architecture

Explains the mental model and architecture of the code under `packages/forms/signals`. You MUST use this skill any time you plan to work with code in `packages/forms/signals`

- `.claude/skills/reference-signal-forms/SKILL.md`
- `.claude/skills/reference-signal-forms/references/integration.md`: This document explains how the Signal Forms system hooks into the Angular compiler and runtime to provide seamless type-checking and efficient updates.

## TypeScript Advanced Types

Master TypeScript's advanced type system including generics, conditional types, mapped types, template literals, and utility types for building type-safe applications. Use when implementing complex type logic, creating reusable type utilities, or ensuring compile-time type safety in TypeScript pr...

- `.claude/skills/typescript-advanced-types/SKILL.md`

## Core

Vitest fast unit testing framework powered by Vite with Jest-compatible API. Use when writing tests, mocking, configuring coverage, or working with test filtering and fixtures.

- `.claude/skills/vitest/SKILL.md`
- `.claude/skills/vitest/GENERATION.md`
- `.claude/skills/vitest/references/advanced-environments.md`: Configure environments like jsdom, happy-dom for browser APIs
- `.claude/skills/vitest/references/advanced-projects.md`: Multi-project configuration for monorepos and different test types
- `.claude/skills/vitest/references/advanced-type-testing.md`: Test TypeScript types with expectTypeOf and assertType
- `.claude/skills/vitest/references/advanced-vi.md`: vi helper for mocking, timers, utilities
- `.claude/skills/vitest/references/core-cli.md`: Command line interface commands and options
- `.claude/skills/vitest/references/core-config.md`: Configure Vitest with vite.config.ts or vitest.config.ts
- `.claude/skills/vitest/references/core-describe.md`: describe/suite for grouping tests into logical blocks
- `.claude/skills/vitest/references/core-expect.md`: Assertions with matchers, asymmetric matchers, and custom matchers
- `.claude/skills/vitest/references/core-hooks.md`: beforeEach, afterEach, beforeAll, afterAll, and around hooks
- `.claude/skills/vitest/references/core-test-api.md`: test/it function for defining tests with modifiers
- `.claude/skills/vitest/references/features-concurrency.md`: Concurrent tests, parallel execution, and sharding
- `.claude/skills/vitest/references/features-context.md`: Test context, custom fixtures with test.extend
- `.claude/skills/vitest/references/features-coverage.md`: Code coverage with V8 or Istanbul providers
- `.claude/skills/vitest/references/features-filtering.md`: Filter tests by name, file patterns, and tags
- `.claude/skills/vitest/references/features-mocking.md`: Mock functions, modules, timers, and dates with vi utilities
- `.claude/skills/vitest/references/features-snapshots.md`: Snapshot testing with file, inline, and file snapshots

<!-- autoskills:end -->
