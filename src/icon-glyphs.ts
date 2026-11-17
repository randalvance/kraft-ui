import type { IconDefinition } from './create-icon.js';

// Original single-ink glyphs from the Kraft design system's assets/Icons.
export const agentIcon = [
  ['rect', { x: 4, y: 8, width: 16, height: 12, rx: 3 }],
  ['path', { d: 'M12 8V4M8 14h.01M16 14h.01' }],
] as const satisfies IconDefinition;

export const agentsIcon = [
  ['path', { d: 'M4 8h16v12H4zM12 8V4M8 14h.01M16 14h.01M2 12h2M20 12h2' }],
] as const satisfies IconDefinition;

export const backgroundIcon = [
  ['path', { d: 'M21 12a9 9 0 1 1-3-6.7M21 3v6h-6' }],
] as const satisfies IconDefinition;

export const branchIcon = [
  ['circle', { cx: 6, cy: 6, r: 2.5 }],
  ['circle', { cx: 6, cy: 18, r: 2.5 }],
  ['circle', { cx: 18, cy: 8, r: 2.5 }],
  ['path', { d: 'M6 8.5v7M18 10.5c0 4-12 3-12 5' }],
] as const satisfies IconDefinition;

export const checkIcon = [
  ['path', { d: 'M5 12l5 5L20 7' }],
] as const satisfies IconDefinition;

export const chevronDownIcon = [
  ['path', { d: 'M6 9l6 6 6-6' }],
] as const satisfies IconDefinition;

export const codeIcon = [
  ['path', { d: 'M16 18l6-6-6-6M8 6l-6 6 6 6' }],
] as const satisfies IconDefinition;

