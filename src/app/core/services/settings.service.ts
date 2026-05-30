import { Injectable, inject } from '@angular/core';
import { AppSettings } from '@models';
import { DbService } from './db.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly db = inject(DbService);

  async getSettings(): Promise<AppSettings> {
    return await this.db.getSettings();
  }

  async save(settings: AppSettings): Promise<void> {
    await this.db.saveSettings(settings);
  }

  async getStorageUsedInKb(): Promise<number> {
    const { usage } = await this.db.getStorageEstimate();

    return (usage ?? 0) / 1024;
  }

  async getStorageBreakdown(): Promise<{ label: string; value: string }[]> {
    const [deckCount, cardCount, reviewCount] = await Promise.all([
      this.db.getDeckCountAll(),
      this.db.getCardCountAll(),
      this.db.getReviewLogCountAll(),
    ]);

    return [
      { label: 'Decks', value: `${deckCount} deck${deckCount !== 1 ? 's' : ''}` },
      { label: 'Cards', value: `${cardCount} card${cardCount !== 1 ? 's' : ''}` },
      { label: 'Review log', value: `${reviewCount} entr${reviewCount !== 1 ? 'ies' : 'y'}` },
    ];
  }
}
