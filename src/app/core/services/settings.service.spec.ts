import { TestBed } from '@angular/core/testing';
import { AppSettings, DEFAULT_SETTINGS } from '@models/settings';
import { DbService } from './db.service';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  const dbMock = {
    getSettings: vi.fn<() => Promise<AppSettings>>(),
    saveSettings: vi.fn<(settings: AppSettings) => Promise<number>>(),
    getStorageEstimate: vi.fn<() => Promise<{ usage: number; quota: number }>>(),
    getDeckCountAll: vi.fn<() => Promise<number>>(),
    getCardCountAll: vi.fn<() => Promise<number>>(),
    getReviewLogCountAll: vi.fn<() => Promise<number>>(),
  };

  let service: SettingsService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: DbService, useValue: dbMock }],
    });
    service = TestBed.inject(SettingsService);
  });

  describe('getSettings', () => {
    it('returns the persisted settings', async () => {
      dbMock.getSettings.mockResolvedValue(DEFAULT_SETTINGS);

      await expect(service.getSettings()).resolves.toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('save', () => {
    it('persists the settings through the database', async () => {
      await service.save(DEFAULT_SETTINGS);

      expect(dbMock.saveSettings).toHaveBeenCalledWith(DEFAULT_SETTINGS);
    });
  });

  describe('getStorageUsedInKb', () => {
    it('converts bytes to kilobytes', async () => {
      dbMock.getStorageEstimate.mockResolvedValue({ usage: 4096, quota: 0 });

      await expect(service.getStorageUsedInKb()).resolves.toBe(4);
    });

    it('returns zero when nothing is stored', async () => {
      dbMock.getStorageEstimate.mockResolvedValue({ usage: 0, quota: 0 });

      await expect(service.getStorageUsedInKb()).resolves.toBe(0);
    });
  });

  describe('getStorageBreakdown', () => {
    it('pluralizes labels for multiple records', async () => {
      dbMock.getDeckCountAll.mockResolvedValue(3);
      dbMock.getCardCountAll.mockResolvedValue(10);
      dbMock.getReviewLogCountAll.mockResolvedValue(42);

      const breakdown = await service.getStorageBreakdown();

      expect(breakdown).toEqual([
        { label: 'Decks', value: '3 decks' },
        { label: 'Cards', value: '10 cards' },
        { label: 'Review log', value: '42 entries' },
      ]);
    });

    it('uses singular labels for single records', async () => {
      dbMock.getDeckCountAll.mockResolvedValue(1);
      dbMock.getCardCountAll.mockResolvedValue(1);
      dbMock.getReviewLogCountAll.mockResolvedValue(1);

      const breakdown = await service.getStorageBreakdown();

      expect(breakdown).toEqual([
        { label: 'Decks', value: '1 deck' },
        { label: 'Cards', value: '1 card' },
        { label: 'Review log', value: '1 entry' },
      ]);
    });

    it('pluralizes zero records', async () => {
      dbMock.getDeckCountAll.mockResolvedValue(0);
      dbMock.getCardCountAll.mockResolvedValue(0);
      dbMock.getReviewLogCountAll.mockResolvedValue(0);

      const breakdown = await service.getStorageBreakdown();

      expect(breakdown).toEqual([
        { label: 'Decks', value: '0 decks' },
        { label: 'Cards', value: '0 cards' },
        { label: 'Review log', value: '0 entries' },
      ]);
    });
  });
});
