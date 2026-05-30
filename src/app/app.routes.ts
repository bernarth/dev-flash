import { Routes } from '@angular/router';
import { deckHasCards, deckResolver } from '@core/resolvers/deck.resolver';
import { cardResolver } from '@core/resolvers/card.resolver';

export const routes: Routes = [
  {
    path: 'study',
    loadComponent: () =>
      import('@features/study/study-list/study-list.component').then((m) => m.StudyListComponent),
  },
  {
    path: 'decks',
    loadComponent: () =>
      import('@features/decks/browse-list/browse-list.component').then(
        (m) => m.BrowseListComponent,
      ),
  },
  {
    path: 'decks/create',
    loadComponent: () =>
      import('@features/decks/deck-create/deck-create.component').then(
        (m) => m.DeckCreateComponent,
      ),
  },
  {
    path: 'decks/:id/study',
    loadComponent: () =>
      import('@features/study/study-session/study-session.component').then(
        (m) => m.StudySessionComponent,
      ),
    resolve: {
      deck: deckResolver,
      deckHasCards: deckHasCards,
    },
  },
  {
    path: 'decks/:id/summary',
    loadComponent: () =>
      import('@features/study/study-summary/study-summary.component').then(
        (m) => m.StudySummaryComponent,
      ),
  },
  {
    path: 'decks/:id/import',
    loadComponent: () =>
      import('@features/import/import-wizard.component').then((m) => m.ImportWizardComponent),
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
    resolve: { card: cardResolver },
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('@features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '',
    redirectTo: 'study',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
