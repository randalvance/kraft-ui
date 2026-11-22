import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Avatar, Checkbox, CheckboxStatus, Inline, Stack, Surface } from '../src';
const meta = { title: 'Primitives/Checkbox', component: Checkbox,
 parameters: { docs: { description: { component: 'A native checkbox printed as a small paper box. Checking fills it with blue ink. Use it to choose items that take effect when a form is submitted; use Toggle for settings that apply immediately. The whole label is the hit target. `className` and `style` style the label; other props and the ref reach the input.' } } },
 args: { children: 'Keep drafts on this desk', onChange: fn() },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => { const box = within(canvasElement).getByRole('checkbox', { name: 'Keep drafts on this desk' }); await userEvent.click(box); await expect(box).toBeChecked(); await userEvent.keyboard(' '); await expect(box).not.toBeChecked(); await expect(args.onChange).toHaveBeenCalledTimes(2); } };
export const WithDescription: Story = { args: { children: 'Archive finished notes', description: 'Archived notes stay searchable for 30 days.' } };
export const States: Story = { render: () => <Stack gap={12}>
 <Checkbox>Unchecked</Checkbox>
 <Checkbox defaultChecked>Checked</Checkbox>
 <Checkbox indeterminate>Some selected</Checkbox>
 <Checkbox disabled>Disabled</Checkbox>
 <Checkbox disabled defaultChecked>Disabled and checked</Checkbox>
</Stack> };
const notes = ['Sketch the cover', 'Cut the stickers', 'Glue the spine'];
export const SelectAll: Story = { render: function SelectAll() {
 const [done, setDone] = useState([true, false, false]);
 const all = done.every(Boolean), some = done.some(Boolean);
 return <Surface as="fieldset" style={{ border: 0, margin: 0, width: 'min(100%, 320px)' }}>
  <Stack gap={10}>
   <Checkbox checked={all} indeterminate={some && !all} onChange={e => setDone(done.map(() => e.target.checked))}>All tasks</Checkbox>
   <Stack gap={8} style={{ paddingInlineStart: 30 }}>{notes.map((note, i) => <Checkbox key={note} checked={done[i]} onChange={e => setDone(done.map((v, j) => j === i ? e.target.checked : v))}>{note}</Checkbox>)}</Stack>
  </Stack>
 </Surface>;
}, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const all = canvas.getByRole('checkbox', { name: 'All tasks' }) as HTMLInputElement; await expect(all.indeterminate).toBe(true); await userEvent.click(all); await expect(canvas.getByRole('checkbox', { name: 'Glue the spine' })).toBeChecked(); } };
export const LongLabels: Story = { render: () => <Stack gap={12} style={{ width: 'min(100%, 240px)' }}>
 <Checkbox description="A note that keeps going so the description wraps under the label rather than under the box.">Remember this extremely long unbroken label {'Identifier'.repeat(4)}</Checkbox>
 <Checkbox lang="ar" dir="rtl">احفظ هذه الملاحظة الطويلة للرجوع إليها لاحقًا</Checkbox>
</Stack> };
export const KeyboardFocus: Story = { render: () => <Checkbox>Focused choice</Checkbox>, play: async ({ canvasElement }) => {
 const box = within(canvasElement).getByRole('checkbox', { name: 'Focused choice' });
 await userEvent.tab();
 await expect(box).toHaveFocus();
 await expect(box.matches(':focus-visible')).toBe(true);
 await expect(getComputedStyle(box.nextElementSibling!).outlineStyle).toBe('solid');
} };

export const MediaAndTrailing: Story = {
 render: () => <Surface style={{ width: 'min(100%, 320px)' }}>
  <Stack gap={12}>
   <Checkbox
    leading={<Avatar decorative size={24} initial="MP" tone="sage" tilt={-4} />}
    trailing="Due Friday"
    description="Ask for one copy on uncoated stock."
   >
    Send the revised cover to the print studio
   </Checkbox>
   <Checkbox
    leading={<span aria-label="Blue swatch" style={{ display: 'block', width: 20, height: 20, background: 'var(--kraft-blue)', borderRadius: 4 }} />}
    trailing="Pantone 286"
   >
    Use blue ink
   </Checkbox>
  </Stack>
 </Surface>,
 play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const cover = canvas.getByRole('checkbox', { name: 'Send the revised cover to the print studio' });
  const row = cover.closest('label')!;
  await expect(cover).toHaveAccessibleDescription('Ask for one copy on uncoated stock. Due Friday');
  await userEvent.click(canvas.getByText('MP'));
  await expect(cover).toBeChecked();
  await userEvent.click(canvas.getByText('Due Friday'));
  await expect(cover).not.toBeChecked();
  const box = row.querySelector('.kraft-checkbox-box')!.getBoundingClientRect();
  const label = row.querySelector('.kraft-choice-label')!.getBoundingClientRect();
  await expect(Math.abs(box.top - label.top)).toBeLessThanOrEqual(2);
  await expect(label.height).toBeGreaterThan(box.height);
 },
};

export const PenTick: Story = {
 render: () => <Stack gap={8}>
  <Checkbox variant="pen" strikeWhenChecked>Fold the inserts</Checkbox>
  <Checkbox variant="pen" strikeWhenChecked defaultChecked trailing="Monday">Cut the covers</Checkbox>
  <Checkbox variant="pen" strikeWhenChecked defaultChecked indeterminate>Assemble the booklets</Checkbox>
  <Checkbox variant="pen" defaultChecked disabled>Send the proofs</Checkbox>
 </Stack>,
 play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const item = canvas.getByText('Fold the inserts');
  const box = canvas.getByRole('checkbox', { name: 'Fold the inserts' });
  await userEvent.tab();
  await expect(box).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(box).toBeChecked();
  await expect(getComputedStyle(item).textDecorationLine).toBe('line-through');
  await expect(getComputedStyle(canvas.getByText('Monday')).textDecorationLine).toBe('none');
  await expect(getComputedStyle(canvas.getByText('Assemble the booklets')).textDecorationLine).toBe('none');
  await userEvent.keyboard(' ');
  await expect(getComputedStyle(item).textDecorationLine).toBe('none');
 },
};

export const StaticStatus: Story = {
 render: () => <Inline gap={16}>
  <CheckboxStatus label="Proof pending" />
  <CheckboxStatus label="Proof approved" checked />
  <CheckboxStatus label="Some proofs approved" indeterminate />
  <CheckboxStatus label="Proof signed" variant="pen" checked />
 </Inline>,
 play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryAllByRole('checkbox')).toHaveLength(0);
  const status = canvas.getByRole('img', { name: 'Proof approved' });
  await expect(status.getBoundingClientRect().width).toBe(36);
  await userEvent.click(status);
  await expect(status).not.toHaveFocus();
  await expect(status).toHaveAttribute('data-state', 'checked');
 },
};
