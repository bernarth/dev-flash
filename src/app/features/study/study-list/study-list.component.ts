import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { SettingsService } from '@services/settings.service';
import { Deck } from '@models';
import { resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

interface DeckWithDue {
  deck: Deck;
  dueCount: number;
  totalCards: number;
  nextReviewDate: Date | null;
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
            <mat-list-item>
              <mat-icon matListItemIcon>layers</mat-icon>
              <span matListItemTitle>{{ item.deck.name }}</span>
              <span matListItemLine>
                @if (item.dueCount > 0) {
                  <span class="due">{{ item.dueCount }} due</span>
                  &nbsp;·&nbsp;
                } @else if (item.nextReviewDate) {
                  {{ formatNextReview(item.nextReviewDate) }}&nbsp;·&nbsp;
                } @else {
                  No cards&nbsp;·&nbsp;
                }
                {{ item.totalCards }} cards
              </span>
              <button mat-flat-button matListItemMeta (click)="startStudy(item.deck.id!)"
                      [attr.aria-label]="'Study ' + item.deck.name">
                Study
              </button>
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
  `],
})
export class StudyListComponent {
  private db = inject(DbService);
  private settings = inject(SettingsService);
  private router = inject(Router);

  readonly data = resource({
    loader: async () => {
      const maxReviews = this.settings.settings().maxReviewsPerDay;
      const decks = await this.db.getAllDecks();
      const items: DeckWithDue[] = await Promise.all(
        decks.map(async (deck) => {
          const [dueCount, totalCards, nextReviewDate] = await Promise.all([
            this.db.getDueCount(deck.id!),
            this.db.getCardCount(deck.id!),
            this.db.getNextReviewDate(deck.id!),
          ]);
          return { deck, dueCount: Math.min(dueCount, maxReviews), totalCards, nextReviewDate };
        }),
      );
      return items;
    },
  });

  readonly items = () => this.data.value() ?? [];

  startStudy(deckId: number): void {
    void this.router.navigate(['/decks', deckId, 'study']);
  }

  formatNextReview(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffH = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffD = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffH <= 1) return 'Next review in < 1h';
    if (diffH < 24) return `Next review in ${diffH}h`;
    if (diffD === 1) return 'Next review tomorrow';
    return `Next review in ${diffD}d`;
  }
}
