import { IconName } from './icon-names';

/**
 * SVG inner content (paths, circles, etc.) for each icon.
 * All values are hardcoded constants — never user input — so the security
 * bypass in icon.component.ts is safe.
 *
 * Stroke style (fill, stroke, linecap, linejoin, stroke-width) is set on the
 * parent <svg> element in the component, not here.
 */
export const ICON_PATHS: Record<IconName, string> = {
  'back':       '<path d="M15 18l-6-6 6-6"/>',
  'check':      '<path d="m5 12 5 5L20 7"/>',
  'chev-down':  '<path d="m6 9 6 6 6-6"/>',
  'chev-right': '<path d="m9 6 6 6-6 6"/>',
  'clock':      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'close':      '<path d="M18 6 6 18M6 6l12 12"/>',
  'code':       '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4 10 20"/>',
  'file':       '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  'filter':     '<path d="M3 5h18M6 12h12M10 19h4"/>',
  'flame':      '<path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8Z"/>',
  'layers':     '<path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4"/>',
  'moon':       '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  'more':       '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  'notes':      '<path d="M4 6h16M4 12h10M4 18h16"/>',
  'plus':       '<path d="M12 5v14M5 12h14"/>',
  'search':     '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  'settings':   '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  'stack':      '<path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 16 8 4 8-4"/>',
  'sun':        '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  'tag':        '<path d="M20.59 13.41 13 21l-9-9V4h8l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="8" cy="8" r="1.2"/>',
  'trash':      '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  'upload':     '<path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
};
