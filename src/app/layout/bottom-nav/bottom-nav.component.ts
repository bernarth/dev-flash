import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-bottom-nav',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="bottom-nav">
      <a class="nav-item" routerLink="/decks" routerLinkActive="active">
        <df-icon name="stack" [size]="22" />
        <span>Decks</span>
      </a>
      <a class="nav-item" routerLink="/browse" routerLinkActive="active">
        <df-icon name="search" [size]="22" />
        <span>Browse</span>
      </a>
      <a class="nav-item" routerLink="/import" routerLinkActive="active">
        <df-icon name="upload" [size]="22" />
        <span>Import</span>
      </a>
      <a class="nav-item" routerLink="/settings" routerLinkActive="active">
        <df-icon name="settings" [size]="22" />
        <span>Settings</span>
      </a>
    </nav>
  `,
  styles: [
    `
      .bottom-nav {
        display: flex;
        align-items: center;
        background: var(--df-surface);
        border-top: 1px solid var(--df-outline-soft);
        padding: 0.5rem 0 env(safe-area-inset-bottom, 0.5rem);
      }
      .nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0;
        color: var(--df-text-faint);
        text-decoration: none;
        font-size: 0.625rem;
        font-weight: 500;
        letter-spacing: 0.03em;
        transition: color 150ms;
      }
      .nav-item.active {
        color: var(--df-primary);
      }
    `,
  ],
})
export class BottomNavComponent {}
