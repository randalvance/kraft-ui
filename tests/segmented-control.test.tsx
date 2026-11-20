import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl, ToggleChips, type SegmentOption } from '../src';

const options: SegmentOption[] = [
  { value: 'all', label: 'All', count: 0, description: 'Every item' },
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off', disabled: true },
];

describe('segmented choices', () => {
  it('forwards native fieldset props and the ref and exposes concise names and optional details', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<SegmentedControl ref={ref} id="filter" label="Show" hideLabel name="show" options={options} defaultValue="all" required />);
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Show' }));
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
    expect(ref.current).toHaveAttribute('id', 'filter');
    const all = screen.getByRole('radio', { name: 'All' });
    expect(all).toHaveAccessibleDescription('Every item Count 0');
    expect(all).toBeChecked();
    expect(all).toBeRequired();
    expect(screen.getByRole('radio', { name: 'Off' })).toBeDisabled();
  });

  it('uses a controlled radio value and associates the inputs with an external form', async () => {
    const onValueChange = vi.fn();
    const ref = createRef<HTMLFormElement>();
    const component = (value: string) => <>
      <form id="filters" ref={ref} />
      <SegmentedControl label="Show" form="filters" name="show" options={options} value={value} onValueChange={onValueChange} />
    </>;
    const { rerender } = render(component('all'));
    await userEvent.click(screen.getByRole('radio', { name: 'On' }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('on', options[1]);
    expect(new FormData(ref.current!).get('show')).toBe('all');
    rerender(component('on'));
    expect(new FormData(ref.current!).get('show')).toBe('on');
  });

  it('reports the live checkbox selection and submits only enabled values', async () => {
    const ref = createRef<HTMLFieldSetElement>();
    const onValueChange = vi.fn();
    render(<form aria-label="Settings">
      <ToggleChips ref={ref} label="Filters" name="filters" options={options} defaultValue={['all', 'off']} onValueChange={onValueChange} />
    </form>);
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Filters' }));
    expect(screen.getByRole('checkbox', { name: 'Off' })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: 'On' }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(['all', 'on', 'off'], options[1]);
    expect(new FormData(screen.getByRole<HTMLFormElement>('form')).getAll('filters')).toEqual(['all', 'on']);
  });

  it('keeps controlled checkboxes in sync and omits a disabled group from the form', async () => {
    const onValueChange = vi.fn();
    const component = (value: readonly string[], disabled = false) => <>
      <form id="filters" aria-label="Settings" />
      <ToggleChips label="Filters" form="filters" name="filters" options={options} value={value} disabled={disabled} onValueChange={onValueChange} />
    </>;
    const { rerender } = render(component(['all', 'on']));
    const all = screen.getByRole('checkbox', { name: 'All' });
    await userEvent.click(all);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(['on'], options[0]);
    expect(all).toBeChecked();
    rerender(component(['on'], true));
    expect(all).not.toBeChecked();
    expect(all).toBeDisabled();
    expect(new FormData(screen.getByRole<HTMLFormElement>('form')).getAll('filters')).toEqual([]);
  });

  it('renders native controls, default selections, and accessible ID references on the server', () => {
    const html = renderToString(<>
      <SegmentedControl label="Show" name="show" options={options} defaultValue="all" />
      <ToggleChips label="Filters" name="filters" options={options} defaultValue={['on']} />
    </>);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect([...doc.querySelectorAll('legend')].map(legend => legend.textContent)).toEqual(['Show', 'Filters']);
    expect(doc.querySelector('input[type=radio]:checked')?.getAttribute('value')).toBe('all');
    expect(doc.querySelector('input[type=checkbox]:checked')?.getAttribute('value')).toBe('on');
    for (const input of doc.querySelectorAll('input')) {
      const labelId = input.getAttribute('aria-labelledby')!;
      expect(doc.getElementById(labelId)?.textContent?.toLowerCase()).toBe(input.getAttribute('value'));
    }
  });
});
