import { inject, Injectable } from '@angular/core';
import { DbService } from './db.service';
import { ReviewLog } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ReviewLogsService {
  private readonly db = inject(DbService);

  async addReviewLog(log: Omit<ReviewLog, 'id'>): Promise<number> {
    return await this.db.addReviewLog(log);
  }
}
