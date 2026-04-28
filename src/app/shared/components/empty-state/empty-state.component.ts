import { Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <df-icon name="stack" [size]="40" />
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
      padding: 48px 24px;
      text-align: center;
      gap: 8px;
    }
    .empty-icon {
      color: var(--df-text-faint);
      margin-bottom: 8px;
    }
    .empty-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--df-text-muted);
    }
    .empty-subtitle {
      font-size: 13px;
      color: var(--df-text-faint);
    }
  `],
})
export class EmptyStateComponent {
  title    = input('Nothing here yet');
  subtitle = input('');
}
