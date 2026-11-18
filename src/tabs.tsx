import { forwardRef, useCallback, useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from 'react';
import { Tooltip, TooltipProvider } from './tooltip.js';

export type TabItem = {
  id: string;
  label: string;
  content?: ReactNode;
  /** DOM IDs for linking the tab and panel. Supply both for an external panel. */
  tabId?: string;
  panelId?: string;
  /** Hides the visible label when a leading icon is supplied and uses it as a tooltip. */
  iconOnly?: boolean;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
};

export type TabsProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  /** Names the tab list. Item IDs must be unique and stable. */
  'aria-label': string;
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string, item: TabItem) => void;
  /** Use manual activation when showing a pane may take noticeable time. */
  activationMode?: 'automatic' | 'manual';
  orientation?: 'horizontal' | 'vertical';
  /** Use bare panes inside another sheet, or supply your own external panes. */
  panel?: 'paper' | 'bare' | 'external';
  /** Lets built-in panes use the available height and scroll independently of the strip. */
  fill?: boolean;
};

type ScrollEdges = 'start' | 'end' | 'both';

// A disabled tab's hover wrapper stays presentational so the tablist owns only tabs.
const DisabledTabTooltipAnchor = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(
  function DisabledTabTooltipAnchor({ 'aria-describedby': _description, ...props }, ref) {
    return <span {...props} ref={ref} className="kraft-tab-tooltip-anchor" />;
  },
);

/** A paper tab strip and its panes, with one tab stop and linked ARIA relationships. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs({
  items, value, defaultValue, onValueChange, activationMode = 'automatic', orientation = 'horizontal',
  panel = 'paper', fill = false, className, 'aria-label': ariaLabel, ...props
}, ref) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [scrollEdges, setScrollEdges] = useState<ScrollEdges>();
  const [tooltipHost, setTooltipHost] = useState<HTMLDivElement | null>(null);
  const prefix = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter(item => !item.disabled);
  const requested = value === undefined ? localValue : value;
  const selected = enabled.find(item => item.id === requested) ?? enabled[0];
  const activeId = enabled.some(item => item.id === focusedId) ? focusedId : selected?.id;
  const tabs = items.map((item, index) => ({
    item,
    tabId: item.tabId ?? `${prefix}-tab-${index}`,
    panelId: item.panelId ?? (panel === 'external' ? undefined : `${prefix}-panel-${index}`),
    descriptionId: item.description ? `${prefix}-description-${index}` : undefined,
    iconOnly: item.iconOnly && item.leading != null,
  }));

  const updateScrollEdges = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const vertical = orientation === 'vertical';
    const offset = vertical ? scroll.scrollTop : Math.abs(scroll.scrollLeft);
    const range = vertical ? scroll.scrollHeight - scroll.clientHeight : scroll.scrollWidth - scroll.clientWidth;
    const moreAtStart = range > 1 && offset > 1;
    const moreAtEnd = range - offset > 1;
    setScrollEdges(moreAtStart ? (moreAtEnd ? 'both' : 'start') : moreAtEnd ? 'end' : undefined);
  }, [orientation]);

  useEffect(() => {
    const scroll = scrollRef.current;
    const list = listRef.current;
    if (!scroll || !list) return;
    updateScrollEdges();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateScrollEdges);
    observer.observe(scroll);
    observer.observe(list);
    return () => observer.disconnect();
  }, [updateScrollEdges]);

  function select(item: TabItem) {
    if (item.disabled || item.id === selected?.id) return;
    if (value === undefined) setLocalValue(item.id);
    onValueChange?.(item.id, item);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, item: TabItem) {
    const index = enabled.findIndex(candidate => candidate.id === item.id);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    let next: TabItem | undefined;
    if (event.key === nextKey) next = enabled[(index + 1) % enabled.length];
    else if (event.key === previousKey) next = enabled[(index - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled.at(-1);
    else return;
    event.preventDefault();
    if (next) tabRefs.current.get(next.id)?.focus();
  }

  return <div {...props} ref={ref} className={className ? `kraft-tabs ${className}` : 'kraft-tabs'}
    data-orientation={orientation} data-panel={panel} data-fill={fill && panel !== 'external' ? true : undefined}>
    <div className="kraft-tab-strip" ref={tabs.some(tab => tab.iconOnly) ? setTooltipHost : undefined}
      data-scroll-start={scrollEdges === 'start' || scrollEdges === 'both' || undefined}
      data-scroll-end={scrollEdges === 'end' || scrollEdges === 'both' || undefined}>
      <div className="kraft-tab-scroll" ref={scrollRef} tabIndex={-1} onScroll={updateScrollEdges}>
        <div ref={listRef} role="tablist" aria-label={ariaLabel} aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
          className="kraft-tab-list" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedId(null); }}>
          <TooltipProvider>
            {tabs.map(({ item, tabId, panelId, descriptionId, iconOnly }) => {
              const trigger = <button key={item.id} ref={node => { if (node) tabRefs.current.set(item.id, node); else tabRefs.current.delete(item.id); }}
                type="button" role="tab" id={tabId} aria-controls={panelId} aria-selected={selected?.id === item.id}
                aria-describedby={descriptionId}
                tabIndex={activeId === item.id && !item.disabled ? 0 : -1} disabled={item.disabled}
                className="kraft-tab" data-icon-only={iconOnly || undefined}
                onFocus={() => { setFocusedId(item.id); if (activationMode === 'automatic') select(item); }}
                onClick={() => select(item)} onKeyDown={event => onTabKeyDown(event, item)}>
                {item.leading != null && <span className="kraft-tab-leading" aria-hidden="true">{item.leading}</span>}
                <span className="kraft-tab-copy">
                  <span className={iconOnly ? 'kraft-visually-hidden' : 'kraft-tab-label'}>{item.label}</span>
                  {descriptionId && <span id={descriptionId} className="kraft-tab-description" aria-hidden="true">{item.description}</span>}
                </span>
                {item.trailing != null && <> <span className="kraft-tab-trailing">{item.trailing}</span></>}
              </button>;
              if (!iconOnly) return trigger;
              const anchor = item.disabled ? <DisabledTabTooltipAnchor>{trigger}</DisabledTabTooltipAnchor> : trigger;
              return <Tooltip key={item.id} trigger={anchor} content={item.label} portalContainer={tooltipHost ?? undefined} />;
            })}
          </TooltipProvider>
        </div>
      </div>
    </div>
    {panel !== 'external' && tabs.map(({ item, tabId, panelId }) => <div key={item.id} id={panelId} role="tabpanel"
      aria-labelledby={tabId} tabIndex={0} hidden={selected?.id !== item.id}
      className="kraft-tab-panel">{item.content}</div>)}
  </div>;
});
