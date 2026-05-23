import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'df-learn-session',
  imports: [],
  template: '',
})
export class LearnSessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    void this.router.navigate(['/decks', id, 'study'], { replaceUrl: true });
  }
}
