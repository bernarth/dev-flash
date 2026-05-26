import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'df-add-cards-sheet',
  imports: [MatIconModule, MatListModule],
  template: `
    <mat-nav-list>
      <mat-list-item (click)="select('add')">
        <mat-icon matListItemIcon>edit_note</mat-icon>
        <span matListItemTitle>Add card manually</span>
      </mat-list-item>
      <mat-list-item (click)="select('import')">
        <mat-icon matListItemIcon>upload_file</mat-icon>
        <span matListItemTitle>Import CSV</span>
      </mat-list-item>
    </mat-nav-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCardsSheetComponent {
  private sheetRef = inject(MatBottomSheetRef<AddCardsSheetComponent>);

  select(action: 'add' | 'import'): void {
    this.sheetRef.dismiss(action);
  }
}
