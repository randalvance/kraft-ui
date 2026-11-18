import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type TableColumn = {
  id: string;
  header: ReactNode;
  align?: 'start' | 'center' | 'end';
  rowHeader?: boolean;
};

export type TableRow = {
  id: string;
  cells: Readonly<Record<string, ReactNode>>;
  current?: boolean;
  dimmed?: boolean;
};

export type TableGroup = {
  id: string;
  caption?: ReactNode;
  rows: readonly TableRow[];
};

export type TableProps = Omit<ComponentPropsWithoutRef<'table'>, 'children'> & {
  columns: readonly TableColumn[];
  caption?: ReactNode;
  empty?: ReactNode;
  maxHeight?: number | string;
  scrollLabel?: string;
} & (
  | { rows: readonly TableRow[]; groups?: never }
  | { groups: readonly TableGroup[]; rows?: never }
);

/** A paper table with native headers and optional row groups. */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({
  columns, rows, groups, caption, empty = 'No rows to display.', maxHeight,
  scrollLabel = 'Scrollable table', className, ...props
}, ref) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLTableSectionElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const scroll = scrollRef.current;
    const head = headRef.current;
    const table = head?.parentElement;
    if (!scroll || !head || !table) return;
    const update = () => {
      setScrollable(scroll.scrollHeight > scroll.clientHeight || scroll.scrollWidth > scroll.clientWidth);
      scroll.style.scrollPaddingBlockStart = `${head.offsetHeight}px`;
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    observer.observe(table);
    observer.observe(head);
    return () => observer.disconnect();
  }, []);

  const bodies = (groups ?? [{ id: 'rows', rows: rows ?? [] }]).filter(group => group.rows.length > 0);
  return <div ref={scrollRef} className="kraft-table-scroll" style={{ maxHeight }}
    tabIndex={scrollable ? 0 : undefined} role={scrollable ? 'region' : undefined}
    aria-label={scrollable ? scrollLabel : undefined}>
    <table {...props} ref={ref} className={className ? `kraft-table ${className}` : 'kraft-table'}>
      {caption != null && <caption>{caption}</caption>}
      <thead ref={headRef}>
        <tr>{columns.map(column => <th key={column.id} scope="col" data-align={column.align}>{column.header}</th>)}</tr>
      </thead>
      {bodies.map(group => <tbody key={group.id}>
        {group.caption != null && <tr className="kraft-table-group">
          <th scope="rowgroup" colSpan={columns.length}>{group.caption}</th>
        </tr>}
        {group.rows.map(row => <tr key={row.id} aria-current={row.current || undefined} data-dimmed={row.dimmed || undefined}>
          {columns.map(column => column.rowHeader
            ? <th key={column.id} scope="row" data-align={column.align}>{row.cells[column.id]}</th>
            : <td key={column.id} data-align={column.align}>{row.cells[column.id]}</td>)}
        </tr>)}
      </tbody>)}
      {bodies.length === 0 && <tbody><tr>
        <td className="kraft-table-empty" colSpan={columns.length}>{empty}</td>
      </tr></tbody>}
    </table>
  </div>;
});

export type TableRowActionProps = ComponentPropsWithoutRef<'button'>;

/** A compact native button for opening details from a table cell. */
export const TableRowAction = forwardRef<HTMLButtonElement, TableRowActionProps>(function TableRowAction({
  className, type = 'button', ...props
}, ref) {
  return <button {...props} ref={ref} type={type}
    className={className ? `kraft-table-action ${className}` : 'kraft-table-action'} />;
});
