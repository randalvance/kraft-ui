import { createRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DescriptionList, Table, TableRowAction, type TableColumn } from '../src';

const columns = [
  { id: 'name', header: 'Server', rowHeader: true },
  { id: 'tools', header: 'Tools', align: 'end' },
] satisfies TableColumn[];

describe('Table', () => {
  it('renders native table, column, group, and row headers and forwards the table and button refs', () => {
    const ref = createRef<HTMLTableElement>();
    const actionRef = createRef<HTMLButtonElement>();
    render(<Table caption="Connected servers" columns={columns} ref={ref} className="inventory" groups={[
      { id: 'remote', caption: 'Remote', rows: [
        { id: 'docs', cells: { name: 'Docs', tools: 2 } },
      ] },
      { id: 'local', caption: 'Local', rows: [
        { id: 'archive', current: true, dimmed: true, cells: {
          name: <TableRowAction ref={actionRef} aria-label="Open Archive">Archive</TableRowAction>, tools: 0,
        } },
      ] },
    ]} />);
    const table = screen.getByRole('table', { name: 'Connected servers' });
    expect(ref.current).toBe(table);
    expect(ref.current?.caption).toHaveTextContent('Connected servers');
    expect(ref.current?.tBodies).toHaveLength(2);
    expect(table).toHaveClass('kraft-table', 'inventory');
    expect(screen.getByRole('columnheader', { name: 'Tools' })).toHaveAttribute('scope', 'col');
    expect(screen.getByText('Remote')).toHaveAttribute('scope', 'rowgroup');
    expect(screen.getByText('Remote')).toHaveAttribute('colspan', '2');
    expect(screen.getByRole('rowheader', { name: 'Docs' })).toHaveAttribute('scope', 'row');
    const button = screen.getByRole('button', { name: 'Open Archive' });
    expect(actionRef.current).toBe(button);
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type', 'button');
    const row = button.closest('tr')!;
    expect(row).toHaveAttribute('aria-current', 'true');
    expect(row).toHaveAttribute('data-dimmed', 'true');
    expect(within(row).getByRole('cell', { name: '0' })).toHaveAttribute('data-align', 'end');
  });

  it('keeps the headers and renders one empty cell when every group is empty', () => {
    render(<Table aria-label="Connection inventory" columns={columns} groups={[{ id: 'local', caption: 'Local', rows: [] }]} />);
    expect(screen.getByRole('table', { name: 'Connection inventory' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.queryByText('Local')).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'No rows to display.' })).toHaveAttribute('colspan', '2');
  });

  it('renders native table markup and current row content on the server', () => {
    const html = renderToString(<Table caption="Inventory" columns={columns} maxHeight={200} rows={[
      { id: 'docs', current: true, cells: { name: <TableRowAction>Docs</TableRowAction>, tools: 2 } },
    ]} />);
    expect(html).toContain('<caption>Inventory</caption><thead>');
    expect(html).toContain('<tbody><tr aria-current="true"><th scope="row">');
    expect(html).toContain('<button type="button" class="kraft-table-action">Docs</button>');
    expect(html).toContain('max-height:200px');
  });
});

describe('DescriptionList', () => {
  it('groups native terms and descriptions, forwards the ref, and keeps the action with its value', () => {
    const ref = createRef<HTMLDListElement>();
    render(<DescriptionList ref={ref} data-testid="connection" className="facts" columns={2} layout="inline" items={[
      { id: 'transport', label: 'Transport', value: <code>HTTP</code> },
      { id: 'workspace', label: 'Workspace', value: 'Product', wide: true, action: <button>Change workspace</button> },
    ]} />);
    const list = screen.getByTestId('connection');
    expect(ref.current).toBe(list);
    expect(list.tagName).toBe('DL');
    expect(list).toHaveClass('kraft-description-list', 'facts');
    expect(list).toHaveAttribute('data-columns', '2');
    expect(list).toHaveAttribute('data-layout', 'inline');
    const [transport, term] = screen.getAllByRole('term');
    expect(transport).toHaveTextContent('Transport');
    expect(transport.nextElementSibling).toContainElement(screen.getByText('HTTP'));
    expect(term).toHaveTextContent('Workspace');
    expect(term.parentElement).toHaveAttribute('data-wide', 'true');
    const definition = term.nextElementSibling;
    expect(definition?.tagName).toBe('DD');
    expect(definition).toContainElement(screen.getByText('Product'));
    expect(definition).toContainElement(screen.getByRole('button', { name: 'Change workspace' }));
  });

  it('renders a stacked native description list on the server by default', () => {
    const html = renderToString(<DescriptionList items={[{ id: 'tools', label: 'Tools', value: 0 }]} />);
    expect(html).toContain('<dl data-columns="1" data-layout="stacked"');
    expect(html).toContain('<dt>Tools</dt><dd><div class="kraft-description-value">0</div></dd>');
  });
});
