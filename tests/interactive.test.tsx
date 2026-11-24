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

  it('lays options out in equal-width columns and keeps the trailing slot uncapped', () => {
    const { container } = render(<RadioGroup label="Plan" name="plan" columns={3} orientation="horizontal"
      options={[{ value: 'a', label: 'A', trailing: 'Picked by Mochi on Tuesday' }, { value: 'b', label: 'B' }]} />);
    const grid = container.querySelector('.kraft-radio-options')!;
    expect(grid).toHaveAttribute('data-columns', '3');
    expect(grid).toHaveStyle('--kraft-radio-columns: 3');
    expect(screen.getByText('Picked by Mochi on Tuesday')).toHaveClass('kraft-radio-trailing');
    for (const columns of [0, 2.7, Number.NaN]) {
      const { container: next } = render(<RadioGroup label="Plan" name={`plan-${columns}`} columns={columns} options={options} />);
      expect(next.querySelector('.kraft-radio-options')?.getAttribute('data-columns'))
        .toBe(Number.isNaN(columns) ? null : String(Math.max(1, Math.floor(columns))));
    }
  });

  it('names swatches and pictures without drawing or clipping a label', async () => {
    const ref = createRef<HTMLFieldSetElement>();
    const onValueChange = vi.fn();
    const swatches = [
      { value: 'teal', label: 'Teal', swatch: 'rgb(40, 120, 120)', description: 'Calm' },
      { value: 'plum', label: 'Plum', swatch: 'rgb(110, 50, 90)' },
      { value: 'ochre', label: 'Ochre', swatch: 'rgb(190, 140, 40)', disabled: true },
    ];
    const { container } = render(<form><RadioGroup ref={ref} label="Colour" name="colour" variant="swatch"
      options={swatches} defaultValue="teal" onValueChange={onValueChange} /></form>);
    expect(ref.current).toHaveAttribute('data-variant', 'swatch');
    const teal = screen.getByRole('radio', { name: 'Teal' });
    expect(teal).toBeChecked();
    expect(teal).toHaveAccessibleDescription('Calm');
    expect(screen.getByRole('radio', { name: 'Ochre' })).toBeDisabled();
    expect(container.querySelector('.kraft-radio-label, .kraft-visually-hidden:not(legend)')).toBeNull();
    expect(screen.queryByText('Teal')).toBeNull();
    expect(container.querySelector('.kraft-radio-swatch')).toHaveStyle('--kraft-radio-swatch: rgb(40, 120, 120)');
    await userEvent.click(container.querySelectorAll('.kraft-radio-swatch')[1]);
    expect(onValueChange).toHaveBeenCalledWith('plum', swatches[1]);
    expect(new FormData(container.querySelector('form')!).get('colour')).toBe('plum');

    render(<RadioGroup label="Portrait" name="portrait" variant="picture" defaultValue="pip" options={[
      { value: 'pip', label: 'Pip', picture: <img src="pip.png" alt="" /> },
      { value: 'kit', label: 'Kit', picture: <img src="kit.png" alt="" /> },
    ]} />);
    const portrait = screen.getByRole('group', { name: 'Portrait' });
    expect(within(portrait).getByRole('radio', { name: 'Pip' })).toBeChecked();
    expect(portrait.querySelectorAll('.kraft-radio-picture img')).toHaveLength(2);
    expect(within(portrait).queryByText('Pip')).toBeNull();
  });

  it('marks flat rows and server renders every variant', () => {
    render(<RadioGroup label="Sort" name="sort" variant="flat" options={options} defaultValue="night" />);
    expect(screen.getByRole('group', { name: 'Sort' })).toHaveAttribute('data-variant', 'flat');
    expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
    for (const variant of ['rows', 'flat', 'swatch', 'picture'] as const) {
      const html = renderToString(<RadioGroup label="Theme" name="theme" variant={variant} columns={2}
        options={[{ value: 'a', label: 'A', swatch: 'red', picture: <b>A</b> }]} />);
      expect(html).toContain('type="radio"');
      expect(html).toContain(`data-variant="${variant}"`);
    }
  });

  it('associates every radio with an external form', () => {
    render(<><form id="settings" /><RadioGroup label="Theme" name="theme" form="settings" variant="swatch"
      options={[{ value: 'a', label: 'A', swatch: 'red' }]} defaultValue="a" /></>);
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('form', 'settings');
  });
});

describe('ActionableList', () => {
  it('keeps primary and secondary actions separate', async () => {
    const open = vi.fn(), more = vi.fn();
    render(<ActionableList aria-label="Sessions"><ActionableListItem label="Plan the release" description="Working now"
      current onActivate={open} actions={<button type="button" onClick={more}>More</button>} />
      <ActionableListItem label="Older session" disabled onActivate={open} /></ActionableList>);
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

  it('forwards native list and item refs and renders rich static rows on the client and server', async () => {
    const listRef = createRef<HTMLUListElement>();
    const itemRef = createRef<HTMLLIElement>();
    const action = vi.fn();
    const list = <ActionableList ref={listRef} aria-label="Print queue" density="compact">
      <ActionableListItem ref={itemRef} id="proof" label={<><code>KW-12</code> Print proof</>}
        description={<>Review the <mark>margins</mark></>} truncateLabel clampDescription={2} done
        actionsVisibility="hover" actions={<button onClick={action}>Reopen print proof</button>} />
      <ActionableListItem label="Old proof" disabled />
    </ActionableList>;
    render(list);
    expect(listRef.current).toBe(screen.getByRole('list', { name: 'Print queue' }));
    expect(listRef.current?.tagName).toBe('UL');
    expect(itemRef.current).toBe(screen.getAllByRole('listitem')[0]);
    expect(itemRef.current?.id).toBe('proof');
    expect(screen.getByText('KW-12').tagName).toBe('CODE');
    expect(screen.getByText('margins').tagName).toBe('MARK');
    const reopen = screen.getByRole('button', { name: 'Reopen print proof' });
    expect(screen.getAllByRole('button')).toEqual([reopen]);
    await userEvent.tab();
    expect(reopen).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(action).toHaveBeenCalledOnce();

    const html = renderToString(list);
    expect(html).toContain('data-density="compact"');
    expect(html).toContain('<code>KW-12</code>');
    expect(html).toContain('--kraft-row-description-lines:2');
    expect(html).not.toContain('<button class="kraft-list-target"');
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
