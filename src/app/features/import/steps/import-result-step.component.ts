import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ImportResult } from '@services/import.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'df-import-result-step',
  imports: [MatIconModule, MatCardModule, MatListModule],
  templateUrl: './import-result-step.component.html',
  styleUrl: './import-result-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportResultStepComponent {
  readonly result = input.required<ImportResult>();
  readonly deckName = input.required<string>();
}
