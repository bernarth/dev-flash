import { marked, type Tokens } from 'marked';
import hljs from 'highlight.js/lib/common';

marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }: Tokens.Code): string {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
});

export { marked };
