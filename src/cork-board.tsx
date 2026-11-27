import {
  forwardRef, useCallback, useEffect, useId, useRef, useState,
  type ComponentPropsWithoutRef, type CSSProperties, type ForwardedRef, type KeyboardEvent, type ReactNode,
} from 'react';
import { Pin, type PinTone } from './material-marks.js';
import { Surface } from './primitives.js';

export type CorkBoardLayout = 'grid' | 'free' | 'columns';

export type CorkBoardProps = ComponentPropsWithoutRef<'div'> & {
  as?: 'div' | 'section';
  /** `grid` flows items, `free` places `CorkBoardItem`s by coordinates, `columns` lines up `CorkBoardColumn`s. */
  layout?: CorkBoardLayout;
  /** Fixed height of the scrolling cork. A free board needs one. */
  height?: number | string;
  /** Tallest the cork grows before it scrolls. */
  maxHeight?: number | string;
  /** Narrowest grid cell, and the width of a free item, in pixels. */
  minItemWidth?: number;
  /** Names the cork while it scrolls and is a keyboard stop. */
  scrollLabel?: string;
};

/** Cork in a wooden frame. Native props and the ref reach the frame. */
export const CorkBoard = forwardRef<HTMLElement, CorkBoardProps>(function CorkBoard({
  as: Tag = 'div', layout = 'grid', height, maxHeight, minItemWidth, scrollLabel = 'Scrollable board',
  className, children, ...props
}, ref) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  // Runs after every render: moving a free item changes the overflow without resizing the body.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const update = () => setScrollable(body.scrollHeight > body.clientHeight || body.scrollWidth > body.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(body);
    return () => observer.disconnect();
  });

  return <Tag {...props} ref={ref as ForwardedRef<HTMLDivElement>}
    className={className ? `kraft-cork-board ${className}` : 'kraft-cork-board'} data-layout={layout}>
    <div ref={bodyRef} className="kraft-cork-board-body"
      style={{
        blockSize: height, maxBlockSize: maxHeight,
        '--kraft-cork-board-item-width': minItemWidth === undefined ? undefined : `${minItemWidth}px`,
      } as CSSProperties}
      tabIndex={scrollable ? 0 : undefined} role={scrollable ? 'region' : undefined}
      aria-label={scrollable ? scrollLabel : undefined}>
      {children}
    </div>
  </Tag>;
});

export type CorkBoardPosition = { x: number; y: number };

type ItemBase = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children?: ReactNode;
  /** A `Pin` drawn over the top edge. */
  pin?: ReactNode;
  /** Pixels from the left edge of a free board. */
  x?: number;
  /** Pixels from the top edge of a free board. */
  y?: number;
  /** Stacking order on a free board. Higher sits in front. */
  z?: number;
  /** Pixels per arrow-key press. Shift moves five steps. */
  step?: number;
};
type FixedItemProps = ItemBase & { label?: string; onMove?: undefined };
type MovableItemProps = ItemBase & {
  /** Names the item for keyboard and screen reader users. */
  label: string;
  /** Called with the next position when an arrow key is pressed. Makes the item a tab stop. */
  onMove: (position: CorkBoardPosition) => void;
};

export type CorkBoardItemProps = FixedItemProps | MovableItemProps;

const arrows: Record<string, readonly [number, number]> = {
  ArrowUp: [0, -1], ArrowRight: [1, 0], ArrowDown: [0, 1], ArrowLeft: [-1, 0],
};

/** One pinned thing on a `CorkBoard`. Give it `onMove` to let the arrow keys move it. */
export const CorkBoardItem = forwardRef<HTMLDivElement, CorkBoardItemProps>(function CorkBoardItem({
  pin, x, y, z, step = 8, label, onMove, className, style, children, onKeyDown, ...props
}, ref) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const setRef = useCallback((node: HTMLDivElement | null) => {
    itemRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  // Keep a keyboard-moved item in view as it travels across a scrolling board.
  useEffect(() => {
    const item = itemRef.current;
    if (item && item === document.activeElement) item.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [x, y]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const direction = arrows[event.key];
    if (!onMove || !direction || event.defaultPrevented || event.target !== event.currentTarget
      || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const distance = event.shiftKey ? step * 5 : step;
    const from = { x: x ?? 0, y: y ?? 0 };
    const to = { x: Math.max(0, from.x + direction[0] * distance), y: Math.max(0, from.y + direction[1] * distance) };
    if (to.x !== from.x || to.y !== from.y) onMove(to);
  };

  return <div {...props} ref={setRef}
    className={className ? `kraft-cork-board-item ${className}` : 'kraft-cork-board-item'}
    style={{
      ...style,
      '--kraft-cork-board-item-x': x === undefined ? undefined : `${x}px`,
      '--kraft-cork-board-item-y': y === undefined ? undefined : `${y}px`,
      '--kraft-cork-board-item-z': z,
    } as CSSProperties}
    {...(onMove
      ? { tabIndex: props.tabIndex ?? 0, role: props.role ?? 'group', 'aria-label': label, 'aria-keyshortcuts': 'ArrowUp ArrowRight ArrowDown ArrowLeft' }
      : label ? { 'aria-label': label } : undefined)}
    onKeyDown={handleKeyDown}>
    {children}
    {pin != null && <span className="kraft-cork-board-item-pin">{pin}</span>}
  </div>;
});

export type CorkBoardColumnProps = Omit<ComponentPropsWithoutRef<'section'>, 'title'> & {
  /** The column's visible name, which also names its region. */
  name: ReactNode;
  /** How many things the column holds. */
  count?: number;
  /** What screen readers hear instead of the bare count, for example "3 notes". */
  countLabel?: string;
  /** Level of the name's heading. Match the page outline: 2 (default) directly under the page `h1`, 3 under an `h2`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  pinTone?: PinTone;
};

/** A Kanban column: a pinned kraft header with a name and count above a stack of items. */
export const CorkBoardColumn = forwardRef<HTMLElement, CorkBoardColumnProps>(function CorkBoardColumn({
  name, count, countLabel, headingLevel = 2, pinTone, className, children,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, ...props
}, ref) {
  const nameId = `${useId()}-name`;
  const Name = `h${headingLevel}` as const;
  return <section {...props} ref={ref} aria-label={ariaLabel}
    aria-labelledby={labelledBy ?? (ariaLabel ? undefined : nameId)}
    className={className ? `kraft-cork-board-column ${className}` : 'kraft-cork-board-column'}>
    <Surface as="header" material="kraft" padding={8} className="kraft-cork-board-column-header">
      <Pin tone={pinTone} />
      <Name id={nameId} className="kraft-cork-board-column-name">{name}</Name>
      {count !== undefined && <span className="kraft-cork-board-column-count">
        {countLabel
          ? <><span aria-hidden="true">{count}</span><span className="kraft-visually-hidden">{countLabel}</span></>
          : count}
      </span>}
    </Surface>
    <div className="kraft-cork-board-column-items">{children}</div>
  </section>;
});
