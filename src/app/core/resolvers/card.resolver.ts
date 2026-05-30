import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, UrlTree } from '@angular/router';
import { Card } from '@core/models';
import { CardService } from '@core/services/card.service';

export const cardResolver: ResolveFn<Card | null | UrlTree> = async (
  route: ActivatedRouteSnapshot,
) => {
  const router = inject(Router);
  const cardService = inject(CardService);
  const cardIdParam = route.paramMap.get('cardId');

  if (!cardIdParam || cardIdParam === 'new') {
    return null;
  }

  const cardId = Number(cardIdParam);

  if (!cardId || isNaN(cardId)) {
    return router.createUrlTree(['/decks']);
  }

  const card = await cardService.getCard(cardId);
  const deckId = Number(route.paramMap.get('id'));

  return card ?? router.createUrlTree(['/decks', deckId, 'browse']);
};
