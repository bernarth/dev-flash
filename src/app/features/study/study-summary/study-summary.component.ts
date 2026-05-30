import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  resource,
} from '@angular/core';
import { Router } from '@angular/router';
import { ReviewLogsService } from '@core/services/review-logs.service';
import { ReviewLog, Rating } from '@models';
import { RATING_CONFIG } from '@core/constants/rating-config';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

@Component({
  selector: 'df-study-summary',
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    SpinnerComponent,
  ],
  templateUrl: './study-summary.component.html',
  styleUrl: './study-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudySummaryComponent {
  private readonly router = inject(Router);
  private readonly reviewLogsService = inject(ReviewLogsService);

  protected readonly id = input.required({ transform: numberAttribute });

  protected readonly logs = resource<ReviewLog[], number>({
    params: () => this.id(),
    loader: ({ params }) => this.reviewLogsService.getSessionLogs(params),
  });

  protected readonly total = computed(() => this.logs.value()?.length ?? 0);

  protected readonly breakdown = computed(() => {
    const items = this.logs.value() ?? [];
    const total = items.length;
    const count = (r: Rating) => items.filter((l) => l.rating === r).length;

    return RATING_CONFIG.map((r) => {
      const ratingCount = count(r.key);
      return {
        ...r,
        count: ratingCount,
        percent: total ? Math.round((ratingCount / total) * 100) : 0,
      };
    });
  });

  protected readonly retentionPercent = computed(() => {
    const items = this.logs.value() ?? [];
    const total = items.length;

    if (!total) {
      return 0;
    }

    const good = items.filter((l) => l.rating === 'good' || l.rating === 'easy').length;

    return Math.round((good / total) * 100);
  });

  goBack(): void {
    void this.router.navigate(['/study']);
  }
}
