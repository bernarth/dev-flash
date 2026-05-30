import { inject, Injectable } from '@angular/core';
import { Deck, DeckListItem, DeckStudyInfo } from '@core/models/deck';
import { DbService } from './db.service';
import { Card } from '@core/models';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private db = inject(DbService);

  async getDeck(id: number): Promise<Deck | undefined> {
    return await this.db.getDeck(id);
  }

  async getCardCount(id: number): Promise<number> {
    return await this.db.getCardCount(id);
  }

  async getDueCards(deckId: number, currentSession: number) {
    return await this.db.getDueCards(deckId, currentSession);
  }

  async updateCard(id: number, changes: Partial<Card>) {
    return await this.db.updateCard(id, changes);
  }

  async updateDeck(id: number, changes: Partial<Deck>): Promise<number> {
    return await this.db.updateDeck(id, changes);
  }

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

  async restartDeck(deckId: number, sessionCount: number): Promise<void> {
    await this.db.resetDeckCards(deckId, sessionCount);
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
