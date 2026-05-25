import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'df-spinner',
  imports: [MatProgressSpinnerModule],
  template: ` <mat-spinner [diameter]="diameter()" /> `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        min-height: 0;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  diameter = input(40);
}
