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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-toolbar>
      <span>Decks</span>
      <span class="spacer"></span>
      @if (decks.value()?.length) {
        <span class="subtitle">{{ totalDue() }} due</span>
      }
      <a mat-icon-button routerLink="/settings" aria-label="Settings">
        <mat-icon>settings</mat-icon>
      </a>
    </mat-toolbar>

    <div class="content">
      @if (decks.isLoading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (decks.value()?.length === 0) {
        <df-empty-state title="No decks yet" subtitle="Create a deck or import a CSV" />
      } @else {
        <mat-nav-list>
          @for (deck of decks.value(); track deck.id) {
            <mat-list-item (click)="openDeck(deck)">
              <mat-icon matListItemIcon>style</mat-icon>
              <span matListItemTitle>{{ deck.name }}</span>
              <span matListItemLine>
                {{ deck.cardCount }} cards · {{ deck.updatedAt | relativeDate }}
                @if (deck.dueCount > 0) {
                  · <span class="due">{{ deck.dueCount }} due</span>
                }
              </span>
            </mat-list-item>
          }
        </mat-nav-list>
      }
    </div>

    <button mat-fab extended class="fab" (click)="createDeck()">
      <mat-icon>add</mat-icon>
      New deck
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
      }

      .spacer {
        flex: 1;
      }
      .subtitle {
        font-size: var(--df-font-size-xs);
        opacity: 0.6;
        margin-right: 0.5rem;
      }
      .due {
        color: var(--mat-sys-primary);
        font-weight: var(--df-font-weight-semibold);
      }
      .content {
        flex: 1;
        overflow-y: auto;
      }
      .loading {
        display: flex;
        justify-content: center; 
        padding: 4rem 1rem; 
      }
      .fab {
        position: absolute;
        bottom: 1.5rem;
        right: 1.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckListComponent {
  private readonly router = inject(Router);
  private readonly deckService = inject(DeckService);

  protected readonly decks = resource<DeckListItem[], unknown>({
    loader: async () => await this.deckService.getDeckList(),
  });
  protected readonly totalDue = computed(
    () => this.decks.value()?.reduce((acc, deck) => acc + deck.dueCount, 0) ?? 0,
  );

  openDeck(deck: DeckListItem): void {
    if (deck.dueCount > 0) {
      void this.router.navigate(['/decks', deck.id, 'study']);
    } else {
      void this.router.navigate(['/decks', deck.id, 'browse']);
    }
  }

  createDeck(): void {
    void this.router.navigate(['/decks', 'create']);
  }
}
