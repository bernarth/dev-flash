import { inject, Injectable } from '@angular/core';
import { DeckListItem, DeckStudyInfo } from '@core/models/deck';
import { DbService } from './db.service';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private db = inject(DbService);

  async getDeckList(): Promise<DeckListItem[]> {
    const rawDecks = await this.db.getAllDecks();

    if (!rawDecks.length) {
      return [];
    }

    const decks = await Promise.all(
      rawDecks.map(async (deck) => {
        const [cardCount, dueCount] = await Promise.all([
          this.db.getCardCount(deck.id!),
          this.db.getDueCount(deck.id!, deck.sessionCount),
        ]);
        return { ...deck, cardCount, dueCount };
      }),
    );

    return decks;
  }

  async getDeckStudyList(): Promise<DeckStudyInfo[]> {
    const decks = await this.db.getAllDecks();
    const items: DeckStudyInfo[] = await Promise.all(
      decks.map(async (deck) => {
        const [totalCards, dueCount] = await Promise.all([
          this.db.getCardCount(deck.id!),
          this.db.getDueCount(deck.id!, deck.sessionCount),
        ]);

        return { deck, totalCards, dueCount };
      }),
    );

    return items;
  }
}
