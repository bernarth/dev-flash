import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { Deck } from '@models';
import { resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

interface DeckStudyInfo {
  deck: Deck;
  totalCards: number;
  dueCount: number;
}

@Component({
  selector: 'df-study-list',
  imports: [MatIconModule, MatToolbarModule, MatListModule, MatButtonModule, MatProgressSpinnerModule, EmptyStateComponent],
  template: `
    <mat-toolbar>Study</mat-toolbar>

    <div class="content">
      @if (data.isLoading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (items().length === 0) {
        <df-empty-state title="No decks yet" subtitle="Create a deck or import a CSV to get started" />
      } @else {
        <mat-list>
          @for (item of items(); track item.deck.id) {
            <mat-list-item class="deck-item">
              <mat-icon matListItemIcon>layers</mat-icon>
              <span matListItemTitle>{{ item.deck.name }}</span>
              <span matListItemLine>
                {{ item.totalCards }} cards
                @if (item.dueCount > 0) {
                  &nbsp;·&nbsp;<span class="due">{{ item.dueCount }} due</span>
                } @else {
                  &nbsp;·&nbsp;All caught up
                }
              </span>
              <div matListItemMeta class="deck-actions">
                <button
                  mat-flat-button
                  class="study-btn"
                  [disabled]="item.dueCount === 0"
                  (click)="startStudy(item.deck.id!)"
                  [attr.aria-label]="'Study ' + item.deck.name"
                >
                  Study
                  @if (item.dueCount > 0) {
                    <span class="mode-count">{{ item.dueCount }}</span>
                  }
                </button>
              </div>
            </mat-list-item>
          }
        </mat-list>
      }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
    .content { flex: 1; overflow-y: auto; }
    .loading { display: flex; justify-content: center; padding: 4rem 1rem; }
    .due { color: var(--mat-sys-primary); font-weight: 600; }
    .deck-actions { display: flex; gap: 0.375rem; align-items: center; }
    .study-btn {
      min-width: 0 !important;
      padding: 0 0.625rem !important;
      font-size: 0.75rem !important;
      height: 2rem !important;
      line-height: 2rem !important;
    }
    .mode-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.25rem;
      height: 1.25rem;
      border-radius: 999px;
      background: currentColor;
      color: var(--mat-sys-surface);
      font-size: 0.625rem;
      font-weight: 700;
      margin-left: 0.25rem;
      opacity: 0.9;
    }
    :host ::ng-deep .deck-item .mat-mdc-list-item-meta { overflow: visible; }
  `],
})
export class StudyListComponent {
  private db = inject(DbService);
  private router = inject(Router);

  readonly data = resource({
    loader: async () => {
      const decks = await this.db.getAllDecks();
      const items: DeckStudyInfo[] = await Promise.all(
        decks.map(async (deck) => {
          const [totalCards, dueCount] = await Promise.all([
            this.db.getCardCount(deck.id!),
            this.db.getDueCount(deck.id!, deck.sessionCount),
          ]);
          return { deck, totalCards, dueCount };
        }),
      );
      return items;
    },
  });

  readonly items = () => this.data.value() ?? [];

  startStudy(deckId: number): void {
    void this.router.navigate(['/decks', deckId, 'study']);
  }
}
