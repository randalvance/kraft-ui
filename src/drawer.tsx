import { forwardRef, useCallback, useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ScrollRegion } from './scroll-region.js';

export type DrawerProps = Omit<ComponentPropsWithoutRef<'aside'>, 'title'> & {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  /** A tag or stamp displayed above the title. */
  eyebrow?: ReactNode;
  /** Controls displayed beside the close button. */
  actions?: ReactNode;
  footer?: ReactNode;
  footerPlacement?: 'fixed' | 'scroll';
  closeLabel?: string;
  /** Omit to hide the close button. */
  onClose?: () => void;
};

/** A titled paper side sheet. The surrounding layout owns whether it is shown. */
export const Drawer = forwardRef<HTMLElement, DrawerProps>(function Drawer({
  title, description, leading, eyebrow, actions, footer, footerPlacement = 'fixed', closeLabel = 'Close panel', onClose, children,
  className, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, ...props
}, ref) {
  const id = useId();
  const hasDescription = description != null && typeof description !== 'boolean' && description !== '';
  const footerContent = footer != null && <div className="kraft-drawer-footer">{footer}</div>;
  const headingId = labelledBy ?? (ariaLabel ? undefined : `${id}-title`);
  return <aside {...props} ref={ref} className={className ? `kraft-drawer ${className}` : 'kraft-drawer'}
    aria-label={ariaLabel} aria-labelledby={headingId}
    aria-describedby={[describedBy, hasDescription ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined}>
    <div className="kraft-drawer-header">
      <div className="kraft-drawer-header-row">
        {leading != null && <span className="kraft-drawer-leading" aria-hidden="true">{leading}</span>}
        <div className="kraft-drawer-heading">
          {eyebrow != null && <div className="kraft-drawer-eyebrow">{eyebrow}</div>}
          <h2 id={`${id}-title`} className="kraft-drawer-title">{title}</h2>
        </div>
        {(actions != null || onClose) && <div className="kraft-drawer-actions">
          {actions}
          {onClose && <button type="button" className="kraft-overlay-close" aria-label={closeLabel} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>}
        </div>}
      </div>
      {hasDescription && <div id={`${id}-description`} className="kraft-drawer-description">{description}</div>}
    </div>
    <ScrollRegion className="kraft-drawer-scroll" label={ariaLabel} labelledBy={headingId}>
      <div className="kraft-drawer-body">{children}</div>
      {footerPlacement === 'scroll' && footerContent}
    </ScrollRegion>
    {footerPlacement === 'fixed' && footerContent}
  </aside>;
});

export type ResizablePaneProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  main: ReactNode;
  pane: ReactNode;
  open?: boolean;
  side?: 'start' | 'end';
  size?: number;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  onSizeChange?: (size: number) => void;
  resizeLabel?: string;
  mainLabel?: string;
  paneLabel?: string;
};

type Drag = { pointerId: number; x: number; size: number };

/** A split layout whose side pane can be resized by pointer or keyboard. Sizes are CSS pixels. */
export const ResizablePane = forwardRef<HTMLDivElement, ResizablePaneProps>(function ResizablePane({
  main, pane, open = true, side = 'end', size, defaultSize = 360, minSize = 240, maxSize = 720,
  onSizeChange, resizeLabel = 'Resize side pane', mainLabel = 'Main pane', paneLabel = 'Side pane', className, style, ...props
}, ref) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const paneId = useId();
  const dragRef = useRef<Drag | null>(null);
  const [localSize, setLocalSize] = useState(defaultSize);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const currentSize = size ?? localSize;
  const setRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') return ref(node);
    if (ref) ref.current = node;
  }, [ref]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => setContainerWidth(root.clientWidth);
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(root);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const reservedWidth = 184; // 160px of main content plus the 24px divider.
  const high = Math.max(0, Math.floor(Math.min(maxSize, containerWidth ? containerWidth - reservedWidth : maxSize)));
  const low = Math.max(0, Math.ceil(Math.min(minSize, high)));
  const displayedSize = clampSize(currentSize);

  function clampSize(next: number) {
    return Math.max(low, Math.min(high, Math.round(next)));
  }

  function changeSize(next: number) {
    const clamped = clampSize(next);
    if (clamped === displayedSize) return;
    if (size === undefined) setLocalSize(clamped);
    onSizeChange?.(clamped);
  }

  function sideSign() {
    const rtl = rootRef.current && getComputedStyle(rootRef.current).direction === 'rtl';
    return (side === 'end') !== rtl ? -1 : 1;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, size: displayedSize };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    changeSize(drag.size + (event.clientX - drag.x) * sideSign());
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next: number;
    if (event.key === 'Home') next = low;
    else if (event.key === 'End') next = high;
    else if (event.key === 'ArrowRight') next = displayedSize + 16 * sideSign();
    else if (event.key === 'ArrowLeft') next = displayedSize - 16 * sideSign();
    else return;
    event.preventDefault();
    changeSize(next);
  }

  const paneStyle = { '--kraft-pane-size': `${displayedSize}px` } as React.CSSProperties;
  const mainPane = <ScrollRegion key="main" className="kraft-pane-main" label={mainLabel}>{main}</ScrollRegion>;
  const sidePane = open && <ScrollRegion key="side" id={paneId} className="kraft-pane-side" label={paneLabel}>{pane}</ScrollRegion>;
  const separator = open && <div key="separator" className="kraft-pane-separator" role="separator" tabIndex={0}
    aria-label={resizeLabel} aria-orientation="vertical" aria-controls={paneId}
    aria-valuemin={low} aria-valuemax={high} aria-valuenow={displayedSize}
    onPointerDown={onPointerDown} onPointerMove={onPointerMove}
    onLostPointerCapture={event => { if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null; }}
    onKeyDown={onKeyDown} />;
  return <div {...props} ref={setRef}
    className={className ? `kraft-resizable-pane ${className}` : 'kraft-resizable-pane'}
    data-side={side} data-open={open} style={{ ...paneStyle, ...style }}>
    {side === 'start' ? [sidePane, separator, mainPane] : [mainPane, separator, sidePane]}
  </div>;
});
