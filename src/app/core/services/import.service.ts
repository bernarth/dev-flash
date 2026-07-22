import { inject, Injectable } from '@angular/core';
import Papa from 'papaparse';
import { Card } from '@models/card';
import { CardService } from './card.service';

export interface ImportResult {
  imported: Omit<Card, 'id'>[];
  skipped: { row: number; reason: string }[];
  warnings: string[];
}

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly cardService = inject(CardService);

  bulkImport(cards: Omit<Card, 'id'>[]): Promise<number> {
    return this.cardService.bulkAddCards(cards);
  }

  parse(file: File, deckId: number): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        reject(new Error('File must be a .csv'));
        return;
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          try {
            resolve(
              this.processRows(
                result.data as Record<string, string>[],
                result.meta.fields ?? [],
                deckId,
              ),
            );
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        },
        error: (err) => reject(new Error(err.message)),
      });
    });
  }

  private processRows(
    rows: Record<string, string>[],
    fields: string[],
    deckId: number,
  ): ImportResult {
    const imported: Omit<Card, 'id'>[] = [];
    const skipped: { row: number; reason: string }[] = [];
    const warnings: string[] = [];

    const lowerFields = fields.map((f) => f.toLowerCase().trim());

    if (!lowerFields.includes('question') || !lowerFields.includes('answer')) {
      throw new Error('CSV must have "question" and "answer" columns');
    }

    const knownCols = ['question', 'answer', 'notes', 'tags'];
    const unknownCols = lowerFields.filter((f) => !knownCols.includes(f));

    if (unknownCols.length) {
      warnings.push(`Unknown columns ignored: ${unknownCols.join(', ')}`);
    }

    const columnKey = (name: string): string => fields[lowerFields.indexOf(name)] ?? name;

    rows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const question = (row[columnKey('question')] ?? '').trim();
      const answer = (row[columnKey('answer')] ?? '').trim();

      if (!question) {
        skipped.push({ row: rowNum, reason: 'empty question' });
        return;
      }
      if (!answer) {
        skipped.push({ row: rowNum, reason: 'empty answer' });
        return;
      }

      const rawTags = (row[columnKey('tags')] ?? '').trim();
      const tags = rawTags
        ? rawTags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : [];

      const notes = (row[columnKey('notes')] ?? '').trim() || undefined;

      imported.push({
        deckId,
        question,
        answer,
        notes,
        tags,
        nextSession: 0,
      });
    });

    return { imported, skipped, warnings };
  }
}
