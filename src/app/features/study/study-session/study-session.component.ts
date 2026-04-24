import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DbService } from '../../../core/services/db.service';
import { SrsService } from '../../../core/services/srs.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Card, Rating } from '../../../core/models';
import { RATING_CONFIG } from '../../../core/constants/rating-config';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'df-study-session',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="screen">
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
                <df-icon name="chev-down" [size]="14"
                  [style.transform]="showNotes() ? 'rotate(0)' : 'rotate(-90deg)'"
                  style="transition: transform 180ms" />
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
          <button class="show-answer-btn" style="margin-top:16px" (click)="exitStudy()">Back to decks</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .screen { display: flex; flex-direction: column; height: 100%; background: var(--df-bg); }
    .top-bar {
      display: flex; align-items: center; padding: 10px 16px; gap: 10px; flex-shrink: 0;
    }
    .deck-name {
      flex: 1; font-size: 14px; font-weight: 500; color: var(--df-text-muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .card-counter { font-size: 12px; color: var(--df-text-muted); flex-shrink: 0; }
    .progress-wrap { padding: 0 20px 12px; flex-shrink: 0; }
    .progress-track {
      height: 4px; background: var(--df-surface-2); border-radius: 999px; overflow: hidden;
    }
    .progress-track span {
      display: block; height: 100%; background: var(--df-primary);
      border-radius: 999px; transition: width 300ms;
    }
    .card-area { flex: 1; padding: 0 20px; position: relative; min-height: 0; }
    .flip-face {
      position: absolute; inset: 0; padding: 20px;
      display: flex; flex-direction: column; gap: 14px; overflow: auto;
      transition: opacity 320ms ease, transform 420ms cubic-bezier(.7,.1,.2,1);
    }
    .flip-face.front { cursor: pointer; opacity: 1; transform: rotateY(0) scale(1); z-index: 2; }
    .flip-face.front.hidden { opacity: 0; transform: rotateY(18deg) scale(0.97); pointer-events: none; z-index: 1; }
    .flip-face.back  { opacity: 0; transform: rotateY(-18deg) scale(0.97); pointer-events: none; z-index: 1; }
    .flip-face.back.visible { opacity: 1; transform: rotateY(0) scale(1); pointer-events: auto; z-index: 2; }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .tag {
      font-size: 11px; padding: 3px 9px; border-radius: 999px;
      background: var(--df-surface-1); color: var(--df-text-muted);
      border: 1px solid var(--df-outline-soft);
    }
    .face-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: var(--df-text-faint); }
    .answer-label { color: var(--df-primary); }
    .question-text { font-size: 20px; line-height: 1.35; letter-spacing: -0.015em; font-weight: 500; flex: 1; }
    .answer-text   { font-size: 14.5px; line-height: 1.55; }
    .flip-hint { font-size: 12px; color: var(--df-text-faint); text-align: center; }
    .notes-toggle {
      display: inline-flex; align-items: center; gap: 6px;
      background: transparent; border: 0; color: var(--df-text-muted);
      cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; padding: 8px 0;
    }
    .notes-panel {
      background: var(--df-surface-1); border: 1px solid var(--df-outline-soft);
      border-left: 2px solid var(--df-primary);
      border-radius: 10px; padding: 12px 14px; font-size: 13px; line-height: 1.6;
    }
    .action-area { padding: 16px 20px 20px; flex-shrink: 0; }
    .show-answer-btn {
      width: 100%; height: 52px; border-radius: 16px; border: 0;
      background: var(--df-primary); color: var(--df-primary-ink);
      font-family: inherit; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: transform 120ms;
    }
    .show-answer-btn:active { transform: scale(0.98); }
    .rating-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .rating-btn {
      border: 1px solid var(--df-outline-soft); background: var(--df-surface-1); color: var(--df-text);
      border-radius: 14px; padding: 10px 4px;
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      cursor: pointer; font-family: inherit; transition: all 140ms;
    }
    .rating-btn:active {
      background: var(--rating-color); color: var(--df-primary-ink); border-color: var(--rating-color);
    }
    .rating-dot { width: 8px; height: 8px; border-radius: 999px; }
    .rating-label { font-size: 13px; font-weight: 600; letter-spacing: -0.01em; }
    .rating-interval { font-size: 10px; opacity: 0.7; }
    .status-msg {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      color: var(--df-text-muted); font-size: 14px;
    }
  `],
})
export class StudySessionComponent implements OnInit {
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);
  private db              = inject(DbService);
  private srs             = inject(SrsService);
  private settingsService = inject(SettingsService);

  deckId         = signal(0);
  deckName       = signal('');
  queue          = signal<Card[]>([]);
  currentIdx     = signal(0);
  flipped        = signal(false);
  showNotes      = signal(false);
  loading        = signal(true);

  currentCard = computed(() => this.queue()[this.currentIdx()] ?? null);
  progressPct = computed(() => {
    const total = this.queue().length;
    return total ? (this.currentIdx() / total) * 100 : 0;
  });

  readonly ratings = RATING_CONFIG;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deckId.set(id);
    this.db.getDeck(id).subscribe(deck => this.deckName.set(deck?.name ?? ''));
    this.loadQueue(id);
  }

  private loadQueue(deckId: number): void {
    const { maxReviewsPerDay, newCardsPerDay } = this.settingsService.settings();
    forkJoin({
      due:      this.db.getDueCards(deckId, maxReviewsPerDay),
      newCards: this.db.getNewCards(deckId, newCardsPerDay),
    }).subscribe(({ due, newCards }) => {
      const seen = new Set(newCards.map(c => c.id));
      this.queue.set([...newCards, ...due.filter(c => !seen.has(c.id))]);
      this.loading.set(false);
    });
  }

  showAnswer(): void {
    this.flipped.set(true);
  }

  rate(rating: Rating): void {
    const card = this.currentCard();
    if (!card) return;

    this.db.updateCard(card.id!, this.srs.applyRating(card, rating)).subscribe();
    this.db.addReviewLog({ cardId: card.id!, deckId: this.deckId(), rating, reviewedAt: new Date() }).subscribe();

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
