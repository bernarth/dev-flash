import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'df-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, SideNavComponent],
  template: `
    <div class="app-shell">
      <!-- Desktop side nav (>= 768px) -->
      <df-side-nav class="side-nav-desktop" />

      <!-- Main content area -->
      <div class="content-area">
        <router-outlet />
      </div>

      <!-- Mobile bottom nav (< 768px) -->
      <df-bottom-nav class="bottom-nav-mobile" />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .app-shell {
      display: flex;
      height: 100vh;
      height: 100dvh;
      background: var(--df-bg);
      overflow: hidden;
    }
    .side-nav-desktop {
      display: none;
    }
    .content-area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .bottom-nav-mobile {
      /* positioned at bottom via flex column in app-shell on mobile */
    }

    /* Mobile: vertical stack */
    @media (max-width: 767px) {
      .app-shell {
        flex-direction: column;
      }
      .side-nav-desktop {
        display: none;
      }
    }

    /* Desktop: horizontal layout */
    @media (min-width: 768px) {
      .app-shell {
        flex-direction: row;
      }
      .side-nav-desktop {
        display: flex;
      }
      .bottom-nav-mobile {
        display: none;
      }
    }
  `],
})
export class LayoutComponent {
  // Initialize settings (which sets up theme) eagerly
  private _settings = inject(SettingsService);
}
