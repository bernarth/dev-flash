import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '@services/theme.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="side-nav">
      <div class="logo df-mono">DF</div>

      <a class="nav-item" routerLink="/decks"    routerLinkActive="active" title="Decks">    <df-icon name="stack"    /></a>
      <a class="nav-item" routerLink="/browse"   routerLinkActive="active" title="Browse">   <df-icon name="search"   /></a>
      <a class="nav-item" routerLink="/import"   routerLinkActive="active" title="Import">   <df-icon name="upload"   /></a>
      <a class="nav-item" routerLink="/settings" routerLinkActive="active" title="Settings"> <df-icon name="settings" /></a>

      <div class="spacer"></div>

      <button class="theme-toggle"
        (click)="toggleTheme()"
        [title]="isDark() ? 'Switch to light' : 'Switch to dark'">
        <df-icon [name]="isDark() ? 'sun' : 'moon'" [size]="18" />
      </button>
    </nav>
  `,
  styles: [`
    .side-nav {
      display: flex; flex-direction: column; align-items: center;
      width: 72px; height: 100%;
      background: var(--df-surface);
      border-right: 1px solid var(--df-outline-soft);
      padding: 14px 0 16px;
    }
    .logo {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--df-primary); color: var(--df-primary-ink);
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; letter-spacing: -0.04em;
      margin-bottom: 18px;
    }
    .nav-item {
      width: 44px; height: 44px; border-radius: 12px; margin-bottom: 6px;
      display: flex; align-items: center; justify-content: center;
      color: var(--df-text-muted); text-decoration: none;
      transition: background 120ms, color 120ms;
    }
    .nav-item:hover  { background: var(--df-surface-1); color: var(--df-text); }
    .nav-item.active { background: var(--df-primary-container); color: var(--df-on-primary-container); }
    .spacer { flex: 1; }
    .theme-toggle {
      width: 44px; height: 44px; border-radius: 12px; border: 0;
      background: transparent; color: var(--df-text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 120ms, color 120ms;
    }
    .theme-toggle:hover { background: var(--df-surface-1); color: var(--df-text); }
  `],
})
export class SideNavComponent {
  private themeService = inject(ThemeService);
  readonly isDark = this.themeService.resolvedDark;

  toggleTheme(): void {
    this.themeService.setMode(this.isDark() ? 'light' : 'dark');
  }
}
