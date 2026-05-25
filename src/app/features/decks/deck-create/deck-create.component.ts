import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, submit, required } from '@angular/forms/signals';
import { DbService } from '@services/db.service';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
  template: `
    <form class="screen" (submit)="$event.preventDefault(); save()">
      <mat-toolbar>
        <button mat-icon-button type="button" (click)="cancel()" aria-label="Cancel">
          <mat-icon>close</mat-icon>
        </button>
        <span>New deck</span>
        <span class="spacer"></span>
        <button mat-flat-button type="submit" [disabled]="deckForm().invalid()">
          <mat-icon>save</mat-icon>
          Save
        </button>
      </mat-toolbar>

      <div class="content">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input
            matInput
            [formField]="deckForm.name"
            placeholder="e.g. C# Fundamentals"
            autofocus
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description (optional)</mat-label>
          <textarea
            matInput
            [formField]="deckForm.description"
            rows="3"
            placeholder="What's this deck for?"
          ></textarea>
        </mat-form-field>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .screen {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .spacer {
        flex: 1;
      }
      .content {
        flex: 1;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class DeckCreateComponent {
  private db = inject(DbService);
  private router = inject(Router);

  deckModel = signal({ name: '', description: '' });
  deckForm = form(this.deckModel, (s) => {
    required(s.name);
  });

  async save(): Promise<void> {
    const success = await submit(this.deckForm, async () => {
      const { name, description } = this.deckModel();
      const now = new Date();
      await this.db.createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
        tags: [],
        sessionCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    });

    if (success) {
      this.router.navigate(['/decks']);
    }
  }

  cancel(): void {
    this.router.navigate(['/decks']);
  }
}