export const copyIcon = [
  ['rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }],
  ['path', { d: 'M5 15V5a2 2 0 0 1 2-2h10' }],
] as const satisfies IconDefinition;

export const factoryIcon = [
  ['path', { d: 'M3 20V5h3v7l5-3v3l5-3v3l5-3v11zM7.5 16h1M12.5 16h1M17.5 16h1' }],
] as const satisfies IconDefinition;

export const homeIcon = [
  ['path', { d: 'M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z' }],
] as const satisfies IconDefinition;

export const inboxIcon = [
  ['path', { d: 'M3 12l2.5-7h13L21 12v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 12h5l2 3h4l2-3h5' }],
] as const satisfies IconDefinition;

export const kanbanIcon = [
  ['path', { d: 'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v7h-4z' }],
] as const satisfies IconDefinition;

export const knowledgeIcon = [
  ['path', { d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20M9 6h7M9 10h5' }],
] as const satisfies IconDefinition;

export const markIcon = [
  ['circle', { cx: 7, cy: 8, r: 2.2, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 12, cy: 5.5, r: 2.2, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 17, cy: 8, r: 2.2, fill: 'currentColor', stroke: 'none' }],
  ['path', { d: 'M12 10c-3.5 0-6.5 3-6.5 6 0 1.8 1.3 3 3 3 1.2 0 2.2-.6 3.5-.6s2.3.6 3.5.6c1.7 0 3-1.2 3-3 0-3-3-6-6.5-6z', fill: 'currentColor', stroke: 'none' }],
] as const satisfies IconDefinition;

export const mcpsIcon = [
  ['path', { d: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4' }],
] as const satisfies IconDefinition;

export const memoryIcon = [
  ['path', { d: 'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18ZM12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18ZM15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4M17.599 6.5a3 3 0 0 0 .399-1.375M6.003 5.125A3 3 0 0 0 6.401 6.5M3.477 10.896a4 4 0 0 1 .585-.396M19.938 10.5a4 4 0 0 1 .585.396M6 18a4 4 0 0 1-1.967-.516M19.967 17.484A4 4 0 0 1 18 18' }],
] as const satisfies IconDefinition;

export const pinwheelIcon = [
  ['path', { d: 'M12 12L4 4h8zM12 12l8-8v8zM12 12l8 8h-8zM12 12l-8 8v-8z', fill: 'currentColor', stroke: 'none' }],
] as const satisfies IconDefinition;

export const plusIcon = [
  ['path', { d: 'M12 5v14M5 12h14' }],
] as const satisfies IconDefinition;

export const pullRequestsIcon = [
  ['path', { d: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 9v6M18 15V9a3 3 0 0 0-3-3h-3M13 3l-3 3 3 3' }],
] as const satisfies IconDefinition;

export const searchIcon = [
  ['circle', { cx: 11, cy: 11, r: 7 }],
  ['path', { d: 'M20 20l-3.5-3.5' }],
] as const satisfies IconDefinition;

export const sendIcon = [
  ['path', { d: 'M12 19V5M5 12l7-7 7 7' }],
] as const satisfies IconDefinition;

export const sessionsIcon = [
  ['path', { d: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.4-4.9A8 8 0 1 1 21 12z' }],
] as const satisfies IconDefinition;

export const settingsIcon = [
  ['circle', { cx: 12, cy: 12, r: 3 }],
  ['path', { d: 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' }],
] as const satisfies IconDefinition;

export const shareIcon = [
  ['circle', { cx: 18, cy: 5, r: 3 }],
  ['circle', { cx: 6, cy: 12, r: 3 }],
  ['circle', { cx: 18, cy: 19, r: 3 }],
  ['path', { d: 'M8.6 13.5l6.8 4M15.4 6.5l-6.8 4' }],
] as const satisfies IconDefinition;

export const skillsIcon = [
  ['path', { d: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z' }],
] as const satisfies IconDefinition;

export const stopIcon = [
  ['rect', { x: 5, y: 5, width: 14, height: 14, rx: 2, fill: 'currentColor', stroke: 'none' }],
] as const satisfies IconDefinition;

export const trashIcon = [
  ['path', { d: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6' }],
] as const satisfies IconDefinition;

export const workflowsIcon = [
  ['path', { d: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9' }],
] as const satisfies IconDefinition;

export const workspacesIcon = [
  ['path', { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
] as const satisfies IconDefinition;

// Additional glyphs used by the Primepaw composition.
export const microphoneIcon = [
  ['rect', { x: 9, y: 3, width: 6, height: 12, rx: 3 }],
  ['path', { d: 'M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8' }],
] as const satisfies IconDefinition;

export const closeIcon = [
  ['path', { d: 'M6 6l12 12M18 6 6 18' }],
] as const satisfies IconDefinition;

export const pinIcon = [
  ['path', { d: 'M8 3h8M9 3v7l-3 4v2h12v-2l-3-4V3M12 16v5' }],
] as const satisfies IconDefinition;

export const pencilIcon = [
  ['path', { d: 'm4 16 12.5-12.5a2.1 2.1 0 0 1 3 3L7 19l-4 1zM14.5 5.5l4 4' }],
] as const satisfies IconDefinition;

export const syncIcon = [
  ['path', { d: 'M3 10a9 9 0 0 1 15.4-6.4L21 6M21 2v4h-4M21 14a9 9 0 0 1-15.4 6.4L3 18M3 22v-4h4' }],
] as const satisfies IconDefinition;

export const folderIcon = [
  ['path', { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
] as const satisfies IconDefinition;

export const fileIcon = [
  ['path', { d: 'M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h5' }],
] as const satisfies IconDefinition;

export const newFileIcon = [
  ['path', { d: 'M14 3H5v18h8M14 3v5h5v4M14 3l5 5M18 15v6M15 18h6' }],
] as const satisfies IconDefinition;

export const newFolderIcon = [
  ['path', { d: 'M12 20H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v3M18 15v6M15 18h6' }],
] as const satisfies IconDefinition;

export const gripIcon = [
  ['circle', { cx: 9, cy: 5, r: 1, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 15, cy: 5, r: 1, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 9, cy: 12, r: 1, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 15, cy: 12, r: 1, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 9, cy: 19, r: 1, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 15, cy: 19, r: 1, fill: 'currentColor', stroke: 'none' }],
] as const satisfies IconDefinition;

export const threeDotsIcon = [
  ['circle', { cx: 5, cy: 12, r: 1.5, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 12, cy: 12, r: 1.5, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 19, cy: 12, r: 1.5, fill: 'currentColor', stroke: 'none' }],
] as const satisfies IconDefinition;

export const terminalIcon = [
  ['rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }],
  ['path', { d: 'm7 8 4 4-4 4M13 16h4' }],
] as const satisfies IconDefinition;

export const clockIcon = [
  ['circle', { cx: 12, cy: 12, r: 9 }],
  ['path', { d: 'M12 7v5l3 2' }],
] as const satisfies IconDefinition;

export const boltIcon = [
  ['path', { d: 'm13 2-9 12h7l-1 8 10-12h-8z' }],
] as const satisfies IconDefinition;

export const eyeIcon = [
  ['path', { d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' }],
  ['circle', { cx: 12, cy: 12, r: 3 }],
] as const satisfies IconDefinition;

export const linkIcon = [
  ['path', { d: 'M10 13a5 5 0 0 0 7 .1l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7M14 11a5 5 0 0 0-7-.1l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7' }],
] as const satisfies IconDefinition;

export const chevronLeftIcon = [
  ['path', { d: 'm15 6-6 6 6 6' }],
] as const satisfies IconDefinition;

export const powerIcon = [
  ['path', { d: 'M12 3v9M6.3 6.3a8 8 0 1 0 11.4 0' }],
] as const satisfies IconDefinition;

export const keyIcon = [
  ['circle', { cx: 8, cy: 8, r: 5 }],
  ['path', { d: 'm11.5 11.5 9 9M17 17l3-3M19 19l3-3' }],
] as const satisfies IconDefinition;
