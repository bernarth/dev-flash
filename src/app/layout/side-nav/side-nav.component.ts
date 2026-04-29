import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '@services/theme.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-side-nav',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="side-nav">
      <div class="logo df-mono">DF</div>

      <a class="nav-item" routerLink="/decks" routerLinkActive="active" title="Decks">
        <df-icon name="stack"
      /></a>
      <a class="nav-item" routerLink="/study" routerLinkActive="active" title="Study">
        <df-icon name="play"
      /></a>
      <a class="nav-item" routerLink="/import" routerLinkActive="active" title="Import">
        <df-icon name="upload"
      /></a>
      <a class="nav-item" routerLink="/settings" routerLinkActive="active" title="Settings">
        <df-icon name="settings"
      /></a>

      <div class="spacer"></div>

      <button
        class="theme-toggle"
        (click)="toggleTheme()"
        [title]="isDark() ? 'Switch to light' : 'Switch to dark'"
      >
        <df-icon [name]="isDark() ? 'sun' : 'moon'" [size]="18" />
      </button>
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
        background: var(--df-surface);
        border-right: 1px solid var(--df-outline-soft);
        padding: 0.875rem 0 1rem;
      }
      .logo {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 10px;
        background: var(--df-primary);
        color: var(--df-primary-ink);
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
        color: var(--df-text-muted);
        text-decoration: none;
        transition:
          background var(--df-transition-base),
          color var(--df-transition-base);
      }
      .nav-item:hover {
        background: var(--df-surface-1);
        color: var(--df-text);
      }
      .nav-item.active {
        background: var(--df-primary-container);
        color: var(--df-on-primary-container);
      }
      .spacer {
        flex: 1;
      }
      .theme-toggle {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 12px;
        border: 0;
        background: transparent;
        color: var(--df-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
          background var(--df-transition-base),
          color var(--df-transition-base);
      }
      .theme-toggle:hover {
        background: var(--df-surface-1);
        color: var(--df-text);
      }
    `,
  ],
})
export class SideNavComponent {
  private themeService = inject(ThemeService);
  readonly isDark = this.themeService.resolvedDark;

  toggleTheme(): void {
    this.themeService.setMode(this.isDark() ? 'light' : 'dark');
  }
}
