import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { SettingsService } from '@services/settings.service';
import { DbService } from '@services/db.service';
import { AppSettings } from '@models';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'df-settings',
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatSliderModule,
    MatButtonModule,
    MatDividerModule,
  ],
  template: `
    <mat-toolbar>Settings</mat-toolbar>

    <div class="content">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Local storage</mat-card-title>
          <mat-card-subtitle>{{ storageUsedMb().toFixed(1) }} MB used</mat-card-subtitle>
        </mat-card-header>
        <mat-list>
          @for (item of storageBreakdown(); track item.label) {
            <mat-list-item>
              <span matListItemTitle>{{ item.label }}</span>
              <span matListItemMeta>{{ item.value }}</span>
            </mat-list-item>
          }
        </mat-list>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Study settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="slider-row">
            <span>New cards per day</span>
            <strong>{{ localSettings().newCardsPerDay }}</strong>
          </div>
          <mat-slider min="1" max="50" step="1">
            <input #s1="matSliderThumb" matSliderThumb [value]="localSettings().newCardsPerDay"
                   (change)="onNewCardsChange(s1.value)" />
          </mat-slider>
          <mat-divider />
          <div class="slider-row">
            <span>Max reviews per day</span>
            <strong>{{ localSettings().maxReviewsPerDay }}</strong>
          </div>
          <mat-slider min="10" max="200" step="10">
            <input #s2="matSliderThumb" matSliderThumb [value]="localSettings().maxReviewsPerDay"
                   (change)="onMaxReviewsChange(s2.value)" />
          </mat-slider>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Danger zone</mat-card-title>
          <mat-card-subtitle>
            Permanently removes all decks, cards, notes, and review history from this device.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-flat-button color="warn" (click)="openDeleteDialog()">
            <mat-icon>delete</mat-icon>
            Delete everything
          </button>
        </mat-card-actions>
      </mat-card>

      <p class="version">DevFlash · v0.1.0</p>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .slider-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0 0.25rem;
    }
    mat-slider { width: 100%; margin-bottom: 0.5rem; }
    mat-divider { margin: 0.5rem 0 1rem; }
    .version { text-align: center; font-size: 0.75rem; opacity: 0.5; margin-bottom: 2rem; }
  `],
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private db = inject(DbService);
  private dialog = inject(MatDialog);

  storageUsedMb = signal(0);
  localSettings = signal<AppSettings>({ ...this.settingsService.settings() });

  storageBreakdown = signal<{ label: string; value: string }[]>([
    { label: 'Decks', value: '…' },
    { label: 'Cards', value: '…' },
    { label: 'Review log', value: '…' },
  ]);

  ngOnInit(): void {
    this.localSettings.set({ ...this.settingsService.settings() });
    this.loadStorageInfo();
  }

  private loadStorageInfo(): void {
    void Promise.all([
      this.db.getStorageEstimate(),
      this.db.getDeckCountAll(),
      this.db.getCardCountAll(),
      this.db.getReviewLogCountAll(),
    ]).then(([{ usage }, deckCount, cardCount, reviewCount]) => {
      this.storageUsedMb.set(usage / (1024 * 1024));
      this.storageBreakdown.set([
        { label: 'Decks', value: `${deckCount} deck${deckCount !== 1 ? 's' : ''}` },
        { label: 'Cards', value: `${cardCount} card${cardCount !== 1 ? 's' : ''}` },
        { label: 'Review log', value: `${reviewCount} entr${reviewCount !== 1 ? 'ies' : 'y'}` },
      ]);
    });
  }

  onNewCardsChange(value: number): void {
    this.localSettings.update((s) => ({ ...s, newCardsPerDay: value }));
    this.settingsService.save(this.localSettings());
  }

  onMaxReviewsChange(value: number): void {
    this.localSettings.update((s) => ({ ...s, maxReviewsPerDay: value }));
    this.settingsService.save(this.localSettings());
  }

  openDeleteDialog(): void {
    const data: ConfirmDialogData = {
      title: 'Delete all data?',
      description: 'This will erase all decks, cards, and review history. This cannot be undone.',
      confirmLabel: 'Yes, delete everything',
      cancelLabel: 'Cancel',
      variant: 'danger',
      icon: 'delete',
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) void this.deleteAll();
    });
  }

  async deleteAll(): Promise<void> {
    await this.db.deleteAllData();
    this.loadStorageInfo();
  }
}
