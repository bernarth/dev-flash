import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImportService, ImportResult } from '@services/import.service';
import { DbService } from '@services/db.service';
import { Deck } from '@models';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'df-import-wizard',
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatStepperModule,
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="cancel()" aria-label="Cancel import">
        <mat-icon>close</mat-icon>
      </button>
      <span>Import cards</span>
    </mat-toolbar>

    <!-- Header-only stepper — content is rendered below in .content -->
    <mat-stepper class="wizard-stepper" [selectedIndex]="step() - 1"
                 (selectionChange)="onStepperChange($event.selectedIndex + 1)">
      <mat-step label="Upload" [completed]="step() > 1"></mat-step>
      <mat-step label="Preview" [completed]="step() > 2"></mat-step>
      <mat-step label="Import"></mat-step>
    </mat-stepper>

    <div class="content">
      @switch (step()) {
        @case (1) {
          <div class="step-content">
            <div class="step-title">Upload a CSV</div>
            <div class="step-sub">Columns: <span class="df-mono">question, answer, tags, notes</span></div>

            <mat-form-field appearance="outline">
              <mat-label>Target deck</mat-label>
              <mat-select [value]="selectedDeckId()" (selectionChange)="selectedDeckId.set($event.value)">
                @for (deck of decks(); track deck.id) {
                  <mat-option [value]="deck.id">{{ deck.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="drop-zone" role="button" tabindex="0"
                 aria-label="Drop a CSV file here or press Enter to browse"
                 (click)="fileInput.click()" (keydown.enter)="fileInput.click()"
                 (keydown.space)="$event.preventDefault(); fileInput.click()"
                 (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
              <mat-icon>upload_file</mat-icon>
              <div>Drop a .csv file here</div>
              <div class="drop-sub">or tap to browse</div>
              <button mat-stroked-button type="button"
                      (click)="$event.stopPropagation(); fileInput.click()">
                Choose file
              </button>
            </div>
            <input #fileInput type="file" accept=".csv" class="visually-hidden" aria-label="CSV file"
                   (change)="onFileSelect($event)" />

            @if (selectedFile()) {
              <mat-card appearance="outlined">
                <mat-card-content class="file-preview">
                  <mat-icon>insert_drive_file</mat-icon>
                  <div class="file-info">
                    <div class="df-mono file-name">{{ selectedFile()!.name }}</div>
                    <div class="file-size">{{ formatSize(selectedFile()!.size) }}</div>
                  </div>
                  <mat-icon class="icon-good">check_circle</mat-icon>
                </mat-card-content>
              </mat-card>
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

            <mat-chip-set>
              @for (col of columnMap; track col[0]) {
                <mat-chip>
                  <mat-icon matChipAvatar>check</mat-icon>
                  {{ col[0] }} → {{ col[1] }}
                </mat-chip>
              }
            </mat-chip-set>

            <mat-card appearance="outlined">
              <mat-list>
                <mat-list-item class="preview-header-row">
                  <span class="preview-row-num df-mono" matListItemIcon>#</span>
                  <span matListItemTitle>question / answer / tags</span>
                </mat-list-item>
                @for (row of previewRows(); track $index) {
                  <mat-list-item>
                    <span class="preview-row-num df-mono" matListItemIcon>
                      {{ String($index + 1).padStart(2, '0') }}
                    </span>
                    <span matListItemTitle>{{ row.question }}</span>
                    <span matListItemLine>{{ row.answer }}</span>
                    @if (row.tags) {
                      <span matListItemLine class="df-mono preview-tags">
                        #{{ row.tags.split(',').join(' #') }}
                      </span>
                    }
                  </mat-list-item>
                }
              </mat-list>
            </mat-card>

            @if (importResult() && importResult()!.skipped.length) {
              <p class="warn-msg">{{ importResult()!.skipped.length }} rows will be skipped</p>
            }
          </div>
        }

        @case (3) {
          <div class="step-content">
            <div class="import-success">
              <mat-icon class="success-check-icon">check_circle</mat-icon>
              <div class="success-title">Imported</div>
              <div class="success-sub">Added to <strong>{{ targetDeckName() }}</strong></div>
            </div>

            <div class="import-stats">
              <mat-card appearance="outlined">
                <mat-card-content class="stat-box">
                  <div class="df-mono stat-num good">{{ importResult() ? importResult()!.imported.length : 0 }}</div>
                  <div class="stat-label">imported</div>
                </mat-card-content>
              </mat-card>
              <mat-card appearance="outlined">
                <mat-card-content class="stat-box">
                  <div class="df-mono stat-num hard">{{ importResult() ? importResult()!.skipped.length : 0 }}</div>
                  <div class="stat-label">skipped</div>
                </mat-card-content>
              </mat-card>
              <mat-card appearance="outlined">
                <mat-card-content class="stat-box">
                  <div class="df-mono stat-num">0</div>
                  <div class="stat-label">errors</div>
                </mat-card-content>
              </mat-card>
            </div>

            @if (importResult() && importResult()!.skipped.length) {
              <mat-card appearance="outlined">
                <mat-card-header>
                  <mat-card-title>Skipped rows</mat-card-title>
                </mat-card-header>
                <mat-list>
                  @for (s of importResult()!.skipped; track s.row) {
                    <mat-list-item>
                      <span matListItemIcon class="df-mono skip-rownum">row {{ s.row }}</span>
                      <span matListItemTitle>{{ s.reason }}</span>
                    </mat-list-item>
                  }
                </mat-list>
              </mat-card>
            }
          </div>
        }
      }
    </div>

    <div class="footer">
      @if (step() === 2) {
        <button mat-stroked-button class="back-btn" (click)="prevStep()">Back</button>
      }
      @if (step() < 3) {
        <button mat-flat-button class="next-btn" [disabled]="!canAdvance()" (click)="nextStep()">
          {{ step() === 2 ? 'Import ' + (importResult() ? importResult()!.imported.length : '') + ' cards' : 'Continue' }}
        </button>
      } @else {
        <button mat-flat-button class="next-btn" (click)="done()">Done</button>
      }
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

  onStepperChange(newStep: number): void {
    if (newStep < this.step()) this.step.set(newStep);
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
    if (!result) return;
    await this.db.bulkAddCards(result.imported);
    this.step.set(3);
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
