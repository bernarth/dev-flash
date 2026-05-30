import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormField, submit, required } from '@angular/forms/signals';
import { DbService } from '@services/db.service';
import { Card } from '@models';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
  template: `
    <form class="screen" (submit)="$event.preventDefault(); save()">
      <mat-toolbar>
        <button mat-icon-button type="button" (click)="cancel()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
        <span>{{ isNew() ? 'New card' : 'Edit card' }}</span>
        <span class="spacer"></span>
        <button mat-flat-button type="submit" [disabled]="cardForm().invalid()">
          <mat-icon>save</mat-icon>
          Save
        </button>
      </mat-toolbar>

      <div class="content">
        <mat-form-field appearance="outline">
          <mat-label>Question</mat-label>
          <textarea
            matInput
            [formField]="cardForm.question"
            rows="3"
            placeholder="What does… / Explain… / Difference between…"
          ></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Answer</mat-label>
          <textarea
            matInput
            class="df-mono"
            [formField]="cardForm.answer"
            rows="6"
            placeholder="The answer…"
          ></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes</mat-label>
          <textarea
            matInput
            [formField]="cardForm.notes"
            rows="4"
            placeholder="Add context, links, gotchas…"
          ></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tags</mat-label>
          <mat-chip-grid #chipGrid aria-label="Tags">
            @for (tag of tags(); track tag) {
              <mat-chip-row (removed)="removeTag(tag)">
                #{{ tag }}
                <button matChipRemove aria-label="Remove tag">
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip-row>
            }
          </mat-chip-grid>
          <input
            placeholder="Add tag…"
            [matChipInputFor]="chipGrid"
            [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
            (matChipInputTokenEnd)="addTagFromInput($event)"
          />
        </mat-form-field>

        @if (!isNew()) {
          <div class="danger-zone">
            <button mat-stroked-button color="warn" type="button" (click)="deleteCard()">
              <mat-icon>delete</mat-icon>
              Delete card
            </button>
          </div>
        }
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
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      mat-form-field,
      mat-expansion-panel {
        width: 100%;
      }
      .full-width {
        width: 100%;
      }
      .danger-zone {
        display: flex;
      }
      .danger-zone button {
        width: 100%;
      }
    `,
  ],
})
export class CardEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DbService);

  readonly separatorKeyCodes = [ENTER, COMMA] as const;

  deckId = signal(0);
  cardId = signal<number | null>(null);
  isNew = signal(true);

  cardModel = signal({ question: '', answer: '', notes: '' });
  cardForm = form(this.cardModel, (s) => {
    required(s.question);
    required(s.answer);
  });

  tags = signal<string[]>([]);

  async ngOnInit(): Promise<void> {
    const deckId = Number(this.route.snapshot.paramMap.get('id'));
    const cardIdParam = this.route.snapshot.paramMap.get('cardId');
    this.deckId.set(deckId);

    if (cardIdParam && cardIdParam !== 'new') {
      const cardId = Number(cardIdParam);
      this.cardId.set(cardId);
      this.isNew.set(false);
      const card = await this.db.getCard(cardId);

      if (card) {
        this.cardModel.set({
          question: card.question,
          answer: card.answer,
          notes: card.notes ?? '',
        });
        this.tags.set([...card.tags]);
      }
    }
  }

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
      const cardData: Omit<Card, 'id'> = {
        deckId: this.deckId(),
        question: question.trim(),
        answer: answer.trim(),
        notes: notes.trim() || undefined,
        tags: this.tags(),
        nextSession: 0,
      };

      if (this.isNew()) {
        await this.db.createCard(cardData);
      } else {
        await this.db.updateCard(this.cardId()!, {
          question: cardData.question,
          answer: cardData.answer,
          notes: cardData.notes,
          tags: cardData.tags,
        });
      }
    });

    if (success) {
      this.goBack();
    }
  }

  async deleteCard(): Promise<void> {
    if (this.cardId()) {
      await this.db.deleteCard(this.cardId()!);
      this.goBack();
    }
  }

  cancel(): void {
    this.goBack();
  }

  private goBack(): void {
    this.router.navigate(['/decks', this.deckId(), 'browse']);
  }
}
