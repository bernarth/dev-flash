import { choose } from './utils';

describe('choose', () => {
  it('returns the value of the first matching branch', () => {
    const result = choose(
      [
        { when: false, value: 'skipped' },
        { when: true, value: 'matched' },
      ],
      'fallback',
    );

    expect(result).toBe('matched');
  });

  it('prefers the earliest branch when several match', () => {
    const result = choose(
      [
        { when: true, value: 1 },
        { when: true, value: 2 },
      ],
      0,
    );

    expect(result).toBe(1);
  });

  it('returns the default value when no branch matches', () => {
    const result = choose([{ when: false, value: 'skipped' }], 'fallback');

    expect(result).toBe('fallback');
  });

  it('returns the default value for an empty branch list', () => {
    const result = choose<string>([], 'fallback');

    expect(result).toBe('fallback');
  });
});
