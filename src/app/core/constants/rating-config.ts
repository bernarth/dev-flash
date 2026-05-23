import { Rating } from '@models/rating';

export interface RatingMeta {
  key: Rating;
  label: string;
  color: string;
}

export const RATING_CONFIG: RatingMeta[] = [
  { key: 'again', label: 'Again', color: 'var(--df-again)' },
  { key: 'hard', label: 'Hard', color: 'var(--df-hard)' },
  { key: 'good', label: 'Good', color: 'var(--df-good)' },
  { key: 'easy', label: 'Easy', color: 'var(--df-easy)' },
];
