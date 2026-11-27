import { createIcon } from '../../src';

/**
 * Glyphs the Primepaw rail and toolbars need that Kraft UI's `Icon` set does not ship yet.
 * Built with `createIcon`, the library's extension point. See docs/primepaw-rebuild.md.
 */
export const PpIcon = createIcon({
  bulb: [['path', { d: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z' }]],
  clipboard: [['rect', { x: 5, y: 4, width: 14, height: 17, rx: 2 }], ['path', { d: 'M9 4V3h6v1M9 10h6M9 14h6M9 18h3' }]],
  board: [['rect', { x: 4, y: 4, width: 16, height: 16, rx: 2 }], ['rect', { x: 8, y: 8, width: 8, height: 8, rx: 1 }]],
  moon: [['path', { d: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z' }]],
  'chevron-right': [['path', { d: 'm9 6 6 6-6 6' }]],
  sparkle: [['path', { d: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z' }]],
  filter: [['path', { d: 'M4 5h16l-6 7v6l-4 2v-8z' }]],
  graph: [['circle', { cx: 6, cy: 6, r: 2.5 }], ['circle', { cx: 18, cy: 8, r: 2.5 }], ['circle', { cx: 10, cy: 18, r: 2.5 }], ['path', { d: 'M8.3 7l7.4.6M7 8.3l2 7.4M16.4 10l-4.6 6' }]],
  expand: [['path', { d: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5' }]],
  sliders: [['path', { d: 'M4 7h10M18 7h2M4 17h4M12 17h8' }], ['circle', { cx: 16, cy: 7, r: 2 }], ['circle', { cx: 10, cy: 17, r: 2 }]],
  vscode: [['path', { d: 'M17 3l4 2v14l-4 2L7 13l-3 3-2-1V9l2-1 3 3zM17 7l-6 5 6 5z' }]],
  activity: [['path', { d: 'M3 12h4l3-7 4 14 3-7h4' }]],
  ban: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M5.6 5.6l12.8 12.8' }]],
  question: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01' }]],
});
