import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, CheckboxGroup, CheckboxStatus, Toggle } from '../src';

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
 it('toggles from both slots and announces trailing text as a description', async () => {
  const change = vi.fn();
  render(<>
   <span id="hint">Shared hint</span>
   <Checkbox leading={<img src="/portrait.png" alt="Portrait" />} trailing="Due Friday"
    description="Cover stock" aria-describedby="hint" onChange={change}>Print covers</Checkbox>
  </>);
  const box = screen.getByRole('checkbox', { name: 'Print covers' });
  expect(box).toHaveAccessibleDescription('Shared hint Cover stock Due Friday');
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  await userEvent.click(screen.getByAltText('Portrait'));
  expect(box).toBeChecked();
  await userEvent.click(screen.getByText('Due Friday'));
  expect(box).not.toBeChecked();
  expect(change).toHaveBeenCalledTimes(2);
 });
});

describe('CheckboxStatus', () => {
 it('renders a named static mark with a span ref on the client and server', async () => {
  const ref = createRef<HTMLSpanElement>();
  const { container } = render(<form><CheckboxStatus ref={ref} checked label="Cover approved" /></form>);
  const status = screen.getByRole('img', { name: 'Cover approved' });
  expect(ref.current).toBe(status);
  expect(status.tagName).toBe('SPAN');
  expect(status).toHaveAttribute('data-state', 'checked');
  expect(container.querySelector('input')).toBeNull();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  await userEvent.tab();
  expect(status).not.toHaveFocus();
  expect(renderToString(<CheckboxStatus label="Some approved" indeterminate />))
   .toMatch(/role="img".*aria-label="Some approved".*data-state="mixed"/);
 });
});

describe('CheckboxGroup', () => {
 it('names a native fieldset and submits, resets and disables its checkbox children', async () => {
  const ref = createRef<HTMLFieldSetElement>();
  function Choices({ disabled = false }: { disabled?: boolean }) {
   return <form>
    <p id="group-hint">Choose any</p>
    <CheckboxGroup ref={ref} label="Print jobs" tally="1 of 2" aria-describedby="group-hint" disabled={disabled}>
     <Checkbox name="jobs" value="covers" defaultChecked>Covers</Checkbox>
     {false && <Checkbox>Hidden</Checkbox>}
     <Checkbox name="jobs" value="inserts">Inserts</Checkbox>
    </CheckboxGroup>
    <button type="reset">Reset</button>
   </form>;
  }
  const { container, rerender } = render(<Choices />);
  const group = screen.getByRole('group', { name: 'Print jobs' });
  const form = container.querySelector('form')!;
  const covers = screen.getByRole('checkbox', { name: 'Covers' });
  const inserts = screen.getByRole('checkbox', { name: 'Inserts' });
  expect(ref.current).toBe(group);
  expect(group.tagName).toBe('FIELDSET');
  expect(group.firstElementChild?.tagName).toBe('LEGEND');
  expect(group).toHaveAccessibleDescription('Choose any 1 of 2');
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  await userEvent.tab();
  expect(covers).toHaveFocus();
  await userEvent.tab();
  expect(inserts).toHaveFocus();
  await userEvent.keyboard(' ');
  expect(new FormData(form).getAll('jobs')).toEqual(['covers', 'inserts']);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(new FormData(form).getAll('jobs')).toEqual(['covers']);
  rerender(<Choices disabled />);
  expect(covers).toBeDisabled();
  expect(inserts).toBeDisabled();
  expect(new FormData(form).has('jobs')).toBe(false);
 });

 it('renders a legend, tally and native checkboxes on the server', () => {
  const html = renderToString(<CheckboxGroup label="Print jobs" tally="1 of 2" columns={2}>
   <Checkbox defaultChecked>Covers</Checkbox>
   <Checkbox>Inserts</Checkbox>
  </CheckboxGroup>);
  expect(html).toMatch(/<fieldset.*<legend.*Print jobs.*1 of 2.*<input.*type="checkbox"/);
  expect(html).toContain('data-columns="2"');
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
 it.each([
  ['the wrapping label', <Toggle defaultChecked>Autosave</Toggle>, ''],
  ['aria-labelledby', <Toggle defaultChecked description="Saves after each edit">Autosave</Toggle>, 'Saves after each edit'],
 ])('writes on and off in the slot but takes its name only from %s', (_, toggle, description) => {
  render(toggle);
  const input = screen.getByRole('switch');
  expect(input).toHaveAttribute('type', 'checkbox');
  expect(input).toHaveAccessibleName('Autosave');
  expect(input).toHaveAccessibleDescription(description);
  for (const word of ['on', 'off']) expect(screen.getByText(word).closest('[aria-hidden="true"]')).not.toBeNull();
 });
 it('puts the label before the switch with labelSide="start" and still toggles from it', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<><Toggle ref={ref} labelSide="start" description="Saves after each edit">Autosave</Toggle><Toggle>Tilt</Toggle></>);
  const [before, after] = screen.getAllByRole('switch');
  const precedes = (text: string, input: HTMLElement) => Boolean(screen.getByText(text).compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING);
  expect(precedes('Autosave', before)).toBe(true);
  expect(precedes('Tilt', after)).toBe(false);
  expect(before.closest('label')).toHaveAttribute('data-label-side', 'start');
  expect(after.closest('label')).toHaveAttribute('data-label-side', 'end');
  expect(ref.current).toBe(before);
  expect(before).toHaveAccessibleName('Autosave');
  await userEvent.click(screen.getByText('Autosave')); expect(before).toBeChecked();
  await userEvent.click(screen.getByText('Saves after each edit')); expect(before).not.toBeChecked();
 });
 it('server-renders the switch, both written states and the label side', () => {
  const html = renderToString(<Toggle labelSide="start" defaultChecked description="Saves after each edit">Autosave</Toggle>);
  expect(html).toContain('role="switch"');
  expect(html).toMatch(/<input[^>]*checked=""/);
  expect(html).toContain('data-label-side="start"');
  expect(html.indexOf('Autosave')).toBeLessThan(html.indexOf('<input'));
  // Both words ship in the markup so CSS shows the right one before hydration.
  expect(html).toMatch(/aria-hidden="true".*>on<.*>off</);
 });
});
