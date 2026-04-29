import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImportService, ImportResult } from '@services/import.service';
import { DbService } from '@services/db.service';
import { Deck } from '@models';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-import-wizard',
  imports: [IconComponent],
  template: `
    <div class="df-screen">
      <header class="df-top-bar">
        <button type="button" class="icon-btn" (click)="cancel()" aria-label="Cancel import">
          <df-icon name="close" [size]="20" />
        </button>
        <div class="top-bar-center">
          <div class="title">Import cards</div>
          <div class="subtitle df-mono">step {{ step() }} / 3 · csv</div>
        </div>
      </header>

      <!-- Stepper -->
      <div class="stepper" role="list" aria-label="Import steps">
        @for (s of steps; track s.n) {
          <div
            class="step-item"
            role="listitem"
            [class.done]="step() > s.n"
            [class.current]="step() === s.n"
            [attr.aria-current]="step() === s.n ? 'step' : null"
          >
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
              <div class="step-sub">
                Columns: <span class="df-mono">question, answer, tags, notes</span>
              </div>

              <!-- Target deck picker -->
              <label class="field" for="deck-select">
                <span class="df-label">Target deck</span>
                <select
                  id="deck-select"
                  class="df-select"
                  [value]="selectedDeckId()"
                  (change)="onDeckSelect($event)"
                >
                  <option value="0" disabled>Select a deck…</option>
                  @for (deck of decks(); track deck.id) {
                    <option [value]="deck.id">{{ deck.name }}</option>
                  }
                </select>
              </label>

              <!-- Drop zone -->
              <div
                class="drop-zone df-dots"
                role="button"
                tabindex="0"
                aria-label="Drop a CSV file here or press Enter to browse"
                [class.has-file]="selectedFile()"
                (click)="fileInput.click()"
                (keydown.enter)="fileInput.click()"
                (keydown.space)="$event.preventDefault(); fileInput.click()"
                (dragover)="$event.preventDefault()"
                (drop)="onDrop($event)"
              >
                <div class="drop-icon" aria-hidden="true">
                  <df-icon name="upload" [size]="22" />
                </div>
                <div class="drop-title">Drop a .csv file here</div>
                <div class="drop-sub">or tap to browse</div>
                <button
                  class="tonal-btn"
                  type="button"
                  (click)="$event.stopPropagation(); fileInput.click()"
                >
                  Choose file
                </button>
              </div>
              <input
                #fileInput
                type="file"
                accept=".csv"
                class="visually-hidden"
                aria-label="CSV file"
                (change)="onFileSelect($event)"
              />

              @if (selectedFile()) {
                <div class="file-preview df-card">
                  <div class="file-icon">
                    <df-icon name="file" [size]="18" />
                  </div>
                  <div class="file-info">
                    <div class="df-mono file-name">{{ selectedFile()!.name }}</div>
                    <div class="file-size">{{ formatSize(selectedFile()!.size) }}</div>
                  </div>
                  <df-icon name="check" [size]="18" [strokeWidth]="2" class="icon-good" />
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
                    <div class="preview-row-num df-mono">
                      {{ String($index + 1).padStart(2, '0') }}
                    </div>
                    <div class="preview-cell">
                      <div class="preview-q">{{ row.question }}</div>
                      <div class="preview-a">{{ row.answer }}</div>
                      @if (row.tags) {
                        <div class="preview-tags df-mono">
                          #{{ row.tags.split(',').join(' #') }}
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              @if (importResult() && importResult()!.skipped.length) {
                <div class="warn-msg">
                  {{ importResult()!.skipped.length }} rows will be skipped
                </div>
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
                  <div class="df-mono stat-num good">
                    {{ importResult() ? importResult()!.imported.length : 0 }}
                  </div>
                  <div class="df-label">imported</div>
                </div>
                <div class="df-card stat-box">
                  <div class="df-mono stat-num hard">
                    {{ importResult() ? importResult()!.skipped.length : 0 }}
                  </div>
                  <div class="df-label">skipped</div>
                </div>
                <div class="df-card stat-box">
                  <div class="df-mono stat-num faint">0</div>
                  <div class="df-label">errors</div>
                </div>
              </div>

              @if (importResult() && importResult()!.skipped.length) {
                <div class="df-card skipped-log">
                  <div class="df-label skipped-log-label">Skipped rows</div>
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
          <button type="button" class="df-btn-outline footer-back" (click)="prevStep()">
            Back
          </button>
        }
        @if (step() < 3) {
          <button
            type="button"
            class="df-btn-primary footer-next"
            [disabled]="!canAdvance()"
            (click)="nextStep()"
          >
            {{
              step() === 2
                ? 'Import ' + (importResult() ? importResult()!.imported.length : '') + ' cards'
                : 'Continue'
            }}
          </button>
        } @else {
          <button type="button" class="df-btn-primary footer-next" (click)="done()">Done</button>
        }
      </div>
    </div>
  `,
  styleUrl: './import-wizard.component.scss',
})
export class ImportWizardComponent implements OnInit {
  protected String = String;

  private importService = inject(ImportService);
  private db = inject(DbService);
  private router = inject(Router);

  decks = signal<Deck[]>([]);

  async ngOnInit(): Promise<void> {
    this.decks.set(await this.db.getAllDecks());
  }

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
    return r.imported.slice(0, 5).map((c) => ({
      question: c.question,
      answer: c.answer,
      tags: c.tags.join(','),
    }));
  });

  targetDeckName = computed(() => {
    const d = this.decks().find((d) => d.id === this.selectedDeckId());
    return d?.name ?? '';
  });

  canAdvance = computed(() => {
    if (this.step() === 1) return !!this.selectedFile() && this.selectedDeckId() > 0;
    if (this.step() === 2) return !!this.importResult();
    return true;
  });

  onDeckSelect(event: Event): void {
    this.selectedDeckId.set(+(event.target as HTMLSelectElement).value);
  }

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

  async nextStep(): Promise<void> {
    if (this.step() === 1) {
      await this.parseFile();
    } else if (this.step() === 2) {
      await this.doImport();
    }
  }

  prevStep(): void {
    this.step.update((s) => s - 1);
  }

  private async parseFile(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;
    try {
      const result = await this.importService.parse(file, this.selectedDeckId());
      this.importResult.set(result);
      this.step.set(2);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Parse failed');
    }
  }

  private async doImport(): Promise<void> {
    const result = this.importResult();

    if (!result) {
      return;
    }

    await this.db.bulkAddCards(result.imported);
    this.step.set(3);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  cancel(): void {
    this.router.navigate(['/decks']);
  }

  done(): void {
    this.router.navigate(['/decks']);
  }
}
