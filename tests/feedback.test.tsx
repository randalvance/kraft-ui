import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Banner, Button, Callout, EmptyState, Toast, ToastRegion, Toggle } from '../src';

afterEach(() => { vi.useRealTimers(); });

describe('Banner', () => {
  it('forwards the ref and native attributes and keeps the control before the line by default', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Banner ref={ref} tone="attention" title="Autopilot is on." role="status" id="autopilot" className="top" data-app="desk"
      control={<Toggle defaultChecked>Autopilot</Toggle>}>Agents merge without asking.</Banner>);
    const banner = screen.getByRole('status');
    expect(banner).toBe(ref.current);
    expect(banner.tagName).toBe('DIV');
    expect(banner).toHaveClass('kraft-banner', 'top');
    expect(banner).toHaveAttribute('id', 'autopilot');
    expect(banner).toHaveAttribute('data-app', 'desk');
    expect(banner).toHaveAttribute('data-tone', 'attention');
    expect(banner).toHaveTextContent('Autopilot is on. Agents merge without asking.');
    expect(banner.firstElementChild).toHaveClass('kraft-banner-control');
    expect(banner.querySelector('strong')).toHaveTextContent('Autopilot is on.');
    expect(screen.getByRole('switch', { name: 'Autopilot' })).toBeChecked();
  });

  it('puts an end control after the line in the document and has no role of its own', () => {
    const { container } = render(<Banner controlSide="end" control={<Button>Review</Button>}>Two cards are waiting.</Banner>);
    const banner = container.querySelector('.kraft-banner')!;
    expect(banner).not.toHaveAttribute('role');
    expect(banner).toHaveAttribute('data-tone', 'neutral');
    expect(banner.firstElementChild).toHaveClass('kraft-banner-line');
    expect(banner.lastElementChild).toHaveClass('kraft-banner-control');
  });

  it('omits empty slots and renders on the server', () => {
    const { container } = render(<Banner control={false}>Line only</Banner>);
    expect(container.querySelector('.kraft-banner-control')).toBeNull();
    expect(container.querySelector('.kraft-banner-title')).toBeNull();
    expect(renderToString(<Banner tone="danger" title="Paused." control={<Button>Resume</Button>}>Runs stop tonight.</Banner>))
      .toContain('data-tone="danger"');
  });
});

