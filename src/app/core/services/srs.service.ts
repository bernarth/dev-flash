import { Injectable } from '@angular/core';
import { Card } from '@models/card';
import { Rating } from '@models/rating';
import { startOfDay } from '@utils/date.utils';

@Injectable({ providedIn: 'root' })
export class SrsService {
  /**
   * Pure SM-2 calculation. No side effects, no DB access.
   * Returns only the fields that change.
   */
  applyRating(card: Card, rating: Rating): Partial<Card> {
    let { interval, easeFactor, repetitions } = card;

    switch (rating) {
      case 'again':
        interval = 1;
        repetitions = 0;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        break;
      case 'hard':
        interval = Math.ceil(interval * 1.2);
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        break;
      case 'good':
        interval = Math.ceil(interval * easeFactor);
        break;
      case 'easy':
        interval = Math.ceil(interval * easeFactor * 1.3);
        easeFactor = Math.min(2.5, easeFactor + 0.1);
        break;
    }

    // Minimum interval = 1 day
    interval = Math.max(1, interval);

    const nextReviewDate = startOfDay();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      interval,
      easeFactor,
      repetitions: rating === 'again' ? 0 : repetitions + 1,
      nextReviewDate,
      lastReviewDate: new Date(),
    };
  }

  newCardDefaults(): Partial<Card> {
    const tomorrow = startOfDay();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: tomorrow,
    };
  }
}
