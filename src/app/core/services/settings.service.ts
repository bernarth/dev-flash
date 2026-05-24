import { Injectable, inject } from '@angular/core';
import { AppSettings } from '@models';
import { DbService } from './db.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private db = inject(DbService);

  getSettings(): Promise<AppSettings> {
    return this.db.getSettings();
  }

  save(settings: AppSettings): void {
    void this.db.saveSettings(settings);
  }
}
