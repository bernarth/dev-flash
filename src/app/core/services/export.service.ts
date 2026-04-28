import { Injectable, inject } from '@angular/core';
import { DbService } from './db.service';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private db = inject(DbService);

  async exportJson(): Promise<void> {
    const data = await this.db.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devflash-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
