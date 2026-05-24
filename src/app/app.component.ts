import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from '@layout/bottom-nav/bottom-nav.component';
import { SideNavComponent } from '@layout/side-nav/side-nav.component';

@Component({
  selector: 'df-root',
  imports: [RouterOutlet, BottomNavComponent, SideNavComponent],
  template: `
    <div class="app-shell">
      <df-side-nav class="side-nav-desktop" />
      <main class="content-area">
        <router-outlet />
      </main>
      <df-bottom-nav class="bottom-nav-mobile" />
    </div>
  `,
  styleUrl: './app.component.scss',
})
export class App { }
