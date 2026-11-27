import { act, createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Button, Icon, IconButton, createIcon, iconNames, searchIcon, closeIcon, type IconName } from '../src';

const SearchIcon = createIcon({ search: searchIcon });

// These examples are checked by npm run typecheck, without rendering invalid input.
function checkNames() {
  const valid: IconName = 'search';
  <Icon name={valid} />;
  <SearchIcon name="search" />;
  // @ts-expect-error Unknown names must fail at the application boundary.
  <Icon name="not-a-kraft-icon" />;
  // @ts-expect-error A subset only accepts the names included in its registry.
  <SearchIcon name="close" />;
}
void checkNames;

describe('Icon', () => {
  it('server-renders all 32 design-system glyphs and the 30 Primepaw additions with a single ink', () => {
    const expectedNames = [
      'agent', 'agents', 'background', 'board', 'branch', 'bulb', 'check', 'chevron-down', 'clipboard',
      'code', 'copy', 'factory', 'home', 'inbox', 'kanban', 'knowledge', 'mark', 'mcps', 'memory',
      'pinwheel', 'plus', 'pull-requests', 'search', 'send', 'sessions', 'settings', 'share', 'skills',
      'stop', 'trash', 'workflows', 'workspaces',
      'microphone', 'close', 'pin', 'pencil', 'sync', 'folder', 'file', 'new-file', 'new-folder', 'grip',
      'three-dots', 'terminal', 'clock', 'bolt', 'eye', 'link', 'chevron-left', 'power', 'key', 'moon',
      'chevron-right', 'sparkle', 'filter', 'graph', 'expand', 'sliders', 'activity', 'ban', 'question',
      'editor',
    ] as const satisfies readonly IconName[];
    expect(iconNames).toHaveLength(62);
    expect(new Set(iconNames).size).toBe(62);
    expect(iconNames).toEqual(expect.arrayContaining([...expectedNames]));
    const container = document.createElement('div');
    container.innerHTML = renderToString(<>{expectedNames.map(name => <Icon key={name} name={name} label={name} />)}</>);
    expect(container.querySelectorAll('svg')).toHaveLength(62);
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg.querySelector('path,circle,rect,line,polyline,polygon,ellipse')).not.toBeNull();
      for (const element of [svg, ...svg.querySelectorAll('*')]) {
        for (const attribute of ['fill', 'stroke']) {
          expect([null, 'none', 'currentColor']).toContain(element.getAttribute(attribute));
        }
      }
    }
  });

  it('gives every name its own drawing, apart from the folder that workspaces shares', () => {
    const drawings = new Map<string, IconName[]>();
    for (const name of iconNames) {
      const drawing = render(<Icon name={name} />).container.querySelector('svg')!.innerHTML;
      drawings.set(drawing, [...(drawings.get(drawing) ?? []), name]);
    }
    // A name wired to another glyph's definition, such as a right chevron that points left, lands here.
    expect([...drawings.values()].filter(names => names.length > 1)).toEqual([['workspaces', 'folder']]);
  });

  it('renders a non-focusable, decorative SVG using the surrounding ink by default', () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector('svg')!;
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).not.toHaveAttribute('tabindex');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('exposes a supplied label as an image name and updates its semantics when removed', () => {
    const { rerender } = render(<Icon name="microphone" label="Microphone enabled" />);
    const svg = screen.getByRole('img', { name: 'Microphone enabled' });
    expect(svg).not.toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    rerender(<Icon name="microphone" />);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it.each(['', '   '])('keeps an empty label (%j) decorative', label => {
    const { container } = render(<Icon name="close" label={label} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('accepts native accessible names while respecting explicit hiding', () => {
    const { rerender } = render(<Icon name="search" aria-label="Find notes" />);
    expect(screen.getByRole('img', { name: 'Find notes' })).toBeInTheDocument();
    rerender(<><span id="search-label">Search the notebook</span><Icon name="search" aria-labelledby="search-label" /></>);
    expect(screen.getByRole('img', { name: 'Search the notebook' })).toBeInTheDocument();
    rerender(<Icon name="search" label="Search" aria-label="Find" />);
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument();
    rerender(<Icon name="search" label="Search" aria-hidden="true" data-testid="hidden-icon" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('hidden-icon')).toHaveAttribute('aria-hidden', 'true');
    rerender(<Icon name="search" aria-hidden="false" data-testid="hidden-icon" />);
    expect(screen.getByTestId('hidden-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards its native SVG ref and native attributes', () => {
    const ref = createRef<SVGSVGElement>();
    render(<Icon ref={ref} name="search" id="search-mark" className="custom-icon" style={{ color: 'rebeccapurple' }} data-testid="mark" aria-describedby="help" />);
    const svg = screen.getByTestId('mark');
    expect(ref.current).toBe(svg);
    expect(svg).toHaveAttribute('id', 'search-mark');
    expect(svg).toHaveClass('kraft-icon', 'custom-icon');
    expect(svg).toHaveStyle({ color: 'rgb(102, 51, 153)' });
    expect(svg).toHaveAttribute('aria-describedby', 'help');
  });

  it.each([16, 32, '1.5em'])('uses the requested square size %s', size => {
    const { container } = render(<Icon name="search" size={size} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('width', String(size));
    expect(svg).toHaveAttribute('height', String(size));
  });

  it('preserves control names and keyboard activation without adding an SVG tab stop', async () => {
    const save = vi.fn(), dismiss = vi.fn();
    render(<>
      <Button onClick={save}><Icon name="search" />Search notes</Button>
      <IconButton aria-label="Dismiss" onClick={dismiss}><Icon name="close" /></IconButton>
      <Icon name="microphone" label="Microphone enabled" />
      <Button>Next action</Button>
    </>);
    const search = screen.getByRole('button', { name: 'Search notes' });
    const close = screen.getByRole('button', { name: 'Dismiss' });
    await userEvent.tab(); expect(search).toHaveFocus();
    await userEvent.keyboard('{Enter}'); expect(save).toHaveBeenCalledOnce();
    await userEvent.tab(); expect(close).toHaveFocus();
    await userEvent.keyboard(' '); expect(dismiss).toHaveBeenCalledOnce();
    await userEvent.tab(); expect(screen.getByRole('button', { name: 'Next action' })).toHaveFocus();
  });

  it('renders a selected registry with the same accessibility, size, and ref contract', () => {
    const AppIcon = createIcon({ search: searchIcon, close: closeIcon });
    const ref = createRef<SVGSVGElement>();
    render(<AppIcon name="close" label="Closed" size={28} ref={ref} data-testid="subset-icon" />);
    expect(ref.current).toBe(screen.getByRole('img', { name: 'Closed' }));
    expect(ref.current).toHaveAttribute('width', '28');
    expect(ref.current).toHaveAttribute('data-testid', 'subset-icon');
  });

  it('server-renders complete glyphs and hydrates without changing their accessible names', async () => {
    const content = <><Icon name="search" /><SearchIcon name="search" label="Search" size={24} /></>;
    const html = renderToString(content);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      expect(container.querySelectorAll('svg')).toHaveLength(2);
      for (const svg of container.querySelectorAll('svg')) expect(svg.childElementCount).toBeGreaterThan(0);
      await act(async () => { root = hydrateRoot(container, content, { onRecoverableError }); });
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(screen.getByRole('img', { name: 'Search' })).toHaveAttribute('width', '24');
      expect(container.innerHTML).toBe(html);
    } finally {
      if (root) await act(async () => { root!.unmount(); });
      container.remove();
    }
  });
});
