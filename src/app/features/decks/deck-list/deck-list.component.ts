import { Component, inject, computed, resource, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DeckListItem } from '@models';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { DeckService } from '@core/services/deck.service';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

@Component({
  selector: 'df-deck-list',
  imports: [
    RouterLink,
    RelativeDatePipe,
    EmptyStateComponent,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    SpinnerComponent,
  ],
  templateUrl: './deck-list.component.html',
  styleUrl: './deck-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckListComponent {
  private readonly router = inject(Router);
  private readonly deckService = inject(DeckService);

  protected readonly decks = resource<DeckListItem[], unknown>({
    loader: () => this.deckService.getDeckList(),
  });
  protected readonly totalDue = computed(
    () => this.decks.value()?.reduce((acc, deck) => acc + deck.dueCount, 0) ?? 0,
  );

  openDeck(deck: DeckListItem): void {
    if (deck.dueCount > 0) {
      this.router.navigate(['/decks', deck.id, 'study']);
    } else {
      this.router.navigate(['/decks', deck.id, 'browse']);
    }
  }

  createDeck(): void {
    this.router.navigate(['/decks', 'create']);
  }
}
