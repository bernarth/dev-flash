import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
  Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppSettings, Card, Deck, DEFAULT_SETTINGS, Rating } from '@models';
import { RATING_CONFIG } from '@core/constants/rating-config';
import { CardService } from '@core/services/card.service';
import { DeckService } from '@core/services/deck.service';
import { ReviewLogsService } from '@core/services/review-logs.service';
import { SchedulerService } from '@services/scheduler.service';
import { SettingsService } from '@services/settings.service';
import { StudyFlipCardComponent } from './parts/study-flip-card.component';
import { StudyRatingGridComponent } from './parts/study-rating-grid.component';

@Component({
  selector: 'df-study-session',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatToolbarModule,
    StudyFlipCardComponent,
    StudyRatingGridComponent,
  ],
  templateUrl: './study-session.component.html',
  styleUrl: './study-session.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudySessionComponent {
  private readonly router = inject(Router);
  private readonly deckService = inject(DeckService);
  private readonly cardService = inject(CardService);
  private readonly settingsService = inject(SettingsService);
  private readonly reviewLogsService = inject(ReviewLogsService);
  private readonly scheduler = inject(SchedulerService);

  protected readonly deck = input.required<Deck>();
  protected readonly deckHasCards = input.required<boolean>();

  protected readonly deckId: Signal<number> = computed(() => this.deck().id);
  protected readonly deckName = computed(() => this.deck().name);
  protected readonly deckSessionCount: Signal<number> = computed(() => this.deck().sessionCount);

  protected readonly settings = resource<AppSettings, unknown>({
    loader: () => this.settingsService.getSettings(),
  });
  protected readonly resolvedSettings = computed(() => this.settings.value() ?? DEFAULT_SETTINGS);

  protected readonly queue = resource<Card[], { deckId: number; currentSession: number }>({
    params: () => ({ deckId: this.deck().id, currentSession: this.deck().sessionCount }),
    loader: ({ params }) => this.cardService.getDueCards(params.deckId, params.currentSession),
  });

  protected readonly currentIdx = signal(0);
  protected readonly doneCount = signal(0);
  protected readonly flipped = signal(false);

  protected readonly currentCard = computed(
    () => (this.queue.value() ?? [])[this.currentIdx()] ?? null,
  );
  protected readonly totalCount = computed(
    () => this.doneCount() + (this.queue.value()?.length ?? 0),
  );
  protected readonly progressPercent = computed(() => {
    const total = this.totalCount();
    return total ? (this.doneCount() / total) * 100 : 0;
  });
  protected readonly emptyMessage = computed(() =>
    this.deckHasCards()
      ? 'All caught up! Come back after your next session.'
      : 'This deck has no cards yet.',
  );

  protected readonly ratingButtons = computed(() => {
    const { hardInterval, goodInterval, easyInterval } = this.resolvedSettings();
    return [
      { ...RATING_CONFIG[0], interval: 'now' },
      { ...RATING_CONFIG[1], interval: `+${hardInterval}` },
      { ...RATING_CONFIG[2], interval: `+${goodInterval}` },
      { ...RATING_CONFIG[3], interval: `+${easyInterval}` },
    ];
  });

  showAnswer(): void {
    this.flipped.set(true);
  }

  rate(rating: Rating): void {
    const card = this.currentCard();

    if (!card) {
      return;
    }

    void this.reviewLogsService.addReviewLog({
      cardId: card.id!,
      deckId: this.deckId(),
      rating,
      reviewedAt: new Date(),
    });

    if (rating === 'again') {
      const queue = [...(this.queue.value() ?? [])];
      queue.push(queue.splice(this.currentIdx(), 1)[0]);
      this.queue.set(queue);
      this.flipped.set(false);
      return;
    }

    void this.cardService.updateCard(
      card.id!,
      this.scheduler.applyRating(rating, this.deckSessionCount(), this.resolvedSettings()),
    );

    const remaining = [...(this.queue.value() ?? [])];
    remaining.splice(this.currentIdx(), 1);
    this.queue.set(remaining);
    this.doneCount.update((n) => n + 1);

    if (remaining.length === 0) {
      void this.deckService.updateDeck(this.deckId(), {
        sessionCount: this.deckSessionCount() + 1,
      });
      void this.router.navigate(['/decks', this.deckId(), 'summary']);
      return;
    }

    const nextIdx = Math.min(this.currentIdx(), remaining.length - 1);
    this.currentIdx.set(nextIdx);
    this.flipped.set(false);
  }

  exitStudy(): void {
    this.router.navigate(['/study']);
  }
}
