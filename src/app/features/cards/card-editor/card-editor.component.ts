import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormField, submit, required } from '@angular/forms/signals';
import { DbService } from '@services/db.service';
import { SrsService } from '@services/srs.service';
import { Card } from '@models';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-card-editor',
  standalone: true,
  imports: [IconComponent, FormField],
  template: `
    <form class="df-screen" (submit)="$event.preventDefault(); save()">
      <header class="df-top-bar">
        <button type="button" class="icon-btn" (click)="cancel()" aria-label="Close">
          <df-icon name="close" [size]="20" />
        </button>
        <div class="title">{{ isNew() ? 'New card' : 'Edit card' }}</div>
        <button type="submit" class="df-save-btn" [disabled]="cardForm().invalid()">Save</button>
      </header>

      <div class="content df-scroll">
        <!-- Question -->
        <label class="field">
          <span class="df-label">Question</span>
          <textarea
            class="df-textarea"
            [formField]="cardForm.question"
            rows="3"
            placeholder="What does… / Explain… / Difference between…"
          ></textarea>
        </label>

        <!-- Answer -->
        <label class="field">
          <span class="df-label">Answer</span>
          <textarea
            class="df-textarea df-mono"
            [formField]="cardForm.answer"
            rows="6"
            placeholder="The answer…"
          ></textarea>
        </label>

        <!-- Notes (collapsible) -->
        <div class="field">
          <button type="button" class="notes-toggle" (click)="notesOpen.set(!notesOpen())"
            [attr.aria-expanded]="notesOpen()">
            <df-icon name="chev-down" [size]="16" class="notes-icon"
              [style.transform]="notesOpen() ? 'rotate(0)' : 'rotate(-90deg)'" />
            <span class="df-label notes-label">Notes <span class="optional">(optional)</span></span>
            @if (!notesOpen()) {
              <span class="notes-empty" aria-hidden="true">— empty</span>
            }
          </button>
          @if (notesOpen()) {
            <textarea
              class="df-textarea notes-textarea"
              [formField]="cardForm.notes"
              rows="4"
              placeholder="Add context, links, gotchas…"
              aria-label="Notes"
            ></textarea>
          }
        </div>

        <!-- Tags -->
        <fieldset class="field">
          <legend class="df-label">Tags</legend>
          <div class="tags-input">
            @for (tag of tags(); track tag) {
              <span class="tag-chip on df-mono">
                #{{ tag }}
                <button type="button" class="tag-remove"
                  (click)="removeTag(tag)"
                  [attr.aria-label]="'Remove tag ' + tag">
                  <df-icon name="close" [size]="12" [strokeWidth]="2" />
                </button>
              </span>
            }
            <input
              class="tag-field df-mono"
              [value]="tagInput()"
              (input)="tagInput.set($any($event.target).value)"
              (keydown.enter)="addTag(); $event.preventDefault()"
              (keydown.comma)="addTag(); $event.preventDefault()"
              [placeholder]="tags().length ? 'Add tag' : 'tag1, tag2…'"
              aria-label="Add tag"
            />
          </div>
        </fieldset>

        <!-- Delete -->
        @if (!isNew()) {
          <div class="danger-zone">
            <button type="button" class="delete-btn" (click)="deleteCard()">
              <df-icon name="trash" [size]="16" />
              Delete card
            </button>
          </div>
        }
      </div>
    </form>
  `,
  styles: [`
    .title { flex: 1; font-weight: 600; font-size: 1rem; letter-spacing: -0.02em; }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 1.25rem 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
    }
    label.field, fieldset.field {
      display: flex;
      flex-direction: column;
    }
    fieldset.field {
      border: 0;
      padding: 0;
      margin: 0;
    }
    fieldset.field legend {
      float: left; /* keeps legend in flow for flex layout */
      width: 100%;
      padding: 0;
      margin-bottom: 0.375rem;
    }
    fieldset.field legend + * { clear: left; }
    .optional { font-weight: 400; color: var(--df-text-faint); }
    .notes-icon { transition: transform var(--df-transition-medium); }
    .notes-label { margin-bottom: 0; }
    .notes-textarea { margin-top: 0.5rem; }
    .notes-toggle {
      display: flex; align-items: center; gap: 0.5rem;
      background: transparent; border: 0; padding: 0.25rem 0;
      color: var(--df-text-muted); cursor: pointer; font-family: inherit;
    }
    .notes-empty {
      font-size: 0.6875rem; color: var(--df-text-faint);
      font-weight: 400; letter-spacing: 0; text-transform: none;
      margin-left: auto;
    }
    .tags-input {
      display: flex; flex-wrap: wrap; gap: 0.375rem; padding: 0.625rem;
      background: var(--df-surface-1); border: 1px solid var(--df-outline-soft);
      border-radius: 12px; min-height: 3rem; align-items: center;
    }
    .tag-chip {
      display: inline-flex; align-items: center; gap: 0.25rem;
      height: 1.75rem; padding: 0 0.625rem; border-radius: var(--df-radius-pill);
      font-size: 0.6875rem; font-weight: 500;
      background: var(--df-primary-container); color: var(--df-on-primary-container);
      border: none;
    }
    .tag-remove {
      display: inline-flex; align-items: center;
      background: transparent; border: 0;
      color: var(--df-on-primary-container); cursor: pointer;
      padding: 0; margin-left: 0.125rem;
    }
    .tag-field {
      flex: 1; min-width: 5rem; background: transparent;
      border: 0; outline: none;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.75rem; color: var(--df-text); padding: 0.25rem 0.125rem;
    }
    .danger-zone {
      padding-top: 1.25rem;
      border-top: 1px solid var(--df-outline-soft);
    }
    .delete-btn {
      display: flex; align-items: center; gap: 0.5rem;
      width: 100%; height: 2.75rem; border-radius: 12px;
      border: 1px solid var(--df-outline); background: transparent;
      color: var(--df-again); font-family: inherit; font-size: 0.8125rem;
      cursor: pointer; justify-content: center;
    }
  `],
})
export class CardEditorComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private db     = inject(DbService);
  private srs    = inject(SrsService);

  deckId = signal(0);
  cardId = signal<number | null>(null);
  isNew  = signal(true);

  cardModel = signal({ question: '', answer: '', notes: '' });
  cardForm  = form(this.cardModel, (s) => {
    required(s.question);
    required(s.answer);
  });

  tags      = signal<string[]>([]);
  tagInput  = signal('');
  notesOpen = signal(false);

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
          answer:   card.answer,
          notes:    card.notes ?? '',
        });
        this.tags.set([...card.tags]);
        if (card.notes) this.notesOpen.set(true);
      }
    }
  }

  addTag(): void {
    const t = this.tagInput().trim().replace(/,/g, '').toLowerCase();
    if (t && !this.tags().includes(t)) {
      this.tags.update(tags => [...tags, t]);
    }
    this.tagInput.set('');
  }

  removeTag(tag: string): void {
    this.tags.update(tags => tags.filter(t => t !== tag));
  }

  async save(): Promise<void> {
    const success = await submit(this.cardForm, async () => {
      const { question, answer, notes } = this.cardModel();
      const defaults = this.srs.newCardDefaults();
      const cardData: Omit<Card, 'id'> = {
        deckId:         this.deckId(),
        question:       question.trim(),
        answer:         answer.trim(),
        notes:          notes.trim() || undefined,
        tags:           this.tags(),
        interval:       defaults.interval!,
        easeFactor:     defaults.easeFactor!,
        repetitions:    defaults.repetitions!,
        nextReviewDate: defaults.nextReviewDate!,
      };

      if (this.isNew()) {
        await this.db.createCard(cardData);
      } else {
        await this.db.updateCard(this.cardId()!, {
          question: cardData.question,
          answer:   cardData.answer,
          notes:    cardData.notes,
          tags:     cardData.tags,
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
