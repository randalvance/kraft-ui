import { createRef, forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb, Button, Pager, TextField, Toolbar, ToolbarGroup } from '../src';

describe('Pager', () => {
  it('is a named navigation landmark of native buttons and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLElement>();
    render(<Pager ref={ref} pageCount={5} defaultPage={2} dots range="21–40 of 87" id="pages" className="mine" data-app="desk" />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toBe(ref.current);
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveClass('kraft-pager', 'mine');
    expect(nav).toHaveAttribute('id', 'pages');
    expect(nav).toHaveAttribute('data-app', 'desk');
    const buttons = within(nav).getAllByRole('button');
    expect(buttons.map(button => button.getAttribute('aria-label'))).toEqual(['Previous page', 'Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5', 'Next page']);
    for (const button of buttons) expect(button).toHaveAttribute('type', 'button');
    expect(within(nav).getByRole('list').tagName).toBe('OL');
    expect(within(nav).getByRole('button', { current: 'page' })).toHaveAccessibleName('Page 2');
    const range = nav.querySelector('.kraft-pager-range')!;
    expect(range).toHaveTextContent('21–40 of 87');
    expect(range).toHaveAttribute('aria-live', 'polite');
  });

  it('moves with previous, next, and the dots, and disables the ends', async () => {
    const onPageChange = vi.fn();
    render(<Pager pageCount={3} dots onPageChange={onPageChange} />);
    const user = userEvent.setup();
    const previous = screen.getByRole('button', { name: 'Previous page' });
    const next = screen.getByRole('button', { name: 'Next page' });
    expect(previous).toBeDisabled();
    await user.click(next);
    await user.click(next);
    expect(onPageChange.mock.calls).toEqual([[2], [3]]);
    expect(next).toBeDisabled();
    expect(previous).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Page 1' }));
    expect(screen.getByRole('button', { current: 'page' })).toHaveAccessibleName('Page 1');
    // Choosing the current page again reports nothing.
    await user.click(screen.getByRole('button', { name: 'Page 1' }));
    expect(onPageChange).toHaveBeenCalledTimes(3);
  });

  it('follows a controlled page and clamps it to the page count', async () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<Pager pageCount={4} page={2} dots onPageChange={onPageChange} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(3);
    expect(screen.getByRole('button', { current: 'page' })).toHaveAccessibleName('Page 2');
    rerender(<Pager pageCount={4} page={9} dots />);
    expect(screen.getByRole('button', { current: 'page' })).toHaveAccessibleName('Page 4');
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('takes its own labels and leaves out the range and dots by default', () => {
    render(<Pager pageCount={2} label="Slides" previousLabel="Back" nextLabel="Forward" />);
    const nav = screen.getByRole('navigation', { name: 'Slides' });
    expect(within(nav).getAllByRole('button').map(button => button.getAttribute('aria-label'))).toEqual(['Back', 'Forward']);
    expect(nav.querySelector('.kraft-pager-range, .kraft-pager-dots')).toBeNull();
  });

  it('renders on the server', () => {
    const html = renderToString(<Pager pageCount={3} defaultPage={3} dots pageLabel={page => `Slide ${page}`} range="3 of 3" />);
    expect(html).toContain('aria-label="Slide 3" aria-current="page"');
    expect(html).toContain('3 of 3');
  });
});

describe('Breadcrumb', () => {
  const items = [{ label: 'Workspaces', href: '/w' }, { label: 'Print Studio', href: '/w/print' }, { label: 'Autumn catalogue' }];

  it('is an ordered list in a navigation landmark with the last item current', () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} items={items} id="trail" className="mine" />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBe(ref.current);
    expect(nav).toHaveClass('kraft-breadcrumb', 'mine');
    expect(nav).toHaveAttribute('id', 'trail');
    expect(within(nav).getByRole('list').tagName).toBe('OL');
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    const links = within(nav).getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/w', '/w/print']);
    for (const link of links) expect(link).not.toHaveAttribute('aria-current');
    const current = screen.getByText('Autumn catalogue');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
    const separators = nav.querySelectorAll('.kraft-breadcrumb-separator');
    expect(separators).toHaveLength(2);
    for (const separator of separators) expect(separator).toHaveAttribute('aria-hidden', 'true');
  });

  it('lets another item be current, even when it is a link', () => {
    render(<Breadcrumb label="Trail" items={[{ id: 'home', label: 'Home', href: '/', current: true }, { id: 'next', label: 'Next', href: '/next' }]} />);
    expect(within(screen.getByRole('navigation', { name: 'Trail' })).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Next' })).not.toHaveAttribute('aria-current');
  });

  it('renders links with a custom component', () => {
    const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(function RouterLink(props, ref) {
      return <a {...props} ref={ref} data-router="" />;
    });
    render(<Breadcrumb items={items} linkAs={RouterLink} />);
    const link = screen.getByRole('link', { name: 'Workspaces' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('href', '/w');
    expect(link).toHaveClass('kraft-link');
  });

  it('renders on the server', () => {
    expect(renderToString(<Breadcrumb items={items} />)).toContain('aria-current="page"');
  });
});

function Tools({ extra = false }: { extra?: boolean }) {
  return <Toolbar label="Card actions">
    <ToolbarGroup label="Edit">
      <Button>Rename</Button>
      <Button disabled>Merge</Button>
      <Button>Duplicate</Button>
    </ToolbarGroup>
    <ToolbarGroup align="end">
      {extra && <Button>Share</Button>}
      <Button>Delete</Button>
    </ToolbarGroup>
  </Toolbar>;
}

describe('Toolbar', () => {
  it('is a named toolbar of groups and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const groupRef = createRef<HTMLDivElement>();
    render(<Toolbar ref={ref} label="Formatting" id="tools" className="mine" data-app="desk">
      <ToolbarGroup ref={groupRef} label="Style" id="style" className="left"><Button>Bold</Button></ToolbarGroup>
      <ToolbarGroup align="end"><Button>Clear</Button></ToolbarGroup>
    </Toolbar>);
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar).toBe(ref.current);
    expect(toolbar).toHaveClass('kraft-toolbar', 'mine');
    expect(toolbar).toHaveAttribute('id', 'tools');
    expect(toolbar).toHaveAttribute('data-app', 'desk');
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    const [style, end] = within(toolbar).getAllByRole('group');
    expect(style).toBe(groupRef.current);
    expect(style).toHaveAccessibleName('Style');
    expect(style).toHaveClass('kraft-toolbar-group', 'left');
    expect(style).toHaveAttribute('data-align', 'start');
    expect(end).toHaveAttribute('data-align', 'end');
    expect(end).not.toHaveAttribute('aria-label');
  });

  it('is one tab stop that the arrow keys, Home, and End move through, skipping disabled controls', async () => {
    render(<><Tools /><button type="button">After</button></>);
    const user = userEvent.setup();
    const button = (name: string) => screen.getByRole('button', { name });
    expect(screen.getAllByRole('button').filter(control => !control.matches(':disabled') && control.tabIndex === 0).map(control => control.textContent)).toEqual(['Rename', 'After']);
    await user.tab();
    expect(button('Rename')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(button('Duplicate')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(button('Delete')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(button('Rename')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(button('Delete')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(button('Rename')).toHaveFocus();
    await user.keyboard('{End}{ArrowLeft}');
    expect(button('Duplicate')).toHaveFocus();
    await user.tab();
    expect(button('After')).toHaveFocus();
    await user.tab({ shift: true });
    expect(button('Duplicate')).toHaveFocus();
  });

  it('keeps one tab stop when controls come and go', () => {
    const { rerender } = render(<Tools />);
    const stops = () => screen.getAllByRole('button').filter(control => !control.matches(':disabled') && control.tabIndex === 0).map(control => control.textContent);
    expect(stops()).toEqual(['Rename']);
    rerender(<Tools extra />);
    expect(stops()).toEqual(['Rename']);
    expect(screen.getByRole('button', { name: 'Share' }).tabIndex).toBe(-1);
  });

  it('moves the tab stop when the control holding it disables itself', async () => {
    function Once() {
      const [used, setUsed] = useState(false);
      return <Button disabled={used} onClick={() => setUsed(true)}>Undo</Button>;
    }
    render(<Toolbar label="History"><Once /><Button>Redo</Button></Toolbar>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Redo' }).tabIndex).toBe(0));
  });

  it('follows a control focused by the pointer and reverses in right-to-left text', async () => {
    render(<div dir="rtl"><Tools /></div>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    expect(screen.getByRole('button', { name: 'Duplicate' }).tabIndex).toBe(0);
    expect(screen.getByRole('button', { name: 'Rename' }).tabIndex).toBe(-1);
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Duplicate' })).toHaveFocus();
  });

  it('leaves arrow keys to a text field and to handlers that prevent the default', async () => {
    function Demo() {
      const [stop, setStop] = useState(false);
      return <Toolbar label="Filter" onKeyDown={event => { if (stop) event.preventDefault(); }}>
        <TextField aria-label="Search" defaultValue="proof" />
        <Button onClick={() => setStop(true)}>Hold</Button>
        <Button>Sort</Button>
      </Toolbar>;
    }
    render(<Demo />);
    const user = userEvent.setup();
    const search = screen.getByRole('textbox', { name: 'Search' });
    await user.click(search);
    await user.keyboard('{ArrowRight}{Home}{End}');
    expect(search).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Hold' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Hold' })).toHaveFocus();
  });

  it('renders on the server', () => {
    const html = renderToString(<Tools />);
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('aria-label="Card actions"');
    expect(html).toContain('role="group"');
  });
});
