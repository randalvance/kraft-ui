import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StatusDot, StatusSticker, type StatusTone } from '../src';

const tones: StatusTone[] = ['working', 'waiting', 'blocked', 'done', 'idle'];

describe('StatusDot', () => {
  it('names a dot without text as one image and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusDot ref={ref} tone="working" label="Working" id="pip-state" className="corner" data-app="desk" title="Pip is working" />);
    const dot = screen.getByRole('img', { name: 'Working' });
    expect(dot).toBe(ref.current);
    expect(dot.tagName).toBe('SPAN');
    expect(dot).toHaveClass('kraft-status-dot', 'corner');
    expect(dot).toHaveAttribute('id', 'pip-state');
    expect(dot).toHaveAttribute('data-app', 'desk');
    expect(dot).toHaveAttribute('title', 'Pip is working');
    expect(dot).toHaveAttribute('data-size', '10');
    expect(dot.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(dot.querySelector('svg')).toHaveAttribute('focusable', 'false');
    expect(dot).not.toHaveAttribute('tabindex');
  });

  it('prints a visible label as plain text instead of an image', () => {
    render(<ul><li><StatusDot tone="blocked">Blocked by review</StatusDot></li></ul>);
    expect(screen.queryByRole('img')).toBeNull();
    const item = screen.getByRole('listitem');
    expect(item).toHaveTextContent('Blocked by review');
    const dot = item.querySelector('.kraft-status-dot')!;
    expect(dot).not.toHaveAttribute('role');
    expect(dot).not.toHaveAttribute('aria-label');
    expect(dot.querySelector('.kraft-status-dot-label')).toHaveTextContent('Blocked by review');
  });

  it('gives each tone a distinct default form and lets variant and shape override it', () => {
    const { container } = render(<>{tones.map(tone => <StatusDot key={tone} tone={tone} label={tone} />)}</>);
    const forms = [...container.querySelectorAll('.kraft-status-dot')].map(dot =>
      `${dot.getAttribute('data-variant')} ${dot.getAttribute('data-shape')} ${dot.querySelector('.kraft-status-dot-tick') ? 'tick' : ''}`.trim());
    expect(forms).toEqual(['solid round', 'dashed round', 'solid square', 'solid round tick', 'hollow round']);
    expect(new Set(forms).size).toBe(tones.length);

    render(<StatusDot tone="done" variant="hollow" shape="square" size={12} label="Done" />);
    const done = screen.getByRole('img', { name: 'Done' });
    expect(done).toHaveAttribute('data-variant', 'hollow');
    expect(done).toHaveAttribute('data-shape', 'square');
    expect(done).toHaveAttribute('data-size', '12');
    expect(done.querySelector('rect.kraft-status-dot-stroke')).not.toBeNull();
    expect(done.querySelector('.kraft-status-dot-tick')).toBeNull();
  });

  it('fixes the dash count so the dashed ring keeps its rhythm at every size', () => {
    const { container } = render(<>
      <StatusDot tone="waiting" size={8} label="Waiting" />
      <StatusDot tone="waiting" shape="square" size={12} label="Waiting" />
    </>);
    const [round, square] = container.querySelectorAll('.kraft-status-dot-stroke');
    expect(round).toHaveAttribute('pathLength', '12');
    expect(square).toHaveAttribute('pathLength', '16');
    expect(round).toHaveAttribute('stroke-dasharray', '1.25 .75');
  });

  it('requires a visible label or an accessible label', () => {
    // @ts-expect-error A dot must not rely on colour alone.
    const unnamed = <StatusDot tone="idle" />;
    // @ts-expect-error A dot takes one kind of label, not both.
    const both = <StatusDot tone="idle" label="Idle">Idle</StatusDot>;
    expect([unnamed, both]).toHaveLength(2);
  });

  it('renders named and labelled dots on the server', () => {
    const doc = new DOMParser().parseFromString(renderToString(<>
      <StatusDot tone="idle" label="Idle" /><StatusDot tone="done">Done</StatusDot>
    </>), 'text/html');
    const [named, labelled] = doc.body.children;
    expect(named.getAttribute('role')).toBe('img');
    expect(named.getAttribute('aria-label')).toBe('Idle');
    expect(named.getAttribute('data-variant')).toBe('hollow');
    expect(labelled.getAttribute('role')).toBeNull();
    expect(labelled.textContent).toBe('Done');
    expect(labelled.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('StatusSticker', () => {
  it('renders the words as written and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusSticker ref={ref} tone="working" id="job" className="row-state" data-app="queue" role="status">Running</StatusSticker>);
    expect(ref.current?.tagName).toBe('SPAN');
    expect(ref.current).toHaveClass('kraft-status-sticker', 'row-state');
    expect(ref.current).toHaveAttribute('id', 'job');
    expect(ref.current).toHaveAttribute('data-app', 'queue');
    expect(ref.current).toHaveAttribute('data-variant', 'solid');
    expect(ref.current).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('status')).toHaveTextContent(/^Running$/);
    expect(ref.current?.querySelector('.kraft-status-sticker-indicator')).toBeNull();
  });

  it('adds a decorative dot or spinner inside without changing the text', () => {
    const { container } = render(<>
      <StatusSticker tone="blocked" variant="paper" indicator="dot">Blocked</StatusSticker>
      <StatusSticker tone="working" variant="ghost" indicator="spinner" size="sm">Running</StatusSticker>
    </>);
    const [paper, ghost] = container.querySelectorAll('.kraft-status-sticker');
    expect(paper).toHaveAttribute('data-variant', 'paper');
    expect(paper.querySelector('.kraft-status-sticker-indicator')).toHaveAttribute('aria-hidden', 'true');
    expect(paper.querySelector('rect.kraft-status-dot-stroke')).not.toBeNull();
    expect(paper).toHaveTextContent(/^Blocked$/);
    expect(ghost).toHaveAttribute('data-size', 'sm');
    const spinner = ghost.querySelector('.kraft-pinwheel')!;
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(spinner).not.toHaveAttribute('role');
    expect(ghost).toHaveTextContent(/^Running$/);
    expect(container.querySelector('[role]')).toBeNull();
  });

  it('renders every variant on the server', () => {
    const doc = new DOMParser().parseFromString(renderToString(<>
      <StatusSticker tone="idle">Idle</StatusSticker>
      <StatusSticker tone="done" variant="paper" indicator="dot">Done</StatusSticker>
      <StatusSticker tone="working" variant="ghost" indicator="spinner">Running</StatusSticker>
    </>), 'text/html');
    const [solid, paper, ghost] = doc.body.children;
    expect(solid.outerHTML).toBe('<span class="kraft-status-sticker" data-tone="idle" data-variant="solid" data-size="md"><span class="kraft-status-sticker-label">Idle</span></span>');
    expect(paper.querySelector('.kraft-status-dot-tick')).not.toBeNull();
    expect(ghost.querySelector('.kraft-pinwheel svg')).not.toBeNull();
  });
});
