import { Injectable, inject } from '@angular/core';
import { DbService } from './db.service';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private db = inject(DbService);

  exportJson(): Observable<void> {
    return from(this.db.exportAll()).pipe(
      switchMap(data => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devflash-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return from(Promise.resolve());
      })
    );
  }
}
