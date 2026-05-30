import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  numberAttribute,
} from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, submit, required } from '@angular/forms/signals';
import { CardService } from '@core/services/card.service';
import { Card } from '@models';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

interface CardFormModel {
  question: string;
  answer: string;
  notes: string;
}

const EMPTY_CARD_FORM: CardFormModel = { question: '', answer: '', notes: '' };

@Component({
  selector: 'df-card-editor',
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    FormField,
  ],
  templateUrl: './card-editor.component.html',
  styleUrl: './card-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEditorComponent {
  private readonly router = inject(Router);
  private readonly cardService = inject(CardService);

  protected readonly separatorKeyCodes = [ENTER, COMMA] as const;

  protected readonly id = input.required({ transform: numberAttribute });
  protected readonly card = input<Card | null>(null);

  protected readonly isNew = computed(() => this.card() === null);

  protected readonly cardModel = linkedSignal<CardFormModel>(() => {
    const card = this.card();
    return card
      ? { question: card.question, answer: card.answer, notes: card.notes ?? '' }
      : { ...EMPTY_CARD_FORM };
  });

  protected readonly cardForm = form(this.cardModel, (s) => {
    required(s.question);
    required(s.answer);
  });

  protected readonly tags = linkedSignal<string[]>(() => [...(this.card()?.tags ?? [])]);

  addTagFromInput(event: MatChipInputEvent): void {
    const value = event.value.trim().replace(/,/g, '').toLowerCase();

    if (value && !this.tags().includes(value)) {
      this.tags.update((tags) => [...tags, value]);
    }

    event.chipInput.clear();
  }

  removeTag(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }

  async save(): Promise<void> {
    const success = await submit(this.cardForm, async () => {
      const { question, answer, notes } = this.cardModel();
      const trimmedNotes = notes.trim();
      const cardData: Omit<Card, 'id'> = {
        deckId: this.id(),
        question: question.trim(),
        answer: answer.trim(),
        notes: trimmedNotes || undefined,
        tags: this.tags(),
        nextSession: 0,
      };

      const existing = this.card();

      if (existing) {
        await this.cardService.updateCard(existing.id!, {
          question: cardData.question,
          answer: cardData.answer,
          notes: cardData.notes,
          tags: cardData.tags,
        });
      } else {
        await this.cardService.createCard(cardData);
      }
    });

    if (success) {
      this.goBack();
    }
  }

  async deleteCard(): Promise<void> {
    const existing = this.card();

    if (existing?.id) {
      await this.cardService.deleteCard(existing.id);
      this.goBack();
    }
  }

  cancel(): void {
    this.goBack();
  }

  private goBack(): void {
    void this.router.navigate(['/decks', this.id(), 'browse']);
  }
}
