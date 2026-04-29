/**
 * Union of every icon name available in the app.
 * Adding a new icon requires: (1) add the name here, (2) add the SVG content in icon-paths.ts.
 * The compiler will error on any <df-icon name="..."> that uses an unknown name.
 */
export type IconName =
  | 'back'
  | 'check'
  | 'chev-down'
  | 'chev-right'
  | 'clock'
  | 'close'
  | 'code'
  | 'file'
  | 'filter'
  | 'flame'
  | 'layers'
  | 'moon'
  | 'more'
  | 'notes'
  | 'play'
  | 'plus'
  | 'search'
  | 'settings'
  | 'stack'
  | 'sun'
  | 'tag'
  | 'trash'
  | 'upload';
