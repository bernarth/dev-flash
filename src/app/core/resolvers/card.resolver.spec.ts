import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Card } from '@models/card';
import { CardService } from '@services/card.service';
import { cardResolver } from './card.resolver';

function buildCard(id: number): Card {
  return {
    id,
    deckId: 1,
    question: 'Question',
    answer: 'Answer',
    tags: [],
    nextSession: 0,
  };
}

function routeWithParams(params: Record<string, string>): ActivatedRouteSnapshot {
  return {
    paramMap: { get: (key: string) => params[key] ?? null },
  } as unknown as ActivatedRouteSnapshot;
}

const state = {} as RouterStateSnapshot;

describe('cardResolver', () => {
  const cardServiceMock = {
    getCard: vi.fn<(id: number) => Promise<Card | undefined>>(),
  };
  const routerMock = {
    createUrlTree: vi.fn<(commands: unknown[]) => UrlTree>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    routerMock.createUrlTree.mockImplementation((commands) => ({ commands }) as unknown as UrlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: CardService, useValue: cardServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('returns null for a new card route without querying the card', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      cardResolver(routeWithParams({ id: '3', cardId: 'new' }), state),
    );

    expect(result).toBeNull();
    expect(cardServiceMock.getCard).not.toHaveBeenCalled();
  });

  it('returns null when the card id is missing', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      cardResolver(routeWithParams({ id: '3' }), state),
    );

    expect(result).toBeNull();
  });

  it('redirects to decks when the card id is not a number', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      cardResolver(routeWithParams({ id: '3', cardId: 'abc' }), state),
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/decks']);
    expect(result).toEqual({ commands: ['/decks'] });
  });

  it('redirects to the card browser when the card does not exist', async () => {
    cardServiceMock.getCard.mockResolvedValue(undefined);

    const result = await TestBed.runInInjectionContext(() =>
      cardResolver(routeWithParams({ id: '3', cardId: '5' }), state),
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/decks', 3, 'browse']);
    expect(result).toEqual({ commands: ['/decks', 3, 'browse'] });
  });

  it('returns the card when it exists', async () => {
    cardServiceMock.getCard.mockResolvedValue(buildCard(5));

    const result = await TestBed.runInInjectionContext(() =>
      cardResolver(routeWithParams({ id: '3', cardId: '5' }), state),
    );

    expect(result).toEqual(buildCard(5));
  });
});
