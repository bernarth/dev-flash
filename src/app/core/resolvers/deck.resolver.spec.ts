import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Deck } from '@models/deck';
import { DeckService } from '@services/deck.service';
import { deckHasCards, deckResolver } from './deck.resolver';

function buildDeck(id: number): Deck {
  return {
    id,
    name: `Deck ${id}`,
    tags: [],
    sessionCount: 0,
    createdAt: new Date('2026-01-01T00:00:00'),
    updatedAt: new Date('2026-01-01T00:00:00'),
  };
}

function routeWithParams(params: Record<string, string>): ActivatedRouteSnapshot {
  return {
    paramMap: { get: (key: string) => params[key] ?? null },
  } as unknown as ActivatedRouteSnapshot;
}

const state = {} as RouterStateSnapshot;

describe('deck resolvers', () => {
  const deckServiceMock = {
    getDeck: vi.fn<(id: number) => Promise<Deck | undefined>>(),
    getCardCount: vi.fn<(id: number) => Promise<number>>(),
  };
  const routerMock = {
    createUrlTree: vi.fn<(commands: unknown[]) => UrlTree>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    routerMock.createUrlTree.mockImplementation((commands) => ({ commands }) as unknown as UrlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: DeckService, useValue: deckServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  describe('deckResolver', () => {
    it('redirects to the study list when the id is not a number', async () => {
      const result = await TestBed.runInInjectionContext(() =>
        deckResolver(routeWithParams({ id: 'abc' }), state),
      );

      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/study']);
      expect(result).toEqual({ commands: ['/study'] });
    });

    it('redirects to the study list when the deck does not exist', async () => {
      deckServiceMock.getDeck.mockResolvedValue(undefined);

      const result = await TestBed.runInInjectionContext(() =>
        deckResolver(routeWithParams({ id: '7' }), state),
      );

      expect(result).toEqual({ commands: ['/study'] });
    });

    it('returns the deck when it exists', async () => {
      deckServiceMock.getDeck.mockResolvedValue(buildDeck(7));

      const result = await TestBed.runInInjectionContext(() =>
        deckResolver(routeWithParams({ id: '7' }), state),
      );

      expect(result).toEqual(buildDeck(7));
    });
  });

  describe('deckHasCards', () => {
    it('redirects to the study list when the id is not a number', async () => {
      const result = await TestBed.runInInjectionContext(() =>
        deckHasCards(routeWithParams({ id: 'abc' }), state),
      );

      expect(result).toEqual({ commands: ['/study'] });
    });

    it('allows navigation when the deck has cards', async () => {
      deckServiceMock.getCardCount.mockResolvedValue(5);

      const result = await TestBed.runInInjectionContext(() =>
        deckHasCards(routeWithParams({ id: '2' }), state),
      );

      expect(result).toBe(true);
    });

    it('redirects to the study list when the deck is empty', async () => {
      deckServiceMock.getCardCount.mockResolvedValue(0);

      const result = await TestBed.runInInjectionContext(() =>
        deckHasCards(routeWithParams({ id: '2' }), state),
      );

      expect(result).toEqual({ commands: ['/study'] });
    });
  });
});
