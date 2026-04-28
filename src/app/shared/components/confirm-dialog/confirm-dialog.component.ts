import { Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/components/icon/icon-names';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'default';

@Component({
  selector: 'df-confirm-dialog',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (open()) {
      <div class="scrim" (click)="cancelled.emit()"></div>

      <div class="sheet" role="dialog" [attr.aria-label]="title()">
        <div class="handle"></div>

        <div class="body">
          @if (icon()) {
            <div class="icon-wrap" [class]="'icon-wrap--' + variant()">
              <df-icon [name]="icon()!" [size]="24" />
            </div>
          }
          <div class="title">{{ title() }}</div>
          @if (description()) {
            <div class="description">{{ description() }}</div>
          }
        </div>

        <div class="actions">
          <button class="confirm-btn" [class]="'confirm-btn--' + variant()" (click)="confirmed.emit()">
            {{ confirmLabel() }}
          </button>
          <button class="cancel-btn" (click)="cancelled.emit()">
            {{ cancelLabel() }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .scrim {
      position: fixed; inset: 0;
      background: var(--df-scrim); z-index: 200;
      animation: fade-in 150ms ease;
    }
    .sheet {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 201;
      background: var(--df-surface);
      border-top-left-radius: 24px; border-top-right-radius: 24px;
      border-top: 1px solid var(--df-outline-soft);
      padding: 20px 20px 28px;
      animation: slide-up 220ms cubic-bezier(0.32, 0.72, 0, 1);
    }
    .handle {
      width: 40px; height: 4px; border-radius: 999px;
      background: var(--df-outline); margin: 0 auto 20px;
    }
    .body { text-align: center; margin-bottom: 20px; }
    .icon-wrap {
      width: 56px; height: 56px; border-radius: 16px;
      margin: 4px auto 14px;
      display: flex; align-items: center; justify-content: center;
    }
    .icon-wrap--danger  { background: color-mix(in srgb, var(--df-again) 18%, transparent); color: var(--df-again); }
    .icon-wrap--warning { background: color-mix(in srgb, var(--df-hard)  18%, transparent); color: var(--df-hard); }
    .icon-wrap--default { background: var(--df-primary-container); color: var(--df-on-primary-container); }
    .title { font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
    .description {
      font-size: 13px; color: var(--df-text-muted);
      margin: 8px auto 0; max-width: 300px; line-height: 1.55;
    }
    .actions { display: flex; flex-direction: column; gap: 8px; }
    .confirm-btn {
      height: 48px; border-radius: 14px; border: 0;
      font-family: inherit; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: transform 100ms;
    }
    .confirm-btn:active { transform: scale(0.98); }
    .confirm-btn--danger  { background: var(--df-again); color: #fff; }
    .confirm-btn--warning { background: var(--df-hard);  color: #fff; }
    .confirm-btn--default { background: var(--df-primary); color: var(--df-primary-ink); }
    .cancel-btn {
      height: 48px; border-radius: 14px;
      border: 1px solid var(--df-outline); background: transparent;
      color: var(--df-text); font-family: inherit; font-size: 14px; cursor: pointer;
    }
    @keyframes fade-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
  `],
})
export class ConfirmDialogComponent {
  open         = input.required<boolean>();
  title        = input.required<string>();
  description  = input('');
  confirmLabel = input('Confirm');
  cancelLabel  = input('Cancel');
  variant      = input<ConfirmDialogVariant>('default');
  icon         = input<IconName | undefined>(undefined);

  confirmed = output<void>();
  cancelled = output<void>();
}
