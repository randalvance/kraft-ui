import type { CSSProperties, ReactNode } from 'react';

export type RowDensity = 'default' | 'compact';
export type RowActionsVisibility = 'always' | 'hover';

export type RowContentOptions = {
  /** Use inline, noninteractive content for the label and description. */
  label: ReactNode;
  description?: ReactNode;
  truncateLabel?: boolean;
  /** Maximum visible description lines. Omit for wrapping copy. */
  clampDescription?: number;
  done?: boolean;
  actions?: ReactNode;
  /** Reveal reserved actions on hover or focus, and keep them visible on touch. */
  actionsVisibility?: RowActionsVisibility;
};

export function descriptionClamp(lines: number | undefined) {
  if (lines === undefined || !Number.isSafeInteger(lines) || lines < 1) return undefined;
  return { '--kraft-row-description-lines': lines } as CSSProperties;
}
