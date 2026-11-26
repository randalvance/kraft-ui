import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { IconButton } from './primitives.js';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

const chevron = <svg className="kraft-nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6" /></svg>;

export type PagerProps = Omit<ComponentPropsWithoutRef<'nav'>, 'children'> & {
  /** Number of pages. Pages are numbered from 1. */
  pageCount: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** The visible range in words, such as "21–40 of 87". It is announced when it changes. */
  range?: ReactNode;
  /** Draws one dot per page, each a button. Suited to a handful of pages. */
  dots?: boolean;
  /** Names the navigation landmark. */
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  /** Names each page dot. Defaults to "Page 3". */
  pageLabel?: (page: number) => string;
};

/** Previous and next buttons around a range and optional page dots, in a navigation landmark. */
export const Pager = forwardRef<HTMLElement, PagerProps>(function Pager({
  pageCount, page, defaultPage = 1, onPageChange, range, dots = false, label = 'Pagination',
  previousLabel = 'Previous page', nextLabel = 'Next page', pageLabel = number => `Page ${number}`, className, ...props
}, ref) {
  const [localPage, setLocalPage] = useState(defaultPage);
  const count = Math.max(1, Math.floor(pageCount));
  const current = Math.min(count, Math.max(1, page ?? localPage));
  const go = (next: number) => {
    if (next === current || next < 1 || next > count) return;
    if (page === undefined) setLocalPage(next);
    onPageChange?.(next);
  };
  const hasRange = range != null && typeof range !== 'boolean' && range !== '';
  return <nav {...props} ref={ref} aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : label)} className={cx('kraft-pager', className)}>
    <IconButton size="sm" className="kraft-pager-previous" aria-label={previousLabel} disabled={current <= 1} onClick={() => go(current - 1)}>{chevron}</IconButton>
    {hasRange && <span className="kraft-pager-range" aria-live="polite" aria-atomic="true">{range}</span>}
    {dots && <ol className="kraft-pager-dots">
      {Array.from({ length: count }, (_, index) => <li key={index}>
        <button type="button" className="kraft-pager-dot" aria-label={pageLabel(index + 1)}
          aria-current={index + 1 === current ? 'page' : undefined} onClick={() => go(index + 1)} />
      </li>)}
    </ol>}
    <IconButton size="sm" className="kraft-pager-next" aria-label={nextLabel} disabled={current >= count} onClick={() => go(current + 1)}>{chevron}</IconButton>
  </nav>;
});

export type BreadcrumbItem = {
  /** A stable key. Defaults to the position. */
  id?: string;
  label: ReactNode;
  /** Omit for a step that is not a link, such as the current page. */
  href?: string;
  /** Marks the current page. Defaults to the last item. */
  current?: boolean;
};

export type BreadcrumbProps = Omit<ComponentPropsWithoutRef<'nav'>, 'children'> & {
  items: BreadcrumbItem[];
  /** Names the navigation landmark. */
  label?: string;
  /** Renders each link, for example a router link. It receives `href`, `className`, `aria-current`, and `children`. */
  linkAs?: ElementType;
};

/** The trail of pages above the current one, as an ordered list in a navigation landmark. */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb({
  items, label = 'Breadcrumb', linkAs: LinkTag = 'a', className, ...props
}, ref) {
  const marked = items.some(item => item.current);
  return <nav {...props} ref={ref} aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : label)} className={cx('kraft-breadcrumb', className)}>
    <ol className="kraft-breadcrumb-list">
      {items.map((item, index) => {
        const current = marked ? item.current === true : index === items.length - 1;
        return <li key={item.id ?? index} className="kraft-breadcrumb-item">
          {index > 0 && <span className="kraft-breadcrumb-separator" aria-hidden="true">{chevron}</span>}
          {item.href !== undefined
            ? <LinkTag href={item.href} className="kraft-link kraft-breadcrumb-link" data-underline="hover" aria-current={current ? 'page' : undefined}>{item.label}</LinkTag>
            : <span className="kraft-breadcrumb-page" aria-current={current ? 'page' : undefined}>{item.label}</span>}
        </li>;
      })}
    </ol>
  </nav>;
});

const toolbarItems = 'button, a[href], input, select, textarea, [tabindex]';
const textEntry = 'input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"]), textarea, select, [contenteditable]';

export type ToolbarProps = Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'aria-orientation'> & {
  /** Names the toolbar. */
  label: string;
};

/**
 * A strip of grouped actions. It is one tab stop: the arrow keys, Home, and End move between its controls,
 * and Tab returns to the control used last.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar({ label, className, onKeyDown, onFocus, ...props }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);
  const active = useRef<HTMLElement | null>(null);
  const controls = () => {
    const root = rootRef.current;
    return root ? [...root.querySelectorAll<HTMLElement>(toolbarItems)].filter(control =>
      control.closest('[role="toolbar"]') === root && !control.matches(':disabled, [aria-disabled="true"], [type="hidden"]')) : [];
  };
  // Controls come from the application, so the roving tab stop is kept on the elements themselves.
  const sync = () => {
    const all = controls();
    if (!active.current || !all.includes(active.current)) active.current = all[0] ?? null;
    for (const control of all) control.tabIndex = control === active.current ? 0 : -1;
  };
  useEffect(sync);
  // A control can disable itself or leave without the toolbar rendering again, which must not strand the tab stop.
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(sync);
    observer.observe(rootRef.current!, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
    return () => observer.disconnect();
  }, []);

  return <div {...props} ref={rootRef} role="toolbar" aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : label)}
    aria-orientation="horizontal" className={cx('kraft-toolbar', className)}
    onFocus={event => {
      onFocus?.(event);
      const control = (event.target as HTMLElement).closest<HTMLElement>(toolbarItems);
      if (!control || !controls().includes(control)) return;
      active.current = control;
      sync();
    }}
    onKeyDown={event => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement;
      if (target.matches(textEntry)) return;
      const all = controls();
      const index = all.indexOf(target.closest<HTMLElement>(toolbarItems)!);
      if (index < 0) return;
      const forward = getComputedStyle(event.currentTarget).direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const backward = forward === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
      const next = event.key === forward ? all[(index + 1) % all.length]
        : event.key === backward ? all[(index - 1 + all.length) % all.length]
        : event.key === 'Home' ? all[0]
        : event.key === 'End' ? all[all.length - 1]
        : undefined;
      if (!next) return;
      event.preventDefault();
      next.focus();
    }} />;
});

export type ToolbarGroupProps = ComponentPropsWithoutRef<'div'> & {
  /** `end` pushes this group and those after it to the far end of the toolbar. */
  align?: 'start' | 'end';
  /** Names the group. */
  label?: string;
};

/** A cluster of related toolbar controls. A dashed rule separates neighbouring groups. */
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(function ToolbarGroup({ align = 'start', label, className, ...props }, ref) {
  return <div role="group" aria-label={label} {...props} ref={ref} className={cx('kraft-toolbar-group', className)} data-align={align} />;
});
