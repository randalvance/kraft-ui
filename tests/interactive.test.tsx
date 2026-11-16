import { createRef, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ActionableList, ActionableListItem, Drawer, RadioGroup, ResizablePane } from '../src';

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

  it('resizes with keyboard and keeps the main pane when closed', async () => {
    const sizes: number[] = [];
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<ResizablePane ref={ref} main={<p>Main</p>} pane={<p>Side</p>}
      defaultSize={360} onSizeChange={next => sizes.push(next)} />);
    Object.defineProperty(ref.current, 'clientWidth', { value: 900, configurable: true });
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
});
