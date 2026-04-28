import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DbService } from '@services/db.service';
import { SrsService } from '@services/srs.service';
import { Card } from '@models';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-card-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="screen">
      <header class="top-bar">
        <button class="icon-btn" (click)="cancel()">
          <df-icon name="close" [size]="20" />
        </button>
        <div class="title">{{ isNew() ? 'New card' : 'Edit card' }}</div>
        <button class="save-btn" [disabled]="!canSave()" (click)="save()">Save</button>
      </header>

      <div class="content df-scroll">
        <!-- Question -->
        <div class="field">
          <div class="df-label">Question</div>
          <textarea
            class="df-textarea"
            [ngModel]="question()"
            (ngModelChange)="question.set($event)"
            rows="3"
            placeholder="What does… / Explain… / Difference between…"
          ></textarea>
        </div>

        <!-- Answer -->
        <div class="field">
          <div class="df-label">Answer</div>
          <textarea
            class="df-textarea mono"
            [ngModel]="answer()"
            (ngModelChange)="answer.set($event)"
            rows="6"
            placeholder="The answer…"
          ></textarea>
        </div>

        <!-- Notes (collapsible) -->
        <div class="field">
          <button class="notes-toggle" (click)="notesOpen.set(!notesOpen())">
            <df-icon name="chev-down" [size]="16"
              [style.transform]="notesOpen() ? 'rotate(0)' : 'rotate(-90deg)'"
              style="transition: transform 180ms" />
            <span class="df-label" style="margin:0">Notes (optional)</span>
            @if (!notesOpen()) {
              <span class="notes-empty">— empty</span>
            }
          </button>
          @if (notesOpen()) {
            <textarea
              class="df-textarea"
              [ngModel]="notes()"
              (ngModelChange)="notes.set($event)"
              rows="4"
              placeholder="Add context, links, gotchas…"
              style="margin-top:8px"
            ></textarea>
          }
        </div>

        <!-- Tags -->
        <div class="field">
          <div class="df-label">Tags</div>
          <div class="tags-input">
            @for (tag of tags(); track tag) {
              <span class="tag-chip on df-mono">
                #{{ tag }}
                <button class="tag-remove" (click)="removeTag(tag)">
                  <df-icon name="close" [size]="12" [strokeWidth]="2" />
                </button>
              </span>
            }
            <input
              class="tag-field df-mono"
              [ngModel]="tagInput()"
              (ngModelChange)="tagInput.set($event)"
              (keydown.enter)="addTag()"
              (keydown.comma)="addTag()"
              [placeholder]="tags().length ? 'add tag' : 'tag1, tag2…'"
            />
          </div>
        </div>

        <!-- Delete -->
        @if (!isNew()) {
          <div class="danger-zone">
            <button class="delete-btn" (click)="deleteCard()">
              <df-icon name="trash" [size]="16" />
              Delete card
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .screen {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .top-bar {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--df-outline-soft);
      gap: 12px;
      flex-shrink: 0;
    }
    .title {
      flex: 1;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: -0.02em;
    }
    .save-btn {
      height: 32px; padding: 0 14px; border-radius: 10px;
      border: 0; background: var(--df-primary); color: var(--df-primary-ink);
      font-family: inherit; font-weight: 500; font-size: 13px; cursor: pointer;
    }
    .save-btn:disabled { opacity: 0.45; cursor: default; }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 20px 40px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .field { display: flex; flex-direction: column; }
    .df-textarea {
      width: 100%; background: var(--df-surface-1); color: var(--df-text);
      border: 1px solid var(--df-outline-soft); border-radius: 12px;
      padding: 12px 14px; font-family: inherit; font-size: 14px;
      outline: none; transition: border-color 120ms; resize: none;
    }
    .df-textarea.mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; line-height: 1.55; }
    .df-textarea:focus { border-color: var(--df-primary); }
    .notes-toggle {
      display: flex; align-items: center; gap: 8px;
      background: transparent; border: 0; padding: 4px 0;
      color: var(--df-text-muted); cursor: pointer; font-family: inherit;
    }
    .notes-empty {
      font-size: 11px; color: var(--df-text-faint);
      font-weight: 400; letter-spacing: 0; text-transform: none;
      margin-left: auto;
    }
    .tags-input {
      display: flex; flex-wrap: wrap; gap: 6px; padding: 10px;
      background: var(--df-surface-1); border: 1px solid var(--df-outline-soft);
      border-radius: 12px; min-height: 48px; align-items: center;
    }
    .tag-chip {
      display: inline-flex; align-items: center; gap: 4px;
      height: 28px; padding: 0 10px; border-radius: 999px;
      font-size: 11px; font-weight: 500;
      background: var(--df-primary-container); color: var(--df-on-primary-container);
      border: none;
    }
    .tag-remove {
      display: inline-flex; align-items: center;
      background: transparent; border: 0;
      color: var(--df-on-primary-container); cursor: pointer;
      padding: 0; margin-left: 2px;
    }
    .tag-field {
      flex: 1; min-width: 80px; background: transparent;
      border: 0; outline: none;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 12px; color: var(--df-text); padding: 4px 2px;
    }
    .danger-zone {
      padding-top: 20px;
      border-top: 1px solid var(--df-outline-soft);
    }
    .delete-btn {
      display: flex; align-items: center; gap: 8px;
      width: 100%; height: 44px; border-radius: 12px;
      border: 1px solid var(--df-outline); background: transparent;
      color: var(--df-again); font-family: inherit; font-size: 13px;
      cursor: pointer; justify-content: center;
    }
  `],
})
export class CardEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DbService);
  private srs = inject(SrsService);

  deckId = signal(0);
  cardId = signal<number | null>(null);
  isNew = signal(true);

  question = signal('');
  answer = signal('');
  notes = signal('');
  tags = signal<string[]>([]);
  tagInput = signal('');
  notesOpen = signal(false);

  canSave = () => this.question().trim() && this.answer().trim();

  ngOnInit(): void {
    const deckId = Number(this.route.snapshot.paramMap.get('id'));
    const cardIdParam = this.route.snapshot.paramMap.get('cardId');
    this.deckId.set(deckId);

    if (cardIdParam && cardIdParam !== 'new') {
      const cardId = Number(cardIdParam);
      this.cardId.set(cardId);
      this.isNew.set(false);
      this.db.getCard(cardId).subscribe(card => {
        if (card) {
          this.question.set(card.question);
          this.answer.set(card.answer);
          this.notes.set(card.notes ?? '');
          this.tags.set([...card.tags]);
          if (card.notes) this.notesOpen.set(true);
        }
      });
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

  save(): void {
    const defaults = this.srs.newCardDefaults();
    const cardData: Omit<Card, 'id'> = {
      deckId: this.deckId(),
      question: this.question().trim(),
      answer: this.answer().trim(),
      notes: this.notes().trim() || undefined,
      tags: this.tags(),
      interval: defaults.interval!,
      easeFactor: defaults.easeFactor!,
      repetitions: defaults.repetitions!,
      nextReviewDate: defaults.nextReviewDate!,
    };

    if (this.isNew()) {
      this.db.createCard(cardData).subscribe(() => this.goBack());
    } else {
      this.db.updateCard(this.cardId()!, {
        question: cardData.question,
        answer: cardData.answer,
        notes: cardData.notes,
        tags: cardData.tags,
      }).subscribe(() => this.goBack());
    }
  }

  deleteCard(): void {
    if (this.cardId()) {
      this.db.deleteCard(this.cardId()!).subscribe(() => this.goBack());
    }
  }

  cancel(): void {
    this.goBack();
  }

  private goBack(): void {
    this.router.navigate(['/decks', this.deckId(), 'browse']);
  }
}
