export interface AppSettings {
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  startingEaseFactor: number;
  theme: 'system' | 'light' | 'dark';
}

export const DEFAULT_SETTINGS: AppSettings = {
  newCardsPerDay: 10,
  maxReviewsPerDay: 50,
  startingEaseFactor: 2.5,
  theme: 'system',
};
