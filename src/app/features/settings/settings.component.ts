import { Component, inject, signal, OnInit } from '@angular/core';
import { SettingsService } from '@services/settings.service';
import { DbService } from '@services/db.service';
import { ExportService } from '@services/export.service';
import { AppSettings } from '@models';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { IconComponent } from '@shared/components/icon/icon.component';

interface StorageItem {
  label: string;
  value: string;
  color: string;
  mb: number;
}

@Component({
  selector: 'df-settings',
  standalone: true,
  imports: [ConfirmDialogComponent, IconComponent],
  template: `
    <div class="df-screen">
      <header class="top-bar">
        <div class="title">Settings</div>
      </header>

      <div class="content df-scroll">

        <!-- Storage -->
        <div class="section-label df-label">Local storage</div>
        <div class="df-card storage-card">
          <div class="storage-header">
            <div>
              <span class="df-mono storage-mb">{{ storageUsedMb().toFixed(1) }}</span>
              <span class="df-mono storage-unit">MB</span>
            </div>
            <span class="df-mono storage-quota">of {{ storageQuotaMb() }} MB quota</span>
          </div>
          <div class="storage-bar"
            role="progressbar"
            [attr.aria-valuenow]="storagePercent().toFixed(1)"
            aria-valuemin="0" aria-valuemax="100"
            [attr.aria-label]="storagePercent().toFixed(1) + '% of ' + storageQuotaMb() + ' MB used'">
            <span [style.width]="storagePercent() + '%'"></span>
          </div>
          <div class="df-mono storage-pct">
            {{ storagePercent().toFixed(1) }}% used · {{ (storageQuotaMb() - storageUsedMb()).toFixed(1) }} MB free
          </div>
        </div>

        <div class="df-card breakdown-card">
          @for (item of storageBreakdown; track item.label) {
            <div class="breakdown-row">
              <span class="breakdown-dot" [style.background]="item.color"></span>
              <div class="breakdown-info">
                <div class="breakdown-label">{{ item.label }}</div>
              </div>
              <span class="df-mono breakdown-value">{{ item.value }}</span>
            </div>
          }
        </div>

        <!-- SRS settings -->
        <div class="section-label df-label df-section">Study settings</div>
        <div class="df-card settings-card">
          <div class="setting-row">
            <div class="setting-info">
              <label for="slider-new-cards" class="setting-label">New cards per day</label>
              <div class="df-mono setting-value">{{ localSettings().newCardsPerDay }}</div>
            </div>
            <input id="slider-new-cards" type="range" min="1" max="50" step="1"
              [value]="localSettings().newCardsPerDay"
              (input)="onNewCardsInput($event)"
              class="slider" />
          </div>
          <div class="df-hr"></div>
          <div class="setting-row">
            <div class="setting-info">
              <label for="slider-max-reviews" class="setting-label">Max reviews per day</label>
              <div class="df-mono setting-value">{{ localSettings().maxReviewsPerDay }}</div>
            </div>
            <input id="slider-max-reviews" type="range" min="10" max="200" step="10"
              [value]="localSettings().maxReviewsPerDay"
              (input)="onMaxReviewsInput($event)"
              class="slider" />
          </div>
        </div>

        <!-- Theme -->
        <div class="section-label df-label df-section">Appearance</div>
        <div class="df-card settings-card">
          <div class="theme-row">
            @for (opt of themeOptions; track opt.value) {
              <button type="button" class="theme-option"
                [class.active]="localSettings().theme === opt.value"
                [attr.aria-pressed]="localSettings().theme === opt.value"
                (click)="setTheme(opt.value)">
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <!-- Maintenance -->
        <div class="section-label df-label df-section">Maintenance</div>
        <div class="df-card maint-card">
          <button type="button" class="maint-row" (click)="exportData()">
            <div class="maint-info">
              <div class="maint-label">Export all cards as JSON</div>
              <div class="maint-sub">Backup all decks and review history</div>
            </div>
            <df-icon name="chev-right" [size]="18" class="maint-chevron" />
          </button>
        </div>

        <!-- Danger zone -->
        <div class="section-label df-label danger-label df-section">Danger zone</div>
        <div class="df-card danger-card">
          <div class="danger-content">
            <div class="danger-icon">
              <df-icon name="trash" [size]="18" />
            </div>
            <div>
              <div class="danger-title">Delete all data</div>
              <div class="danger-desc">
                Permanently removes all decks, cards, notes, and review history from this device.
              </div>
            </div>
          </div>
          <button type="button" class="delete-all-btn" (click)="confirmDelete.set(true)">
            Delete everything
          </button>
        </div>

        <div class="version df-mono">DevFlash · v0.1.0</div>
      </div>
    </div>

    <df-confirm-dialog
      [open]="confirmDelete()"
      title="Delete all data?"
      description="This will erase all decks, cards, and review history. This cannot be undone."
      confirmLabel="Yes, delete everything"
      cancelLabel="Cancel"
      variant="danger"
      icon="trash"
      (confirmed)="deleteAll()"
      (cancelled)="confirmDelete.set(false)"
    />
  `,
  styles: [`
    /* :host needs position:relative for the confirm dialog overlay */
    :host { display: flex; flex-direction: column; height: 100%; position: relative; }
    .top-bar {
      padding: 1rem 1.25rem 0.75rem;
      border-bottom: 1px solid var(--df-outline-soft);
      flex-shrink: 0;
    }
    .title { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.025em; }
    .content { flex: 1; overflow-y: auto; padding: 0.5rem 1.25rem 2.5rem; }
    /* section spacing handled by global .df-section */
    .storage-card { padding: 1rem; }
    .storage-header {
      display: flex; align-items: baseline;
      justify-content: space-between; margin-bottom: 0.75rem;
    }
    .storage-mb { font-size: 1.75rem; font-weight: 600; letter-spacing: -0.02em; }
    .storage-unit { font-size: 0.875rem; color: var(--df-text-muted); margin-left: 0.25rem; }
    .storage-quota { font-size: 0.6875rem; color: var(--df-text-faint); }
    .storage-bar {
      height: 6px; border-radius: var(--df-radius-pill);
      background: var(--df-surface-2); overflow: hidden; margin-bottom: 0.5rem;
    }
    .storage-bar span {
      display: block; height: 100%;
      background: var(--df-primary); border-radius: var(--df-radius-pill);
    }
    .storage-pct { font-size: 0.656rem; color: var(--df-text-faint); }
    .breakdown-card { overflow: hidden; margin-top: 0.625rem; }
    .breakdown-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 0.875rem;
      border-bottom: 1px solid var(--df-outline-soft);
    }
    .breakdown-row:last-child { border-bottom: 0; }
    .breakdown-dot { width: 0.5rem; height: 0.5rem; border-radius: 2px; flex-shrink: 0; }
    .breakdown-info { flex: 1; }
    .breakdown-label { font-size: 0.8125rem; font-weight: 500; }
    .breakdown-value { font-size: 0.75rem; font-variant-numeric: tabular-nums; }
    .settings-card { overflow: hidden; }
    .setting-row {
      display: flex; align-items: center;
      padding: 0.875rem; gap: 1rem;
    }
    .setting-info { flex: 1; }
    .setting-label { font-size: 0.8125rem; font-weight: 500; }
    .setting-value { font-size: 1.25rem; font-weight: 600; color: var(--df-primary); }
    .slider { width: 6.25rem; accent-color: var(--df-primary); }
    .theme-row { display: flex; padding: 0.625rem; gap: 0.375rem; }
    .theme-option {
      flex: 1; height: 2.25rem; border-radius: 10px;
      border: 1px solid var(--df-outline-soft);
      background: transparent; color: var(--df-text-muted);
      font-family: inherit; font-size: 0.8125rem; cursor: pointer;
      transition: background var(--df-transition-base), color var(--df-transition-base);
    }
    .theme-option.active {
      background: var(--df-primary-container);
      color: var(--df-on-primary-container);
      border-color: transparent;
    }
    .maint-card { overflow: hidden; }
    .maint-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.875rem; cursor: pointer; width: 100%;
      background: transparent; border: 0; text-align: left; color: var(--df-text);
    }
    .maint-info { flex: 1; }
    .maint-label { font-size: 0.844rem; font-weight: 500; }
    .maint-sub { font-size: 0.6875rem; color: var(--df-text-faint); margin-top: 0.125rem; }
    .maint-chevron { color: var(--df-text-faint); }
    .danger-label { color: var(--df-again); }
    .danger-card {
      padding: 1rem;
      border-color: color-mix(in srgb, var(--df-again) 35%, var(--df-outline-soft));
    }
    .danger-content {
      display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.875rem;
    }
    .danger-icon {
      width: 2.25rem; height: 2.25rem; flex-shrink: 0; border-radius: 10px;
      background: color-mix(in srgb, var(--df-again) 18%, transparent);
      color: var(--df-again);
      display: flex; align-items: center; justify-content: center;
    }
    .danger-title { font-size: 0.875rem; font-weight: 600; }
    .danger-desc { font-size: 0.781rem; color: var(--df-text-muted); margin-top: 0.25rem; line-height: 1.5; }
    .delete-all-btn {
      width: 100%; height: 2.75rem; border-radius: 12px; border: 0;
      background: var(--df-again); color: var(--df-primary-ink);
      font-family: inherit; font-size: 0.844rem; font-weight: 600; cursor: pointer;
    }
    .version {
      text-align: center; margin-top: 1.5rem;
      font-size: 0.656rem; color: var(--df-text-faint);
    }
  `],
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private db = inject(DbService);
  private exportService = inject(ExportService);

  confirmDelete = signal(false);

  storageUsedMb = signal(0);
  storageQuotaMb = signal(50);
  storagePercent = signal(0);

  localSettings = signal<AppSettings>({ ...this.settingsService.settings() });

  readonly themeOptions = [
    { label: 'System', value: 'system' as const },
    { label: 'Light', value: 'light' as const },
    { label: 'Dark', value: 'dark' as const },
  ];

  readonly storageBreakdown: StorageItem[] = [
    { label: 'Cards', value: '~', color: 'var(--df-primary)', mb: 0 },
    { label: 'Review log', value: '~', color: 'var(--df-hard)', mb: 0 },
    { label: 'App cache', value: '~', color: 'var(--df-text-faint)', mb: 0 },
  ];

  ngOnInit(): void {
    this.localSettings.set({ ...this.settingsService.settings() });
    this.loadStorageInfo();
  }

  private loadStorageInfo(): void {
    this.db.getStorageEstimate().then(({ usage, quota }) => {
      const usedMb = usage / (1024 * 1024);
      const quotaMb = Math.min(quota / (1024 * 1024), 1024);
      this.storageUsedMb.set(usedMb);
      this.storageQuotaMb.set(Math.round(quotaMb));
      this.storagePercent.set(quotaMb > 0 ? (usedMb / quotaMb) * 100 : 0);
    });
  }

  onNewCardsInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.localSettings.update(s => ({ ...s, newCardsPerDay: value }));
    this.settingsService.save(this.localSettings());
  }

  onMaxReviewsInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.localSettings.update(s => ({ ...s, maxReviewsPerDay: value }));
    this.settingsService.save(this.localSettings());
  }

  setTheme(theme: 'system' | 'light' | 'dark'): void {
    this.localSettings.update(s => ({ ...s, theme }));
    this.settingsService.save(this.localSettings());
  }

  async exportData(): Promise<void> {
    await this.exportService.exportJson();
  }

  async deleteAll(): Promise<void> {
    await this.db.deleteAllData();
    this.confirmDelete.set(false);
  }
}
