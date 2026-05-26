import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { DeckService } from '@core/services/deck.service';

@Component({
  selector: 'df-study-list',
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: './study-list.component.html',
  styleUrl: './study-list.component.scss',
})
export class StudyListComponent {
  private readonly router = inject(Router);
  private readonly deckService = inject(DeckService);

  protected readonly decks = resource({
    loader: () => this.deckService.getDeckStudyList(),
  });

  protected readonly items = () => this.decks.value() ?? [];

  startStudy(deckId: number): void {
    this.router.navigate(['/decks', deckId, 'study']);
  }
}
