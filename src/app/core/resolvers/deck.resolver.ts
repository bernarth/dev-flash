import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, UrlTree } from '@angular/router';
import { Deck } from '@core/models';
import { DeckService } from '@core/services/deck.service';

export const deckResolver: ResolveFn<Deck | UrlTree> = async (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const deckService = inject(DeckService);
  const deckId = Number(route.paramMap.get('id'));

  if (!deckId || isNaN(deckId)) {
    return router.createUrlTree(['/study']);
  }

  const deck = await deckService.getDeck(deckId);

  return deck ?? router.createUrlTree(['/study']);
};

export const deckHasCards: ResolveFn<boolean | UrlTree> = async (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const deckService = inject(DeckService);
  const deckId = Number(route.paramMap.get('id'));

  if (!deckId || isNaN(deckId)) {
    return router.createUrlTree(['/study']);
  }

  const cardCount = await deckService.getCardCount(deckId);

  return cardCount ? cardCount > 0 : router.createUrlTree(['/study']);
};
