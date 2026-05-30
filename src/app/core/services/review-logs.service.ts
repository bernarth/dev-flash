import { inject, Injectable } from '@angular/core';
import { DbService } from './db.service';
import { ReviewLog } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ReviewLogsService {
  private readonly db = inject(DbService);

  async addReviewLog(log: Omit<ReviewLog, 'id'>): Promise<number> {
    return await this.db.addReviewLog(log);
  }

  async getSessionLogs(deckId: number, windowMinutes = 30): Promise<ReviewLog[]> {
    const sessionStart = new Date();
    sessionStart.setMinutes(sessionStart.getMinutes() - windowMinutes);
    return await this.db.getReviewLogs(deckId, sessionStart);
  }
}
