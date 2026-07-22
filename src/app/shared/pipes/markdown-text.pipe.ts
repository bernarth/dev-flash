import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdownText',
})
export class MarkdownTextPipe implements PipeTransform {
  transform(value: string): string {
    return value
      .replace(/```(?:\w*\n)?([\s\S]*?)```/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\b_([^_]+)_\b/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
