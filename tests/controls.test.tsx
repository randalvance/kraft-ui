import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, Toggle } from '../src';

describe('Checkbox', () => {
 it('is a labelled native checkbox toggled by pointer, label, and Space', async () => {
  const change = vi.fn(), ref = createRef<HTMLInputElement>();
  render(<Checkbox ref={ref} name="keep" value="yes" onChange={change}>Keep drafts</Checkbox>);
  const box = screen.getByRole('checkbox', { name: 'Keep drafts' });
  expect(ref.current).toBe(box);
  expect(box).toHaveAttribute('name', 'keep');
  await userEvent.click(screen.getByText('Keep drafts')); expect(box).toBeChecked();
  await userEvent.keyboard(' '); expect(box).not.toBeChecked();
  await userEvent.click(box); expect(box).toBeChecked();
  expect(change).toHaveBeenCalledTimes(3);
 });
 it('supports controlled state and the mixed state', async () => {
  function Group() {
   const [items, setItems] = useState([true, false]);
   const all = items.every(Boolean), some = items.some(Boolean);
   return <>
    <Checkbox checked={all} indeterminate={some && !all} onChange={e => setItems(items.map(() => e.target.checked))}>All notes</Checkbox>
    {items.map((on, i) => <Checkbox key={i} checked={on} onChange={e => setItems(items.map((v, j) => j === i ? e.target.checked : v))}>{`Note ${i + 1}`}</Checkbox>)}
   </>;
  }
  render(<Group />);
  const all = screen.getByRole('checkbox', { name: 'All notes' }) as HTMLInputElement;
  expect(all.indeterminate).toBe(true);
  await userEvent.click(screen.getByRole('checkbox', { name: 'Note 2' }));
  expect(all.indeterminate).toBe(false); expect(all).toBeChecked();
  await userEvent.click(all);
  expect(screen.getByRole('checkbox', { name: 'Note 1' })).not.toBeChecked();
 });
 it('reapplies a controlled mixed state after a parent render', async () => {
  const { rerender } = render(<Checkbox indeterminate>Some notes</Checkbox>);
  const box = screen.getByRole('checkbox', { name: 'Some notes' }) as HTMLInputElement;
  expect(box.indeterminate).toBe(true);
  await userEvent.click(box);
  rerender(<Checkbox indeterminate>Some notes</Checkbox>);
  expect(box.indeterminate).toBe(true);
 });
 it('announces descriptions alongside caller-supplied ones and respects disabled', async () => {
  const change = vi.fn();
  render(<><span id="extra">Shared hint</span><Checkbox description="Kept for 30 days" aria-describedby="extra" disabled onChange={change}>Archive</Checkbox></>);
  const box = screen.getByRole('checkbox', { name: 'Archive' });
  expect(box).toHaveAccessibleDescription('Shared hint Kept for 30 days');
  await userEvent.click(box); expect(change).not.toHaveBeenCalled(); expect(box).toBeDisabled();
 });
 it('submits with its form and renders on the server', () => {
  const { container } = render(<form><Checkbox name="tags" value="ideas" defaultChecked>Ideas</Checkbox></form>);
  expect(new FormData(container.querySelector('form')!).get('tags')).toBe('ideas');
  expect(renderToString(<Checkbox>Server</Checkbox>)).toContain('type="checkbox"');
 });
});

describe('Toggle', () => {
 it('is a labelled switch with immediate on/off state', async () => {
  const change = vi.fn(), ref = createRef<HTMLInputElement>();
  render(<Toggle ref={ref} onChange={change} description="Saves after each edit">Autosave</Toggle>);
  const toggle = screen.getByRole('switch', { name: 'Autosave' });
  expect(ref.current).toBe(toggle);
  expect(toggle).toHaveAccessibleDescription('Saves after each edit');
  expect(toggle).not.toBeChecked();
  await userEvent.click(toggle); expect(toggle).toBeChecked();
  await userEvent.keyboard(' '); expect(toggle).not.toBeChecked();
  expect(change).toHaveBeenCalledTimes(2);
 });
 it('accepts an aria-label without visible text and keeps class/style on the label', () => {
  const { container } = render(<Toggle aria-label="Night mode" className="mine" style={{ marginTop: 4 }} />);
  expect(screen.getByRole('switch', { name: 'Night mode' })).toBeInTheDocument();
  const label = container.querySelector('label')!;
  expect(label).toHaveClass('kraft-toggle', 'mine'); expect(label.style.marginTop).toBe('4px');
  expect(container.querySelector('.kraft-choice-text')).toBeNull();
 });
 it('participates in native form submission and validation', () => {
  const { container } = render(<form><Toggle name="autosave" value="on" defaultChecked required>Autosave</Toggle><Toggle name="other" value="on" defaultChecked disabled>Other</Toggle></form>);
  const form = container.querySelector('form')!;
  expect(new FormData(form).get('autosave')).toBe('on');
  expect(new FormData(form).has('other')).toBe(false);
  expect(form.checkValidity()).toBe(true);
 });
});
