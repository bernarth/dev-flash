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
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent { }
