import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Rating } from '@models';
import { RatingMeta } from '@core/constants/rating-config';

export interface RatingButton extends RatingMeta {
  interval: string;
}

@Component({
  selector: 'df-study-rating-grid',
  imports: [MatButtonModule],
  templateUrl: './study-rating-grid.component.html',
  styleUrl: './study-rating-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyRatingGridComponent {
  readonly buttons = input.required<RatingButton[]>();
  readonly rated = output<Rating>();
}
