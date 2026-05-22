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
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
        color: var(--mat-sys-outline);
        margin-bottom: 0.5rem;
      }
      .empty-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface-variant);
      }
      .empty-subtitle {
        font-size: 0.8125rem;
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
