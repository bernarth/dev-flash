import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Card, Deck, ReviewLog, AppSettings, DEFAULT_SETTINGS } from '@models';
import { endOfDay } from '@utils/date.utils';

class DevFlashDb extends Dexie {
  decks!: Table<Deck, number>;
  cards!: Table<Card, number>;
  reviewLogs!: Table<ReviewLog, number>;
  settings!: Table<AppSettings & { id: number }, number>;

  constructor() {
    super('DevFlashDb');
    this.version(1).stores({
      decks: '++id, name, createdAt, updatedAt',
      cards: '++id, deckId, nextReviewDate, lastReviewDate, *tags',
      reviewLogs: '++id, cardId, deckId, reviewedAt',
      settings: '++id',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class DbService {
  private db = new DevFlashDb();

  // ── Decks ────────────────────────────────────────────────────────────────

  getAllDecks(): Promise<Deck[]> {
    return this.db.decks.orderBy('createdAt').toArray();
  }

  getDeck(id: number): Promise<Deck | undefined> {
    return this.db.decks.get(id);
  }

  createDeck(deck: Omit<Deck, 'id'>): Promise<number> {
    return this.db.decks.add(deck as Deck);
  }

  updateDeck(id: number, changes: Partial<Deck>): Promise<number> {
    return this.db.decks.update(id, { ...changes, updatedAt: new Date() });
  }

  deleteDeck(id: number): Promise<void> {
    return this.db.transaction('rw', this.db.decks, this.db.cards, this.db.reviewLogs, async () => {
      await this.db.reviewLogs.where('deckId').equals(id).delete();
      await this.db.cards.where('deckId').equals(id).delete();
      await this.db.decks.delete(id);
    });
  }

  // ── Cards ────────────────────────────────────────────────────────────────

  getCardsByDeck(deckId: number): Promise<Card[]> {
    return this.db.cards.where('deckId').equals(deckId).toArray();
  }

  getCard(id: number): Promise<Card | undefined> {
    return this.db.cards.get(id);
  }

  getDueCards(deckId: number, maxReviews: number): Promise<Card[]> {
    const today = endOfDay();
    return this.db.cards
      .where('deckId').equals(deckId)
      .and(c => c.nextReviewDate <= today)
      .limit(maxReviews)
      .toArray();
  }

  getNewCards(deckId: number, max: number): Promise<Card[]> {
    return this.db.cards
      .where('deckId').equals(deckId)
      .and(c => c.repetitions === 0)
      .limit(max)
      .toArray();
  }

  createCard(card: Omit<Card, 'id'>): Promise<number> {
    return this.db.cards.add(card as Card);
  }

  updateCard(id: number, changes: Partial<Card>): Promise<number> {
    return this.db.cards.update(id, changes);
  }

  deleteCard(id: number): Promise<void> {
    return this.db.transaction('rw', this.db.cards, this.db.reviewLogs, async () => {
      await this.db.reviewLogs.where('cardId').equals(id).delete();
      await this.db.cards.delete(id);
    });
  }

  bulkAddCards(cards: Omit<Card, 'id'>[]): Promise<number> {
    return this.db.cards.bulkAdd(cards as Card[]);
  }

  getCardCount(deckId: number): Promise<number> {
    return this.db.cards.where('deckId').equals(deckId).count();
  }

  getDueCount(deckId: number): Promise<number> {
    const today = endOfDay();
    return this.db.cards
      .where('deckId').equals(deckId)
      .and(c => c.nextReviewDate <= today)
      .count();
  }

  // ── Review Logs ──────────────────────────────────────────────────────────

  addReviewLog(log: Omit<ReviewLog, 'id'>): Promise<number> {
    return this.db.reviewLogs.add(log as ReviewLog);
  }

  getReviewLogs(deckId: number, since?: Date): Promise<ReviewLog[]> {
    return this.db.reviewLogs
      .where('deckId').equals(deckId)
      .toArray()
      .then(logs => since ? logs.filter(l => l.reviewedAt >= since) : logs);
  }

  // ── Settings ─────────────────────────────────────────────────────────────

  getSettings(): Promise<AppSettings> {
    return this.db.settings.get(1).then(s => s ?? { id: 1, ...DEFAULT_SETTINGS });
  }

  saveSettings(settings: AppSettings): Promise<number> {
    return this.db.settings.put({ id: 1, ...settings });
  }

  // ── Storage info ─────────────────────────────────────────────────────────

  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const est = await navigator.storage.estimate();
      return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
    }
    return { usage: 0, quota: 0 };
  }

  getCardCountAll(): Promise<number> {
    return this.db.cards.count();
  }

  getDeckCountAll(): Promise<number> {
    return this.db.decks.count();
  }

  getReviewLogCountAll(): Promise<number> {
    return this.db.reviewLogs.count();
  }

  // ── Nuke ─────────────────────────────────────────────────────────────────

  deleteAllData(): Promise<void> {
    return this.db.transaction('rw', this.db.decks, this.db.cards, this.db.reviewLogs, this.db.settings, async () => {
      await this.db.decks.clear();
      await this.db.cards.clear();
      await this.db.reviewLogs.clear();
      await this.db.settings.clear();
    });
  }

  // ── Export ───────────────────────────────────────────────────────────────

  async exportAll(): Promise<{ decks: Deck[]; cards: Card[]; reviewLogs: ReviewLog[] }> {
    const [decks, cards, reviewLogs] = await Promise.all([
      this.db.decks.toArray(),
      this.db.cards.toArray(),
      this.db.reviewLogs.toArray(),
    ]);
    return { decks, cards, reviewLogs };
  }
}
