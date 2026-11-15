import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Button, IconButton, ThemeProvider, Surface, Heading, Sticker, Separator, Link, Box } from '../src';

describe('native interaction contracts', () => {
 it('supports keyboard activation and forwards its native ref', async () => {
  const click = vi.fn(), ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref} onClick={click}>Keep</Button>);
  await userEvent.tab(); expect(ref.current).toHaveFocus();
  await userEvent.keyboard('{Enter} '); expect(click).toHaveBeenCalledTimes(2);
 });
 it('does not submit forms by default and permits explicit submit', async () => {
  const submit = vi.fn(e => e.preventDefault());
  render(<form onSubmit={submit}><Button>Keep</Button><Button type="submit">Send</Button></form>);
  await userEvent.click(screen.getByText('Keep')); expect(submit).not.toHaveBeenCalled();
  await userEvent.click(screen.getByText('Send')); expect(submit).toHaveBeenCalledOnce();
 });
 it('prevents busy and disabled controls from firing while retaining names', async () => {
  const click = vi.fn(); render(<><Button loading onClick={click}>Saving</Button><Button disabled onClick={click}>Unavailable</Button></>);
  const busy = screen.getByRole('button', { name: 'Saving' });
  expect(busy).toHaveAttribute('aria-busy', 'true');
  await userEvent.click(busy); await userEvent.click(screen.getByText('Unavailable')); expect(click).not.toHaveBeenCalled();
 });
 it('exposes icon names and preserves anchor semantics', () => {
  render(<><IconButton aria-label="Add note"><svg aria-hidden="true" /></IconButton><Link href="/notes">Notes</Link></>);
  expect(screen.getByRole('button', { name: 'Add note' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Notes' })).toHaveAttribute('href', '/notes');
 });
});
describe('composition and server rendering', () => {
 it('preserves chosen semantics and polymorphic refs', () => {
  const ref = createRef<HTMLElement>(); render(<Surface as="article" ref={ref} aria-label="Note"><Heading as="h3">A note</Heading><Box as="ul"><Box as="li">An item</Box></Box></Surface>);
  expect(ref.current).toBe(screen.getByRole('article', { name: 'Note' })); expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('A note'); expect(screen.getByRole('listitem')).toHaveTextContent('An item');
 });
 it('scopes themes and preferences without modifying the document', () => {
  const before = document.documentElement.outerHTML;
  const html = renderToString(<ThemeProvider theme="night" texture={false} motion={false} tilt={false}><ThemeProvider theme="paper"><Button>Keep</Button></ThemeProvider></ThemeProvider>);
  expect(html).toContain('data-kraft-theme="night"'); expect(html).toContain('data-kraft-theme="paper"'); expect(html).toContain('data-kraft-texture="off"'); expect(document.documentElement.outerHTML).toBe(before);
 });
 it('keeps decorative stickers and rules out of the accessibility tree', () => {
  const { container } = render(<><Sticker decorative>Extra</Sticker><Sticker>Ready</Sticker><Separator decorative /><Separator orientation="vertical" /></>);
  expect(screen.getByText('Extra')).toHaveAttribute('aria-hidden','true'); expect(screen.getByText('Ready')).not.toHaveAttribute('aria-hidden'); expect(screen.getAllByRole('separator')).toHaveLength(1); expect(container.querySelector('[aria-orientation="vertical"]')).toBeTruthy();
 });
});
