import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconName } from './icon-names';
import { ICON_PATHS } from './icon-paths';

/**
 * Renders a single SVG icon by name.
 *
 * Usage:
 *   <df-icon name="search" />
 *   <df-icon name="trash" [size]="18" />
 *   <df-icon name="check" [strokeWidth]="2" label="Done" />
 *
 * - `size`        — width & height in px (default 20)
 * - `strokeWidth` — SVG stroke-width (default 1.75)
 * - `label`       — accessible label; omit for decorative icons
 *
 * `display: contents` on the host means the component adds zero layout boxes —
 * the inner <svg> participates directly in the parent's flex/grid context.
 *
 * The DomSanitizer bypass is intentional and safe: ICON_PATHS is a hardcoded
 * constant in this codebase, never derived from user input.
 */
@Component({
  selector: 'df-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.aria-label]="label() || null"
      [attr.role]="label() ? 'img' : null"
    >
      <g [innerHTML]="svgContent()"></g>
    </svg>
  `,
  styles: [':host { display: contents; flex-shrink: 0; }'],
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);

  name = input.required<IconName>();
  size = input<number>(20);
  strokeWidth = input<number>(1.75);
  label = input<string>('');

  svgContent = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[this.name()]),
  );
}
