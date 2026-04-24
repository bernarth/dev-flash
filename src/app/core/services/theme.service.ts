import { Injectable, signal, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>('system');
  readonly resolvedDark = signal<boolean>(false);

  constructor() {
    // Apply theme immediately on boot
    this.applyTheme(this.mode());

    // Re-apply when the OS preference changes (only relevant in 'system' mode)
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.mode() === 'system') {
          this.applyTheme('system');
        }
      });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    this.applyTheme(mode);
  }

  private applyTheme(mode: ThemeMode): void {
    const isDark =
      mode === 'dark' ||
      (mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const root = this.document.documentElement;
    root.classList.remove('df-light', 'df-dark');
    root.classList.add(isDark ? 'df-dark' : 'df-light');

    this.resolvedDark.set(isDark);
  }
}
