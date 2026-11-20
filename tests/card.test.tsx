import { createRef } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Card, CardAddTile } from '../src';

describe('Card', () => {
  it('renders the paper slots in a native article and forwards its ref and native props', () => {
    const ref = createRef<HTMLElement>();
    render(<Card ref={ref} id="proof" aria-labelledby="proof-title" className="proof" tone="navy" tilt={1.5} off
      header={<h2 id="proof-title">Poster proof</h2>}
      media={<img src="/proof.png" alt="Red poster" />}
      corner={<button type="button">Pin proof</button>}
      footer={<a href="/proof-guide">Proof guide</a>}>
      <p>Check the red ink.</p>
    </Card>);
    const frame = screen.getByRole('article', { name: 'Poster proof' });
    const card = within(frame);
    expect(frame).toBe(ref.current);
    expect(frame).toHaveAttribute('id', 'proof');
    expect(frame).toHaveClass('proof');
    expect(frame).toHaveAttribute('data-tone', 'navy');
    expect(frame).toHaveAttribute('data-off', 'true');
    expect(frame).toHaveStyle('--kraft-card-tilt: 1.5deg');
    expect(card.getByRole('heading', { name: 'Poster proof' })).toBeVisible();
    expect(card.getByRole('img', { name: 'Red poster' })).toBeVisible();
    expect(card.getByRole('button', { name: 'Pin proof' })).toBeEnabled();
    expect(card.getByText('Check the red ink.')).toBeVisible();
    expect(card.getByRole('link', { name: 'Proof guide' })).toHaveAttribute('href', '/proof-guide');
  });

  it('forwards anchor semantics, current state and ref to the primary link', () => {
    const ref = createRef<HTMLAnchorElement>();
    const open = vi.fn(event => event.preventDefault());
    render(<Card as="a" ref={ref} href="/boards" target="_blank" rel="noreferrer" selected onClick={open}
      aria-current="page" aria-labelledby="boards-title" header={<h2 id="boards-title">Boards</h2>}
      footer={<a href="/board-guide">Board guide</a>} />);
    const main = screen.getByRole('link', { name: 'Boards', current: 'page' });
    const guide = screen.getByRole('link', { name: 'Board guide' });
    expect(main).toBe(ref.current);
    expect(main).toHaveAttribute('href', '/boards');
    expect(main).toHaveAttribute('target', '_blank');
    expect(main).toHaveAttribute('rel', 'noreferrer');
    expect(main).not.toContainElement(guide);
    fireEvent.click(main);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('keeps a button and its slot controls independent, including when disabled', () => {
    const ref = createRef<HTMLButtonElement>();
    const open = vi.fn();
    const pin = vi.fn();
    const submit = vi.fn(event => event.preventDefault());
    const card = (disabled = false) => <form onSubmit={submit}>
      <Card as="button" ref={ref} aria-label="Open proof" selected={disabled} disabled={disabled} off onClick={open}
        corner={<button type="button" onClick={pin}>Pin proof</button>}>Poster proof</Card>
    </form>;
    const { rerender } = render(card());
    const main = screen.getByRole('button', { name: 'Open proof', pressed: false });
    expect(main).toBe(ref.current);
    expect(main).toHaveAttribute('type', 'button');
    expect(main).toBeEnabled();
    fireEvent.click(main);
    fireEvent.click(screen.getByRole('button', { name: 'Pin proof' }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(pin).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();

    rerender(card(true));
    expect(main).toBeDisabled();
    expect(main).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(main);
    fireEvent.click(screen.getByRole('button', { name: 'Pin proof' }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(pin).toHaveBeenCalledTimes(2);
  });

  it('server-renders every variant and its associated action name', () => {
    const html = renderToString(<>
      <Card header="Studio" />
      <Card as="a" href="/boards" aria-labelledby="boards-title" selected header={<h2 id="boards-title">Boards</h2>} />
      <Card as="button" aria-label="Select proof" selected corner={<button type="button">Pin proof</button>} />
      <CardAddTile label="Add board" />
    </>);
    const markup = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
    expect(markup.getAllByRole('article')).toHaveLength(3);
    expect(markup.getByRole('link', { name: 'Boards', current: true })).toHaveAttribute('href', '/boards');
    expect(markup.getByRole('button', { name: 'Select proof', pressed: true }))
      .not.toContainElement(markup.getByRole('button', { name: 'Pin proof' }));
    expect(markup.getByRole('button', { name: 'Add board' })).toHaveTextContent('Add board');
  });
});

describe('CardAddTile', () => {
  it('forwards native button props and the ref and uses its printed label as the name', () => {
    const ref = createRef<HTMLButtonElement>();
    const add = vi.fn();
    render(<CardAddTile ref={ref} label="Add workspace" className="add" name="add-workspace" onClick={add} />);
    const tile = screen.getByRole('button', { name: 'Add workspace' });
    expect(tile).toBe(ref.current);
    expect(tile).toHaveClass('add');
    expect(tile).toHaveAttribute('type', 'button');
    expect(tile).toHaveAttribute('name', 'add-workspace');
    expect(tile.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(tile);
    expect(add).toHaveBeenCalledOnce();
  });
});
