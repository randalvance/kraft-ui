import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge, Icon, IconButton, TreeView, type TreeNode } from '../src';

const items: TreeNode[] = [
  { id: 'shelf', label: 'Idea shelf', trailing: '3 folders', children: [
    { id: 'notes', label: 'Notes', description: 'Small things worth keeping', children: [
      { id: 'draft', label: 'First draft', description: 'An outline on paper', trailing: <Badge tone="sage">Ready</Badge> },
      { id: 'sketch', label: 'Cover sketch', trailing: 'Today' },
    ] },
    { id: 'clippings', label: 'Clippings', children: [
      { id: 'palette', label: 'Palette samples' },
    ] },
  ] },
  { id: 'archive', label: 'Archive', children: [
    { id: 'old', label: 'Older notes', disabled: true },
  ] },
];

const meta = {
  title: 'Components/TreeView', component: TreeView,
  parameters: { controls: { include: ['selectionMode', 'density', 'branchStyle'] }, docs: { description: { component: 'A named hierarchy with rich labels and optional row actions. Branches expand and leaves select. Arrow keys move through visible rows, Home and End jump to the edges, typing finds a label, and Enter or Space activates a row. Tab reaches the separate row actions.' } } },
  argTypes: {
    selectionMode: { control: 'radio', options: ['single', 'none'] },
    density: { control: 'radio', options: ['default', 'compact'] },
    branchStyle: { control: 'radio', options: ['board', 'plain'] },
  },
  args: { 'aria-label': 'Idea shelf', items, defaultExpandedIds: ['shelf', 'notes'], defaultSelectedId: 'draft', selectionMode: 'single', style: { maxWidth: 380 } },
} satisfies Meta<typeof TreeView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const tree = within(canvasElement).getByRole('tree', { name: 'Idea shelf' });
  await expect(within(tree).getByRole('treeitem', { name: /^Notes\b/ })).toHaveAttribute('aria-expanded', 'true');
  const sketch = within(tree).getByRole('treeitem', { name: /^Cover sketch\b/ });
  await userEvent.click(sketch);
  await expect(sketch).toHaveAttribute('aria-selected', 'true');
} };

export const Keyboard: Story = { args: { defaultExpandedIds: [], defaultSelectedId: null }, play: async ({ canvasElement }) => {
  const tree = within(canvasElement).getByRole('tree', { name: 'Idea shelf' });
  const shelf = within(tree).getByRole('treeitem', { name: /^Idea shelf\b/ });
  await userEvent.tab();
  await expect(shelf).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect(shelf).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('{ArrowRight}');
  await expect(within(tree).getByRole('treeitem', { name: /^Notes\b/ })).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect(shelf).toHaveFocus();
} };

export const Controlled: Story = { render: function ControlledTree() {
  const [selectedId, setSelectedId] = useState<string | null>('draft');
  const [expandedIds, setExpandedIds] = useState<readonly string[]>(['shelf', 'notes']);
  return <TreeView aria-label="Controlled ideas" items={items} selectedId={selectedId} onSelectionChange={setSelectedId} expandedIds={expandedIds} onExpandedChange={setExpandedIds} style={{ maxWidth: 380 }} />;
}, play: async ({ canvasElement }) => {
  const tree = within(canvasElement).getByRole('tree', { name: 'Controlled ideas' });
  const clippings = within(tree).getByRole('treeitem', { name: 'Clippings' });
  await userEvent.click(clippings);
  await expect(clippings).toHaveAttribute('aria-expanded', 'true');
  await expect(within(tree).getByRole('treeitem', { name: /^First draft\b/ })).toHaveAttribute('aria-selected', 'true');
} };

export const RightToLeft: Story = { render: () => <div dir="rtl" lang="ar"><TreeView aria-label="أفكار" items={[{ id: 'a', label: 'ملاحظات', children: [{ id: 'b', label: 'الفكرة الأولى' }] }]} style={{ maxWidth: 320 }} /></div>, play: async ({ canvasElement }) => {
  const tree = within(canvasElement).getByRole('tree', { name: 'أفكار' });
  await userEvent.tab();
  await userEvent.keyboard('{ArrowLeft}');
  await expect(within(tree).getByRole('treeitem', { name: 'ملاحظات' })).toHaveAttribute('aria-expanded', 'true');
} };

export const Night: Story = { globals: { theme: 'night' } };

const pinFolder = fn();
const files: TreeNode[] = [
  { id: 'src', label: <><code>src</code> Workspace application source</>, textValue: 'src',
    description: <>Files for the <strong>production workspace</strong> and its navigation components</>,
    leading: <Icon name="code" />, truncateLabel: true, clampDescription: 1,
    actionsVisibility: 'hover', actions: <IconButton variant="bare" size="sm" aria-label="Pin source folder" onClick={pinFolder}><Icon name="pin" /></IconButton>,
    children: [
      { id: 'index', label: <code>index.ts</code>, trailing: 'Updated just before the print review' },
      { id: 'legacy', label: <code>legacy.ts</code>, trailing: <Badge tone="sage" size="sm">Done</Badge>, done: true, selectable: false },
      { id: 'private', label: 'Private files', disabled: true },
    ] },
];

export const FileNavigator: Story = {
  args: { 'aria-label': 'Project files', items: files, density: 'compact', branchStyle: 'plain', defaultExpandedIds: [],
    defaultSelectedId: null, style: { width: 280, maxWidth: '100%' } },
  play: async ({ canvasElement }) => {
    const tree = within(within(canvasElement).getByRole('tree', { name: 'Project files' }));
    const branch = tree.getByRole('treeitem', { name: /^src Workspace/ });
    const row = branch.querySelector('.kraft-tree-row')!;
    const label = row.querySelector('.kraft-tree-label')!;
    const description = row.querySelector('.kraft-tree-description')!;
    const action = tree.getByRole('button', { name: 'Pin source folder' });
    const slot = action.parentElement!;
    const reservedWidth = slot.getBoundingClientRect().width;
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(26);
    await expect(row.getBoundingClientRect().height).toBeLessThanOrEqual(32);
    await expect(getComputedStyle(row).boxShadow).toBe('none');
    await expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(getComputedStyle(description).webkitLineClamp).toBe('1');
    await expect(getComputedStyle(slot).opacity).toBe('0');
    await userEvent.tab();
    await expect(branch).toHaveFocus();
    await expect(getComputedStyle(row).outlineStyle).toBe('solid');
    await expect(getComputedStyle(slot).opacity).toBe('1');
    await expect(slot.getBoundingClientRect().width).toBe(reservedWidth);
    await userEvent.tab();
    await expect(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(pinFolder).toHaveBeenCalled();
    await expect(branch).toHaveAttribute('aria-expanded', 'false');
    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    const file = tree.getByRole('treeitem', { name: /^index\.ts/ });
    await expect(file).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(file).toHaveAttribute('aria-selected', 'true');
    const trailing = tree.getByText('Updated just before the print review');
    await expect(trailing.getBoundingClientRect().width).toBeGreaterThan(0.45 * file.clientWidth);
    const done = tree.getByRole('treeitem', { name: /^legacy\.ts/ });
    await expect(getComputedStyle(done.querySelector('.kraft-tree-label')!).textDecorationLine).toBe('line-through');
    await expect(done).not.toHaveAttribute('aria-selected');
    await expect(tree.getByRole('treeitem', { name: 'Private files' })).toHaveAttribute('aria-disabled', 'true');
  },
};

export const FileNavigatorWithoutDecoration: Story = { ...FileNavigator, globals: { texture: 'off', motion: 'off', tilt: 'off' } };
