import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, switchMap, of, map } from 'rxjs';
import { DbService } from '../../../core/services/db.service';
import { Deck } from '../../../core/models';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

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
    <div class="screen">
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

      <button class="fab" (click)="createDeck()">
        <df-icon name="plus" [size]="20" />
        <span>New deck</span>
      </button>
    </div>
  `,
  styles: [`
    .screen {
      display: flex; flex-direction: column;
      height: 100%; position: relative; overflow: hidden;
    }
    .top-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 12px;
      background: var(--df-bg); border-bottom: 1px solid var(--df-outline-soft);
      flex-shrink: 0;
    }
    .title { font-size: 22px; font-weight: 600; letter-spacing: -0.025em; }
    .subtitle { font-size: 12px; color: var(--df-text-faint); margin-top: 2px; }
    .top-bar-actions { display: flex; gap: 4px; }
    .content { flex: 1; overflow-y: auto; padding: 16px 20px 100px; }
    .deck-list { display: flex; flex-direction: column; gap: 10px; }
    .deck-card {
      padding: 14px; display: flex; gap: 14px; align-items: flex-start;
      cursor: pointer; transition: background 120ms;
    }
    .deck-card:hover { background: var(--df-surface-1); }
    .deck-icon {
      width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
      border: 1px solid; display: flex; align-items: center; justify-content: center;
    }
    .deck-info { flex: 1; min-width: 0; }
    .deck-header {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .deck-name {
      font-weight: 600; font-size: 15px; letter-spacing: -0.015em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .due-chip {
      font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px;
      background: var(--df-primary-container); color: var(--df-on-primary-container);
      white-space: nowrap; flex-shrink: 0;
    }
    .deck-meta {
      display: flex; gap: 10px; margin-top: 8px;
      font-size: 12px; color: var(--df-text-muted);
    }
    .dot { color: var(--df-text-faint); }
    .fab {
      position: absolute; right: 20px; bottom: 20px;
      height: 56px; min-width: 56px; padding: 0 20px; border-radius: 18px;
      background: var(--df-primary); color: var(--df-primary-ink); border: 0;
      cursor: pointer; font-family: inherit; font-weight: 600; font-size: 14px;
      display: inline-flex; align-items: center; gap: 8px;
      box-shadow: 0 10px 24px -8px rgba(56,217,224,0.55), 0 2px 0 rgba(0,0,0,0.2);
      letter-spacing: -0.01em; white-space: nowrap; transition: transform 120ms;
    }
    .fab:active { transform: scale(0.97); }
  `],
})
export class DeckListComponent {
  private db     = inject(DbService);
  private router = inject(Router);

  decks    = signal<DeckViewModel[]>([]);
  totalDue = computed(() => this.decks().reduce((a, d) => a + d.dueCount, 0));

  constructor() {
    this.db.getAllDecks().pipe(
      switchMap(rawDecks =>
        rawDecks.length
          ? forkJoin(rawDecks.map(deck =>
              forkJoin({
                cardCount: this.db.getCardCount(deck.id!),
                dueCount:  this.db.getDueCount(deck.id!),
              }).pipe(map(counts => ({ ...deck, ...counts })))
            ))
          : of([])
      )
    ).subscribe(result => this.decks.set(result));
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
