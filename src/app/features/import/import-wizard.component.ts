import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Deck } from '@models';
import { DeckService } from '@core/services/deck.service';
import { ImportResult, ImportService } from '@services/import.service';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { ImportUploadStepComponent } from './steps/import-upload-step.component';
import { ImportPreviewStepComponent } from './steps/import-preview-step.component';
import { ImportResultStepComponent } from './steps/import-result-step.component';

@Component({
  selector: 'df-import-wizard',
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatStepperModule,
    ImportUploadStepComponent,
    ImportPreviewStepComponent,
    ImportResultStepComponent,
  ],
  templateUrl: './import-wizard.component.html',
  styleUrl: './import-wizard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportWizardComponent {
  private readonly importService = inject(ImportService);
  private readonly deckService = inject(DeckService);
  private readonly router = inject(Router);

  protected readonly id = input(0, {
    transform: (value: string | number | null | undefined) => Number(value) || 0,
  });

  protected readonly hasDeckContext = computed(() => this.id() > 0);

  protected readonly decks = resource<Deck[], unknown>({
    loader: () => this.deckService.getAllDecks(),
  });

  protected readonly step = signal(1);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly importResult = signal<ImportResult | null>(null);
  protected readonly error = signal('');

  protected readonly selectedDeckId = linkedSignal(() => this.id());

  protected readonly targetDeckName = computed(
    () => (this.decks.value() ?? []).find((d) => d.id === this.selectedDeckId())?.name ?? '',
  );

  protected readonly canAdvance = computed(() => {
    const current = this.step();
    if (current === 1) {
      return !!this.selectedFile() && this.selectedDeckId() > 0;
    }
    if (current === 2) {
      return !!this.importResult();
    }
    return true;
  });

  protected readonly continueLabel = computed(() => {
    if (this.step() !== 2) {
      return 'Continue';
    }
    const count = this.importResult()?.imported.length ?? 0;
    return `Import ${count} cards`;
  });

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
    if (newStep < this.step()) {
      this.step.set(newStep);
    }
  }

  cancel(): void {
    this.navigateBack();
  }

  done(): void {
    this.navigateBack();
  }

  private async parseFile(): Promise<void> {
    const file = this.selectedFile();

    if (!file) {
      return;
    }

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

    await this.importService.bulkImport(result.imported);
    this.step.set(3);
  }

  private navigateBack(): void {
    if (this.hasDeckContext()) {
      void this.router.navigate(['/decks', this.id(), 'browse']);
    } else {
      void this.router.navigate(['/decks']);
    }
  }
}
