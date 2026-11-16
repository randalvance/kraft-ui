import { forwardRef, useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

export type DrawerProps = Omit<ComponentPropsWithoutRef<'aside'>, 'title'> & {
  title: string;
  description?: string;
  leading?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  onClose: () => void;
};

/** A titled paper side sheet. The surrounding layout owns whether it is shown. */
export const Drawer = forwardRef<HTMLElement, DrawerProps>(function Drawer({
  title, description, leading, footer, closeLabel = 'Close panel', onClose, children,
  className, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, ...props
}, ref) {
  const id = useId();
  return <aside {...props} ref={ref} className={className ? `kraft-drawer ${className}` : 'kraft-drawer'}
    aria-label={ariaLabel} aria-labelledby={labelledBy ?? (ariaLabel ? undefined : `${id}-title`)}
    aria-describedby={[describedBy, description ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined}>
    <div className="kraft-drawer-header">
      {leading != null && <span className="kraft-drawer-leading" aria-hidden="true">{leading}</span>}
      <div className="kraft-drawer-heading"><h2 id={`${id}-title`} className="kraft-drawer-title">{title}</h2>
        {description && <p id={`${id}-description`} className="kraft-drawer-description">{description}</p>}
      </div>
      <button type="button" className="kraft-overlay-close" aria-label={closeLabel} onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>
    <div className="kraft-drawer-body">{children}</div>
    {footer != null && <div className="kraft-drawer-footer">{footer}</div>}
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
};

type Drag = { pointerId: number; x: number; size: number };

/** A split layout whose side pane can be resized by pointer or keyboard. Sizes are CSS pixels. */
export const ResizablePane = forwardRef<HTMLDivElement, ResizablePaneProps>(function ResizablePane({
  main, pane, open = true, side = 'end', size, defaultSize = 360, minSize = 240, maxSize = 720,
  onSizeChange, resizeLabel = 'Resize side pane', className, style, ...props
}, ref) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const [localSize, setLocalSize] = useState(defaultSize);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const currentSize = size ?? localSize;

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

  function bounds() {
    const available = Math.max(0, (rootRef.current?.clientWidth || containerWidth || maxSize + 160) - 160);
    const high = Math.min(maxSize, available);
    return { low: Math.min(minSize, high), high };
  }

  function changeSize(next: number) {
    const { low, high } = bounds();
    const clamped = Math.round(Math.max(low, Math.min(high, next)));
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
    const { low, high } = bounds();
    let next: number;
    if (event.key === 'Home') next = low;
    else if (event.key === 'End') next = high;
    else if (event.key === 'ArrowRight') next = displayedSize + 16 * sideSign();
    else if (event.key === 'ArrowLeft') next = displayedSize - 16 * sideSign();
    else return;
    event.preventDefault();
    changeSize(next);
  }

  const { low, high } = bounds();
  const displayedSize = Math.round(Math.max(low, Math.min(high, currentSize)));
  const paneStyle = { '--kraft-pane-size': `${displayedSize}px` } as React.CSSProperties;
  return <div {...props} ref={node => { rootRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
    className={className ? `kraft-resizable-pane ${className}` : 'kraft-resizable-pane'}
    data-side={side} data-open={open} style={{ ...paneStyle, ...style }}>
    <div className="kraft-pane-main">{main}</div>
    {open && <>
      <div className="kraft-pane-separator" role="separator" tabIndex={0} aria-label={resizeLabel} aria-orientation="vertical"
        aria-valuemin={low} aria-valuemax={high} aria-valuenow={displayedSize}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={event => { if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }} onKeyDown={onKeyDown} />
      <div className="kraft-pane-side">{pane}</div>
    </>}
  </div>;
});
