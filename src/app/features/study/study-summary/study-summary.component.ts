import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '@services/db.service';
import { ReviewLog, Rating } from '@models';
import { RATING_CONFIG } from '@core/constants/rating-config';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'df-study-summary',
  imports: [IconComponent],
  template: `
    <div class="df-screen">
      <header class="df-top-bar">
        <button class="icon-btn" (click)="goBack()">
          <df-icon name="close" [size]="20" />
        </button>
        <div class="title">Session complete</div>
      </header>

      <div class="content df-scroll">
        <!-- Hero -->
        <div class="hero">
          <div class="hero-icon">
            <df-icon name="check" [size]="30" [strokeWidth]="2" />
          </div>
          <div class="hero-title">Nice work.</div>
          <div class="hero-sub">{{ total() }} cards reviewed</div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card df-card">
            <div class="df-label">retention</div>
            <div class="stat-value df-mono">{{ retentionPct() }}%</div>
          </div>
          <div class="stat-card df-card">
            <div class="df-label">reviewed</div>
            <div class="stat-value df-mono">{{ total() }}</div>
          </div>
        </div>

        <!-- Breakdown -->
        <div class="df-card breakdown-card">
          <div class="df-label">Breakdown</div>
          <!-- Segmented bar -->
          <div class="seg-bar">
            @for (r of breakdownWithPct(); track r.key) {
              @if (r.count > 0) {
                <div [style.flex]="r.count" [style.background]="r.color"></div>
              }
            }
          </div>
          <div class="breakdown-list">
            @for (r of breakdownWithPct(); track r.key) {
              <div class="breakdown-row">
                <span class="breakdown-dot" [style.background]="r.color"></span>
                <span class="breakdown-label">{{ r.label }}</span>
                <span class="breakdown-count df-mono">{{ r.count }}</span>
                <span class="breakdown-pct df-mono">{{ r.pct }}%</span>
              </div>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="df-btn-primary" (click)="studyAgain()">Study again</button>
          <button class="df-btn-outline" (click)="goBack()">Back to decks</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      .title {
        font-weight: 600;
        font-size: 1rem;
      }
      .content {
        flex: 1;
        overflow-y: auto;
        padding: 0.25rem 1.25rem 2rem;
      }
      .hero {
        text-align: center;
        padding: 1.5rem 0 1.25rem;
      }
      .hero-icon {
        width: 4rem;
        height: 4rem;
        margin: 0 auto 0.875rem;
        border-radius: 20px;
        background: var(--df-primary-container);
        color: var(--df-on-primary-container);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .hero-title {
        font-size: 1.75rem;
        font-weight: 600;
        letter-spacing: -0.03em;
      }
      .hero-sub {
        font-size: 0.8125rem;
        color: var(--df-text-muted);
        margin-top: 0.25rem;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.625rem;
        margin-bottom: 0.875rem;
      }
      .stat-card {
        padding: 0.875rem;
      }
      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: -0.02em;
      }
      .breakdown-card {
        padding: 1rem;
        margin-bottom: 1.25rem;
      }
      .seg-bar {
        display: flex;
        gap: 0.125rem;
        height: 0.625rem;
        border-radius: var(--df-radius-pill);
        overflow: hidden;
        margin-bottom: 0.875rem;
        background: var(--df-surface-2);
      }
      .breakdown-list {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }
      .breakdown-row {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }
      .breakdown-dot {
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 3px;
        flex-shrink: 0;
      }
      .breakdown-label {
        flex: 1;
        font-size: 0.8125rem;
      }
      .breakdown-count {
        font-size: 0.8125rem;
        font-variant-numeric: tabular-nums;
      }
      .breakdown-pct {
        font-size: 0.6875rem;
        color: var(--df-text-faint);
        width: 2.25rem;
        text-align: right;
      }
      .actions {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }
    `,
  ],
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

  studyAgain(): void {
    this.router.navigate(['/decks', this.deckId(), 'study']);
  }

  goBack(): void {
    this.router.navigate(['/decks']);
  }
}
