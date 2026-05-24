import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DeckListItem } from '@core/models/deck';
import { DeckService } from '@core/services/deck.service';

export const deckListResolver: ResolveFn<DeckListItem[]> = () => {
  return inject(DeckService).getDeckList();
};
