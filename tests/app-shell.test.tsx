import { createRef, forwardRef, type ComponentPropsWithoutRef } from 'react';
import { createPortal } from 'react-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell, RailTile } from '../src';

const Glyph = () => <svg data-testid="glyph" />;
const RouterLink = forwardRef<HTMLAnchorElement, { to: string } & ComponentPropsWithoutRef<'a'>>(
  function RouterLink({ to, ...props }, ref) { return <a ref={ref} href={to} data-router="" {...props} />; });

describe('RailTile', () => {
  it('renders a named link and forwards ref and native props', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<RailTile ref={ref} href="/inbox" id="t" className="mine" label="Inbox"><Glyph /></RailTile>);
    const tile = screen.getByRole('link', { name: 'Inbox' });
    expect(tile).toBe(ref.current);
    expect(tile).toHaveAttribute('href', '/inbox');
    expect(tile).toHaveAttribute('id', 't');
    expect(tile).toHaveClass('kraft-rail-tile', 'mine');
    expect(tile).toHaveAttribute('data-tone', 'neutral');
    expect(screen.getByTestId('glyph').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('marks the current page', () => {
    const { rerender } = render(<RailTile href="/a" label="Inbox" current><Glyph /></RailTile>);
    expect(screen.getByRole('link', { name: 'Inbox', current: 'page' })).toBeInTheDocument();
    rerender(<RailTile href="/a" label="Inbox"><Glyph /></RailTile>);
    expect(screen.getByRole('link', { name: 'Inbox' })).not.toHaveAttribute('aria-current');
    rerender(<RailTile href="/a" label="Inbox" current aria-current="step"><Glyph /></RailTile>);
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveAttribute('aria-current', 'step');
  });

  it('renders through a router link via as and keeps its props', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<RailTile as={RouterLink} ref={ref} to="/x" label="X" className="c"><Glyph /></RailTile>);
    const tile = screen.getByRole('link', { name: 'X' });
    expect(tile).toBe(ref.current);
    expect(tile).toHaveAttribute('href', '/x');
    expect(tile).toHaveAttribute('data-router');
    expect(tile).toHaveClass('kraft-rail-tile', 'c');
  });

  it('adds a count badge and names it', () => {
    const { rerender, container } = render(<RailTile href="/a" label="Inbox" count={3}><Glyph /></RailTile>);
    expect(screen.getByRole('link', { name: 'Inbox, 3 new' })).toBeInTheDocument();
    const badge = container.querySelector('.kraft-rail-tile-count')!;
    expect(badge).toHaveTextContent('3');
    expect(badge).toHaveAttribute('aria-hidden', 'true');
    rerender(<RailTile href="/a" label="Inbox" count={120}><Glyph /></RailTile>);
    expect(screen.getByRole('link', { name: 'Inbox, 120 new' })).toBeInTheDocument();
    expect(container.querySelector('.kraft-rail-tile-count')).toHaveTextContent('99+');
    rerender(<RailTile href="/a" label="Inbox" count={3} countLabel={n => `${n} unread`}><Glyph /></RailTile>);
    expect(screen.getByRole('link', { name: 'Inbox, 3 unread' })).toBeInTheDocument();
  });

  it('ignores counts that are not positive', () => {
    for (const count of [0, -3, Number.NaN]) {
      const { container, unmount } = render(<RailTile href="/a" label="Inbox" count={count}><Glyph /></RailTile>);
      expect(container.querySelector('.kraft-rail-tile-count')).toBeNull();
      expect(screen.getByRole('link')).toHaveAccessibleName('Inbox');
      unmount();
    }
    const { container } = render(<RailTile href="/a" label="Inbox" count={4.7}><Glyph /></RailTile>);
    expect(container.querySelector('.kraft-rail-tile-count')).toHaveTextContent('4');
    expect(screen.getByRole('link')).toHaveAccessibleName('Inbox, 4 new');
  });

  it('shows its label as a tooltip on focus', async () => {
    render(<RailTile href="/a" label="Inbox"><Glyph /></RailTile>);
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Inbox');
  });

  it('renders on the server', () => {
    const html = renderToString(<RailTile href="/a" label="A" current count={2}><Glyph /></RailTile>);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('kraft-rail-tile');
  });
});

