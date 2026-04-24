import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../../core/services/db.service';
import { Card } from '../../../core/models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'df-card-browser',
  standalone: true,
  imports: [FormsModule, EmptyStateComponent, IconComponent],
  template: `
    <div class="screen">
      <header class="top-bar">
        <button class="icon-btn" (click)="goBack()">
          <df-icon name="back" [size]="22" />
        </button>
        <div class="top-bar-center">
          <div class="title">{{ deckName() }}</div>
          <div class="subtitle df-mono">{{ cards().length }} cards</div>
        </div>
      </header>

      <!-- Search -->
      <div class="search-wrap">
        <div class="search-box">
          <df-icon name="search" [size]="18" class="search-icon" />
          <input
            class="search-input"
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
            placeholder="Search cards"
          />
          <span class="search-hint df-mono">⌘K</span>
        </div>
      </div>

      <!-- Tag chips -->
      <div class="tags-row df-scroll">
        @for (tag of allTags(); track tag) {
          <button class="tag-chip df-mono"
            [class.on]="activeTag() === tag"
            (click)="activeTag.set(tag)">
            {{ tag === 'All' ? 'All' : '#' + tag }}
          </button>
        }
      </div>

      <!-- Results info -->
      <div class="results-bar">
        <span class="df-mono results-count">{{ filtered().length }} {{ filtered().length === 1 ? 'result' : 'results' }}</span>
      </div>

      <!-- Card list -->
      <div class="content df-scroll">
        @if (filtered().length === 0) {
          <df-empty-state title="No cards match" />
        } @else {
          <div class="card-list">
            @for (card of filtered(); track card.id) {
              <div class="card-item df-card" (click)="editCard(card)">
                <div class="card-question">{{ card.question }}</div>
                <div class="card-footer">
                  <div class="card-tags">
                    @for (tag of card.tags; track tag) {
                      <span class="small-tag df-mono">#{{ tag }}</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- FAB -->
      <button class="fab" (click)="addCard()">
        <df-icon name="plus" [size]="22" [strokeWidth]="2" />
      </button>
    </div>
  `,
  styles: [`
    .screen {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    .top-bar {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid var(--df-outline-soft);
      gap: 10px;
      flex-shrink: 0;
    }
    .top-bar-center { flex: 1; min-width: 0; }
    .title {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.015em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .subtitle {
      font-size: 11px;
      color: var(--df-text-faint);
    }
    .search-wrap {
      padding: 10px 20px 8px;
      flex-shrink: 0;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--df-surface-1);
      border: 1px solid var(--df-outline-soft);
      border-radius: 12px;
      padding: 10px 12px;
    }
    .search-icon { color: var(--df-text-faint); flex-shrink: 0; }
    .search-input {
      flex: 1;
      background: transparent;
      border: 0;
      outline: none;
      font-family: inherit;
      font-size: 14px;
      color: var(--df-text);
    }
    .search-hint {
      font-size: 11px;
      color: var(--df-text-faint);
    }
    .tags-row {
      display: flex;
      gap: 6px;
      padding: 0 20px 10px;
      overflow-x: auto;
      flex-shrink: 0;
    }
    .tag-chip {
      display: inline-flex;
      align-items: center;
      height: 30px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: var(--df-surface-1);
      color: var(--df-text-muted);
      border: 1px solid var(--df-outline-soft);
      cursor: pointer;
      white-space: nowrap;
      transition: background 120ms, color 120ms;
    }
    .tag-chip.on {
      background: var(--df-primary-container);
      color: var(--df-on-primary-container);
      border-color: transparent;
    }
    .results-bar {
      padding: 0 20px 8px;
      flex-shrink: 0;
    }
    .results-count {
      font-size: 11px;
      color: var(--df-text-faint);
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 0 20px 100px;
    }
    .card-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .card-item {
      padding: 14px;
      cursor: pointer;
      transition: background 120ms;
    }
    .card-item:hover { background: var(--df-surface-1); }
    .card-question {
      font-size: 14px;
      line-height: 1.4;
      font-weight: 500;
      letter-spacing: -0.01em;
    }
    .card-footer {
      margin-top: 10px;
    }
    .card-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .small-tag {
      font-size: 10.5px;
      padding: 2px 7px;
      border-radius: 999px;
      background: var(--df-surface-1);
      color: var(--df-text-muted);
      border: 1px solid var(--df-outline-soft);
    }
    .fab {
      position: absolute;
      right: 20px;
      bottom: 20px;
      width: 56px;
      height: 56px;
      border-radius: 18px;
      background: var(--df-primary);
      color: var(--df-primary-ink);
      border: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 24px -8px rgba(56, 217, 224, 0.55);
    }
  `],
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
    this.cards().forEach(c => c.tags.forEach(t => tags.add(t)));
    return ['All', ...Array.from(tags).sort()];
  });

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    const tag = this.activeTag();
    return this.cards().filter(c =>
      (tag === 'All' || c.tags.includes(tag)) &&
      (!q || c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q))
    );
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deckId.set(id);
    this.db.getDeck(id).subscribe(d => this.deckName.set(d?.name ?? ''));
    this.db.getCardsByDeck(id).subscribe(cards => this.cards.set(cards));
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
