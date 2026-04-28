import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DbService } from '@services/db.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-deck-create',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="screen">
      <header class="top-bar">
        <button class="icon-btn" (click)="cancel()">
          <df-icon name="close" />
        </button>
        <div class="title">New deck</div>
        <button class="save-btn" [disabled]="!name().trim()" (click)="save()">Save</button>
      </header>

      <div class="content">
        <div class="field">
          <div class="df-label">Name</div>
          <input class="df-input"
            [ngModel]="name()" (ngModelChange)="name.set($event)"
            placeholder="e.g. C# Fundamentals" autofocus />
        </div>

        <div class="field">
          <div class="df-label">Description (optional)</div>
          <textarea class="df-textarea"
            [ngModel]="description()" (ngModelChange)="description.set($event)"
            rows="3" placeholder="What's this deck for?"></textarea>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .screen { display: flex; flex-direction: column; height: 100%; }
    .top-bar {
      display: flex; align-items: center; padding: 12px 20px;
      border-bottom: 1px solid var(--df-outline-soft); gap: 12px; flex-shrink: 0;
    }
    .title { flex: 1; font-weight: 600; font-size: 16px; letter-spacing: -0.02em; }
    .save-btn {
      height: 32px; padding: 0 14px; border-radius: 10px; border: 0;
      background: var(--df-primary); color: var(--df-primary-ink);
      font-family: inherit; font-weight: 500; font-size: 13px; cursor: pointer;
    }
    .save-btn:disabled { opacity: 0.45; cursor: default; }
    .content { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
    .df-input, .df-textarea {
      width: 100%; background: var(--df-surface-1); color: var(--df-text);
      border: 1px solid var(--df-outline-soft); border-radius: 12px;
      padding: 12px 14px; font-family: inherit; font-size: 14px;
      outline: none; transition: border-color 120ms; resize: none;
    }
    .df-input:focus, .df-textarea:focus { border-color: var(--df-primary); }
  `],
})
export class DeckCreateComponent {
  private db     = inject(DbService);
  private router = inject(Router);

  name        = signal('');
  description = signal('');

  save(): void {
    const now = new Date();
    this.db.createDeck({
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      tags: [],
      createdAt: now,
      updatedAt: now,
    }).subscribe(() => this.router.navigate(['/decks']));
  }

  cancel(): void {
    this.router.navigate(['/decks']);
  }
}
