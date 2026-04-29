import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { Card } from '@models';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-card-browser',
  imports: [EmptyStateComponent, IconComponent],
  template: `
    <div class="df-screen">
      <header class="top-bar">
        <button type="button" class="icon-btn" (click)="goBack()" aria-label="Go back">
          <df-icon name="back" [size]="22" />
        </button>
        <div class="top-bar-center">
          <div class="title">{{ deckName() }}</div>
          <div class="subtitle df-mono">{{ cards().length }} cards</div>
        </div>
      </header>

      <!-- Search -->
      <div class="search-wrap">
        <label class="search-box">
          <df-icon name="search" [size]="18" class="search-icon" />
          <input
            class="search-input"
            [value]="query()"
            (input)="onSearchInput($event)"
            placeholder="Search cards"
            aria-label="Search cards"
          />
          <span class="search-hint df-mono" aria-hidden="true">⌘K</span>
        </label>
      </div>

      <!-- Tag filter chips -->
      <div class="tags-row df-scroll" role="group" aria-label="Filter by tag">
        @for (tag of allTags(); track tag) {
          <button
            type="button"
            class="tag-chip df-mono"
            [class.on]="activeTag() === tag"
            [attr.aria-pressed]="activeTag() === tag"
            (click)="activeTag.set(tag)"
          >
            {{ tag === 'All' ? 'All' : '#' + tag }}
          </button>
        }
      </div>

      <!-- Results info -->
      <div class="results-bar">
        <span class="df-mono results-count" aria-live="polite">
          {{ filtered().length }} {{ filtered().length === 1 ? 'result' : 'results' }}
        </span>
      </div>

      <!-- Card list -->
      <div class="content df-scroll">
        @if (filtered().length === 0) {
          <df-empty-state title="No cards match" icon="search" />
        } @else {
          <ul class="card-list" role="list">
            @for (card of filtered(); track card.id) {
              <li>
                <button type="button" class="card-item df-card" (click)="editCard(card)">
                  <div class="card-question">{{ card.question }}</div>
                  <div class="card-footer">
                    <div class="card-tags" aria-label="Tags">
                      @for (tag of card.tags; track tag) {
                        <span class="small-tag df-mono">#{{ tag }}</span>
                      }
                    </div>
                  </div>
                </button>
              </li>
            }
          </ul>
        }
      </div>

      <!-- FAB -->
      <button type="button" class="df-fab" (click)="addCard()" aria-label="Add card">
        <df-icon name="plus" [size]="22" [strokeWidth]="2" />
      </button>
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
        display: flex;
        align-items: center;
        padding: 0.625rem 1rem;
        border-bottom: 1px solid var(--df-outline-soft);
        gap: 0.625rem;
        flex-shrink: 0;
      }
      .top-bar-center {
        flex: 1;
        min-width: 0;
      }
      .title {
        font-size: 0.9375rem;
        font-weight: 600;
        letter-spacing: -0.015em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .subtitle {
        font-size: 0.6875rem;
        color: var(--df-text-faint);
      }
      .search-wrap {
        padding: 0.625rem 1.25rem 0.5rem;
        flex-shrink: 0;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        background: var(--df-surface-1);
        border: 1px solid var(--df-outline-soft);
        border-radius: 12px;
        padding: 0.625rem 0.75rem;
        cursor: text;
      }
      .search-icon {
        color: var(--df-text-faint);
        flex-shrink: 0;
      }
      .search-input {
        flex: 1;
        background: transparent;
        border: 0;
        outline: none;
        font-family: inherit;
        font-size: 0.875rem;
        color: var(--df-text);
      }
      .search-hint {
        font-size: 0.6875rem;
        color: var(--df-text-faint);
      }
      .tags-row {
        display: flex;
        gap: 0.375rem;
        padding: 0 1.25rem 0.625rem;
        overflow-x: auto;
        flex-shrink: 0;
      }
      .tag-chip {
        display: inline-flex;
        align-items: center;
        height: 1.875rem;
        padding: 0 0.75rem;
        border-radius: var(--df-radius-pill);
        font-size: 0.75rem;
        font-weight: 500;
        background: var(--df-surface-1);
        color: var(--df-text-muted);
        border: 1px solid var(--df-outline-soft);
        cursor: pointer;
        white-space: nowrap;
        transition:
          background var(--df-transition-base),
          color var(--df-transition-base);
      }
      .tag-chip.on {
        background: var(--df-primary-container);
        color: var(--df-on-primary-container);
        border-color: transparent;
      }
      .results-bar {
        padding: 0 1.25rem 0.5rem;
        flex-shrink: 0;
      }
      .results-count {
        font-size: 0.6875rem;
        color: var(--df-text-faint);
      }
      .content {
        flex: 1;
        overflow-y: auto;
        padding: 0 1.25rem var(--df-space-fab);
      }
      .card-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .card-item {
        display: block;
        width: 100%;
        text-align: left;
        background: transparent;
        border: 0;
        padding: 0.875rem;
        cursor: pointer;
        font-family: inherit;
        color: inherit;
        transition: background var(--df-transition-base);
      }
      .card-item:hover {
        background: var(--df-surface-1);
      }
      .card-question {
        font-size: 0.875rem;
        line-height: 1.4;
        font-weight: 500;
        letter-spacing: -0.01em;
      }
      .card-footer {
        margin-top: 0.625rem;
      }
      .card-tags {
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
      }
      .small-tag {
        font-size: 0.656rem;
        padding: 0.125rem 0.4375rem;
        border-radius: var(--df-radius-pill);
        background: var(--df-surface-1);
        color: var(--df-text-muted);
        border: 1px solid var(--df-outline-soft);
      }
    `,
  ],
})
export class CardBrowserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DbService);

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

  addCard(): void {
    this.router.navigate(['/decks', this.deckId(), 'cards', 'new']);
  }
}
