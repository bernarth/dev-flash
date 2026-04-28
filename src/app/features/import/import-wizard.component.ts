import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImportService, ImportResult } from '@services/import.service';
import { DbService } from '@services/db.service';
import { Deck } from '@models';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-import-wizard',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="screen">
      <header class="top-bar">
        <button class="icon-btn" (click)="cancel()">
          <df-icon name="close" [size]="20" />
        </button>
        <div class="top-bar-center">
          <div class="title">Import cards</div>
          <div class="subtitle df-mono">step {{ step() }} / 3 · csv</div>
        </div>
      </header>

      <!-- Stepper -->
      <div class="stepper">
        @for (s of steps; track s.n) {
          <div class="step-item" [class.done]="step() > s.n" [class.current]="step() === s.n">
            <div class="step-dot">
              @if (step() > s.n) {
                <df-icon name="check" [size]="14" [strokeWidth]="2" />
              } @else {
                {{ s.n }}
              }
            </div>
            <div class="step-label">{{ s.label }}</div>
          </div>
          @if (s.n < 3) {
            <div class="step-connector" [class.done]="step() > s.n"></div>
          }
        }
      </div>

      <div class="content df-scroll">
        @switch (step()) {
          @case (1) {
            <div class="step-content">
              <div class="step-title">Upload a CSV</div>
              <div class="step-sub">Columns: <span class="df-mono">question, answer, tags, notes</span></div>

              <!-- Target deck picker -->
              <div class="field">
                <div class="df-label">Target deck</div>
                <select class="df-select"
                  [ngModel]="selectedDeckId()"
                  (ngModelChange)="selectedDeckId.set(+$event)">
                  <option value="0" disabled>Select a deck…</option>
                  @for (deck of decks(); track deck.id) {
                    <option [value]="deck.id">{{ deck.name }}</option>
                  }
                </select>
              </div>

              <!-- Drop zone -->
              <div class="drop-zone df-dots"
                [class.has-file]="selectedFile()"
                (click)="fileInput.click()"
                (dragover)="$event.preventDefault()"
                (drop)="onDrop($event)">
                <div class="drop-icon">
                  <df-icon name="upload" [size]="22" />
                </div>
                <div class="drop-title">Drop a .csv file here</div>
                <div class="drop-sub">or tap to browse</div>
                <button class="tonal-btn" type="button" (click)="$event.stopPropagation(); fileInput.click()">
                  Choose file
                </button>
              </div>
              <input #fileInput type="file" accept=".csv" style="display:none"
                (change)="onFileSelect($event)" />

              @if (selectedFile()) {
                <div class="file-preview df-card">
                  <div class="file-icon">
                    <df-icon name="file" [size]="18" />
                  </div>
                  <div class="file-info">
                    <div class="df-mono file-name">{{ selectedFile()!.name }}</div>
                    <div class="file-size">{{ formatSize(selectedFile()!.size) }}</div>
                  </div>
                  <df-icon name="check" [size]="18" [strokeWidth]="2" style="color: var(--df-good)" />
                </div>
              }

              @if (error()) {
                <div class="error-msg">{{ error() }}</div>
              }
            </div>
          }

          @case (2) {
            <div class="step-content">
              <div class="step-title">Preview</div>
              <div class="step-sub">First 5 rows · column mapping looks good</div>

              <div class="column-map">
                @for (col of columnMap; track col[0]) {
                  <span class="col-chip df-mono on">
                    <df-icon name="check" [size]="12" [strokeWidth]="2" />
                    {{ col[0] }} → {{ col[1] }}
                  </span>
                }
              </div>

              <div class="preview-table df-card">
                <div class="preview-header">
                  <div class="preview-row-num">#</div>
                  <div>question / answer / tags</div>
                </div>
                @for (row of previewRows(); track $index) {
                  <div class="preview-row">
                    <div class="preview-row-num df-mono">{{ String($index + 1).padStart(2, '0') }}</div>
                    <div class="preview-cell">
                      <div class="preview-q">{{ row.question }}</div>
                      <div class="preview-a">{{ row.answer }}</div>
                      @if (row.tags) {
                        <div class="preview-tags df-mono">#{{ row.tags.split(',').join(' #') }}</div>
                      }
                    </div>
                  </div>
                }
              </div>

              @if (importResult() && importResult()!.skipped.length) {
                <div class="warn-msg">{{ importResult()!.skipped.length }} rows will be skipped</div>
              }
            </div>
          }

          @case (3) {
            <div class="step-content">
              <div class="import-success">
                <div class="success-icon">
                  <df-icon name="check" [size]="30" [strokeWidth]="2" />
                </div>
                <div class="success-title">Imported</div>
                <div class="success-sub">
                  Added to <strong>{{ targetDeckName() }}</strong>
                </div>
              </div>

              <div class="import-stats">
                <div class="df-card stat-box">
                  <div class="df-mono stat-num good">{{ importResult() ? importResult()!.imported.length : 0 }}</div>
                  <div class="df-label">imported</div>
                </div>
                <div class="df-card stat-box">
                  <div class="df-mono stat-num hard">{{ importResult() ? importResult()!.skipped.length : 0 }}</div>
                  <div class="df-label">skipped</div>
                </div>
                <div class="df-card stat-box">
                  <div class="df-mono stat-num faint">0</div>
                  <div class="df-label">errors</div>
                </div>
              </div>

              @if (importResult() && importResult()!.skipped.length) {
                <div class="df-card skipped-log">
                  <div class="df-label" style="padding:12px 14px 8px;margin:0">Skipped rows</div>
                  <div class="df-hr"></div>
                  @for (s of importResult()!.skipped; track s.row) {
                    <div class="skipped-row">
                      <span class="df-mono skip-rownum">row {{ s.row }}</span>
                      <span class="skip-reason">{{ s.reason }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }
      </div>

      <!-- Footer nav -->
      <div class="footer">
        @if (step() > 1 && step() < 3) {
          <button class="btn-outline" (click)="prevStep()">Back</button>
        }
        @if (step() < 3) {
          <button class="btn-filled"
            [disabled]="!canAdvance()"
            (click)="nextStep()">
            {{ step() === 2 ? 'Import ' + (importResult() ? importResult()!.imported.length : '') + ' cards' : 'Continue' }}
          </button>
        } @else {
          <button class="btn-filled" (click)="done()">Done</button>
        }
      </div>
    </div>
  `,
  styles: [`
    .screen {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .top-bar {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--df-outline-soft);
      gap: 12px;
      flex-shrink: 0;
    }
    .top-bar-center { flex: 1; }
    .title { font-weight: 600; font-size: 16px; }
    .subtitle { font-size: 11px; color: var(--df-text-faint); }
    .stepper {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 20px;
      flex-shrink: 0;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }
    .step-dot {
      width: 28px; height: 28px; border-radius: 10px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      background: var(--df-surface-1);
      color: var(--df-text-faint);
      border: 1px solid var(--df-outline-soft);
    }
    .step-item.current .step-dot {
      background: var(--df-primary-container);
      color: var(--df-on-primary-container);
      border-color: var(--df-primary);
    }
    .step-item.done .step-dot {
      background: var(--df-primary);
      color: var(--df-primary-ink);
      border-color: var(--df-primary);
    }
    .step-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--df-text-faint);
      white-space: nowrap;
    }
    .step-item.current .step-label, .step-item.done .step-label {
      color: var(--df-text);
    }
    .step-connector {
      height: 1px;
      width: 14px;
      background: var(--df-outline-soft);
      flex-shrink: 0;
    }
    .step-connector.done { background: var(--df-primary); }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 20px 20px;
    }
    .step-content {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .step-title {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .step-sub {
      font-size: 13px;
      color: var(--df-text-muted);
    }
    .df-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--df-text-faint); margin-bottom: 8px; }
    .field { display: flex; flex-direction: column; }
    .df-select {
      width: 100%; background: var(--df-surface-1); color: var(--df-text);
      border: 1px solid var(--df-outline-soft); border-radius: 12px;
      padding: 12px 14px; font-family: inherit; font-size: 14px; outline: none;
    }
    .drop-zone {
      border: 1.5px dashed var(--df-outline);
      border-radius: 16px;
      padding: 28px 20px;
      text-align: center;
      background: var(--df-surface);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .drop-icon {
      width: 52px; height: 52px; border-radius: 16px;
      background: var(--df-primary-container);
      color: var(--df-on-primary-container);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 6px;
    }
    .drop-title { font-size: 14px; font-weight: 500; }
    .drop-sub { font-size: 12px; color: var(--df-text-faint); }
    .tonal-btn {
      margin-top: 10px; height: 38px; padding: 0 18px; border-radius: 12px;
      border: 0; background: var(--df-primary-container);
      color: var(--df-on-primary-container);
      font-family: inherit; font-size: 13px; cursor: pointer;
    }
    .file-preview {
      display: flex; align-items: center; gap: 12px; padding: 12px;
    }
    .file-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--df-surface-1); border: 1px solid var(--df-outline-soft);
      display: flex; align-items: center; justify-content: center;
      color: var(--df-text-muted);
    }
    .file-info { flex: 1; min-width: 0; }
    .file-name { font-size: 12.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-size { font-size: 11px; color: var(--df-text-faint); }
    .error-msg { font-size: 13px; color: var(--df-again); padding: 8px 12px; background: color-mix(in srgb, var(--df-again) 12%, transparent); border-radius: 10px; }
    .warn-msg { font-size: 12px; color: var(--df-text-faint); }
    .column-map { display: flex; gap: 6px; flex-wrap: wrap; }
    .col-chip {
      display: inline-flex; align-items: center; gap: 4px;
      height: 30px; padding: 0 12px; border-radius: 999px;
      font-size: 12px; font-weight: 500;
    }
    .col-chip.on {
      background: var(--df-primary-container);
      color: var(--df-on-primary-container);
    }
    .preview-table { overflow: hidden; }
    .preview-header {
      display: grid; grid-template-columns: 32px 1fr;
      font-size: 11px; font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: var(--df-text-faint);
      border-bottom: 1px solid var(--df-outline-soft);
      background: var(--df-surface-1);
      padding: 8px 12px;
    }
    .preview-row {
      display: grid; grid-template-columns: 32px 1fr;
      padding: 10px 12px;
      border-bottom: 1px solid var(--df-outline-soft);
    }
    .preview-row:last-child { border-bottom: 0; }
    .preview-row-num { font-size: 11px; color: var(--df-text-faint); font-family: 'JetBrains Mono', ui-monospace, monospace; padding-top: 2px; }
    .preview-cell { min-width: 0; }
    .preview-q { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .preview-a { font-size: 12px; color: var(--df-text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .preview-tags { font-size: 10.5px; color: var(--df-primary); margin-top: 4px; }
    .import-success { text-align: center; padding: 16px 0 12px; }
    .success-icon {
      width: 64px; height: 64px; margin: 0 auto 14px;
      border-radius: 20px; background: var(--df-primary-container);
      color: var(--df-on-primary-container);
      display: flex; align-items: center; justify-content: center;
    }
    .success-title { font-size: 22px; font-weight: 600; letter-spacing: -0.025em; }
    .success-sub { font-size: 13px; color: var(--df-text-muted); margin-top: 4px; }
    .import-stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    }
    .stat-box { padding: 14px; text-align: center; }
    .stat-num { font-size: 26px; font-weight: 600; line-height: 1; }
    .good { color: var(--df-good); }
    .hard { color: var(--df-hard); }
    .faint { color: var(--df-text-faint); }
    .skipped-log { overflow: hidden; }
    .skipped-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--df-outline-soft);
    }
    .skipped-row:last-child { border-bottom: 0; }
    .skip-rownum { font-size: 11px; color: var(--df-text-faint); width: 44px; }
    .skip-reason { font-size: 13px; flex: 1; }
    .footer {
      padding: 12px 20px 24px;
      border-top: 1px solid var(--df-outline-soft);
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn-filled {
      flex: 2; height: 46px; border-radius: 13px;
      border: 0; background: var(--df-primary); color: var(--df-primary-ink);
      font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .btn-filled:disabled { opacity: 0.45; cursor: default; }
    .btn-outline {
      flex: 1; height: 46px; border-radius: 13px;
      border: 1px solid var(--df-outline); background: transparent;
      color: var(--df-text); font-family: inherit; font-size: 14px; cursor: pointer;
    }
  `],
})
export class ImportWizardComponent {
  protected String = String;

  private importService = inject(ImportService);
  private db = inject(DbService);
  private router = inject(Router);

  decks = toSignal(this.db.getAllDecks(), { initialValue: [] as Deck[] });

  step = signal(1);
  selectedDeckId = signal(0);
  selectedFile = signal<File | null>(null);
  importResult = signal<ImportResult | null>(null);
  error = signal('');
  importing = signal(false);

  readonly steps = [
    { n: 1, label: 'Upload' },
    { n: 2, label: 'Preview' },
    { n: 3, label: 'Import' },
  ];

  readonly columnMap = [
    ['question', 'Question'],
    ['answer', 'Answer'],
    ['tags', 'Tags'],
    ['notes', 'Notes'],
  ];

  previewRows = computed(() => {
    const r = this.importResult();
    if (!r) return [];
    return r.imported.slice(0, 5).map(c => ({
      question: c.question,
      answer: c.answer,
      tags: c.tags.join(','),
    }));
  });

  targetDeckName = computed(() => {
    const d = this.decks().find(d => d.id === this.selectedDeckId());
    return d?.name ?? '';
  });

  canAdvance = computed(() => {
    if (this.step() === 1) return !!this.selectedFile() && this.selectedDeckId() > 0;
    if (this.step() === 2) return !!this.importResult();
    return true;
  });

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile.set(input.files[0]);
      this.error.set('');
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.error.set('');
    }
  }

  nextStep(): void {
    if (this.step() === 1) {
      this.parseFile();
    } else if (this.step() === 2) {
      this.doImport();
    }
  }

  prevStep(): void {
    this.step.update(s => s - 1);
  }

  private parseFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.importService.parse(file, this.selectedDeckId()).then(result => {
      this.importResult.set(result);
      this.step.set(2);
    }).catch(err => {
      this.error.set(err.message);
    });
  }

  private doImport(): void {
    const result = this.importResult();
    if (!result) return;

    this.db.bulkAddCards(result.imported).subscribe(() => {
      this.step.set(3);
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  cancel(): void {
    this.router.navigate(['/decks']);
  }

  done(): void {
    this.router.navigate(['/decks']);
  }
}
