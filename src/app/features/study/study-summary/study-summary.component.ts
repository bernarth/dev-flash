import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '../../../core/services/db.service';
import { ReviewLog, Rating } from '../../../core/models';
import { RATING_CONFIG } from '../../../core/constants/rating-config';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'df-study-summary',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="screen">
      <header class="top-bar">
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
          <button class="btn-filled" (click)="studyAgain()">Study again</button>
          <button class="btn-outline" (click)="goBack()">Back to decks</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .screen {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .top-bar {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--df-outline-soft);
      gap: 12px;
      flex-shrink: 0;
    }
    .title {
      font-weight: 600;
      font-size: 16px;
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 4px 20px 32px;
    }
    .hero {
      text-align: center;
      padding: 24px 0 20px;
    }
    .hero-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 14px;
      border-radius: 20px;
      background: var(--df-primary-container);
      color: var(--df-on-primary-container);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-title {
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.03em;
    }
    .hero-sub {
      font-size: 13px;
      color: var(--df-text-muted);
      margin-top: 4px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .stat-card {
      padding: 14px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .breakdown-card {
      padding: 16px;
      margin-bottom: 20px;
    }
    .seg-bar {
      display: flex;
      gap: 2px;
      height: 10px;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 14px;
      background: var(--df-surface-2);
    }
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .breakdown-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .breakdown-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .breakdown-label {
      flex: 1;
      font-size: 13px;
    }
    .breakdown-count {
      font-size: 13px;
      font-variant-numeric: tabular-nums;
    }
    .breakdown-pct {
      font-size: 11px;
      color: var(--df-text-faint);
      width: 36px;
      text-align: right;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn-filled {
      height: 48px;
      border-radius: 14px;
      border: 0;
      background: var(--df-primary);
      color: var(--df-primary-ink);
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 120ms;
    }
    .btn-outline {
      height: 48px;
      border-radius: 14px;
      border: 1px solid var(--df-outline);
      background: transparent;
      color: var(--df-text);
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
    }
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
    const count = (r: Rating) => ls.filter(l => l.rating === r).length;
    return RATING_CONFIG.map(r => ({ ...r, count: count(r.key) }));
  });

  total = computed(() => this.logs().length);

  breakdownWithPct = computed(() => {
    const t = this.total();
    return this.breakdown().map(r => ({
      ...r,
      pct: t ? Math.round(r.count / t * 100) : 0,
    }));
  });

  retentionPct = computed(() => {
    const t = this.total();
    if (!t) return 0;
    const good = this.logs().filter(l => l.rating === 'good' || l.rating === 'easy').length;
    return Math.round(good / t * 100);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deckId.set(id);

    const sessionStart = new Date();
    sessionStart.setMinutes(sessionStart.getMinutes() - 30);
    this.db.getReviewLogs(id, sessionStart).subscribe(logs => {
      this.logs.set(logs);
    });
  }

  studyAgain(): void {
    this.router.navigate(['/decks', this.deckId(), 'study']);
  }

  goBack(): void {
    this.router.navigate(['/decks']);
  }
}
