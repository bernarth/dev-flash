import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SettingsService } from '@services/settings.service';
import { DbService } from '@services/db.service';
import { AppSettings, DEFAULT_SETTINGS } from '@models';
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
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
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
          <mat-card-title>Session intervals</mat-card-title>
          <mat-card-subtitle>Sessions before a card comes back</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="intervals-grid">
            <mat-form-field appearance="outline">
              <mat-label>Hard</mat-label>
              <input matInput type="number" min="1" max="10"
                     [value]="localSettings().hardInterval"
                     (input)="onIntervalInput('hardInterval', $event)" />
              <mat-hint>sessions</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Good</mat-label>
              <input matInput type="number" min="2" max="20"
                     [value]="localSettings().goodInterval"
                     (input)="onIntervalInput('goodInterval', $event)" />
              <mat-hint>sessions</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Easy</mat-label>
              <input matInput type="number" min="3" max="30"
                     [value]="localSettings().easyInterval"
                     (input)="onIntervalInput('easyInterval', $event)" />
              <mat-hint>sessions</mat-hint>
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-flat-button (click)="saveSettings()">
            <mat-icon>save</mat-icon>
            Save
          </button>
        </mat-card-actions>
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
    .intervals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding-top: 0.5rem;
    }
    @media (max-width: 360px) {
      .intervals-grid { grid-template-columns: 1fr; }
    }
    .version { text-align: center; font-size: var(--df-font-size-xs); opacity: 0.5; margin-bottom: 2rem; }
  `],
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private db = inject(DbService);
  private dialog = inject(MatDialog);

  storageUsedMb = signal(0);
  localSettings = signal<AppSettings>({ ...DEFAULT_SETTINGS });

  storageBreakdown = signal<{ label: string; value: string }[]>([
    { label: 'Decks', value: '…' },
    { label: 'Cards', value: '…' },
    { label: 'Review log', value: '…' },
  ]);

  async ngOnInit(): Promise<void> {
    const s = await this.settingsService.getSettings();
    this.localSettings.set({ ...s });
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

  onIntervalInput(key: 'hardInterval' | 'goodInterval' | 'easyInterval', event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value > 0) {
      this.localSettings.update((s) => ({ ...s, [key]: value }));
    }
  }

  saveSettings(): void {
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
