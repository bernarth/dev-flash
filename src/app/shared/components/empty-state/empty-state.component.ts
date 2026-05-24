import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'df-empty-state',
  imports: [MatIcon],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <div class="empty-title">{{ title() }}</div>
      @if (subtitle()) {
        <div class="empty-subtitle">{{ subtitle() }}</div>
      }
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1.5rem;
        text-align: center;
        gap: 0.5rem;
      }
      .empty-icon {
        font-size: var(--df-icon-size-lg);
        width: var(--df-icon-size-lg);
        height: var(--df-icon-size-lg);
        color: var(--mat-sys-outline);
        margin-bottom: 0.5rem;
      }
      .empty-title {
        font-size: var(--df-font-size-md);
        font-weight: var(--df-font-weight-semibold);
        color: var(--mat-sys-on-surface-variant);
      }
      .empty-subtitle {
        font-size: var(--df-font-size-sm);
        color: var(--mat-sys-outline);
      }
    `,
  ],
})
export class EmptyStateComponent {
  title = input('Nothing here yet');
  subtitle = input('');
  icon = input<string>('style');
}
