import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from '@layout/bottom-nav/bottom-nav.component';
import { SideNavComponent } from '@layout/side-nav/side-nav.component';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent, SideNavComponent],
  template: `
    <div class="app-shell">
      <df-side-nav class="side-nav-desktop" />
      <div class="content-area">
        <router-outlet />
      </div>
      <df-bottom-nav class="bottom-nav-mobile" />
    </div>
  `,
  styles: [
    `
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

      @media (max-width: 47.9375rem) {
        .app-shell {
          flex-direction: column;
        }
      }

      @media (min-width: 48rem) {
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
    `,
  ],
})
export class App {
  private _settings = inject(SettingsService);
}
