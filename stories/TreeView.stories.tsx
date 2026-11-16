import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Badge, TreeView, type TreeNode } from '../src';

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
  parameters: { controls: { include: ['selectionMode'] }, docs: { description: { component: 'A generic hierarchy with native ARIA tree semantics. Nodes supply stable IDs, text labels, optional descriptions and decorative marks. Branch rows expand; leaves select. Set selectable on a branch when it should select too. Arrow keys move through visible items, Home/End jump to the edges, typing finds a label, and Enter/Space activates. Application code owns filtering, routing, menus, and drag and drop.' } } },
  argTypes: { selectionMode: { control: 'radio', options: ['single', 'none'] } },
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
