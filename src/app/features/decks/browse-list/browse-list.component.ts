import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { DeckService } from '@core/services/deck.service';

@Component({
  selector: 'df-browse-list',
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: './browse-list.component.html',
  styleUrl: './browse-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowseListComponent {
  private readonly router = inject(Router);
  private readonly deckService = inject(DeckService);

  protected readonly decks = resource({
    loader: () => this.deckService.getDeckList(),
  });

  browseDeck(deckId: number): void {
    this.router.navigate(['/decks', deckId, 'browse']);
  }

  createDeck(): void {
    this.router.navigate(['/decks', 'create']);
  }
}
