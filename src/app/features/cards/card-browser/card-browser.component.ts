import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Card, Deck } from '@models';
import { CardService } from '@core/services/card.service';
import { DeckService } from '@core/services/deck.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { AddCardsSheetComponent } from './add-cards-sheet.component';

type AddSheetAction = 'add' | 'import' | undefined;

@Component({
  selector: 'df-card-browser',
  imports: [
    RouterLink,
    EmptyStateComponent,
    SpinnerComponent,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatListModule,
    MatButtonModule,
    MatBottomSheetModule,
  ],
  templateUrl: './card-browser.component.html',
  styleUrl: './card-browser.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardBrowserComponent {
  private readonly router = inject(Router);
  private readonly deckService = inject(DeckService);
  private readonly cardService = inject(CardService);
  private readonly bottomSheet = inject(MatBottomSheet);

  protected readonly id = input.required({ transform: numberAttribute });

  protected readonly deck = resource<Deck | undefined, number>({
    params: () => this.id(),
    loader: ({ params }) => this.deckService.getDeck(params),
  });

  protected readonly cards = resource<Card[], number>({
    params: () => this.id(),
    loader: ({ params }) => this.cardService.getCardsByDeck(params),
  });

  protected readonly query = signal('');
  protected readonly activeTag = signal('All');

  protected readonly allTags = computed(() => {
    const tags = new Set<string>();
    (this.cards.value() ?? []).forEach((c) => c.tags.forEach((t) => tags.add(t)));

    return ['All', ...Array.from(tags).sort()];
  });

  protected readonly filtered = computed(() => {
    const query = this.query().toLowerCase();
    const tag = this.activeTag();

    return (this.cards.value() ?? []).filter(
      (card) =>
        (tag === 'All' || card.tags.includes(tag)) &&
        (!query ||
          card.question.toLowerCase().includes(query) ||
          card.answer.toLowerCase().includes(query)),
    );
  });

  onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  editCard(card: Card): void {
    void this.router.navigate(['/decks', this.id(), 'cards', card.id]);
  }

  openAddSheet(): void {
    this.bottomSheet
      .open(AddCardsSheetComponent)
      .afterDismissed()
      .subscribe((action: AddSheetAction) => {
        if (action === 'add') {
          void this.router.navigate(['/decks', this.id(), 'cards', 'new']);
        } else if (action === 'import') {
          void this.router.navigate(['/decks', this.id(), 'import']);
        }
      });
  }
}
