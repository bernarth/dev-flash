import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'decks',
    loadComponent: () =>
      import('@features/decks/deck-list/deck-list.component').then((m) => m.DeckListComponent),
  },
  {
    path: 'decks/create',
    loadComponent: () =>
      import('@features/decks/deck-create/deck-create.component').then(
        (m) => m.DeckCreateComponent,
      ),
  },
  {
    path: 'decks/:id/learn',
    loadComponent: () =>
      import('@features/study/learn-session/learn-session.component').then(
        (m) => m.LearnSessionComponent,
      ),
  },
  {
    path: 'decks/:id/review',
    loadComponent: () =>
      import('@features/study/study-session/study-session.component').then(
        (m) => m.StudySessionComponent,
      ),
  },
  {
    path: 'decks/:id/study',
    loadComponent: () =>
      import('@features/study/study-session/study-session.component').then(
        (m) => m.StudySessionComponent,
      ),
  },
  {
    path: 'decks/:id/summary',
    loadComponent: () =>
      import('@features/study/study-summary/study-summary.component').then(
        (m) => m.StudySummaryComponent,
      ),
  },
  {
    path: 'decks/:id/browse',
    loadComponent: () =>
      import('@features/cards/card-browser/card-browser.component').then(
        (m) => m.CardBrowserComponent,
      ),
  },
  {
    path: 'decks/:id/cards/:cardId',
    loadComponent: () =>
      import('@features/cards/card-editor/card-editor.component').then(
        (m) => m.CardEditorComponent,
      ),
  },
  {
    path: 'study',
    loadComponent: () =>
      import('@features/study/study-list/study-list.component').then((m) => m.StudyListComponent),
  },
  {
    path: 'import',
    loadComponent: () =>
      import('@features/import/import-wizard.component').then((m) => m.ImportWizardComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('@features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '',
    redirectTo: 'decks',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
