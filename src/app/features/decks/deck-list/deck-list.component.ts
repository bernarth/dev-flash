import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DbService } from '@services/db.service';
import { Deck } from '@models';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

interface DeckViewModel extends Deck {
  cardCount: number;
  dueCount: number;
}

const DECK_COLORS = ['#38D9E0', '#C678DD', '#F2A84A', '#6FD78B', '#F26D6D', '#61AFEF'];

@Component({
  selector: 'df-deck-list',
  standalone: true,
  imports: [RouterLink, RelativeDatePipe, EmptyStateComponent, IconComponent],
  template: `
    <div class="df-screen">
      <header class="top-bar">
        <div class="top-bar-title">
          <div class="title">Decks</div>
          @if (decks().length) {
            <div class="subtitle df-mono">{{ decks().length }} decks · {{ totalDue() }} due today</div>
          }
        </div>
        <div class="top-bar-actions">
          <a routerLink="/settings" class="icon-btn" title="Settings">
            <df-icon name="settings" />
          </a>
        </div>
      </header>

      <div class="content df-scroll">
        @if (decks().length === 0) {
          <df-empty-state title="No decks yet" subtitle="Create a deck or import a CSV" />
        } @else {
          <div class="deck-list">
            @for (deck of decks(); track deck.id) {
              <div class="deck-card df-card" (click)="openDeck(deck)">
                <div class="deck-icon"
                  [style.background]="deckColor(deck) + '22'"
                  [style.borderColor]="deckColor(deck) + '44'"
                  [style.color]="deckColor(deck)">
                  <df-icon name="stack" [size]="20" />
                </div>
                <div class="deck-info">
                  <div class="deck-header">
                    <div class="deck-name">{{ deck.name }}</div>
                    @if (deck.dueCount > 0) {
                      <span class="due-chip df-mono">{{ deck.dueCount }} due</span>
                    }
                  </div>
                  <div class="deck-meta">
                    <span class="df-mono">{{ deck.cardCount }} cards</span>
                    <span class="dot">·</span>
                    <span>{{ deck.updatedAt | relativeDate }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <button class="df-fab df-fab--extended" (click)="createDeck()">
        <df-icon name="plus" [size]="20" />
        <span>New deck</span>
      </button>
    </div>
  `,
  styles: [`
    .top-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem 0.75rem;
      background: var(--df-bg); border-bottom: 1px solid var(--df-outline-soft);
      flex-shrink: 0;
    }
    .title { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.025em; }
    .subtitle { font-size: 0.75rem; color: var(--df-text-faint); margin-top: 0.125rem; }
    .top-bar-actions { display: flex; gap: 0.25rem; }
    .content { flex: 1; overflow-y: auto; padding: 1rem 1.25rem var(--df-space-fab); }
    .deck-list { display: flex; flex-direction: column; gap: 0.625rem; }
    .deck-card {
      padding: 0.875rem; display: flex; gap: 0.875rem; align-items: flex-start;
      cursor: pointer; transition: background var(--df-transition-base);
    }
    .deck-card:hover { background: var(--df-surface-1); }
    .deck-icon {
      width: 2.5rem; height: 2.5rem; border-radius: 10px; flex-shrink: 0;
      border: 1px solid; display: flex; align-items: center; justify-content: center;
    }
    .deck-info { flex: 1; min-width: 0; }
    .deck-header {
      display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
    }
    .deck-name {
      font-weight: 600; font-size: 0.9375rem; letter-spacing: -0.015em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .due-chip {
      font-size: 0.6875rem; font-weight: 600; padding: 0.1875rem 0.5rem;
      border-radius: var(--df-radius-pill);
      background: var(--df-primary-container); color: var(--df-on-primary-container);
      white-space: nowrap; flex-shrink: 0;
    }
    .deck-meta {
      display: flex; gap: 0.625rem; margin-top: 0.5rem;
      font-size: 0.75rem; color: var(--df-text-muted);
    }
    .dot { color: var(--df-text-faint); }
  `],
})
export class DeckListComponent implements OnInit {
  private db     = inject(DbService);
  private router = inject(Router);

  decks    = signal<DeckViewModel[]>([]);
  totalDue = computed(() => this.decks().reduce((a, d) => a + d.dueCount, 0));

  async ngOnInit(): Promise<void> {
    const rawDecks = await this.db.getAllDecks();
    if (!rawDecks.length) return;
    const decks = await Promise.all(
      rawDecks.map(async deck => {
        const [cardCount, dueCount] = await Promise.all([
          this.db.getCardCount(deck.id!),
          this.db.getDueCount(deck.id!),
        ]);
        return { ...deck, cardCount, dueCount };
      })
    );
    this.decks.set(decks);
  }

  deckColor(deck: Deck): string {
    return DECK_COLORS[(deck.id ?? 0) % DECK_COLORS.length];
  }

  openDeck(deck: DeckViewModel): void {
    this.router.navigate(
      deck.dueCount > 0
        ? ['/decks', deck.id, 'study']
        : ['/decks', deck.id, 'browse']
    );
  }

  createDeck(): void {
    this.router.navigate(['/decks', 'create']);
  }
}
