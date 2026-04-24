export interface Card {
  id?: number;
  deckId: number;
  question: string;
  answer: string;
  notes?: string;
  tags: string[];
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate?: Date;
}
