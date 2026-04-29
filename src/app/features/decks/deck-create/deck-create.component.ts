import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, submit, required } from '@angular/forms/signals';
import { DbService } from '@services/db.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-deck-create',
  imports: [IconComponent, FormField],
  template: `
    <form class="df-screen" (submit)="$event.preventDefault(); save()">
      <header class="df-top-bar">
        <button type="button" class="icon-btn" (click)="cancel()" aria-label="Cancel">
          <df-icon name="close" />
        </button>
        <div class="title">New deck</div>
        <button type="submit" class="df-save-btn" [disabled]="deckForm().invalid()">Save</button>
      </header>

      <div class="content">
        <label class="field">
          <span class="df-label">Name</span>
          <input
            class="df-input"
            [formField]="deckForm.name"
            placeholder="e.g. C# Fundamentals"
            autofocus
          />
        </label>

        <label class="field">
          <span class="df-label">Description <span class="optional">(optional)</span></span>
          <textarea
            class="df-textarea"
            [formField]="deckForm.description"
            rows="3"
            placeholder="What's this deck for?"
          ></textarea>
        </label>
      </div>
    </form>
  `,
  styles: [
    `
      .title {
        flex: 1;
        font-weight: 600;
        font-size: 1rem;
        letter-spacing: -0.02em;
      }
      .content {
        flex: 1;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      label.field {
        display: flex;
        flex-direction: column;
      }
      .optional {
        font-weight: 400;
        color: var(--df-text-faint);
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
