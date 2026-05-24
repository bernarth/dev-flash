import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { ReviewLog, Rating } from '@models';
import { RATING_CONFIG } from '@core/constants/rating-config';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'df-study-summary',
  imports: [MatIconModule, MatToolbarModule, MatCardModule, MatListModule, MatButtonModule],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="goBack()" aria-label="Close">
        <mat-icon>close</mat-icon>
      </button>
      <span>Session complete</span>
    </mat-toolbar>

    <div class="content">
      <div class="hero">
        <mat-icon class="hero-icon">check_circle</mat-icon>
        <div class="hero-title">Nice work.</div>
        <div class="hero-sub">{{ total() }} cards reviewed</div>
      </div>

      <div class="stats-grid">
        <mat-card appearance="outlined">
          <mat-card-content>
            <div class="stat-label">retention</div>
            <div class="stat-value df-mono">{{ retentionPct() }}%</div>
          </mat-card-content>
        </mat-card>
        <mat-card appearance="outlined">
          <mat-card-content>
            <div class="stat-label">reviewed</div>
            <div class="stat-value df-mono">{{ total() }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      @if (total() > 0) {
        <mat-card appearance="outlined">
          <mat-card-content>
            <div class="seg-bar">
              @for (r of breakdownWithPct(); track r.key) {
                @if (r.count > 0) {
                  <div [style.flex]="r.count" [style.background]="r.color"></div>
                }
              }
            </div>
            <mat-list>
              @for (r of breakdownWithPct(); track r.key) {
                <mat-list-item>
                  <span class="breakdown-dot" matListItemIcon [style.background]="r.color"></span>
                  <span matListItemTitle>{{ r.label }}</span>
                  <span matListItemMeta class="df-mono">{{ r.count }} ({{ r.pct }}%)</span>
                </mat-list-item>
              }
            </mat-list>
          </mat-card-content>
        </mat-card>
      }

      <div class="actions">
        <button mat-stroked-button (click)="goBack()">Back to decks</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
    .content { flex: 1; overflow-y: auto; padding: 0 1rem 2rem; }
    .hero { text-align: center; padding: 2rem 0 1.5rem; }
    .hero-icon {
      font-size: var(--df-icon-size-display);
      width: var(--df-icon-size-display);
      height: var(--df-icon-size-display);
      color: var(--mat-sys-primary);
    }
    .hero-title {
      font-size: var(--df-font-size-2xl);
      font-weight: var(--df-font-weight-semibold);
      margin-top: 0.5rem;
    }
    .hero-sub { font-size: var(--df-font-size-base); opacity: 0.6; margin-top: 0.25rem; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
    .stat-label { font-size: var(--df-font-size-xs); opacity: 0.6; }
    .stat-value { font-size: var(--df-font-size-xl); font-weight: var(--df-font-weight-semibold); }
    .seg-bar {
      display: flex;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.75rem;
      gap: 2px;
      background: var(--mat-sys-surface-variant, #1b2129);
    }
    .breakdown-dot { width: 0.625rem; height: 0.625rem; border-radius: 3px; flex-shrink: 0; }
    .actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
    .actions button { width: 100%; }
  `],
})
export class StudySummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DbService);

  deckId = signal(0);
  logs = signal<ReviewLog[]>([]);

  breakdown = computed(() => {
    const ls = this.logs();
    const count = (r: Rating) => ls.filter((l) => l.rating === r).length;
    return RATING_CONFIG.map((r) => ({ ...r, count: count(r.key) }));
  });

  total = computed(() => this.logs().length);

  breakdownWithPct = computed(() => {
    const t = this.total();
    return this.breakdown().map((r) => ({
      ...r,
      pct: t ? Math.round((r.count / t) * 100) : 0,
    }));
  });

  retentionPct = computed(() => {
    const t = this.total();
    if (!t) return 0;
    const good = this.logs().filter((l) => l.rating === 'good' || l.rating === 'easy').length;
    return Math.round((good / t) * 100);
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deckId.set(id);
    const sessionStart = new Date();
    sessionStart.setMinutes(sessionStart.getMinutes() - 30);
    const logs = await this.db.getReviewLogs(id, sessionStart);
    this.logs.set(logs);
  }

  goBack(): void {
    void this.router.navigate(['/decks']);
  }
}