const rail = <ul><li><RailTile href="/inbox" label="Inbox" current><Glyph /></RailTile></li></ul>;

describe('AppShell', () => {
  it('lays out named landmarks and forwards ref and native props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<AppShell ref={ref} id="shell" className="mine" rail={rail} railLabel="Primary" topBar={<p>Search</p>}
      board={<p>Filter list</p>} boardLabel="Filters" sheetHead={<h1>Inbox</h1>}><p>Body copy</p></AppShell>);
    expect(ref.current).toHaveAttribute('id', 'shell');
    expect(ref.current).toHaveClass('kraft-app-shell', 'mine');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toContainElement(screen.getByRole('link', { name: 'Inbox' }));
    expect(screen.getByRole('banner')).toHaveTextContent('Search');
    expect(screen.getByRole('complementary', { name: 'Filters' })).toHaveTextContent('Filter list');
    const main = screen.getByRole('main');
    const heading = screen.getByRole('heading', { name: 'Inbox' });
    expect(main).toContainElement(heading);
    expect(main.querySelector('.kraft-app-sheet-body')).not.toContainElement(heading);
    expect(main.querySelector('.kraft-app-sheet-body')).toHaveTextContent('Body copy');
  });

  it('defaults the rail name and omits optional regions', () => {
    const { container } = render(<AppShell rail={rail}><p>Body</p></AppShell>);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(container.querySelector('.kraft-app-shell-grid')).not.toHaveAttribute('data-has-board');
    expect(container.querySelector('.kraft-app-sheet-head')).toBeNull();
  });

  it('renders the rail footer after the tiles', () => {
    render(<AppShell rail={rail} railFooter={<button type="button">Settings</button>}><p>Body</p></AppShell>);
    const nav = screen.getByRole('navigation');
    expect(nav.lastElementChild).toHaveClass('kraft-app-rail-footer');
    expect(nav.lastElementChild).toContainElement(screen.getByRole('button', { name: 'Settings' }));
  });

  it('requires a board label', () => {
    // @ts-expect-error board needs boardLabel
    render(<AppShell rail={null} board={<p />} />);
  });

  it('treats false like an absent region', () => {
    const show = false;
    const { container } = render(<AppShell rail={rail} topBar={show && <p>Search</p>} railFooter={show && <p>Foot</p>}
      sheetHead={show && <h1>Inbox</h1>}><p>Body</p></AppShell>);
    expect(screen.queryByRole('banner')).toBeNull();
    expect(container.querySelector('.kraft-app-shell-grid')).not.toHaveAttribute('data-has-topbar');
    expect(container.querySelector('.kraft-app-rail-footer')).toBeNull();
    expect(container.querySelector('.kraft-app-sheet-head')).toBeNull();
  });

  it('names the sheet scroll region from the sheet head when no sheetLabel is given', () => {
    // jsdom has no layout; make every element report overflow so ScrollRegion exposes its named region.
    const height = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(500);
    try {
      const { unmount } = render(<AppShell rail={rail} sheetHead={<h1>Inbox</h1>}><p>Body</p></AppShell>);
      expect(screen.getByRole('main')).toContainElement(screen.getByRole('region', { name: 'Inbox' }));
      unmount();
      render(<AppShell rail={rail}><p>Body</p></AppShell>);
      expect(screen.getByRole('region', { name: 'Content' })).toBeInTheDocument();
    } finally {
      height.mockRestore();
    }
  });

  it('renders on the server', () => {
    for (const board of [undefined, <p key="b">Filters</p>]) {
      const html = renderToString(board ? <AppShell rail={rail} board={board} boardLabel="Filters">Body</AppShell>
        : <AppShell rail={rail}>Body</AppShell>);
      expect(html).toContain('kraft-app-shell');
      expect(html).toContain('<main');
    }
  });
});

