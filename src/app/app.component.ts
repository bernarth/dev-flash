import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from '@layout/bottom-nav/bottom-nav.component';
import { SideNavComponent } from '@layout/side-nav/side-nav.component';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent, SideNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  private _settings = inject(SettingsService);
}
