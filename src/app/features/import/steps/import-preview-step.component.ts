import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ImportResult } from '@services/import.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

const COLUMN_MAP: ReadonlyArray<readonly [string, string]> = [
  ['question', 'Question'],
  ['answer', 'Answer'],
  ['tags', 'Tags'],
  ['notes', 'Notes'],
];

@Component({
  selector: 'df-import-preview-step',
  imports: [MatIconModule, MatChipsModule, MatCardModule, MatListModule],
  templateUrl: './import-preview-step.component.html',
  styleUrl: './import-preview-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPreviewStepComponent {
  readonly result = input.required<ImportResult>();

  protected readonly columnMap = COLUMN_MAP;

  protected readonly previewRows = computed(() =>
    this.result()
      .imported.slice(0, 5)
      .map((c, i) => ({
        index: String(i + 1).padStart(2, '0'),
        question: c.question,
        answer: c.answer,
        tags: c.tags.join(','),
      })),
  );
}
