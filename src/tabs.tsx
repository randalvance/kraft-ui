import { forwardRef, useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
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
};

/** A paper tab strip and its panes, with one tab stop and linked ARIA relationships. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs({
  items, value, defaultValue, onValueChange, activationMode = 'automatic', orientation = 'horizontal',
  className, 'aria-label': ariaLabel, ...props
}, ref) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const prefix = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter(item => !item.disabled);
  const requested = value === undefined ? localValue : value;
  const selected = enabled.find(item => item.id === requested) ?? enabled[0];
  const activeId = enabled.some(item => item.id === focusedId) ? focusedId : selected?.id;

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

  return <div {...props} ref={ref} className={className ? `kraft-tabs ${className}` : 'kraft-tabs'} data-orientation={orientation}>
    <div role="tablist" aria-label={ariaLabel} aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      className="kraft-tab-list" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedId(null); }}>
      {items.map((item, index) => {
        const tabId = `${prefix}-tab-${index}`;
        const panelId = `${prefix}-panel-${index}`;
        return <button key={item.id} ref={node => { if (node) tabRefs.current.set(item.id, node); else tabRefs.current.delete(item.id); }}
          type="button" role="tab" id={tabId} aria-controls={panelId} aria-selected={selected?.id === item.id}
          tabIndex={activeId === item.id && !item.disabled ? 0 : -1} disabled={item.disabled}
          className="kraft-tab" onFocus={() => { setFocusedId(item.id); if (activationMode === 'automatic') select(item); }}
          onClick={() => select(item)} onKeyDown={event => onTabKeyDown(event, item)}>
          {item.leading != null && <span className="kraft-tab-leading" aria-hidden="true">{item.leading}</span>}
          <span className="kraft-tab-label">{item.label}</span>
          {item.trailing != null && <> <span className="kraft-tab-trailing">{item.trailing}</span></>}
        </button>;
      })}
    </div>
    {items.map((item, index) => <div key={item.id} id={`${prefix}-panel-${index}`} role="tabpanel"
      aria-labelledby={`${prefix}-tab-${index}`} tabIndex={0} hidden={selected?.id !== item.id}
      className="kraft-tab-panel">{item.content}</div>)}
  </div>;
});
