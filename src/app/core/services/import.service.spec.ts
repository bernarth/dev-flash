import { TestBed } from '@angular/core/testing';
import { Card } from '@models/card';
import { CardService } from './card.service';
import { ImportService } from './import.service';

function csvFile(content: string, name = 'deck.csv'): File {
  return new File([content], name, { type: 'text/csv' });
}

describe('ImportService', () => {
  const cardServiceMock = {
    bulkAddCards: vi.fn<(cards: Omit<Card, 'id'>[]) => Promise<number>>(),
  };

  let service: ImportService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: CardService, useValue: cardServiceMock }],
    });
    service = TestBed.inject(ImportService);
  });

  describe('parse', () => {
    it('rejects files without a csv extension', async () => {
      const promise = service.parse(csvFile('question,answer\nq,a\n', 'notes.txt'), 1);

      await expect(promise).rejects.toThrow('File must be a .csv');
    });

    it('accepts files with an uppercase csv extension', async () => {
      const result = await service.parse(csvFile('question,answer\nq1,a1\n', 'DECK.CSV'), 1);

      expect(result.imported).toHaveLength(1);
    });

    it('rejects csv files missing required columns', async () => {
      const promise = service.parse(csvFile('question,note\nq,n\n'), 1);

      await expect(promise).rejects.toThrow('CSV must have "question" and "answer" columns');
    });

    it('imports rows as new cards for the target deck', async () => {
      const result = await service.parse(
        csvFile('question,answer\nWhat is Big-O?,Upper bound\n'),
        7,
      );

      expect(result.imported).toEqual([
        {
          deckId: 7,
          question: 'What is Big-O?',
          answer: 'Upper bound',
          notes: undefined,
          tags: [],
          nextSession: 0,
        },
      ]);
      expect(result.skipped).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('trims whitespace around questions and answers', async () => {
      const result = await service.parse(
        csvFile('question,answer\n  padded q  ,  padded a  \n'),
        1,
      );

      expect(result.imported[0]?.question).toBe('padded q');
      expect(result.imported[0]?.answer).toBe('padded a');
    });

    it('skips rows with an empty question or answer and reports their line', async () => {
      const result = await service.parse(
        csvFile('question,answer\n,missing question\nmissing answer,\nok,fine\n'),
        1,
      );

      expect(result.skipped).toEqual([
        { row: 2, reason: 'empty question' },
        { row: 3, reason: 'empty answer' },
      ]);
      expect(result.imported.map((card) => card.question)).toEqual(['ok']);
    });

    it('warns about unknown columns and ignores their data', async () => {
      const result = await service.parse(csvFile('question,answer,difficulty\nq,a,hard\n'), 1);

      expect(result.warnings).toEqual(['Unknown columns ignored: difficulty']);
      expect(result.imported[0]).not.toHaveProperty('difficulty');
    });

    it('normalizes tags to a trimmed lowercase list', async () => {
      const result = await service.parse(
        csvFile('question,answer,tags\nq,a,"JS, Arrays ,  QUIZ"\n'),
        1,
      );

      expect(result.imported[0]?.tags).toEqual(['js', 'arrays', 'quiz']);
    });

    it('maps notes and leaves them undefined when empty', async () => {
      const result = await service.parse(
        csvFile('question,answer,notes\nq1,a1,remember this\nq2,a2,\n'),
        1,
      );

      expect(result.imported[0]?.notes).toBe('remember this');
      expect(result.imported[1]?.notes).toBeUndefined();
    });

    it('reads columns case-insensitively', async () => {
      const result = await service.parse(csvFile('QUESTION,ANSWER,Tags,Notes\nq,a,js,note\n'), 1);

      expect(result.imported[0]).toMatchObject({
        question: 'q',
        answer: 'a',
        tags: ['js'],
        notes: 'note',
      });
    });
  });

  describe('bulkImport', () => {
    it('delegates the insert to the card service', async () => {
      const cards: Omit<Card, 'id'>[] = [
        { deckId: 1, question: 'q1', answer: 'a1', tags: [], nextSession: 0 },
        { deckId: 1, question: 'q2', answer: 'a2', tags: [], nextSession: 0 },
      ];
      cardServiceMock.bulkAddCards.mockResolvedValue(2);

      await expect(service.bulkImport(cards)).resolves.toBe(2);
      expect(cardServiceMock.bulkAddCards).toHaveBeenCalledWith(cards);
    });
  });
});
