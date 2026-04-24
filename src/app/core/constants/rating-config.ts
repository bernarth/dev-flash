import { Rating } from '../models/rating';

export interface RatingMeta {
  key: Rating;
  label: string;
  color: string;
  interval: string;
}

export const RATING_CONFIG: RatingMeta[] = [
  { key: 'again', label: 'Again', color: 'var(--df-again)', interval: '<1m' },
  { key: 'hard',  label: 'Hard',  color: 'var(--df-hard)',  interval: '6m'  },
  { key: 'good',  label: 'Good',  color: 'var(--df-good)',  interval: '10m' },
  { key: 'easy',  label: 'Easy',  color: 'var(--df-easy)',  interval: '4d'  },
];
