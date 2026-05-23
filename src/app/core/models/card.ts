export interface Card {
  id?: number;
  deckId: number;
  question: string;
  answer: string;
  notes?: string;
  tags: string[];
  nextSession: number;
  lastReviewedAt?: Date;
}
