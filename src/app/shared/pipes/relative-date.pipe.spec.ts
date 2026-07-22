import { RelativeDatePipe } from './relative-date.pipe';

describe('RelativeDatePipe', () => {
  const pipe = new RelativeDatePipe();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns Never for nullish values', () => {
    expect(pipe.transform(null)).toBe('Never');
    expect(pipe.transform(undefined)).toBe('Never');
  });

  it('returns Just now for dates less than a minute old', () => {
    expect(pipe.transform(new Date('2026-06-15T11:59:30'))).toBe('Just now');
  });

  it('returns minutes ago for dates less than an hour old', () => {
    expect(pipe.transform(new Date('2026-06-15T11:45:00'))).toBe('15m ago');
  });

  it('returns hours ago for dates less than a day old', () => {
    expect(pipe.transform(new Date('2026-06-15T09:00:00'))).toBe('3h ago');
  });

  it('returns Yesterday for dates less than two days old', () => {
    expect(pipe.transform(new Date('2026-06-14T12:00:00'))).toBe('Yesterday');
  });

  it('returns days ago for dates less than a week old', () => {
    expect(pipe.transform(new Date('2026-06-12T12:00:00'))).toBe('3 days ago');
  });

  it('falls back to a locale date for older dates', () => {
    const older = new Date('2026-05-01T12:00:00');

    expect(pipe.transform(older)).toBe(older.toLocaleDateString());
  });

  it('accepts date strings', () => {
    expect(pipe.transform('2026-06-15T11:00:00')).toBe('1h ago');
  });
});
