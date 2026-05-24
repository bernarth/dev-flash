export interface Deck {
  id?: number;
  name: string;
  description?: string;
  tags: string[];
  sessionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckListItem extends Deck {
  cardCount: number;
  dueCount: number;
}
