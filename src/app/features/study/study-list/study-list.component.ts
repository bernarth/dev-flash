import { Component, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { SettingsService } from '@services/settings.service';
import { Deck } from '@models';
import { IconComponent } from '@shared/components/icon/icon.component';

interface DeckWithDue {
  deck: Deck;
  dueCount: number;
  totalCards: number;
  nextReviewDate: Date | null;
}

@Component({
  selector: 'df-study-list',
  imports: [IconComponent],
  template: `
    <div class="df-screen">
      <header class="top-bar">
        <div class="title">Study</div>
      </header>

      <div class="content df-scroll">
        @if (data.isLoading()) {
          <div class="loading">Loading…</div>
        } @else if (items().length === 0) {
          <div class="empty-state">
            <df-icon name="stack" [size]="48" />
            <p class="empty-title">No decks yet</p>
            <p class="empty-sub">Create a deck or import a CSV to get started</p>
          </div>
        } @else {
          <div class="deck-list">
            @for (item of items(); track item.deck.id) {
              <div class="deck-card">
                <div class="deck-icon">
                  <df-icon name="layers" [size]="20" />
                </div>
                <div class="deck-info">
                  <div class="deck-name">{{ item.deck.name }}</div>
                  <div class="deck-meta">
                    @if (item.dueCount > 0) {
                      <span class="due-badge">{{ item.dueCount }} due</span>
                    } @else if (item.nextReviewDate) {
                      <span class="next-review">{{ formatNextReview(item.nextReviewDate) }}</span>
                    } @else {
                      <span class="all-done">No cards yet</span>
                    }
                    <span class="separator">·</span>
                    <span class="total">{{ item.totalCards }} cards</span>
                  </div>
                </div>
                <button
                  class="study-btn"
                  [class.study-btn--dim]="item.dueCount === 0"
                  (click)="startStudy(item.deck.id!)"
                  [attr.aria-label]="'Study ' + item.deck.name"
                >
                  <df-icon name="play" [size]="18" />
                  Study
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      .top-bar {
        padding: 1rem 1.25rem 0.75rem;
        background: var(--df-bg);
        border-bottom: 1px solid var(--df-outline-soft);
        flex-shrink: 0;
      }
      .title {
        font-size: 1.375rem;
        font-weight: 600;
        letter-spacing: -0.025em;
      }
      .content {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 1.25rem;
      }
      .loading {
        text-align: center;
        color: var(--df-text-muted);
        padding: 3rem 0;
        font-size: 0.875rem;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 4rem 1rem;
        color: var(--df-text-faint);
        text-align: center;
      }
      .empty-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--df-text-muted);
        margin: 0.5rem 0 0;
      }
      .empty-sub {
        font-size: 0.875rem;
        margin: 0;
      }
      .deck-list {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }
      .deck-card {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 0.875rem;
        background: var(--df-surface);
        border-radius: var(--df-radius-card);
        border: 1px solid var(--df-outline-soft);
      }
      .deck-icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 10px;
        background: var(--df-primary-container);
        color: var(--df-on-primary-container);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .deck-info {
        flex: 1;
        min-width: 0;
      }
      .deck-name {
        font-size: 0.9375rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .deck-meta {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        margin-top: 0.2rem;
        font-size: 0.75rem;
      }
      .due-badge {
        color: var(--df-primary);
        font-weight: 600;
      }
      .all-done {
        color: var(--df-text-faint);
      }
      .next-review {
        color: var(--df-text-muted);
      }
      .separator {
        color: var(--df-text-faint);
      }
      .total {
        color: var(--df-text-muted);
      }
      .study-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 1rem;
        border-radius: var(--df-radius-pill);
        border: 0;
        background: var(--df-primary);
        color: var(--df-primary-ink);
        font-family: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        flex-shrink: 0;
        transition: opacity var(--df-transition-base), transform var(--df-transition-base);
      }
      .study-btn:active {
        transform: scale(0.97);
      }
      .study-btn--dim {
        background: var(--df-surface-2);
        color: var(--df-text-muted);
      }
    `,
  ],
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
        decks.map(async deck => {
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
