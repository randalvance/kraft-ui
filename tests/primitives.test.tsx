import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Button, Icon, IconButton, ThemeProvider, Surface, Heading, Sticker, Separator, Link, Box, PaperPanel, Text } from '../src';

describe('native interaction contracts', () => {
 it('supports keyboard activation and forwards its native ref', async () => {
  const click = vi.fn(), ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref} variant="ghost" leading={<Icon name="pin" label="Pin glyph" />} onClick={click}>Keep</Button>);
  expect(ref.current).toBe(screen.getByRole('button', { name: 'Keep' }));
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  await userEvent.tab(); expect(ref.current).toHaveFocus();
  await userEvent.keyboard('{Enter} '); expect(click).toHaveBeenCalledTimes(2);
 });
 it('does not submit forms by default and permits explicit submit', async () => {
  const submit = vi.fn(e => e.preventDefault());
  render(<form onSubmit={submit}><IconButton variant="bare" aria-label="Keep"><Icon name="pin" /></IconButton><Button variant="dashed" type="submit">Send</Button></form>);
  await userEvent.click(screen.getByRole('button', { name: 'Keep' })); expect(submit).not.toHaveBeenCalled();
  await userEvent.click(screen.getByText('Send')); expect(submit).toHaveBeenCalledOnce();
 });
 it('prevents busy and disabled controls from firing while retaining names', async () => {
  const click = vi.fn();
  render(<>
    <Button loading onClick={click}>Saving</Button>
    <IconButton loading onClick={click} aria-label="Refreshing"><svg data-testid="action-icon" /></IconButton>
    <Button disabled onClick={click}>Unavailable</Button>
  </>);
  const busy = screen.getByRole('button', { name: 'Saving' });
  const iconButton = screen.getByRole('button', { name: 'Refreshing' });
  for (const button of [busy, iconButton]) {
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(button.querySelector('.kraft-pinwheel')).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(button);
  }
  expect(screen.queryByTestId('action-icon')).not.toBeInTheDocument();
  await userEvent.click(screen.getByText('Unavailable'));
  expect(click).not.toHaveBeenCalled();
 });
 it('exposes icon names and preserves anchor semantics', () => {
  render(<><IconButton aria-label="Add note"><svg aria-hidden="true" /></IconButton><Link href="/notes">Notes</Link></>);
  expect(screen.getByRole('button', { name: 'Add note' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Notes' })).toHaveAttribute('href', '/notes');
 });
 it('forwards an icon button ref and keeps its badge and accessible name while busy', () => {
  const ref = createRef<HTMLButtonElement>();
  const view = render(<IconButton ref={ref} variant="bare" aria-label="Inbox, 12 unread" badge={<Sticker size="count">12</Sticker>}>
    <Icon name="inbox" />
  </IconButton>);
  const button = screen.getByRole('button', { name: 'Inbox, 12 unread' });
  expect(ref.current).toBe(button);
  expect(button).toHaveAttribute('type', 'button');
  expect(screen.getByText('12').parentElement).toHaveAttribute('aria-hidden', 'true');
  view.rerender(<IconButton ref={ref} variant="bare" aria-label="Inbox, 12 unread" badge={<Sticker size="count">12</Sticker>} loading>
    <Icon name="inbox" />
  </IconButton>);
  expect(screen.getByRole('button', { name: 'Inbox, 12 unread' })).toBe(button);
  expect(button).toBeDisabled();
  expect(screen.getByText('12')).toBeInTheDocument();
  expect(button.querySelectorAll('svg')).toHaveLength(1);
 });
});
describe('composition and server rendering', () => {
 it('renders quiet buttons, toggle state, and decorative slots on the server', () => {
  const html = renderToString(<>
    <Button variant="text" tone="danger" leading={<Icon name="trash" />} wrap>Remove draft</Button>
    <IconButton variant="bare" aria-label="Inbox, no unread messages" badge={0} aria-pressed>
      <Icon name="inbox" />
    </IconButton>
  </>);
  const container = document.createElement('div');
  container.innerHTML = html;
  const [textButton, iconButton] = container.querySelectorAll('button');
  expect(textButton).toHaveAttribute('data-variant', 'text');
  expect(textButton).toHaveAttribute('data-button-tone', 'danger');
  expect(textButton).toHaveAttribute('data-button-wrap', 'true');
  expect(textButton.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  expect(textButton).toHaveTextContent('Remove draft');
  expect(iconButton).toHaveAttribute('data-variant', 'bare');
  expect(iconButton).toHaveAttribute('aria-pressed', 'true');
  expect(iconButton).toHaveAttribute('aria-label', 'Inbox, no unread messages');
  expect(iconButton.lastElementChild).toHaveTextContent('0');
 });
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
 it('labels a blank paper panel and keeps controls and content in their slots', () => {
  const ref = createRef<HTMLElement>();
  const { container } = render(<PaperPanel ref={ref} title="Workshop" titleAs="h3" controls={<Button>Close</Button>} footer={<Text>Ready</Text>} data-testid="workshop"><Text>Notes</Text></PaperPanel>);
  const region = screen.getByRole('region', { name: 'Workshop' });
  expect(ref.current).toBe(region);
  expect(region).toHaveAttribute('data-testid', 'workshop');
  expect(screen.getByRole('heading', { level: 3, name: 'Workshop' })).toBeInTheDocument();
  expect(container.querySelector('.kraft-paper-panel-controls button')).toHaveTextContent('Close');
  expect(container.querySelector('.kraft-paper-panel-body')).toHaveTextContent('Notes');
  expect(container.querySelector('.kraft-paper-panel-footer')).toHaveTextContent('Ready');
  const blank = renderToString(<PaperPanel title="Blank" />);
  expect(blank).toContain('kraft-paper-panel-body');
 });
});
