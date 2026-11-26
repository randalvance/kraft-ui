import { forwardRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import type { CardTone } from './card.js';
import { Badge } from './primitives.js';

export type CollapsibleGroupProps = Omit<ComponentPropsWithoutRef<'details'>, 'title' | 'open'> & {
  /** The header text. It names the disclosure. */
  title: ReactNode;
  /** A count sticker in the header. */
  count?: number;
  /** Says what the count is for assistive technology, such as "3 cards". Defaults to the number. */
  countLabel?: (count: number) => string;
  /** Tints the header. */
  tone?: CardTone;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Groups that share a name open one at a time: opening one closes the others. */
  name?: string;
  children?: ReactNode;
};

/** A native disclosure with a tinted header and a count. Hidden content stays findable with find-in-page. */
export const CollapsibleGroup = forwardRef<HTMLDetailsElement, CollapsibleGroupProps>(function CollapsibleGroup({
  title, count, countLabel, tone = 'neutral', open: openProp, defaultOpen = false, onOpenChange, onToggle, children, className, ...props
}, ref) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = openProp ?? localOpen;
  return <details {...props} ref={ref} open={open} className={className ? `kraft-collapsible ${className}` : 'kraft-collapsible'} data-tone={tone}
    onToggle={event => {
      onToggle?.(event);
      const next = event.currentTarget.open;
      if (next === open) return;
      if (openProp === undefined) setLocalOpen(next);
      // A controlled group shows the application's state until the application changes it.
      else event.currentTarget.open = open;
      onOpenChange?.(next);
    }}>
    <summary className="kraft-collapsible-summary">
      <svg className="kraft-collapsible-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6" /></svg>
      <span className="kraft-collapsible-title">{title}</span>
      {count !== undefined && <>
        {countLabel && <span className="kraft-visually-hidden">, {countLabel(count)}</span>}
        <Badge size="count" className="kraft-collapsible-count" aria-hidden={countLabel ? true : undefined}>{count}</Badge>
      </>}
    </summary>
    <div className="kraft-collapsible-body">{children}</div>
  </details>;
});
