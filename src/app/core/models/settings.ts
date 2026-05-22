export interface AppSettings {
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  startingEaseFactor: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  newCardsPerDay: 10,
  maxReviewsPerDay: 50,
  startingEaseFactor: 2.5,
};
