import { Rating } from './rating';

export interface ReviewLog {
  id?: number;
  cardId: number;
  deckId: number;
  rating: Rating;
  reviewedAt: Date;
}
