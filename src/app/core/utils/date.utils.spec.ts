import { endOfDay, startOfDay } from './date.utils';

describe('date utils', () => {
  describe('startOfDay', () => {
    it('resets the time to midnight', () => {
      const result = startOfDay(new Date('2026-03-10T15:45:30.500'));

      expect(result).toEqual(new Date('2026-03-10T00:00:00.000'));
    });

    it('does not mutate the input date', () => {
      const input = new Date('2026-03-10T15:45:30.500');

      startOfDay(input);

      expect(input).toEqual(new Date('2026-03-10T15:45:30.500'));
    });
  });

  describe('endOfDay', () => {
    it('sets the time to the last millisecond of the day', () => {
      const result = endOfDay(new Date('2026-03-10T15:45:30.500'));

      expect(result).toEqual(new Date('2026-03-10T23:59:59.999'));
    });

    it('does not mutate the input date', () => {
      const input = new Date('2026-03-10T15:45:30.500');

      endOfDay(input);

      expect(input).toEqual(new Date('2026-03-10T15:45:30.500'));
    });
  });
});
