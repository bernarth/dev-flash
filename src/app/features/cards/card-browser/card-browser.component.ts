import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { Card } from '@models';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { AddCardsSheetComponent } from './add-cards-sheet.component';

@Component({
  selector: 'df-card-browser',
  imports: [
    EmptyStateComponent,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatListModule,
    MatButtonModule,
    MatBottomSheetModule,
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="goBack()" aria-label="Go back">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <div class="toolbar-title">
        <span>{{ deckName() }}</span>
        <span class="subtitle">{{ cards().length }} cards</span>
      </div>
    </mat-toolbar>

    <div class="search-wrap">
      <mat-form-field appearance="outline" class="search-field">
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          [value]="query()"
          (input)="onSearchInput($event)"
          placeholder="Search cards"
          aria-label="Search cards"
        />
      </mat-form-field>
    </div>

    <div class="tags-wrap">
      <mat-chip-listbox
        [value]="activeTag()"
        (change)="activeTag.set($event.value ?? 'All')"
        aria-label="Filter by tag"
      >
        @for (tag of allTags(); track tag) {
          <mat-chip-option [value]="tag">{{ tag === 'All' ? 'All' : '#' + tag }}</mat-chip-option>
        }
      </mat-chip-listbox>
    </div>

    <p class="results-count" aria-live="polite">
      {{ filtered().length }} {{ filtered().length === 1 ? 'result' : 'results' }}
    </p>

    <div class="content">
      @if (filtered().length === 0) {
        <df-empty-state title="No cards match" icon="search_off" />
      } @else {
        <mat-nav-list>
          @for (card of filtered(); track card.id) {
            <mat-list-item (click)="editCard(card)">
              <span matListItemTitle>{{ card.question }}</span>
              @if (card.tags.length) {
                <span matListItemLine>{{ card.tags.map((t) => '#' + t).join(' ') }}</span>
              }
            </mat-list-item>
          }
        </mat-nav-list>
      }
    </div>

    <button mat-fab class="fab" (click)="openAddSheet()" aria-label="Add cards">
      <mat-icon>add</mat-icon>
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
      }

      .toolbar-title {
        display: flex;
        flex-direction: column;
      }

      .subtitle {
        font-size: var(--df-font-size-xs);
        opacity: 0.6;
        line-height: 1;
      }
      .search-wrap {
        padding: 0.5rem 1rem 0;
        flex-shrink: 0;
      }
      .search-field {
        width: 100%;
      }
      .tags-wrap {
        padding: 0 1rem;
        flex-shrink: 0;
      }
      .results-count {
        font-size: var(--df-font-size-xs);
        opacity: 0.5;
        padding: 0 1rem 0.25rem;
        margin: 0;
      }
      .content {
        flex: 1;
        overflow-y: auto;
      }
      .fab {
        position: absolute;
        bottom: 1.5rem;
        right: 1.5rem;
      }
    `,
  ],
})
export class CardBrowserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DbService);
  private bottomSheet = inject(MatBottomSheet);

  deckId = signal(0);
  deckName = signal('');
  cards = signal<Card[]>([]);
  query = signal('');
  activeTag = signal('All');

  allTags = computed(() => {
    const tags = new Set<string>();
    this.cards().forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return ['All', ...Array.from(tags).sort()];
  });

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    const tag = this.activeTag();
    return this.cards().filter(
      (c) =>
        (tag === 'All' || c.tags.includes(tag)) &&
        (!q || c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q)),
    );
  });

  onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deckId.set(id);
    const [deck, cards] = await Promise.all([this.db.getDeck(id), this.db.getCardsByDeck(id)]);
    this.deckName.set(deck?.name ?? '');
    this.cards.set(cards);
  }

  goBack(): void {
    this.router.navigate(['/decks']);
  }

  editCard(card: Card): void {
    this.router.navigate(['/decks', this.deckId(), 'cards', card.id]);
  }

  openAddSheet(): void {
    this.bottomSheet
      .open(AddCardsSheetComponent)
      .afterDismissed()
      .subscribe((action: 'add' | 'import' | undefined) => {
        if (action === 'add') this.router.navigate(['/decks', this.deckId(), 'cards', 'new']);
        else if (action === 'import') this.router.navigate(['/decks', this.deckId(), 'import']);
      });
  }
}
