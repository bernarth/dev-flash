import { MarkdownTextPipe } from './markdown-text.pipe';

describe('MarkdownTextPipe', () => {
  const pipe = new MarkdownTextPipe();

  it('strips inline code backticks', () => {
    expect(pipe.transform('What is the difference between `==` and `===`?')).toBe(
      'What is the difference between == and ===?',
    );
  });

  it('strips bold and italic markers', () => {
    expect(pipe.transform('**pending** — not *settled* yet')).toBe('pending — not settled yet');
  });

  it('unwraps links to their text', () => {
    expect(pipe.transform('see [the docs](https://example.com) here')).toBe('see the docs here');
  });

  it('collapses list markup and newlines into a single line', () => {
    expect(pipe.transform('1. first item\n2. second item\n\n- bullet')).toBe(
      'first item second item bullet',
    );
  });

  it('keeps the code text from fenced blocks', () => {
    expect(pipe.transform('```js\nconst x = 1;\n```')).toBe('const x = 1;');
  });
});
