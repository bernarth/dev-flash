import { Injectable } from '@angular/core';
import { Rating } from '@models/rating';
import { AppSettings } from '@models/settings';

@Injectable({ providedIn: 'root' })
export class SchedulerService {
  applyRating(rating: Exclude<Rating, 'again'>, currentSession: number, settings: AppSettings): Partial<import('@models/card').Card> {
    const offsets: Record<Exclude<Rating, 'again'>, number> = {
      hard: settings.hardInterval,
      good: settings.goodInterval,
      easy: settings.easyInterval,
    };
    return {
      nextSession: currentSession + offsets[rating],
      lastReviewedAt: new Date(),
    };
  }
}
