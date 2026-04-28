import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { SrsService } from '@services/srs.service';
import { SettingsService } from '@services/settings.service';
import { Card, Rating } from '@models';
import { RATING_CONFIG } from '@core/constants/rating-config';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-study-session',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="df-screen">
      <header class="top-bar">
        <button class="icon-btn" (click)="exitStudy()">
          <df-icon name="back" [size]="22" />
        </button>
        <div class="deck-name">{{ deckName() }}</div>
        <span class="card-counter df-mono">{{ currentIdx() + 1 }}/{{ queue().length }}</span>
      </header>

      <div class="progress-wrap">
        <div class="progress-track">
          <span [style.width]="progressPct() + '%'"></span>
        </div>
      </div>

      @if (currentCard()) {
        <div class="card-area">
          <!-- FRONT -->
          <div class="flip-face df-card df-scroll front"
            [class.hidden]="flipped()"
            (click)="!flipped() && showAnswer()">
            <div class="tags">
              @for (tag of currentCard()!.tags; track tag) {
                <span class="tag df-mono">#{{ tag }}</span>
              }
            </div>
            <div class="face-label">QUESTION</div>
            <div class="question-text" [innerHTML]="currentCard()!.question"></div>
            <div class="flip-hint">Tap to reveal the answer</div>
          </div>

          <!-- BACK -->
          <div class="flip-face df-card df-scroll back" [class.visible]="flipped()">
            <div class="face-label answer-label">ANSWER</div>
            <div class="answer-text" [innerHTML]="currentCard()!.answer"></div>

            @if (currentCard()!.notes) {
              <button class="notes-toggle" (click)="showNotes.set(!showNotes())">
                <df-icon name="chev-down" [size]="14" class="notes-icon"
                  [style.transform]="showNotes() ? 'rotate(0)' : 'rotate(-90deg)'" />
                <df-icon name="notes" [size]="14" />
                <span>{{ showNotes() ? 'Hide notes' : 'Show notes' }}</span>
              </button>
              @if (showNotes()) {
                <div class="notes-panel" [innerHTML]="currentCard()!.notes!"></div>
              }
            }
          </div>
        </div>

        <div class="action-area">
          @if (!flipped()) {
            <button class="show-answer-btn" (click)="showAnswer()">Show Answer</button>
          } @else {
            <div class="rating-grid">
              @for (r of ratings; track r.key) {
                <button class="rating-btn"
                  [style.--rating-color]="r.color"
                  (click)="rate(r.key)">
                  <span class="rating-dot" [style.background]="r.color"></span>
                  <span class="rating-label">{{ r.label }}</span>
                  <span class="rating-interval df-mono">{{ r.interval }}</span>
                </button>
              }
            </div>
          }
        </div>

      } @else if (loading()) {
        <div class="status-msg">Loading cards…</div>
      } @else {
        <div class="status-msg">
          <p>No cards due!</p>
          <button class="show-answer-btn show-answer-btn--spaced" (click)="exitStudy()">Back to decks</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .df-screen { background: var(--df-bg); }
    .top-bar {
      display: flex; align-items: center; padding: 0.625rem 1rem; gap: 0.625rem; flex-shrink: 0;
    }
    .deck-name {
      flex: 1; font-size: 0.875rem; font-weight: 500; color: var(--df-text-muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .card-counter { font-size: 0.75rem; color: var(--df-text-muted); flex-shrink: 0; }
    .progress-wrap { padding: 0 1.25rem 0.75rem; flex-shrink: 0; }
    .progress-track {
      height: 4px; background: var(--df-surface-2); border-radius: var(--df-radius-pill); overflow: hidden;
    }
    .progress-track span {
      display: block; height: 100%; background: var(--df-primary);
      border-radius: var(--df-radius-pill); transition: width var(--df-transition-slow);
    }
    .card-area { flex: 1; padding: 0 1.25rem; position: relative; min-height: 0; }
    .flip-face {
      position: absolute; inset: 0; padding: 1.25rem;
      display: flex; flex-direction: column; gap: 0.875rem; overflow: auto;
      transition: opacity 320ms ease, transform 420ms cubic-bezier(.7,.1,.2,1);
    }
    .flip-face.front { cursor: pointer; opacity: 1; transform: rotateY(0) scale(1); z-index: var(--df-z-sticky); }
    .flip-face.front.hidden { opacity: 0; transform: rotateY(18deg) scale(0.97); pointer-events: none; z-index: var(--df-z-base); }
    .flip-face.back  { opacity: 0; transform: rotateY(-18deg) scale(0.97); pointer-events: none; z-index: var(--df-z-base); }
    .flip-face.back.visible { opacity: 1; transform: rotateY(0) scale(1); pointer-events: auto; z-index: var(--df-z-sticky); }
    .tags { display: flex; gap: 0.375rem; flex-wrap: wrap; }
    .tag {
      font-size: 0.6875rem; padding: 0.1875rem 0.5625rem; border-radius: var(--df-radius-pill);
      background: var(--df-surface-1); color: var(--df-text-muted);
      border: 1px solid var(--df-outline-soft);
    }
    .face-label { font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em; color: var(--df-text-faint); }
    .answer-label { color: var(--df-primary); }
    .question-text { font-size: 1.25rem; line-height: 1.35; letter-spacing: -0.015em; font-weight: 500; flex: 1; }
    .answer-text   { font-size: 0.906rem; line-height: 1.55; }
    .flip-hint { font-size: 0.75rem; color: var(--df-text-faint); text-align: center; }
    .notes-icon { transition: transform var(--df-transition-medium); }
    .notes-toggle {
      display: inline-flex; align-items: center; gap: 0.375rem;
      background: transparent; border: 0; color: var(--df-text-muted);
      cursor: pointer; font-family: inherit; font-size: 0.8125rem; font-weight: 500; padding: 0.5rem 0;
    }
    .notes-panel {
      background: var(--df-surface-1); border: 1px solid var(--df-outline-soft);
      border-left: 2px solid var(--df-primary);
      border-radius: 10px; padding: 0.75rem 0.875rem; font-size: 0.8125rem; line-height: 1.6;
    }
    .action-area { padding: 1rem 1.25rem 1.25rem; flex-shrink: 0; }
    .show-answer-btn {
      width: 100%; height: 3.25rem; border-radius: 16px; border: 0;
      background: var(--df-primary); color: var(--df-primary-ink);
      font-family: inherit; font-size: 0.9375rem; font-weight: 600;
      cursor: pointer; transition: transform var(--df-transition-base);
    }
    .show-answer-btn:active { transform: scale(0.98); }
    .show-answer-btn--spaced { margin-top: 1rem; }
    .rating-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
    .rating-btn {
      border: 1px solid var(--df-outline-soft); background: var(--df-surface-1); color: var(--df-text);
      border-radius: var(--df-radius); padding: 0.625rem 0.25rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.1875rem;
      cursor: pointer; font-family: inherit; transition: all 140ms;
    }
    .rating-btn:active {
      background: var(--rating-color); color: var(--df-primary-ink); border-color: var(--rating-color);
    }
    .rating-dot { width: 0.5rem; height: 0.5rem; border-radius: var(--df-radius-pill); }
    .rating-label { font-size: 0.8125rem; font-weight: 600; letter-spacing: -0.01em; }
    .rating-interval { font-size: 0.625rem; opacity: 0.7; }
    .status-msg {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      color: var(--df-text-muted); font-size: 0.875rem;
    }
  `],
})
export class StudySessionComponent implements OnInit {
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);
  private db              = inject(DbService);
  private srs             = inject(SrsService);
  private settingsService = inject(SettingsService);

  deckId     = signal(0);
  deckName   = signal('');
  queue      = signal<Card[]>([]);
  currentIdx = signal(0);
  flipped    = signal(false);
  showNotes  = signal(false);
  loading    = signal(true);

  currentCard = computed(() => this.queue()[this.currentIdx()] ?? null);
  progressPct = computed(() => {
    const total = this.queue().length;
    return total ? (this.currentIdx() / total) * 100 : 0;
  });

  readonly ratings = RATING_CONFIG;

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deckId.set(id);
    const deck = await this.db.getDeck(id);
    this.deckName.set(deck?.name ?? '');
    await this.loadQueue(id);
  }

  private async loadQueue(deckId: number): Promise<void> {
    const { maxReviewsPerDay, newCardsPerDay } = this.settingsService.settings();
    const [due, newCards] = await Promise.all([
      this.db.getDueCards(deckId, maxReviewsPerDay),
      this.db.getNewCards(deckId, newCardsPerDay),
    ]);
    const seen = new Set(newCards.map(c => c.id));
    this.queue.set([...newCards, ...due.filter(c => !seen.has(c.id))]);
    this.loading.set(false);
  }

  showAnswer(): void {
    this.flipped.set(true);
  }

  rate(rating: Rating): void {
    const card = this.currentCard();
    if (!card) return;

    // fire-and-forget: UI updates immediately (optimistic), DB writes happen in background
    void Promise.all([
      this.db.updateCard(card.id!, this.srs.applyRating(card, rating)),
      this.db.addReviewLog({ cardId: card.id!, deckId: this.deckId(), rating, reviewedAt: new Date() }),
    ]);

    if (rating === 'again') {
      const q = [...this.queue()];
      q.push(q.splice(this.currentIdx(), 1)[0]);
      this.queue.set(q);
    }

    const next = this.currentIdx() + (rating === 'again' ? 0 : 1);
    if (next >= this.queue().length) {
      this.router.navigate(['/decks', this.deckId(), 'summary']);
    } else {
      this.currentIdx.set(next);
      this.flipped.set(false);
      this.showNotes.set(false);
    }
  }

  exitStudy(): void {
    this.router.navigate(['/decks']);
  }
}
