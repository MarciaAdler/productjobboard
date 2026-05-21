import { parse } from 'node-html-parser';

export function htmlToText(html: string | null | undefined): string {
  if (!html) return '';
  const root = parse(html);
  // Remove script and style nodes
  root.querySelectorAll('script, style').forEach(el => el.remove());
  return root.textContent.replace(/\s+/g, ' ').trim();
}

export function stripScripts(html: string | null | undefined): string {
  if (!html) return '';
  const root = parse(html);
  root.querySelectorAll('script, style, iframe').forEach(el => el.remove());
  return root.toString();
}
