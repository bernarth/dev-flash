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
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
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
