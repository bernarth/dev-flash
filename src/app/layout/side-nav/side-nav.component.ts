import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'df-side-nav',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="side-nav">
      <div class="logo df-mono">DF</div>

      <a class="nav-item" routerLink="/decks" routerLinkActive="active" title="Decks">
        <mat-icon>style</mat-icon>
      </a>
      <a class="nav-item" routerLink="/study" routerLinkActive="active" title="Study">
        <mat-icon>play_arrow</mat-icon>
      </a>
      <a class="nav-item" routerLink="/import" routerLinkActive="active" title="Import">
        <mat-icon>upload_file</mat-icon>
      </a>
      <a class="nav-item" routerLink="/settings" routerLinkActive="active" title="Settings">
        <mat-icon>settings</mat-icon>
      </a>
    </nav>
  `,
  styles: [
    `
      .side-nav {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 4.5rem;
        height: 100%;
        background: var(--mat-sys-surface);
        border-right: 1px solid var(--mat-sys-outline-variant);
        padding: 0.875rem 0 1rem;
      }
      .logo {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 10px;
        background: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9375rem;
        font-weight: 700;
        letter-spacing: -0.04em;
        margin-bottom: 1.125rem;
      }
      .nav-item {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 12px;
        margin-bottom: 0.375rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--mat-sys-on-surface-variant);
        text-decoration: none;
        transition:
          background 150ms,
          color 150ms;
      }
      .nav-item:hover {
        background: var(--mat-sys-surface-container-low);
        color: var(--mat-sys-on-surface);
      }
      .nav-item.active {
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }
    `,
  ],
})
export class SideNavComponent {}