describe('AppShell board', () => {
  // jsdom has no layout: treat the toggle as rendered unless the shell sits inside [data-test-wide].
  beforeEach(() => {
    (HTMLElement.prototype as unknown as { checkVisibility: () => boolean }).checkVisibility = function (this: HTMLElement) {
      return !this.closest('[data-test-wide]');
    };
  });
  afterEach(() => { delete (HTMLElement.prototype as unknown as { checkVisibility?: unknown }).checkVisibility; });

  const shell = (props: Partial<{ boardOpen: boolean; defaultBoardOpen: boolean; onBoardOpenChange: (open: boolean) => void }> = {}) =>
    <AppShell rail={rail} board={<button type="button">Unread only</button>} boardLabel="Filters" {...props}><p>Body</p></AppShell>;

  it('opens and closes the board from the rail toggle', async () => {
    const { container } = render(shell());
    const toggle = screen.getByRole('button', { name: 'Show Filters' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', screen.getByRole('complementary', { name: 'Filters' }).id);
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('.kraft-app-shell')).toHaveAttribute('data-board-open');
    expect(screen.getByRole('complementary', { name: 'Filters' })).toContainElement(document.activeElement as HTMLElement);
    await userEvent.click(screen.getByRole('button', { name: 'Close Filters' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('.kraft-app-shell')).not.toHaveAttribute('data-board-open');
    expect(toggle).toHaveFocus();
  });

  it('closes on Escape inside the board and returns focus', async () => {
    render(shell());
    const toggle = screen.getByRole('button', { name: 'Show Filters' });
    await userEvent.click(toggle);
    await userEvent.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('ignores Escape when the layout is wide', async () => {
    const { container } = render(<div data-test-wide="">{shell({ defaultBoardOpen: true })}</div>);
    const inside = screen.getByRole('button', { name: 'Unread only' });
    inside.focus();
    await userEvent.keyboard('{Escape}');
    expect(container.querySelector('.kraft-app-shell')).toHaveAttribute('data-board-open');
    expect(inside).toHaveFocus();
  });

  it('supports controlled open state', async () => {
    const change = vi.fn();
    const { rerender } = render(shell({ boardOpen: false, onBoardOpenChange: change }));
    const toggle = screen.getByRole('button', { name: 'Show Filters' });
    await userEvent.click(toggle);
    expect(change).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('complementary', { name: 'Filters' })).not.toContainElement(document.activeElement as HTMLElement);
    rerender(shell({ boardOpen: true, onBoardOpenChange: change }));
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('starts closed by default and honours defaultBoardOpen', () => {
    const { unmount } = render(shell());
    expect(screen.getByRole('button', { name: 'Show Filters' })).toHaveAttribute('aria-expanded', 'false');
    unmount();
    render(shell({ defaultBoardOpen: true }));
    expect(screen.getByRole('button', { name: 'Show Filters' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('lets a control inside the board consume Escape first', async () => {
    render(<AppShell rail={rail} defaultBoardOpen boardLabel="Filters"
      board={<button type="button" onKeyDown={event => { if (event.key === 'Escape') event.preventDefault(); }}>Menu</button>}>Body</AppShell>);
    screen.getByRole('button', { name: 'Menu' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Show Filters' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus();
  });

  it('closes when focus leaves the narrow board, but not for its own portals', async () => {
    const Portaled = () => createPortal(<button type="button">Portaled option</button>, document.body);
    render(<AppShell rail={rail} defaultBoardOpen boardLabel="Filters"
      board={<><button type="button">Unread only</button><Portaled /></>}><button type="button">Sheet action</button></AppShell>);
    const toggle = screen.getByRole('button', { name: 'Show Filters' });
    screen.getByRole('button', { name: 'Unread only' }).focus();
    screen.getByRole('button', { name: 'Portaled option' }).focus();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    screen.getByRole('button', { name: 'Unread only' }).focus();
    screen.getByRole('button', { name: 'Sheet action' }).focus();
    await vi.waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.getByRole('button', { name: 'Sheet action' })).toHaveFocus();
  });

  it('keeps the wide board when focus leaves it', async () => {
    render(<div data-test-wide="">{shell({ defaultBoardOpen: true })}</div>);
    screen.getByRole('button', { name: 'Unread only' }).focus();
    screen.getByRole('link', { name: 'Inbox' }).focus();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(screen.getByRole('button', { name: 'Show Filters', hidden: true })).toHaveAttribute('aria-expanded', 'true');
  });

  it('uses custom toggle and close labels', () => {
    render(<AppShell rail={rail} board={<p>List</p>} boardLabel="Filters" boardToggleLabel="Open filters" boardCloseLabel="Hide filters">Body</AppShell>);
    expect(screen.getByRole('button', { name: 'Open filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide filters' })).toBeInTheDocument();
  });
});
