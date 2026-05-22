import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DbService } from '@services/db.service';
import { Deck } from '@models';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

interface DeckViewModel extends Deck {
  cardCount: number;
  dueCount: number;
}

@Component({
  selector: 'df-deck-list',
  imports: [RouterLink, RelativeDatePipe, EmptyStateComponent, MatIconModule, MatToolbarModule, MatListModule, MatButtonModule],
  template: `
    <mat-toolbar>
      <span>Decks</span>
      <span class="spacer"></span>
      @if (decks().length) {
        <span class="subtitle">{{ totalDue() }} due today</span>
      }
      <a mat-icon-button routerLink="/settings" aria-label="Settings">
        <mat-icon>settings</mat-icon>
      </a>
    </mat-toolbar>

    <div class="content">
      @if (decks().length === 0) {
        <df-empty-state title="No decks yet" subtitle="Create a deck or import a CSV" />
      } @else {
        <mat-nav-list>
          @for (deck of decks(); track deck.id) {
            <mat-list-item (click)="openDeck(deck)">
              <mat-icon matListItemIcon>style</mat-icon>
              <span matListItemTitle>{{ deck.name }}</span>
              <span matListItemLine>
                {{ deck.cardCount }} cards · {{ deck.updatedAt | relativeDate }}
                @if (deck.dueCount > 0) { · <strong class="due">{{ deck.dueCount }} due</strong> }
              </span>
            </mat-list-item>
          }
        </mat-nav-list>
      }
    </div>

    <button mat-fab extended class="fab" (click)="createDeck()">
      <mat-icon>add</mat-icon>
      New deck
    </button>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }
    .spacer { flex: 1; }
    .subtitle { font-size: 0.75rem; opacity: 0.6; margin-right: 0.5rem; }
    .due { color: var(--mat-sys-primary); }
    .content { flex: 1; overflow-y: auto; }
    .fab { position: absolute; bottom: 1.5rem; right: 1.5rem; }
  `],
})
export class DeckListComponent implements OnInit {
  private db = inject(DbService);
  private router = inject(Router);

  decks = signal<DeckViewModel[]>([]);
  totalDue = computed(() => this.decks().reduce((a, d) => a + d.dueCount, 0));

  async ngOnInit(): Promise<void> {
    const rawDecks = await this.db.getAllDecks();
    if (!rawDecks.length) return;
    const decks = await Promise.all(
      rawDecks.map(async (deck) => {
        const [cardCount, dueCount] = await Promise.all([
          this.db.getCardCount(deck.id!),
          this.db.getDueCount(deck.id!),
        ]);
        return { ...deck, cardCount, dueCount };
      }),
    );
    this.decks.set(decks);
  }

  openDeck(deck: DeckViewModel): void {
    this.router.navigate(
      deck.dueCount > 0 ? ['/decks', deck.id, 'study'] : ['/decks', deck.id, 'browse'],
    );
  }

  createDeck(): void {
    this.router.navigate(['/decks', 'create']);
  }
}
