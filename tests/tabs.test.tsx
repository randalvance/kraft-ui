import { createRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, type TabItem } from '../src';

const items: TabItem[] = [
  { id: 'notes', label: 'Notes', content: <p>A paper note</p> },
  { id: 'locked', label: 'Locked', content: <p>Unavailable</p>, disabled: true },
  { id: 'sketches', label: 'Sketches', content: <input aria-label="Sketch title" /> },
];

describe('Tabs', () => {
  it('links each tab to a named pane and supports refs and server rendering', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tabs ref={ref} aria-label="Notebook sections" items={items} />);
    const list = screen.getByRole('tablist', { name: 'Notebook sections' });
    const notes = within(list).getByRole('tab', { name: 'Notes' });
    const pane = screen.getByRole('tabpanel', { name: 'Notes' });
    expect(ref.current).toContainElement(list);
    expect(notes).toHaveAttribute('aria-controls', pane.id);
    expect(pane).toHaveAttribute('aria-labelledby', notes.id);
    expect(notes).toHaveAttribute('aria-selected', 'true');
    expect(pane).not.toHaveAttribute('hidden');
    const sketches = within(list).getByRole('tab', { name: 'Sketches' });
    expect(document.getElementById(sketches.getAttribute('aria-controls')!)).toHaveAttribute('hidden');
    expect(renderToString(<Tabs aria-label="Server sections" items={items} />)).toContain('role="tabpanel"');
  });

  it('activates on focus, skips disabled tabs, wraps, and moves Tab into the pane', async () => {
    const onValueChange = vi.fn();
    render(<Tabs aria-label="Notebook sections" items={items} onValueChange={onValueChange} />);
    const notes = screen.getByRole('tab', { name: 'Notes' });
    const sketches = screen.getByRole('tab', { name: 'Sketches' });
    await userEvent.tab(); expect(notes).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}'); expect(sketches).toHaveFocus();
    expect(sketches).toHaveAttribute('aria-selected', 'true');
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('sketches', items[2]);
    await userEvent.keyboard('{ArrowRight}'); expect(notes).toHaveFocus();
    await userEvent.keyboard('{End}'); expect(sketches).toHaveFocus();
    await userEvent.tab(); expect(screen.getByRole('tabpanel', { name: 'Sketches' })).toHaveFocus();
    expect(screen.getAllByRole('tab').filter(tab => tab.tabIndex === 0)).toHaveLength(1);
  });

  it('keeps manual focus separate from selection until activation and accepts controlled state', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Tabs aria-label="Notebook sections" items={items} value="notes" onValueChange={onValueChange} activationMode="manual" />);
    const notes = screen.getByRole('tab', { name: 'Notes' });
    const sketches = screen.getByRole('tab', { name: 'Sketches' });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(sketches).toHaveFocus();
    expect(notes).toHaveAttribute('aria-selected', 'true');
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('sketches', items[2]);
    expect(notes).toHaveAttribute('aria-selected', 'true');
    rerender(<Tabs aria-label="Notebook sections" items={items} value="sketches" onValueChange={onValueChange} activationMode="manual" />);
    expect(sketches).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Sketches' })).toBeVisible();
  });

  it('uses vertical arrow keys and reverses horizontal arrows in right-to-left text', async () => {
    const { rerender } = render(<Tabs aria-label="Sections" items={items} orientation="vertical" />);
    const list = screen.getByRole('tablist', { name: 'Sections' });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Sketches' })).toHaveFocus();
    expect(list).toHaveAttribute('aria-orientation', 'vertical');
    rerender(<div dir="rtl"><Tabs aria-label="Sections" items={items} /></div>);
    screen.getByRole('tab', { name: 'Sketches' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Notes' })).toHaveFocus();
  });
});
