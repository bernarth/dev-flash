import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { Deck } from '@models';
import { choose } from '@core/utils/utils';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'df-import-upload-step',
  imports: [MatIconModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './import-upload-step.component.html',
  styleUrl: './import-upload-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportUploadStepComponent {
  readonly decks = input<Deck[]>([]);
  readonly hasDeckContext = input(false);
  readonly selectedDeckId = model.required<number>();
  readonly selectedFile = model.required<File | null>();
  readonly error = model<string>('');

  protected readonly dragOver = signal(false);

  onDeckChange(value: number): void {
    this.selectedDeckId.set(value);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFile(input.files?.[0] ?? null, () => (input.value = ''));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.handleFile(event.dataTransfer?.files[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.error.set('');
  }

  formatSize(bytes: number): string {
    return choose(
      [
        { when: bytes < 1024, value: `${bytes} B` },
        { when: bytes < 1024 * 1024, value: `${(bytes / 1024).toFixed(1)} KB` },
      ],
      `${(bytes / (1024 * 1024)).toFixed(1)} MB`,
    );
  }

  private handleFile(file: File | null, onReject?: () => void): void {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.error.set('Only .csv files are accepted.');
      onReject?.();
      return;
    }

    this.selectedFile.set(file);
    this.error.set('');
  }
}
