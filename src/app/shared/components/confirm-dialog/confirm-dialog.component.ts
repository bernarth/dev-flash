import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'default';

export interface ConfirmDialogData {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  icon?: string;
}

@Component({
  selector: 'df-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div mat-dialog-title>
      @if (data.icon) {
        <mat-icon class="dialog-icon" [class]="'dialog-icon--' + (data.variant ?? 'default')">
          {{ data.icon }}
        </mat-icon>
      }
      {{ data.title }}
    </div>

    @if (data.description) {
      <mat-dialog-content>{{ data.description }}</mat-dialog-content>
    }

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="ref.close(false)">
        {{ data.cancelLabel ?? 'Cancel' }}
      </button>
      <button
        mat-flat-button
        [color]="data.variant === 'danger' || data.variant === 'warning' ? 'warn' : 'primary'"
        (click)="ref.close(true)"
      >
        {{ data.confirmLabel ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      [mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .dialog-icon {
        font-size: var(--df-font-size-lg);
        width: var(--df-font-size-lg);
        height: var(--df-font-size-lg);
      }
      .dialog-icon--danger { color: var(--df-again); }
      .dialog-icon--warning { color: var(--df-hard); }
      .dialog-icon--default { color: var(--mat-sys-primary); }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<ConfirmDialogComponent>);
}
