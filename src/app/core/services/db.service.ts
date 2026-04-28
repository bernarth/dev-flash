import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { from, Observable } from 'rxjs';
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

  getAllDecks(): Observable<Deck[]> {
    return from(this.db.decks.orderBy('createdAt').toArray());
  }

  getDeck(id: number): Observable<Deck | undefined> {
    return from(this.db.decks.get(id));
  }

  createDeck(deck: Omit<Deck, 'id'>): Observable<number> {
    return from(this.db.decks.add(deck as Deck));
  }

  updateDeck(id: number, changes: Partial<Deck>): Observable<number> {
    return from(this.db.decks.update(id, { ...changes, updatedAt: new Date() }));
  }

  deleteDeck(id: number): Observable<void> {
    return from(
      this.db.transaction('rw', this.db.decks, this.db.cards, this.db.reviewLogs, async () => {
        await this.db.reviewLogs.where('deckId').equals(id).delete();
        await this.db.cards.where('deckId').equals(id).delete();
        await this.db.decks.delete(id);
      })
    );
  }

  // ── Cards ────────────────────────────────────────────────────────────────

  getCardsByDeck(deckId: number): Observable<Card[]> {
    return from(this.db.cards.where('deckId').equals(deckId).toArray());
  }

  getCard(id: number): Observable<Card | undefined> {
    return from(this.db.cards.get(id));
  }

  getDueCards(deckId: number, maxReviews: number): Observable<Card[]> {
    const today = endOfDay();
    return from(
      this.db.cards
        .where('deckId').equals(deckId)
        .and(c => c.nextReviewDate <= today)
        .limit(maxReviews)
        .toArray()
    );
  }

  getNewCards(deckId: number, max: number): Observable<Card[]> {
    return from(
      this.db.cards
        .where('deckId').equals(deckId)
        .and(c => c.repetitions === 0)
        .limit(max)
        .toArray()
    );
  }

  createCard(card: Omit<Card, 'id'>): Observable<number> {
    return from(this.db.cards.add(card as Card));
  }

  updateCard(id: number, changes: Partial<Card>): Observable<number> {
    return from(this.db.cards.update(id, changes));
  }

  deleteCard(id: number): Observable<void> {
    return from(
      this.db.transaction('rw', this.db.cards, this.db.reviewLogs, async () => {
        await this.db.reviewLogs.where('cardId').equals(id).delete();
        await this.db.cards.delete(id);
      })
    );
  }

  bulkAddCards(cards: Omit<Card, 'id'>[]): Observable<number> {
    return from(this.db.cards.bulkAdd(cards as Card[]));
  }

  getCardCount(deckId: number): Observable<number> {
    return from(this.db.cards.where('deckId').equals(deckId).count());
  }

  getDueCount(deckId: number): Observable<number> {
    const today = endOfDay();
    return from(
      this.db.cards
        .where('deckId').equals(deckId)
        .and(c => c.nextReviewDate <= today)
        .count()
    );
  }

  // ── Review Logs ──────────────────────────────────────────────────────────

  addReviewLog(log: Omit<ReviewLog, 'id'>): Observable<number> {
    return from(this.db.reviewLogs.add(log as ReviewLog));
  }

  getReviewLogs(deckId: number, since?: Date): Observable<ReviewLog[]> {
    let query = this.db.reviewLogs.where('deckId').equals(deckId);
    return from(query.toArray().then(logs =>
      since ? logs.filter(l => l.reviewedAt >= since) : logs
    ));
  }

  // ── Settings ─────────────────────────────────────────────────────────────

  getSettings(): Observable<AppSettings> {
    return from(
      this.db.settings.get(1).then(s => s ?? { id: 1, ...DEFAULT_SETTINGS })
    );
  }

  saveSettings(settings: AppSettings): Observable<number> {
    return from(this.db.settings.put({ id: 1, ...settings }));
  }

  // ── Storage info ─────────────────────────────────────────────────────────

  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const est = await navigator.storage.estimate();
      return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
    }
    return { usage: 0, quota: 0 };
  }

  getCardCountAll(): Observable<number> {
    return from(this.db.cards.count());
  }

  getDeckCountAll(): Observable<number> {
    return from(this.db.decks.count());
  }

  getReviewLogCountAll(): Observable<number> {
    return from(this.db.reviewLogs.count());
  }

  // ── Nuke ─────────────────────────────────────────────────────────────────

  deleteAllData(): Observable<void> {
    return from(
      this.db.transaction('rw', this.db.decks, this.db.cards, this.db.reviewLogs, this.db.settings, async () => {
        await this.db.decks.clear();
        await this.db.cards.clear();
        await this.db.reviewLogs.clear();
        await this.db.settings.clear();
      })
    );
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
