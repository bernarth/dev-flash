import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { SchedulerService } from '@services/scheduler.service';
import { SettingsService } from '@services/settings.service';
import { AppSettings, Card, DEFAULT_SETTINGS, Rating } from '@models';
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
        <span class="card-counter df-mono">{{ doneCount() }}/{{ totalCount() }}</span>
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
                <mat-icon
                  class="notes-icon"
                  [style.transform]="showNotes() ? 'rotate(0)' : 'rotate(-90deg)'"
                  >expand_more</mat-icon
                >
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
              @for (r of ratingButtons(); track r.key) {
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
          <p>{{ emptyMessage() }}</p>
          <button mat-flat-button class="status-btn" (click)="exitStudy()">Back to decks</button>
        </div>
      }
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
      .screen {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      .spacer {
        flex: 1;
      }
      .deck-name {
        font-size: var(--df-font-size-base);
        font-weight: var(--df-font-weight-medium);
        opacity: 0.7;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .card-counter {
        font-size: var(--df-font-size-xs);
        opacity: 0.6;
        flex-shrink: 0;
      }
      .card-area {
        flex: 1;
        padding: 0.75rem 1.25rem;
        position: relative;
        min-height: 0;
      }
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
      .tags {
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
      }
      .tag {
        font-size: var(--df-font-size-xs);
        padding: 0.1875rem 0.5625rem;
        border-radius: 999px;
        background: var(--mat-sys-surface-variant, #1b2129);
        opacity: 0.8;
      }
      .face-label {
        font-size: var(--df-font-size-xs);
        font-weight: var(--df-font-weight-semibold);
        letter-spacing: 0.1em;
        opacity: 0.5;
      }
      .answer-label {
        color: var(--mat-sys-primary);
        opacity: 1;
      }
      .question-text {
        font-size: var(--df-font-size-lg);
        line-height: 1.35;
        letter-spacing: -0.015em;
        font-weight: var(--df-font-weight-medium);
        flex: 1;
      }
      .answer-text {
        font-size: var(--df-font-size-base);
        line-height: 1.55;
      }
      .flip-hint {
        font-size: var(--df-font-size-xs);
        opacity: 0.4;
        text-align: center;
      }
      .notes-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        background: transparent;
        border: 0;
        opacity: 0.7;
        cursor: pointer;
        font-family: inherit;
        font-size: var(--df-font-size-sm);
        font-weight: var(--df-font-weight-medium);
        padding: 0.5rem 0;
      }
      .notes-toggle mat-icon {
        font-size: var(--df-icon-size-sm);
        width: var(--df-icon-size-sm);
        height: var(--df-icon-size-sm);
      }
      .notes-icon {
        transition: transform 180ms ease;
      }
      .notes-panel {
        background: var(--mat-sys-surface-variant, #1b2129);
        border-left: 2px solid var(--mat-sys-primary);
        border-radius: 10px;
        padding: 0.75rem 0.875rem;
        font-size: var(--df-font-size-sm);
        line-height: 1.6;
      }
      .action-area {
        padding: 0.75rem 1.25rem 1.25rem;
        flex-shrink: 0;
      }
      .show-answer-btn {
        width: 100%;
        height: 3.25rem;
        font-size: var(--df-font-size-md);
        font-weight: var(--df-font-weight-semibold);
      }
      .rating-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
      }
      .rating-btn {
        flex-direction: column !important;
        height: auto !important;
        padding: 0.625rem 0.25rem !important;
        min-width: 0 !important;
      }
      .rating-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 999px;
      }
      .rating-label {
        font-size: var(--df-font-size-sm);
        font-weight: var(--df-font-weight-semibold);
      }
      .rating-interval {
        font-size: var(--df-font-size-2xs);
        opacity: 0.6;
      }
      .status-msg {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
        font-size: var(--df-font-size-base);
      }
      .status-btn {
        margin-top: 1rem;
      }
    `,
  ],
})
export class StudySessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DbService);
  private srs = inject(SchedulerService);
  private settingsService = inject(SettingsService);

  deckId = signal(0);
  deckName = signal('');
  currentSession = signal(0);
  settings = signal<AppSettings>({ ...DEFAULT_SETTINGS });
  queue = signal<Card[]>([]);
  currentIdx = signal(0);
  doneCount = signal(0);
  flipped = signal(false);
  showNotes = signal(false);
  loading = signal(true);
  deckHasCards = signal(false);

  currentCard = computed(() => this.queue()[this.currentIdx()] ?? null);
  totalCount = computed(() => this.doneCount() + this.queue().length);
  progressPct = computed(() => {
    const total = this.totalCount();
    return total ? (this.doneCount() / total) * 100 : 0;
  });
  emptyMessage = computed(() =>
    this.deckHasCards()
      ? 'All caught up! Come back after your next session.'
      : 'This deck has no cards yet.',
  );

  ratingButtons = computed(() => {
    const { hardInterval, goodInterval, easyInterval } = this.settings();
    return [
      { ...RATING_CONFIG[0], interval: 'now' },
      { ...RATING_CONFIG[1], interval: `+${hardInterval}` },
      { ...RATING_CONFIG[2], interval: `+${goodInterval}` },
      { ...RATING_CONFIG[3], interval: `+${easyInterval}` },
    ];
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deckId.set(id);
    const [deck, cardCount, settings] = await Promise.all([
      this.db.getDeck(id),
      this.db.getCardCount(id),
      this.settingsService.getSettings(),
    ]);
    this.deckName.set(deck?.name ?? '');
    this.deckHasCards.set(cardCount > 0);
    this.settings.set(settings);
    const session = deck?.sessionCount ?? 0;
    this.currentSession.set(session);
    const cards = await this.db.getDueCards(id, session);
    this.queue.set(cards);
    this.loading.set(false);
  }

  showAnswer(): void {
    this.flipped.set(true);
  }

  rate(rating: Rating): void {
    const card = this.currentCard();
    if (!card) return;

    void this.db.addReviewLog({
      cardId: card.id!,
      deckId: this.deckId(),
      rating,
      reviewedAt: new Date(),
    });

    if (rating === 'again') {
      const q = [...this.queue()];
      q.push(q.splice(this.currentIdx(), 1)[0]);
      this.queue.set(q);
      this.flipped.set(false);
      this.showNotes.set(false);
      return;
    }

    void this.db.updateCard(
      card.id!,
      this.srs.applyRating(rating, this.currentSession(), this.settings()),
    );

    const remaining = [...this.queue()];
    remaining.splice(this.currentIdx(), 1);
    this.queue.set(remaining);
    this.doneCount.update((n) => n + 1);

    if (remaining.length === 0) {
      void this.db.updateDeck(this.deckId(), { sessionCount: this.currentSession() + 1 });
      void this.router.navigate(['/decks', this.deckId(), 'summary']);
      return;
    }

    const nextIdx = Math.min(this.currentIdx(), remaining.length - 1);
    this.currentIdx.set(nextIdx);
    this.flipped.set(false);
    this.showNotes.set(false);
  }

  exitStudy(): void {
    this.router.navigate(['/decks']);
  }
}
