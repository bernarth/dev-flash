import { Component, inject, resource, linkedSignal } from '@angular/core';
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
import { form, min, submit, FormField, max } from '@angular/forms/signals';

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
    FormField,
  ],
  template: `
    <mat-toolbar>Settings</mat-toolbar>

    <div class="content">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Local storage</mat-card-title>
          <mat-card-subtitle>
            @if (storageUsedKb.isLoading()) {
              Loading used storage...
            } @else {
              {{ storageUsedKb.value()?.toFixed(2) ?? '?' }} KB used
            }
          </mat-card-subtitle>
        </mat-card-header>
        @if (storageBreakdown.isLoading()) {
          <mat-card-content> Loading storage... </mat-card-content>
        } @else {
          <mat-list>
            @for (item of storageBreakdown.value() ?? []; track item.label) {
              <mat-list-item>
                <span matListItemTitle>{{ item.label }}</span>
                <span matListItemMeta>{{ item.value }}</span>
              </mat-list-item>
            }
          </mat-list>
        }
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
              <input matInput type="number" [formField]="settingsForm.hardInterval" />
              <mat-hint>sessions</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Good</mat-label>
              <input matInput type="number" [formField]="settingsForm.goodInterval" />
              <mat-hint>sessions</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Easy</mat-label>
              <input matInput type="number" [formField]="settingsForm.easyInterval" />
              <mat-hint>sessions</mat-hint>
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button
            mat-flat-button
            (click)="saveSettings()"
            [disabled]="settingsForm().submitting() || !settingsForm().dirty()"
          >
            <mat-icon>save</mat-icon>
            Save Session Intervals
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
          <button mat-flat-button class="danger-btn" (click)="openDeleteDialog()">
            <mat-icon>delete</mat-icon>
            Delete everything
          </button>
        </mat-card-actions>
      </mat-card>

      <p class="version">DevFlash | v0.3.0</p>
    </div>
  `,
  styles: [
    `
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

      @media (max-width: 767px) {
        .intervals-grid {
          grid-template-columns: 1fr;
        }
      }

      .danger-btn {
        --mat-button-filled-container-color: var(--mat-sys-error);
        --mat-button-filled-label-text-color: var(--mat-sys-on-error);
      }

      .version {
        text-align: center;
        font-size: var(--df-font-size-xs);
        opacity: 0.5;
      }
    `,
  ],
})
export class SettingsComponent {
  private settingsService = inject(SettingsService);
  private db = inject(DbService);
  private dialog = inject(MatDialog);

  protected storageUsedKb = resource<number, unknown>({
    loader: () => this.settingsService.getStorageUsedInKb(),
  });
  protected storageBreakdown = resource({
    loader: () => this.settingsService.getStorageBreakdown(),
  });
  protected localSettings = resource<AppSettings, unknown>({
    loader: () => this.settingsService.getSettings(),
  });

  protected settingsModel = linkedSignal(
    () => this.localSettings.value() ?? { ...DEFAULT_SETTINGS },
  );

  protected settingsForm = form(this.settingsModel, (schemaPath) => {
    min(schemaPath.hardInterval, 1);
    max(schemaPath.hardInterval, 30);
    min(schemaPath.goodInterval, (ctx) => ctx.stateOf(schemaPath.hardInterval).value() + 1);
    max(schemaPath.goodInterval, 30);
    min(schemaPath.easyInterval, (ctx) => ctx.stateOf(schemaPath.goodInterval).value() + 1);
    max(schemaPath.easyInterval, 30);
  });

  async saveSettings(): Promise<void> {
    const success = await submit(this.settingsForm, async () => {
      const settings = this.settingsModel();
      await this.settingsService.save(settings);
    });

    if (success) {
      this.localSettings.reload();
      this.settingsForm().reset();
    }
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
    const reference = this.dialog.open(ConfirmDialogComponent, { data });
    reference.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        void this.deleteAll();
      }
    });
  }

  async deleteAll(): Promise<void> {
    await this.db.deleteAllData();
    this.storageUsedKb.reload();
    this.storageBreakdown.reload();
    this.localSettings.reload();
  }
}
