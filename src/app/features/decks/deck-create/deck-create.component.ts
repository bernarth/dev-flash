import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, submit, required, maxLength, minLength } from '@angular/forms/signals';
import { DbService } from '@services/db.service';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreateDeck } from '@core/models';

@Component({
  selector: 'df-deck-create',
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormField,
  ],
  templateUrl: './deck-create.component.html',
  styleUrl: './deck-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckCreateComponent {
  private db = inject(DbService);
  private router = inject(Router);

  deckModel = signal<CreateDeck>({ name: '', description: '' });
  deckForm = form(this.deckModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    minLength(schemaPath.name, 5);
    maxLength(schemaPath.name, 100);
    maxLength(schemaPath.description, 255);
  });

  async save(): Promise<void> {
    let newId = 0;
    const success = await submit(this.deckForm, async () => {
      const { name, description } = this.deckModel();
      const now = new Date();
      newId = await this.db.createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
        tags: [],
        sessionCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    });

    if (success) {
      this.router.navigate(['/decks', newId, 'browse']);
    }
  }

  cancel(): void {
    this.router.navigate(['/decks']);
  }
}
