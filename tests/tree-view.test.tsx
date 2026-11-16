import { createRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { TreeView, type TreeNode } from '../src';

const items: TreeNode[] = [
  { id: 'work', label: 'Work', description: 'Current notes', trailing: '3 items', children: [
    { id: 'alpha', label: 'Alpha' },
    { id: 'hidden', label: 'Unavailable', disabled: true },
    { id: 'nested', label: 'Nested', children: [{ id: 'beta', label: 'Beta' }] },
  ] },
  { id: 'archive', label: 'Archive' },
];

describe('TreeView', () => {
  it('exposes a named hierarchy with descriptions and a forwarded ref', () => {
    const ref = createRef<HTMLUListElement>();
    render(<TreeView ref={ref} aria-label="Notebook" items={items} />);
    const tree = screen.getByRole('tree', { name: 'Notebook' });
    const work = within(tree).getByRole('treeitem', { name: /^Work\b/ });
    expect(ref.current).toBe(tree);
    expect(work).toHaveAttribute('aria-expanded', 'false');
    expect(work).toHaveAttribute('aria-level', '1');
    expect(work).toHaveAccessibleName('Work Current notes 3 items');
    expect(work).not.toHaveAttribute('aria-selected');
    expect(within(tree).queryByRole('treeitem', { name: 'Alpha' })).toBeNull();
    expect(renderToString(<TreeView aria-label="Server tree" items={items} />)).toContain('role="tree"');
  });

  it('moves one focus through visible enabled items and expands with arrows', async () => {
    render(<TreeView aria-label="Notebook" items={items} defaultExpandedIds={['work']} />);
    const work = screen.getByRole('treeitem', { name: /^Work\b/ });
    await userEvent.tab(); expect(work).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}'); expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}'); expect(screen.getByRole('treeitem', { name: 'Nested' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}'); expect(screen.getByRole('treeitem', { name: 'Nested' })).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowRight}'); expect(screen.getByRole('treeitem', { name: 'Beta' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}'); expect(screen.getByRole('treeitem', { name: 'Nested' })).toHaveFocus();
    await userEvent.keyboard('{End}'); expect(screen.getByRole('treeitem', { name: 'Archive' })).toHaveFocus();
    await userEvent.keyboard('{Home}'); expect(work).toHaveFocus();
    expect(screen.getAllByRole('treeitem').filter(item => item.tabIndex === 0)).toHaveLength(1);
  });

  it('selects leaves, toggles branches, and supports controlled state', async () => {
    const onExpandedChange = vi.fn(), onSelectionChange = vi.fn();
    const { rerender } = render(<TreeView aria-label="Notebook" items={items} expandedIds={[]} selectedId={null} onExpandedChange={onExpandedChange} onSelectionChange={onSelectionChange} />);
    const work = screen.getByRole('treeitem', { name: /^Work\b/ });
    await userEvent.click(work);
    expect(onExpandedChange).toHaveBeenCalledWith(['work']);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(work).toHaveAttribute('aria-expanded', 'false');
    rerender(<TreeView aria-label="Notebook" items={items} expandedIds={['work']} selectedId={null} onExpandedChange={onExpandedChange} onSelectionChange={onSelectionChange} />);
    const alpha = screen.getByRole('treeitem', { name: 'Alpha' });
    await userEvent.click(alpha);
    expect(onSelectionChange).toHaveBeenCalledWith('alpha', items[0].children![0]);
    expect(alpha).toHaveAttribute('aria-selected', 'false');
    rerender(<TreeView aria-label="Notebook" items={items} expandedIds={['work']} selectedId="alpha" onExpandedChange={onExpandedChange} onSelectionChange={onSelectionChange} />);
    expect(alpha).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('treeitem', { name: 'Unavailable' }));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('can select a branch and finds visible labels by typing', async () => {
    const selectable: TreeNode[] = [{ ...items[0], selectable: true }, items[1]];
    render(<TreeView aria-label="Notebook" items={selectable} defaultExpandedIds={['work']} />);
    const work = screen.getByRole('treeitem', { name: /^Work\b/ });
    await userEvent.click(work);
    expect(work).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('a');
    expect(screen.getByRole('treeitem', { name: 'Archive' })).toHaveFocus();
  });
});
