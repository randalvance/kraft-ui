import { useEffect, useId, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Badge, DescriptionList, Drawer, ResizablePane, Table, TableRowAction, type TableColumn } from '../src';

const columns: TableColumn[] = [
  { id: 'name', header: 'Server', rowHeader: true },
  { id: 'transport', header: 'Transport', align: 'center' },
  { id: 'tools', header: 'Tools', align: 'end' },
];
const servers = [
  { id: 'docs', name: 'Documentation', transport: 'HTTP', tools: 8 },
  { id: 'build', name: 'Build logs', transport: 'STDIO', tools: 2 },
  { id: 'archive', name: 'Archive', transport: 'STDIO', tools: 0, off: true },
];

const meta = {
  title: 'Components/Table', component: Table,
  args: { caption: 'Connected servers', columns, rows: servers.map(server => ({ id: server.id, cells: server })) },
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {};

export const GroupedWithDrawer: Story = {
  render: function GroupedWithDrawer() {
    const [current, setCurrent] = useState<string | null>(null);
    const opener = useRef<HTMLButtonElement | null>(null);
    const drawerId = useId();
    const server = servers.find(item => item.id === current);
    useEffect(() => { if (!server) opener.current?.focus(); }, [server]);
    const rows = servers.map(item => ({
      id: item.id,
      current: item.id === current,
      dimmed: item.off,
      cells: {
        name: <TableRowAction aria-expanded={item.id === current}
          aria-controls={item.id === current ? drawerId : undefined} onClick={event => {
            opener.current = event.currentTarget;
            setCurrent(item.id);
          }}>{item.name}</TableRowAction>,
        transport: <Badge tone="neutral">{item.transport}</Badge>,
        tools: item.off ? 'Off' : item.tools,
      },
    }));
    return <ResizablePane style={{ maxWidth: 820, minHeight: 320 }} open={server != null} defaultSize={280}
      main={<Table caption="Connected servers" columns={columns} groups={[
        { id: 'workspace', caption: 'Workspace', rows: rows.slice(0, 2) },
        { id: 'local', caption: 'Local', rows: rows.slice(2) },
      ]} />}
      pane={server && <Drawer id={drawerId} title={server.name} onClose={() => setCurrent(null)}>
        <DescriptionList items={[
          { id: 'transport', label: 'Transport', value: server.transport },
          { id: 'tools', label: 'Tools', value: server.tools },
        ]} />
      </Drawer>} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table', { name: 'Connected servers' });
    const first = within(table).getByRole('button', { name: 'Documentation' });
    const off = within(table).getByRole('button', { name: 'Archive' });
    await expect(within(table).getAllByRole('rowgroup')).toHaveLength(3);
    first.focus();
    await userEvent.keyboard('{Enter}');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(first.closest('tr')).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getByRole('complementary', { name: 'Documentation' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close panel' }));
    await expect(first).toHaveFocus();
    await expect(first.closest('tr')).not.toHaveAttribute('aria-current');
    await userEvent.tab();
    await userEvent.tab();
    await expect(off).toHaveFocus();
    await expect(getComputedStyle(off).outlineStyle).toBe('solid');
    await userEvent.keyboard('[Space]');
    await expect(off.closest('tr')).toHaveAttribute('data-dimmed', 'true');
    await expect(off.closest('tr')).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getByRole('complementary', { name: 'Archive' })).toBeVisible();
  },
};

export const StickyHead: Story = {
  args: {
    caption: 'Server inventory', maxHeight: 224, scrollLabel: 'Scroll server inventory',
    rows: Array.from({ length: 15 }, (_, index) => ({
      id: `server-${index}`,
      cells: { name: <TableRowAction>Server {index + 1}</TableRowAction>, transport: 'HTTP', tools: index + 1 },
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = await canvas.findByRole('region', { name: 'Scroll server inventory' });
    const header = canvas.getByRole('columnheader', { name: 'Server' });
    await expect(region).toHaveAttribute('tabindex', '0');
    region.focus();
    region.scrollTop = region.scrollHeight;
    await expect(region.scrollTop).toBeGreaterThan(200);
    await expect(header.getBoundingClientRect().top).toBeCloseTo(region.getBoundingClientRect().top + region.clientTop, 0);
    const first = canvas.getByRole('button', { name: 'Server 1' });
    region.scrollTop += first.getBoundingClientRect().top - region.getBoundingClientRect().top - 8;
    await expect(first.getBoundingClientRect().top).toBeLessThan(header.getBoundingClientRect().bottom);
    await userEvent.tab();
    await expect(first).toHaveFocus();
    await expect(first.getBoundingClientRect().top).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom);
  },
};

export const Empty: Story = {
  args: { rows: [], empty: 'No servers match this filter.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('cell', { name: 'No servers match this filter.' })).toHaveAttribute('colspan', '3');
  },
};
