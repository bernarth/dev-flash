import { AppSettings, DEFAULT_SETTINGS } from '@models/settings';
import { SchedulerService } from './scheduler.service';

describe('SchedulerService', () => {
  const service = new SchedulerService();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('applyRating', () => {
    it('schedules a hard rating one session ahead by default', () => {
      const result = service.applyRating('hard', 4, DEFAULT_SETTINGS);

      expect(result.nextSession).toBe(5);
    });

    it('schedules a good rating three sessions ahead by default', () => {
      const result = service.applyRating('good', 4, DEFAULT_SETTINGS);

      expect(result.nextSession).toBe(7);
    });

    it('schedules an easy rating five sessions ahead by default', () => {
      const result = service.applyRating('easy', 4, DEFAULT_SETTINGS);

      expect(result.nextSession).toBe(9);
    });

    it('applies custom intervals from the settings', () => {
      const settings: AppSettings = { hardInterval: 2, goodInterval: 4, easyInterval: 9 };

      expect(service.applyRating('hard', 1, settings).nextSession).toBe(3);
      expect(service.applyRating('good', 1, settings).nextSession).toBe(5);
      expect(service.applyRating('easy', 1, settings).nextSession).toBe(10);
    });

    it('stamps lastReviewedAt with the current time', () => {
      const result = service.applyRating('good', 0, DEFAULT_SETTINGS);

      expect(result.lastReviewedAt).toEqual(new Date('2026-06-15T12:00:00'));
    });

    it('returns only scheduling fields', () => {
      const result = service.applyRating('easy', 2, DEFAULT_SETTINGS);

      expect(Object.keys(result).sort()).toEqual(['lastReviewedAt', 'nextSession']);
    });
  });
});
