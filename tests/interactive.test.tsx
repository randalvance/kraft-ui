import { createRef, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ActionableList, ActionableListItem, Dialog, Drawer, RadioGroup, ResizablePane } from '../src';

describe('RadioGroup', () => {
  const options = [
    { value: 'light', label: 'Light', description: 'A fresh sheet' },
    { value: 'night', label: 'Night', description: 'A quiet desk' },
    { value: 'retired', label: 'Retired', disabled: true },
  ];

  it('uses native radio inputs, form submission, and a named fieldset', async () => {
    const onValueChange = vi.fn();
    const ref = createRef<HTMLFieldSetElement>();
    const { container } = render(<form><RadioGroup ref={ref} label="Theme" name="theme" options={options}
      defaultValue="light" onValueChange={onValueChange} required /></form>);
    const group = screen.getByRole('group', { name: 'Theme' });
    expect(ref.current).toBe(group);
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveAccessibleDescription('A fresh sheet');
    await userEvent.click(screen.getByText('Night'));
    expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith('night', options[1]);
    expect(new FormData(container.querySelector('form')!).get('theme')).toBe('night');
    expect(screen.getByRole('radio', { name: 'Retired' })).toBeDisabled();
  });

  it('supports controlled selection and server rendering', async () => {
    function Controlled() {
      const [value, setValue] = useState('light');
      return <RadioGroup label="Theme" name="theme" options={options} value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByText('Night'));
    expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
    expect(renderToString(<RadioGroup label="Theme" name="theme" options={options} />)).toContain('type="radio"');
  });
});

describe('ActionableList', () => {
  it('keeps primary and secondary actions separate', async () => {
    const open = vi.fn(), more = vi.fn();
    render(<ActionableList aria-label="Sessions"><ActionableListItem label="Plan the release" description="Working now"
      current onActivate={open} actions={<button type="button" onClick={more}>More</button>} />
      <ActionableListItem label="Older session" disabled /></ActionableList>);
    const list = screen.getByRole('list', { name: 'Sessions' });
    await userEvent.click(within(list).getByRole('button', { name: 'More' }));
    expect(more).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
    const row = within(list).getByRole('button', { name: /Plan the release/ });
    expect(row).toHaveAttribute('aria-current', 'page');
    await userEvent.click(row);
    expect(open).toHaveBeenCalledOnce();
    expect(within(list).getByRole('button', { name: 'Older session' })).toBeDisabled();
  });

  it('uses an anchor when a destination is provided', () => {
    render(<ActionableList aria-label="Pages"><ActionableListItem label="Notes" href="/notes" /></ActionableList>);
    expect(screen.getByRole('link', { name: 'Notes' })).toHaveAttribute('href', '/notes');
  });
});

describe('Drawer and ResizablePane', () => {
  it('labels its sheet and closes through the caller', async () => {
    const onClose = vi.fn();
    render(<Drawer title="Artifacts" description="Pinned from this session" onClose={onClose}>A paper plan</Drawer>);
    const drawer = screen.getByRole('complementary', { name: 'Artifacts' });
    expect(drawer).toHaveAccessibleDescription('Pinned from this session');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Close panel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('forwards native aside props and supports rich heading content without a close action', () => {
    const ref = createRef<HTMLElement>();
    render(<Drawer ref={ref} id="proofs" title={<>Print <em>proofs</em></>}
      eyebrow={<span>Draft</span>} description={<p>Ready for <strong>review</strong></p>}
      actions={<button>Pin</button>} footer="Last edited today" footerPlacement="scroll" />);
    const drawer = screen.getByRole('complementary', { name: 'Print proofs' });
    expect(ref.current).toBe(drawer);
    expect(drawer.tagName).toBe('ASIDE');
    expect(drawer).toHaveAttribute('id', 'proofs');
    expect(drawer).toHaveAccessibleDescription('Ready for review');
    expect(within(drawer).getByRole('heading').previousElementSibling).toHaveTextContent('Draft');
    expect(within(drawer).getByRole('button', { name: 'Pin' })).toBeEnabled();
    expect(within(drawer).queryByRole('button', { name: 'Close panel' })).not.toBeInTheDocument();
  });

  it('resizes with keyboard and keeps the main pane when closed', async () => {
    const sizes: number[] = [];
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<ResizablePane ref={ref} main={<p>Main</p>} pane={<p>Side</p>}
      defaultSize={360} onSizeChange={next => sizes.push(next)} />);
    Object.defineProperty(ref.current, 'clientWidth', { value: 900, configurable: true });
    fireEvent(window, new Event('resize'));
    const handle = screen.getByRole('separator', { name: 'Resize side pane' });
    handle.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(handle).toHaveAttribute('aria-valuenow', '376');
    expect(sizes).toEqual([376]);
    await userEvent.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '240');
    rerender(<ResizablePane ref={ref} main={<p>Main</p>} pane={<p>Side</p>} open={false} />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.queryByText('Side')).not.toBeInTheDocument();
  });

  it('renders a split pane and stacked drawers on the server', () => {
    const html = renderToString(<ResizablePane side="start" main="Session notes" pane={<>
      <Drawer title="Print files" />
      <Drawer title="Approvals" />
    </>} />);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const divider = doc.querySelector('[role="separator"]')!;
    const side = doc.getElementById(divider.getAttribute('aria-controls')!);
    expect(side?.nextElementSibling).toBe(divider);
    expect(side?.querySelectorAll('aside')).toHaveLength(2);
    expect(divider.nextElementSibling?.textContent).toBe('Session notes');
  });
});

describe('Dialog', () => {
  it('forwards the native element, props, and ref and associates rich content', () => {
    const ref = createRef<HTMLDialogElement>();
    const { getByTestId } = render(<Dialog ref={ref} data-testid="proof-dialog" titleAs="h3"
      open={false} onOpenChange={() => {}} title={<em>Print proof</em>} description={<p>Ready for <strong>review</strong>.</p>}
      eyebrow={<span>Draft</span>} size="sm" actions={<button>Pin proof</button>} />);
    const dialog = getByTestId('proof-dialog') as HTMLDialogElement;
    expect(ref.current).toBe(dialog);
    expect(dialog).toBeInstanceOf(HTMLDialogElement);
    expect(dialog).toHaveAttribute('data-size', 'sm');
    expect(dialog).not.toHaveAttribute('open');
    const heading = document.getElementById(dialog.getAttribute('aria-labelledby')!);
    expect(heading?.tagName).toBe('H3');
    expect(heading).toHaveTextContent('Print proof');
    expect(heading?.previousElementSibling).toHaveTextContent('Draft');
    expect(document.getElementById(dialog.getAttribute('aria-describedby')!)?.querySelector('p')).toHaveTextContent('Ready for review.');
    expect(dialog.querySelector('button')?.textContent).toBe('Pin proof');
  });

  it('renders an initially open dialog as native markup on the server for modal activation on mount', () => {
    const html = renderToString(<Dialog open onOpenChange={() => {}} title="Proof" description="Ready for review." />);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const dialog = doc.querySelector('dialog')!;
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(doc.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Proof');
    expect(doc.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent).toBe('Ready for review.');
  });
});
