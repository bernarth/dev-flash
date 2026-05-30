import { inject, Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Card } from '@core/models';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly db = inject(DbService);

  getCardsByDeck(deckId: number): Promise<Card[]> {
    return this.db.getCardsByDeck(deckId);
  }

  getCard(id: number): Promise<Card | undefined> {
    return this.db.getCard(id);
  }

  getDueCards(deckId: number, currentSession: number): Promise<Card[]> {
    return this.db.getDueCards(deckId, currentSession);
  }

  createCard(card: Omit<Card, 'id'>): Promise<number> {
    return this.db.createCard(card);
  }

  updateCard(id: number, changes: Partial<Card>): Promise<number> {
    return this.db.updateCard(id, changes);
  }

  deleteCard(id: number): Promise<void> {
    return this.db.deleteCard(id);
  }

  bulkAddCards(cards: Omit<Card, 'id'>[]): Promise<number> {
    return this.db.bulkAddCards(cards);
  }
}
