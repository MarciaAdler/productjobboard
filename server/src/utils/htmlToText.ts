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
      // CSS selectors
      if (/^[.#][a-zA-Z][\w-]*\s*\{/.test(t)) return false;
      // CSS property lines (key: value;)
      if (/^[a-z-]{3,30}\s*:\s*.{1,80};$/.test(t)) return false;
      // Lines with excessive braces/brackets (code artifacts)
      const specials = (t.match(/[{};()=<>\\]/g) || []).length;
      if (specials > 4 && t.length < 150) return false;
      return true;
    })
    .join('\n');
}

export function htmlToText(html: string | null | undefined): string {
  if (!html) return '';

  // Insert newlines around block-level elements before stripping tags
  const expanded = html
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
