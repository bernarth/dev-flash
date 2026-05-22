import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { SrsService } from '@services/srs.service';
import { SettingsService } from '@services/settings.service';
import { Card, Rating } from '@models';
import { RATING_CONFIG } from '@core/constants/rating-config';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'df-study-session',
  imports: [MatIconModule, MatProgressBarModule, MatButtonModule, MatToolbarModule],
  template: `
    <div class="screen">
      <mat-toolbar>
        <button mat-icon-button (click)="exitStudy()" aria-label="Exit study">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="deck-name">{{ deckName() }}</span>
        <span class="spacer"></span>
        <span class="card-counter df-mono">{{ currentIdx() + 1 }}/{{ queue().length }}</span>
      </mat-toolbar>

      <mat-progress-bar mode="determinate" [value]="progressPct()"></mat-progress-bar>

      @if (currentCard()) {
        <div class="card-area">
          <!-- FRONT -->
          <div
            class="flip-face df-scroll front"
            [class.hidden]="flipped()"
            (click)="!flipped() && showAnswer()"
          >
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
          <div class="flip-face df-scroll back" [class.visible]="flipped()">
            <div class="face-label answer-label">ANSWER</div>
            <div class="answer-text" [innerHTML]="currentCard()!.answer"></div>

            @if (currentCard()!.notes) {
              <button mat-button class="notes-toggle" (click)="showNotes.set(!showNotes())">
                <mat-icon class="notes-icon"
                  [style.transform]="showNotes() ? 'rotate(0)' : 'rotate(-90deg)'">expand_more</mat-icon>
                <mat-icon>notes</mat-icon>
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
            <button mat-flat-button class="show-answer-btn" (click)="showAnswer()">
              Show Answer
            </button>
          } @else {
            <div class="rating-grid">
              @for (r of ratings; track r.key) {
                <button mat-stroked-button class="rating-btn" (click)="rate(r.key)">
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
          <p>This deck has no cards yet.</p>
          <button mat-flat-button class="status-btn" (click)="exitStudy()">Back to decks</button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    .screen {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    .spacer { flex: 1; }
    .deck-name {
      font-size: 0.875rem;
      font-weight: 500;
      opacity: 0.7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-counter { font-size: 0.75rem; opacity: 0.6; flex-shrink: 0; }
    .card-area {
      flex: 1;
      padding: 0.75rem 1.25rem;
      position: relative;
      min-height: 0;
    }
    /* 3D card flip — no Material equivalent, keep as custom CSS */
    .flip-face {
      position: absolute;
      inset: 0;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      overflow: auto;
      border-radius: var(--mat-sys-shape-medium, 12px);
      background: var(--mat-sys-surface-container, #1b2129);
      border: 1px solid var(--mat-sys-outline-variant, #232a33);
      transition:
        opacity 320ms ease,
        transform 420ms cubic-bezier(0.7, 0.1, 0.2, 1);
    }
    .flip-face.front {
      cursor: pointer;
      opacity: 1;
      transform: rotateY(0) scale(1);
      z-index: 10;
    }
    .flip-face.front.hidden {
      opacity: 0;
      transform: rotateY(18deg) scale(0.97);
      pointer-events: none;
      z-index: 0;
    }
    .flip-face.back {
      opacity: 0;
      transform: rotateY(-18deg) scale(0.97);
      pointer-events: none;
      z-index: 0;
    }
    .flip-face.back.visible {
      opacity: 1;
      transform: rotateY(0) scale(1);
      pointer-events: auto;
      z-index: 10;
    }
    .tags { display: flex; gap: 0.375rem; flex-wrap: wrap; }
    .tag {
      font-size: 0.6875rem;
      padding: 0.1875rem 0.5625rem;
      border-radius: 999px;
      background: var(--mat-sys-surface-variant, #1b2129);
      opacity: 0.8;
    }
    .face-label {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      opacity: 0.5;
    }
    .answer-label { color: var(--mat-sys-primary); opacity: 1; }
    .question-text {
      font-size: 1.25rem;
      line-height: 1.35;
      letter-spacing: -0.015em;
      font-weight: 500;
      flex: 1;
    }
    .answer-text { font-size: 0.906rem; line-height: 1.55; }
    .flip-hint { font-size: 0.75rem; opacity: 0.4; text-align: center; }
    .notes-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: transparent;
      border: 0;
      opacity: 0.7;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.8125rem;
      font-weight: 500;
      padding: 0.5rem 0;
    }
    .notes-toggle mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .notes-icon { transition: transform 180ms ease; }
    .notes-panel {
      background: var(--mat-sys-surface-variant, #1b2129);
      border-left: 2px solid var(--mat-sys-primary);
      border-radius: 10px;
      padding: 0.75rem 0.875rem;
      font-size: 0.8125rem;
      line-height: 1.6;
    }
    .action-area { padding: 0.75rem 1.25rem 1.25rem; flex-shrink: 0; }
    .show-answer-btn { width: 100%; height: 3.25rem; font-size: 0.9375rem; font-weight: 600; }
    .rating-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
    .rating-btn {
      flex-direction: column !important;
      height: auto !important;
      padding: 0.625rem 0.25rem !important;
      min-width: 0 !important;
    }
    .rating-dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; }
    .rating-label { font-size: 0.8125rem; font-weight: 600; }
    .rating-interval { font-size: 0.625rem; opacity: 0.6; }
    .status-msg {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      font-size: 0.875rem;
    }
    .status-btn { margin-top: 1rem; }
  `],
})
export class StudySessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DbService);
  private srs = inject(SrsService);
  private settingsService = inject(SettingsService);

  deckId = signal(0);
  deckName = signal('');
  queue = signal<Card[]>([]);
  currentIdx = signal(0);
  flipped = signal(false);
  showNotes = signal(false);
  loading = signal(true);

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
    const seen = new Set(newCards.map((c) => c.id));
    const srsQueue = [...newCards, ...due.filter((c) => !seen.has(c.id))];

    if (srsQueue.length > 0) {
      this.queue.set(srsQueue);
    } else {
      const all = await this.db.getCardsByDeck(deckId);
      this.queue.set(all);
    }
    this.loading.set(false);
  }

  showAnswer(): void {
    this.flipped.set(true);
  }

  rate(rating: Rating): void {
    const card = this.currentCard();
    if (!card) return;

    void Promise.all([
      this.db.updateCard(card.id!, this.srs.applyRating(card, rating)),
      this.db.addReviewLog({
        cardId: card.id!,
        deckId: this.deckId(),
        rating,
        reviewedAt: new Date(),
      }),
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
