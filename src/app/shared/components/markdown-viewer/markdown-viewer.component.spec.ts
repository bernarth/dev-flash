import { TestBed } from '@angular/core/testing';
import { MarkdownViewerComponent } from './markdown-viewer.component';

describe('MarkdownViewerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownViewerComponent],
    }).compileComponents();
  });

  function render(content: string): HTMLElement {
    const fixture = TestBed.createComponent(MarkdownViewerComponent);
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders markdown bold and inline code', () => {
    const el = render('**bold** and `code`');
    expect(el.querySelector('strong')?.textContent).toBe('bold');
    expect(el.querySelector('code')?.textContent).toBe('code');
  });

  it('converts single newlines to line breaks', () => {
    const el = render('line one\nline two');
    expect(el.querySelector('br')).toBeTruthy();
  });

  it('highlights fenced code blocks with hljs classes', () => {
    const el = render('```js\nconst x = 1;\n```');
    const code = el.querySelector('pre code');
    expect(code?.classList.contains('hljs')).toBe(true);
    expect(code?.classList.contains('language-js')).toBe(true);
    expect(code?.querySelector('.hljs-keyword')).toBeTruthy();
  });

  it('falls back to plaintext for unknown languages', () => {
    const el = render('```notalang\nfoo bar\n```');
    const code = el.querySelector('pre code');
    expect(code?.classList.contains('language-plaintext')).toBe(true);
    expect(code?.textContent).toContain('foo bar');
  });

  it('strips script tags from rendered output', () => {
    const el = render('<script>alert("xss")</script>hello');
    expect(el.querySelector('script')).toBeNull();
    expect(el.textContent).toContain('hello');
  });

  it('strips event handler attributes from rendered output', () => {
    const el = render('<img src="x" onerror="alert(1)">');
    const img = el.querySelector('img');
    expect(img?.hasAttribute('onerror')).toBe(false);
  });
});
