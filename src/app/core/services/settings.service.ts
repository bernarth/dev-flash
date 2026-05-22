import { Injectable, signal, inject } from '@angular/core';
import { AppSettings, DEFAULT_SETTINGS } from '@models';
import { DbService } from './db.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private db = inject(DbService);

  readonly settings = signal<AppSettings>({ ...DEFAULT_SETTINGS });
  readonly loaded = signal(false);

  constructor() {
    this.db.getSettings().then((s) => {
      this.settings.set(s);
      this.loaded.set(true);
    });
  }

  save(settings: AppSettings): void {
    this.settings.set(settings);
    void this.db.saveSettings(settings);
  }
}
