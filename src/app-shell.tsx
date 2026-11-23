import { forwardRef, useEffect, useId, useRef, useState, type AriaAttributes, type FocusEvent, type KeyboardEvent, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import type { PolymorphicComponent } from './primitives.js';
import type { CardTone } from './card.js';
import { Tooltip, TooltipProvider } from './tooltip.js';
import { ScrollRegion } from './scroll-region.js';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

export type RailTileProps = {
  /** Accessible name and tooltip text. */
  label: string;
  /** Icon glyph, usually an `Icon`. Decorative; hidden from assistive technology. */
  children: ReactNode;
  tone?: CardTone;
  /** Sets `aria-current="page"` and presses the tile flat. A caller's `aria-current` wins. */
  current?: boolean;
  /** Count badge. Hidden when not a positive number; shows "99+" above 99. */
  count?: number;
  /** Appended to the accessible name when the count shows. */
  countLabel?: (count: number) => string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
};

const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Reads the CSS result once per event: the narrow toggle is only rendered by the container query. */
const isRendered = (el: HTMLElement) => typeof el.checkVisibility === 'function' ? el.checkVisibility() : el.getClientRects().length > 0;

/** `false` from `cond && <X />` counts as absent, like null and undefined. */
const present = (node: ReactNode) => node !== undefined && node !== null && node !== false;

const defaultCountLabel = (count: number) => `${count} new`;

type RailTileInnerProps = RailTileProps & { as?: ElementType; className?: string; 'aria-current'?: AriaAttributes['aria-current'] };

/** A 44px navigation card tile for the AppShell rail. Polymorphic through `as`; defaults to `<a>`. */
export const RailTile = forwardRef<HTMLElement, RailTileInnerProps>(function RailTile({
  as: Tag = 'a', label, children, tone = 'neutral', current, count, countLabel = defaultCountLabel, tooltipSide = 'right',
  className, 'aria-current': ariaCurrent, ...props
}, ref) {
  const shown = typeof count === 'number' && Number.isFinite(count) && count > 0 ? Math.floor(count) : undefined;
  const tile = <Tag {...props} ref={ref} className={cx('kraft-rail-tile', className)} data-tone={tone}
    aria-current={ariaCurrent ?? (current ? 'page' : undefined)}>
    <span className="kraft-rail-tile-glyph" aria-hidden="true">{children}</span>
    <span className="kraft-visually-hidden">{shown === undefined ? label : `${label}, ${countLabel(shown)}`}</span>
    {shown !== undefined && <span className="kraft-rail-tile-count" aria-hidden="true"><span className="kraft-rail-tile-count-label">{shown > 99 ? '99+' : shown}</span></span>}
  </Tag>;
  return <Tooltip trigger={tile} content={label} side={tooltipSide} />;
}) as unknown as PolymorphicComponent<RailTileProps, 'a'>;

type AppShellBoardProps =
  | { board?: undefined; boardLabel?: never; boardOpen?: never; defaultBoardOpen?: never; onBoardOpenChange?: never; boardToggleLabel?: never; boardCloseLabel?: never }
  | {
    /** Optional cardboard board, rendered in an `<aside>`. */
    board: ReactNode;
    /** Names the board landmark and its scroll region. */
    boardLabel: string;
    /** Narrow layouts only: whether the board is shown. */
    boardOpen?: boolean;
    defaultBoardOpen?: boolean;
    onBoardOpenChange?: (open: boolean) => void;
    /** Defaults to "Show {boardLabel}". */
    boardToggleLabel?: string;
    /** Defaults to "Close {boardLabel}". */
    boardCloseLabel?: string;
  };

export type AppShellProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & AppShellBoardProps & {
  /** Rail content, usually a list of RailTiles. Rendered in a `<nav>`. */
  rail: ReactNode;
  /** Names the rail navigation landmark. */
  railLabel?: string;
  /** Content at the foot of the rail. */
  railFooter?: ReactNode;
  /** Optional top bar, rendered in a `<header>`. */
  topBar?: ReactNode;
  /** Fixed head of the sheet; it does not scroll. */
  sheetHead?: ReactNode;
  /** Names the sheet's scroll region when it overflows. */
  sheetLabel?: string;
  /** Sheet body; scrolls on its own. Rendered in `<main>`. */
  children?: ReactNode;
};

/** The diorama page layout: a rail of tiles, an optional top bar and board, and one paper sheet filling the viewport. */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell({
  rail, railLabel = 'Main', railFooter, topBar, board, boardLabel, boardOpen, defaultBoardOpen, onBoardOpenChange,
  boardToggleLabel, boardCloseLabel, sheetHead, sheetLabel, children, className, ...props
}, ref) {
  const hasBoard = present(board);
  const hasHead = present(sheetHead);
  const boardId = useId();
  const headId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(blurTimer.current), []);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const boardRef = useRef<HTMLElement>(null);
  const openedByUser = useRef(false);
  const [localOpen, setLocalOpen] = useState(defaultBoardOpen ?? false);
  const open = hasBoard && (boardOpen ?? localOpen);
  const setOpen = (next: boolean) => {
    if (boardOpen === undefined) setLocalOpen(next);
    onBoardOpenChange?.(next);
  };

  useEffect(() => {
    if (!open || !openedByUser.current) return;
    openedByUser.current = false;
    const body = boardRef.current?.querySelector<HTMLElement>('.kraft-app-board-body');
    const first = body?.querySelector<HTMLElement>(focusable) ?? boardRef.current?.querySelector<HTMLElement>('.kraft-app-board-close');
    first?.focus();
  }, [open]);

  const close = () => {
    openedByUser.current = false;
    setOpen(false);
    toggleRef.current?.focus();
  };
  const onBoardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || event.defaultPrevented || !open || !toggleRef.current || !isRendered(toggleRef.current)) return;
    event.stopPropagation();
    close();
  };
  // A narrow board lies over the sheet, so it must not hide focus that moved on (WCAG 2.4.11). React focus events
  // bubble through portals, so focus inside the board's own popups cancels the pending close.
  const onBoardBlur = (event: FocusEvent<HTMLElement>) => {
    if (!open || event.relatedTarget === toggleRef.current || !toggleRef.current || !isRendered(toggleRef.current)) return;
    clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => {
      openedByUser.current = false;
      setOpen(false);
    }, 0);
  };
  const onBoardFocus = () => clearTimeout(blurTimer.current);

  return <div {...props} ref={ref} className={cx('kraft-app-shell', className)} data-board-open={open || undefined}>
    <div className="kraft-app-shell-grid" data-has-topbar={present(topBar) || undefined} data-has-board={hasBoard || undefined}>
      <nav className="kraft-app-rail" aria-label={railLabel}>
        {hasBoard && <button ref={toggleRef} type="button" className="kraft-app-board-toggle" aria-expanded={open}
          aria-controls={boardId} aria-label={boardToggleLabel ?? `Show ${boardLabel}`}
          onClick={() => { if (open) close(); else { openedByUser.current = true; setOpen(true); } }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M9.5 4.5v15" /></svg>
        </button>}
        <TooltipProvider>{rail}</TooltipProvider>
        {present(railFooter) && <div className="kraft-app-rail-footer"><TooltipProvider>{railFooter}</TooltipProvider></div>}
      </nav>
      {present(topBar) && <header className="kraft-app-topbar">{topBar}</header>}
      {hasBoard && <aside ref={boardRef} id={boardId} className="kraft-app-board" aria-label={boardLabel} onKeyDown={onBoardKeyDown}
        onBlur={onBoardBlur} onFocus={onBoardFocus}>
        <button type="button" className="kraft-overlay-close kraft-app-board-close" aria-label={boardCloseLabel ?? `Close ${boardLabel}`} onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <ScrollRegion className="kraft-app-board-body" label={boardLabel}>{board}</ScrollRegion>
      </aside>}
      <main className="kraft-app-sheet">
        {hasHead && <div id={headId} className="kraft-app-sheet-head">{sheetHead}</div>}
        <ScrollRegion className="kraft-app-sheet-body" label={sheetLabel ?? (hasHead ? undefined : 'Content')}
          labelledBy={sheetLabel === undefined && hasHead ? headId : undefined}>{children}</ScrollRegion>
      </main>
    </div>
  </div>;
});
