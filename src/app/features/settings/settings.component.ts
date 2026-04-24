import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { DbService } from '../../core/services/db.service';
import { ExportService } from '../../core/services/export.service';
import { AppSettings } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface StorageItem {
  label: string;
  value: string;
  color: string;
  mb: number;
}

@Component({
  selector: 'df-settings',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent, IconComponent],
  template: `
    <div class="screen">
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
          <div class="storage-bar">
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
        <div class="section-label df-label" style="margin-top:20px">Study settings</div>
        <div class="df-card settings-card">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">New cards per day</div>
              <div class="df-mono setting-value">{{ localSettings.newCardsPerDay }}</div>
            </div>
            <input type="range" min="1" max="50" step="1"
              [(ngModel)]="localSettings.newCardsPerDay"
              (ngModelChange)="onSettingChange()"
              class="slider" />
          </div>
          <div class="df-hr"></div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Max reviews per day</div>
              <div class="df-mono setting-value">{{ localSettings.maxReviewsPerDay }}</div>
            </div>
            <input type="range" min="10" max="200" step="10"
              [(ngModel)]="localSettings.maxReviewsPerDay"
              (ngModelChange)="onSettingChange()"
              class="slider" />
          </div>
        </div>

        <!-- Theme -->
        <div class="section-label df-label" style="margin-top:20px">Appearance</div>
        <div class="df-card settings-card">
          <div class="theme-row">
            @for (opt of themeOptions; track opt.value) {
              <button class="theme-option"
                [class.active]="localSettings.theme === opt.value"
                (click)="setTheme(opt.value)">
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <!-- Maintenance -->
        <div class="section-label df-label" style="margin-top:20px">Maintenance</div>
        <div class="df-card maint-card">
          <button class="maint-row" (click)="exportData()">
            <div class="maint-info">
              <div class="maint-label">Export all cards as JSON</div>
              <div class="maint-sub">Backup all decks and review history</div>
            </div>
            <df-icon name="chev-right" [size]="18" class="maint-chevron" />
          </button>
        </div>

        <!-- Danger zone -->
        <div class="section-label df-label danger-label" style="margin-top:20px">Danger zone</div>
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
          <button class="delete-all-btn" (click)="confirmDelete.set(true)">
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
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }
    .screen {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .top-bar {
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--df-outline-soft);
      flex-shrink: 0;
    }
    .title {
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.025em;
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 20px 40px;
    }
    .section-label { margin-top: 16px; }
    .storage-card { padding: 16px; }
    .storage-header {
      display: flex; align-items: baseline;
      justify-content: space-between; margin-bottom: 12px;
    }
    .storage-mb { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
    .storage-unit { font-size: 14px; color: var(--df-text-muted); margin-left: 4px; }
    .storage-quota { font-size: 11px; color: var(--df-text-faint); }
    .storage-bar {
      height: 6px; border-radius: 999px;
      background: var(--df-surface-2); overflow: hidden; margin-bottom: 8px;
    }
    .storage-bar span {
      display: block; height: 100%;
      background: var(--df-primary); border-radius: 999px;
    }
    .storage-pct { font-size: 10.5px; color: var(--df-text-faint); }
    .breakdown-card { overflow: hidden; margin-top: 10px; }
    .breakdown-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--df-outline-soft);
    }
    .breakdown-row:last-child { border-bottom: 0; }
    .breakdown-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
    .breakdown-info { flex: 1; }
    .breakdown-label { font-size: 13px; font-weight: 500; }
    .breakdown-value { font-size: 12px; font-variant-numeric: tabular-nums; }
    .settings-card { overflow: hidden; }
    .setting-row {
      display: flex; align-items: center;
      padding: 14px 14px; gap: 16px;
    }
    .setting-info { flex: 1; }
    .setting-label { font-size: 13px; font-weight: 500; }
    .setting-value { font-size: 20px; font-weight: 600; color: var(--df-primary); }
    .slider {
      width: 100px;
      accent-color: var(--df-primary);
    }
    .theme-row {
      display: flex;
      padding: 10px;
      gap: 6px;
    }
    .theme-option {
      flex: 1; height: 36px; border-radius: 10px;
      border: 1px solid var(--df-outline-soft);
      background: transparent; color: var(--df-text-muted);
      font-family: inherit; font-size: 13px; cursor: pointer;
      transition: background 120ms, color 120ms;
    }
    .theme-option.active {
      background: var(--df-primary-container);
      color: var(--df-on-primary-container);
      border-color: transparent;
    }
    .maint-card { overflow: hidden; }
    .maint-row {
      display: flex; align-items: center; gap: 12px;
      padding: 14px; cursor: pointer; width: 100%;
      background: transparent; border: 0; text-align: left;
      color: var(--df-text);
    }
    .maint-info { flex: 1; }
    .maint-label { font-size: 13.5px; font-weight: 500; }
    .maint-sub { font-size: 11px; color: var(--df-text-faint); margin-top: 2px; }
    .maint-chevron { color: var(--df-text-faint); }
    .danger-label { color: var(--df-again); }
    .danger-card {
      padding: 16px;
      border-color: color-mix(in srgb, var(--df-again) 35%, var(--df-outline-soft));
    }
    .danger-content {
      display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px;
    }
    .danger-icon {
      width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px;
      background: color-mix(in srgb, var(--df-again) 18%, transparent);
      color: var(--df-again);
      display: flex; align-items: center; justify-content: center;
    }
    .danger-title { font-size: 14px; font-weight: 600; }
    .danger-desc { font-size: 12.5px; color: var(--df-text-muted); margin-top: 4px; line-height: 1.5; }
    .delete-all-btn {
      width: 100%; height: 44px; border-radius: 12px; border: 0;
      background: var(--df-again); color: #fff;
      font-family: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer;
    }
    .version {
      text-align: center; margin-top: 24px;
      font-size: 10.5px; color: var(--df-text-faint);
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

  localSettings: AppSettings = { ...this.settingsService.settings() };

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
    this.localSettings = { ...this.settingsService.settings() };
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

  onSettingChange(): void {
    this.settingsService.save({ ...this.localSettings });
  }

  setTheme(theme: 'system' | 'light' | 'dark'): void {
    this.localSettings = { ...this.localSettings, theme };
    this.settingsService.save(this.localSettings);
  }

  exportData(): void {
    this.exportService.exportJson().subscribe();
  }

  deleteAll(): void {
    this.db.deleteAllData().subscribe(() => {
      this.confirmDelete.set(false);
    });
  }
}
