import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  styleUrl: './side-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {}
