import { parse } from 'node-html-parser';

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, '...')
    .replace(/&bull;/g, '•')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]{2,6};/g, ' ');
}

function removeCodeLikeLines(text: string): string {
  return text
    .split('\n')
    .filter(line => {
      const t = line.trim();
      if (!t) return true;
      // CSS selectors (.foo { or #bar {)
      if (/^[.#][a-zA-Z][\w-]*[\s,{]/.test(t)) return false;
      // CSS @-rules
      if (/^@(media|keyframes|font-face|import|charset|supports)/i.test(t)) return false;
      // CSS property lines (key: value;)
      if (/^[a-z-]{3,30}\s*:\s*.{1,100};$/.test(t)) return false;
      // Standalone closing brace lines
      if (/^\s*\}[\s;]*$/.test(t)) return false;
      // Lines that look like HTML attributes leaking through
      if (/^(class|style|id|data-[\w-]+)\s*=\s*["']/.test(t)) return false;
      // Long strings with no spaces (base64, hashes, minified code)
      if (t.length > 80 && !t.includes(' ')) return false;
      // Lines with excessive code-like characters
      const specials = (t.match(/[{};()=<>\\]/g) || []).length;
      if (specials > 3 && t.length < 200) return false;
      return true;
    })
    .join('\n');
}

export function htmlToText(html: string | null | undefined): string {
  if (!html) return '';

  // Strip style/script blocks and their content before any parsing
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  // Insert newlines around block-level elements before stripping tags
  const expanded = stripped
    .replace(/<\/(p|div|h[1-6]|li|section|article|tr|blockquote)\s*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n');

  const root = parse(expanded);
  root.querySelectorAll('script, style, iframe, noscript').forEach(el => el.remove());

  let text = root.textContent;
  text = decodeEntities(text);
  text = removeCodeLikeLines(text);

  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function stripScripts(html: string | null | undefined): string {
  if (!html) return '';
  const root = parse(html);
  root.querySelectorAll('script, style, iframe').forEach(el => el.remove());
  return root.toString();
}
