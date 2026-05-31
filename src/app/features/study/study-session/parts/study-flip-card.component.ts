import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Card } from '@models';

@Component({
  selector: 'df-study-flip-card',
  imports: [MatIconModule],
  templateUrl: './study-flip-card.component.html',
  styleUrl: './study-flip-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyFlipCardComponent {
  readonly card = input.required<Card>();
  readonly flipped = input.required<boolean>();
  readonly revealAnswer = output<void>();

  protected readonly peekExpanded = linkedSignal({
    source: this.card,
    computation: () => false,
  });
  protected readonly showNotes = linkedSignal({
    source: this.card,
    computation: () => false,
  });

  protected onFrontClick(): void {
    if (!this.flipped()) {
      this.revealAnswer.emit();
    }
  }

  protected togglePeek(): void {
    this.peekExpanded.update((v) => !v);
  }

  protected toggleNotes(): void {
    this.showNotes.update((v) => !v);
  }
}
