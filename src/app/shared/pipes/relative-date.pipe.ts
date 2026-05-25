import { Pipe, PipeTransform } from '@angular/core';
import { choose } from '@core/utils/utils';

@Pipe({
  name: 'relativeDate',
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: Date | string | null | undefined): string {
    if (!value) {
      return 'Never';
    }

    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    return choose(
      [
        { when: diff < 60, value: 'Just now' },
        { when: diff < 3600, value: `${Math.floor(diff / 60)}m ago` },
        { when: diff < 86400, value: `${Math.floor(diff / 3600)}h ago` },
        { when: diff < 172800, value: 'Yesterday' },
        { when: diff < 604800, value: `${Math.floor(diff / 86400)} days ago` },
      ],
      date.toLocaleDateString(),
    );
  }
}
