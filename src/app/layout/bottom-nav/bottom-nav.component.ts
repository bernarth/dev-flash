import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'df-bottom-nav',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="bottom-nav">
      <a class="nav-item" routerLink="/decks" routerLinkActive="active">
        <mat-icon>style</mat-icon>
        <span>Decks</span>
      </a>
      <a class="nav-item" routerLink="/study" routerLinkActive="active">
        <mat-icon>play_arrow</mat-icon>
        <span>Study</span>
      </a>
      <a class="nav-item" routerLink="/import" routerLinkActive="active">
        <mat-icon>upload_file</mat-icon>
        <span>Import</span>
      </a>
      <a class="nav-item" routerLink="/settings" routerLinkActive="active">
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </a>
    </nav>
  `,
  styles: [
    `
      .bottom-nav {
        display: flex;
        align-items: center;
        background: var(--mat-sys-surface);
        border-top: 1px solid var(--mat-sys-outline-variant);
        padding: 0.5rem 0 env(safe-area-inset-bottom, 0.5rem);
      }
      .nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0;
        color: var(--mat-sys-on-surface-variant);
        text-decoration: none;
        font-size: 0.625rem;
        font-weight: 500;
        letter-spacing: 0.03em;
        transition: color 150ms;
      }
      .nav-item mat-icon {
        font-size: 1.375rem;
        width: 1.375rem;
        height: 1.375rem;
      }
      .nav-item.active {
        color: var(--mat-sys-primary);
      }
    `,
  ],
})
export class BottomNavComponent {}
