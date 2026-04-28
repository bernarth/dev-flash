import { Injectable, signal, inject } from '@angular/core';
import { AppSettings, DEFAULT_SETTINGS } from '@models';
import { DbService } from './db.service';
import { ThemeService } from './theme.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private db = inject(DbService);
  private theme = inject(ThemeService);

  readonly settings = signal<AppSettings>({ ...DEFAULT_SETTINGS });
  readonly loaded = signal(false);

  constructor() {
    this.db.getSettings().subscribe(s => {
      this.settings.set(s);
      this.theme.setMode(s.theme);
      this.loaded.set(true);
    });
  }

  save(settings: AppSettings): void {
    this.settings.set(settings);
    this.theme.setMode(settings.theme);
    this.db.saveSettings(settings).subscribe();
  }
}
