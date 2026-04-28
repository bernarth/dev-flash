import { Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/components/icon/icon-names';

@Component({
  selector: 'df-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <df-icon [name]="icon()" [size]="40" />
      </div>
      <div class="empty-title">{{ title() }}</div>
      @if (subtitle()) {
        <div class="empty-subtitle">{{ subtitle() }}</div>
      }
    </div>
  `,
  styles: [`
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
      color: var(--df-text-faint);
      margin-bottom: 0.5rem;
    }
    .empty-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--df-text-muted);
    }
    .empty-subtitle {
      font-size: 0.8125rem;
      color: var(--df-text-faint);
    }
  `],
})
export class EmptyStateComponent {
  title    = input('Nothing here yet');
  subtitle = input('');
  icon     = input<IconName>('stack');
}
