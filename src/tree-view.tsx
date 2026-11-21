import { forwardRef, useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from 'react';
import { descriptionClamp, type RowContentOptions, type RowDensity } from './row-options.js';

export type TreeBranchStyle = 'board' | 'plain';

export type TreeNode = RowContentOptions & {
  id: string;
  /** Optional typeahead text for a rich label. Defaults to the rendered label text. */
  textValue?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  /** Branches only expand by default. Set this to true to make a branch selectable too. */
  selectable?: boolean;
  children?: readonly TreeNode[];
};

export type TreeViewProps = Omit<ComponentPropsWithoutRef<'ul'>, 'children' | 'onSelect'> & {
  /** A name for the tree as a whole. Item labels must be unique enough to distinguish them. */
  'aria-label': string;
  items: readonly TreeNode[];
  density?: RowDensity;
  branchStyle?: TreeBranchStyle;
  selectionMode?: 'none' | 'single';
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectionChange?: (id: string, item: TreeNode) => void;
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  onExpandedChange?: (ids: readonly string[]) => void;
};

type VisibleItem = { item: TreeNode; parentId: string | null; depth: number; position: number; setSize: number };

function visibleItems(items: readonly TreeNode[], expanded: ReadonlySet<string>, parentId: string | null = null, depth = 0): VisibleItem[] {
  return items.flatMap((item, index) => [
    { item, parentId, depth, position: index + 1, setSize: items.length },
    ...(item.children?.length && expanded.has(item.id) ? visibleItems(item.children, expanded, item.id, depth + 1) : []),
  ]);
}

/** A tree with roving treeitem focus and optional row actions. */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView({
  items, density = 'default', branchStyle = 'board', selectionMode = 'single', selectedId, defaultSelectedId = null, onSelectionChange,
  expandedIds, defaultExpandedIds = [], onExpandedChange, className, ...props
}, forwardedRef) {
  const [localSelected, setLocalSelected] = useState<string | null>(defaultSelectedId);
  const [localExpanded, setLocalExpanded] = useState<readonly string[]>(defaultExpandedIds);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const idPrefix = useId();
  const refs = useRef(new Map<string, HTMLDivElement>());
  const search = useRef({ value: '', timer: 0 });
  const selected = selectedId === undefined ? localSelected : selectedId;
  const expanded = new Set(expandedIds === undefined ? localExpanded : expandedIds);
  const visible = visibleItems(items, expanded);
  const enabled = visible.filter(({ item }) => !item.disabled);
  const activeId = enabled.some(({ item }) => item.id === focusedId) ? focusedId
    : enabled.some(({ item }) => item.id === selected) ? selected : enabled[0]?.item.id ?? null;

  function focus(id: string) {
    setFocusedId(id);
    refs.current.get(id)?.focus();
  }

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    const ids = [...next];
    if (expandedIds === undefined) setLocalExpanded(ids);
    onExpandedChange?.(ids);
  }

  function isSelectable(item: TreeNode) {
    return selectionMode === 'single' && (item.selectable ?? !item.children?.length);
  }

  function select(item: TreeNode) {
    if (item.disabled || !isSelectable(item)) return;
    if (selectedId === undefined) setLocalSelected(item.id);
    onSelectionChange?.(item.id, item);
  }

  function activate(item: TreeNode) {
    if (item.disabled) return;
    select(item);
    if (item.children?.length) toggle(item.id);
  }

  function onItemKeyDown(event: KeyboardEvent<HTMLDivElement>, current: VisibleItem) {
    if (event.target !== event.currentTarget || current.item.disabled) return;
    const index = enabled.findIndex(({ item }) => item.id === current.item.id);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const expandKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const collapseKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    let next: string | undefined;
    if (event.key === 'ArrowDown') next = enabled[index + 1]?.item.id;
    else if (event.key === 'ArrowUp') next = enabled[index - 1]?.item.id;
    else if (event.key === 'Home') next = enabled[0]?.item.id;
    else if (event.key === 'End') next = enabled.at(-1)?.item.id;
    else if (event.key === expandKey) {
      if (current.item.children?.length && !expanded.has(current.item.id)) toggle(current.item.id);
      else if (current.item.children?.length) next = current.item.children.find(child => !child.disabled)?.id;
    } else if (event.key === collapseKey) {
      if (current.item.children?.length && expanded.has(current.item.id)) toggle(current.item.id);
      else next = current.parentId ?? undefined;
    } else if (event.key === 'Enter' || event.key === ' ') activate(current.item);
    else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      clearTimeout(search.current.timer);
      search.current.value += event.key.toLocaleLowerCase();
      search.current.timer = window.setTimeout(() => { search.current.value = ''; }, 500);
      const ordered = [...enabled.slice(index + 1), ...enabled.slice(0, index + 1)];
      next = ordered.find(({ item }) => {
        const text = item.textValue ?? (typeof item.label === 'string'
          ? item.label : refs.current.get(item.id)?.querySelector('.kraft-tree-label')?.textContent);
        return text?.trim().toLocaleLowerCase().startsWith(search.current.value);
      })?.item.id;
    } else return;
    event.preventDefault();
    if (next) focus(next);
  }

  function render(itemsAtLevel: readonly TreeNode[], depth: number, parentId: string | null, path: readonly number[]): ReactNode {
    return itemsAtLevel.map((item, index) => {
      const branch = Boolean(item.children?.length);
      const selectable = isSelectable(item);
      const clamp = descriptionClamp(item.clampDescription);
      const current = { item, parentId, depth, position: index + 1, setSize: itemsAtLevel.length };
      const groupId = `${idPrefix}-${[...path, index].join('-')}-group`;
      const rowId = `${idPrefix}-${[...path, index].join('-')}-row`;
      return <li key={item.id} role="none" className="kraft-tree-wrapper">
        <div ref={node => { if (node) refs.current.set(item.id, node); else refs.current.delete(item.id); }}
        role="treeitem" tabIndex={item.id === activeId ? 0 : -1} aria-labelledby={rowId}
        aria-level={depth + 1} aria-posinset={current.position} aria-setsize={current.setSize}
        aria-expanded={branch ? expanded.has(item.id) : undefined}
        aria-owns={branch && expanded.has(item.id) ? groupId : undefined}
        aria-selected={selectable ? selected === item.id : undefined}
        aria-disabled={item.disabled || undefined}
        className="kraft-tree-item" data-branch={branch || undefined} data-done={item.done || undefined}
        data-activatable={branch || selectable || undefined}
        onFocus={event => { if (event.target === event.currentTarget) setFocusedId(item.id); }}
        onKeyDown={event => onItemKeyDown(event, current)}
        onClick={event => {
          if (item.disabled || (event.target instanceof Element &&
            (event.target.closest('[role="treeitem"]') !== event.currentTarget || event.target.closest('.kraft-tree-actions')))) return;
          focus(item.id);
          activate(item);
        }}>
        <span className="kraft-tree-row">
          <span id={rowId} className="kraft-tree-main">
            <span className="kraft-tree-chevron" aria-hidden="true">{branch && <svg viewBox="0 0 20 20" fill="none"><path d="m7 4 6 6-6 6" /></svg>}</span>
            {item.leading != null && <span className="kraft-tree-leading" aria-hidden="true">{item.leading}</span>}
            <span className="kraft-tree-content"><span className="kraft-tree-label" data-truncate={item.truncateLabel || undefined}>{item.label}</span>
              {item.description != null && item.description !== '' && <> <span className="kraft-tree-description" style={clamp} data-clamp={clamp ? true : undefined}>{item.description}</span></>}
            </span>
            {item.trailing != null && <> <span className="kraft-tree-trailing">{item.trailing}</span></>}
          </span>
          {!item.disabled && item.actions != null && <span className="kraft-tree-actions" data-visibility={item.actionsVisibility}>{item.actions}</span>}
        </span>
        </div>
        {branch && expanded.has(item.id) && <ul id={groupId} role="group" className="kraft-tree-group">{render(item.children!, depth + 1, item.id, [...path, index])}</ul>}
      </li>;
    });
  }

  return <ul {...props} ref={forwardedRef} role="tree" data-density={density} data-branch-style={branchStyle} className={className ? `kraft-tree ${className}` : 'kraft-tree'}>{render(items, 0, null, [])}</ul>;
});
