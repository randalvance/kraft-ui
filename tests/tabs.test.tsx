import { createRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Badge, Icon, Tabs, type TabItem } from '../src';

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

  it('links native tab buttons to application-owned panels and preserves the root ref', async () => {
    const ref = createRef<HTMLDivElement>();
    const onSubmit = vi.fn(event => event.preventDefault());
    const external: TabItem[] = [
      { id: 'notes', label: 'Notes', tabId: 'notes-tab', panelId: 'notes-panel' },
      { id: 'sketches', label: 'Sketches', tabId: 'sketches-tab', panelId: 'sketches-panel' },
    ];
    render(<form onSubmit={onSubmit}>
      <Tabs ref={ref} id="sections" className="custom" aria-label="Sections" items={external} value="notes" panel="external" />
      <section id="notes-panel" aria-labelledby="notes-tab" role="tabpanel" tabIndex={0}>A note.</section>
      <section id="sketches-panel" aria-labelledby="sketches-tab" role="tabpanel" tabIndex={0} hidden>A drawing.</section>
    </form>);
    const list = screen.getByRole('tablist', { name: 'Sections' });
    expect(ref.current).toHaveAttribute('id', 'sections');
    expect(ref.current).toHaveClass('custom');
    expect(ref.current).toContainElement(list);
    expect(within(ref.current!).queryByRole('tabpanel', { hidden: true })).toBeNull();
    const tab = within(list).getByRole('tab', { name: 'Notes' });
    const panel = screen.getByRole('tabpanel', { name: 'Notes' });
    expect(tab).toBeInstanceOf(HTMLButtonElement);
    expect(tab).toHaveAttribute('type', 'button');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(panel).toHaveFocus();
  });

  it('server-renders bare panes, icon names, counts, and distinct tab descriptions', () => {
    const html = renderToString(<Tabs aria-label="Sections" panel="bare" fill items={[
      { ...items[0], iconOnly: true, leading: <Icon name="file" />, trailing: <Badge>0</Badge> },
      { ...items[2], description: 'Ready to share' },
    ]} />);
    const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
    const scope = within(container);
    const notes = scope.getByRole('tab', { name: 'Notes 0' });
    const sketches = scope.getByRole('tab', { name: 'Sketches' });
    const panel = scope.getByRole('tabpanel', { name: 'Notes 0' });
    expect(notes).toHaveAttribute('aria-controls', panel.id);
    expect(sketches).toHaveAccessibleDescription('Ready to share');
    expect(container.querySelector('[data-panel="bare"]')).toHaveAttribute('data-fill', 'true');
    expect(scope.getAllByRole('tabpanel', { hidden: true })).toHaveLength(2);
  });

  it('server-renders external relationships without generating panes', () => {
    const html = renderToString(<Tabs aria-label="Sections" panel="external" items={[
      { id: 'notes', label: 'Notes', tabId: 'my-tab', panelId: 'my-panel', content: 'Unused built-in content' },
    ]} />);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('id="my-tab"');
    expect(html).toContain('aria-controls="my-panel"');
    expect(html).not.toContain('role="tabpanel"');
    expect(html).not.toContain('Unused built-in content');
  });
});