describe('Callout', () => {
  it('is a note with a hidden icon, and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Callout ref={ref} tone="blue" title="Heads up" leading={<svg data-testid="icon" />} id="note" className="wide" aria-label="Draft notice">Drafts stay on this device.</Callout>);
    const note = screen.getByRole('note', { name: 'Draft notice' });
    expect(note).toBe(ref.current);
    expect(note).toHaveClass('kraft-callout', 'wide');
    expect(note).toHaveAttribute('id', 'note');
    expect(note).toHaveAttribute('data-tone', 'blue');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(note.querySelector('.kraft-callout-title')).toHaveTextContent('Heads up');
    expect(note.querySelector('.kraft-callout-body')).toHaveTextContent('Drafts stay on this device.');
  });

  it('offers a danger form whose action is a real control, and lets the role be replaced', async () => {
    const onDelete = vi.fn();
    render(<Callout tone="danger" role="alert" title="Delete this workspace" action={<Button variant="danger" onClick={onDelete}>Delete workspace</Button>}>
      This cannot be undone.
    </Callout>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-tone', 'danger');
    const button = screen.getByRole('button', { name: 'Delete workspace' });
    expect(alert).toContainElement(button);
    expect(alert.lastElementChild).toHaveClass('kraft-callout-action');
    await userEvent.setup().click(button);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('renders on the server without optional parts', () => {
    const html = renderToString(<Callout>Plain note</Callout>);
    expect(html).toContain('role="note"');
    expect(html).not.toContain('kraft-callout-title');
    expect(html).not.toContain('kraft-callout-action');
  });
});

describe('EmptyState', () => {
  it('prints the title as a paragraph, the note, and the action, and forwards the ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} title="No cards yet" leading={<svg data-testid="mark" />} action={<Button>Add a card</Button>} id="empty" className="tall">
      Cards appear when an agent picks up a task.
    </EmptyState>);
    const empty = ref.current!;
    expect(empty).toHaveClass('kraft-empty-state', 'tall');
    expect(empty).toHaveAttribute('id', 'empty');
    expect(empty).toHaveAttribute('data-size', 'md');
    expect(screen.getByText('No cards yet').tagName).toBe('P');
    expect(screen.queryByRole('heading')).toBeNull();
    expect(empty).toHaveTextContent('Cards appear when an agent picks up a task.');
    expect(screen.getByTestId('mark').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(empty).toContainElement(screen.getByRole('button', { name: 'Add a card' }));
  });

  it('takes a heading level and a small size, and renders on the server', () => {
    render(<EmptyState title="Nothing matches" titleAs="h3" size="sm" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Nothing matches' })).toHaveClass('kraft-empty-state-title');
    const html = renderToString(<EmptyState title="All caught up" size="sm" />);
    expect(html).toContain('data-size="sm"');
    expect(html).not.toContain('kraft-empty-state-note');
  });
});

describe('Toast', () => {
  it('is a polite atomic status with native Undo and close buttons, and forwards the ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Toast ref={ref} onUndo={() => {}} onDismiss={() => {}} id="archived" className="mine" data-app="desk">Card archived</Toast>);
    const toast = screen.getByRole('status');
    expect(toast).toBe(ref.current);
    expect(toast).toHaveClass('kraft-toast', 'mine');
    expect(toast).toHaveAttribute('id', 'archived');
    expect(toast).toHaveAttribute('data-app', 'desk');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
    expect(toast).toHaveTextContent('Card archived');
    for (const name of ['Undo', 'Dismiss']) {
      const button = screen.getByRole('button', { name });
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
    }
    expect(screen.getByRole('button', { name: 'Dismiss' }).querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows only the controls it has handlers for, with custom labels', () => {
    const { rerender } = render(<Toast>Saved</Toast>);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<Toast onUndo={() => {}} undoLabel="Restore">Deleted</Toast>);
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['Restore']);
    rerender(<Toast onDismiss={() => {}} dismissLabel="Close notice">Synced</Toast>);
    expect(screen.getByRole('button', { name: 'Close notice' })).toBeInTheDocument();
  });

  it('undoes and then reports why it is leaving', async () => {
    const calls: string[] = [];
    render(<Toast onUndo={() => calls.push('undo')} onDismiss={reason => calls.push(`dismiss:${reason}`)}>Card archived</Toast>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(calls).toEqual(['undo', 'dismiss:undo', 'dismiss:close']);
  });

  it('dismisses on Escape from inside, unless the event was already handled', async () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Toast onDismiss={onDismiss}>Card archived</Toast>);
    const user = userEvent.setup();
    screen.getByRole('button', { name: 'Dismiss' }).focus();
    await user.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledExactlyOnceWith('close');
    rerender(<Toast onDismiss={onDismiss} onKeyDown={event => event.preventDefault()}>Card archived</Toast>);
    await user.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('times out after the duration, and waits while hovered or focused', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast duration={1000} onUndo={() => {}} onDismiss={onDismiss}>Card archived</Toast>);
    const toast = screen.getByRole('status');
    act(() => { vi.advanceTimersByTime(900); });
    fireEvent.pointerEnter(toast);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.pointerLeave(toast);
    act(() => { screen.getByRole('button', { name: 'Undo' }).focus(); });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { screen.getByRole('button', { name: 'Undo' }).blur(); });
    act(() => { vi.advanceTimersByTime(999); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onDismiss).toHaveBeenCalledExactlyOnceWith('timeout');
  });

  it('stays until dismissed without a duration', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast onDismiss={onDismiss}>Saved</Toast>);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('returns focus to what had it when the toast appeared', async () => {
    function Demo() {
      return <><button type="button">Archive</button><Toast onDismiss={() => {}}>Card archived</Toast></>;
    }
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    render(<Demo />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('renders on the server', () => {
    const html = renderToString(<ToastRegion><Toast onUndo={() => {}}>Card archived</Toast></ToastRegion>);
    expect(html).toContain('role="status"');
    expect(html).toContain('Undo');
  });
});

describe('ToastRegion', () => {
  it('is a named landmark that holds toasts and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ToastRegion ref={ref} placement="top-end" id="toasts" className="mine"><Toast>Saved</Toast></ToastRegion>);
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toBe(ref.current);
    expect(region).toHaveClass('kraft-toast-region', 'mine');
    expect(region).toHaveAttribute('id', 'toasts');
    expect(region).toHaveAttribute('data-placement', 'top-end');
    expect(region).toContainElement(screen.getByRole('status'));
  });

  it('defaults to the bottom and takes another name', () => {
    render(<ToastRegion label="Activity" />);
    expect(screen.getByRole('region', { name: 'Activity' })).toHaveAttribute('data-placement', 'bottom');
  });
});
