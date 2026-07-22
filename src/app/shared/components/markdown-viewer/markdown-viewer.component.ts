import {
  ChangeDetectionStrategy,
  Component,
  SecurityContext,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from './marked.config';

@Component({
  selector: 'df-markdown-viewer',
  template: '<div class="df-markdown-viewer" [innerHTML]="html()"></div>',
  styleUrl: './markdown-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MarkdownViewerComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly content = input.required<string>();

  protected readonly html = computed(() => {
    const rawHtml = marked.parse(this.content(), { async: false });

    return this.sanitizer.sanitize(SecurityContext.HTML, rawHtml);
  });
}
