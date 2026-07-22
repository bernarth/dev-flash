import { TestBed } from '@angular/core/testing';
import { Deck } from '@models/deck';
import { DbService } from './db.service';
import { DeckService } from './deck.service';

function buildDeck(id: number, sessionCount = 0): Deck {
  return {
    id,
    name: `Deck ${id}`,
    tags: [],
    sessionCount,
    createdAt: new Date('2026-01-01T00:00:00'),
    updatedAt: new Date('2026-01-01T00:00:00'),
  };
}

describe('DeckService', () => {
  const dbMock = {
    getAllDecks: vi.fn<() => Promise<Deck[]>>(),
    getCardCount: vi.fn<(id: number) => Promise<number>>(),
    getDueCount: vi.fn<(id: number, sessionCount: number) => Promise<number>>(),
    resetDeckCards: vi.fn<(deckId: number, sessionCount: number) => Promise<void>>(),
  };

  let service: DeckService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: DbService, useValue: dbMock }],
    });
    service = TestBed.inject(DeckService);
  });

  describe('getDeckList', () => {
    it('returns an empty list without querying counts when there are no decks', async () => {
      dbMock.getAllDecks.mockResolvedValue([]);

      await expect(service.getDeckList()).resolves.toEqual([]);
      expect(dbMock.getCardCount).not.toHaveBeenCalled();
      expect(dbMock.getDueCount).not.toHaveBeenCalled();
    });

    it('combines each deck with its card and due counts', async () => {
      dbMock.getAllDecks.mockResolvedValue([buildDeck(1, 2), buildDeck(2, 5)]);
      dbMock.getCardCount.mockImplementation(async (id) => (id === 1 ? 10 : 20));
      dbMock.getDueCount.mockImplementation(async (id) => (id === 1 ? 3 : 0));

      const list = await service.getDeckList();

      expect(list).toEqual([
        { ...buildDeck(1, 2), cardCount: 10, dueCount: 3 },
        { ...buildDeck(2, 5), cardCount: 20, dueCount: 0 },
      ]);
    });

    it('counts due cards against the deck session count', async () => {
      dbMock.getAllDecks.mockResolvedValue([buildDeck(1, 7)]);
      dbMock.getCardCount.mockResolvedValue(5);
      dbMock.getDueCount.mockResolvedValue(2);

      await service.getDeckList();

      expect(dbMock.getDueCount).toHaveBeenCalledWith(1, 7);
    });
  });

  describe('getDeckStudyList', () => {
    it('maps decks to study info with totals and due counts', async () => {
      dbMock.getAllDecks.mockResolvedValue([buildDeck(1)]);
      dbMock.getCardCount.mockResolvedValue(12);
      dbMock.getDueCount.mockResolvedValue(4);

      const list = await service.getDeckStudyList();

      expect(list).toEqual([{ deck: buildDeck(1), totalCards: 12, dueCount: 4 }]);
    });
  });

  describe('restartDeck', () => {
    it('resets all deck cards to the given session', async () => {
      await service.restartDeck(3, 9);

      expect(dbMock.resetDeckCards).toHaveBeenCalledWith(3, 9);
    });
  });
});
