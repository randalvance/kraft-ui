import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Stack, Surface, Toggle } from '../src';
const meta = { title: 'Primitives/Toggle', component: Toggle,
 parameters: { docs: { description: { component: 'An on/off switch: a native checkbox with `role="switch"`, drawn as a thick card pull-tab sliding in a slot cut into the paper. The slot shows a handwritten “on” or “off” and turns blue when on. The written state is decorative: the switch already announces it. Use it for settings that take effect immediately. For a pressed/unpressed action, use Button with `aria-pressed`. Set `labelSide="start"` for a settings row that reads name first, switch last. `className` and `style` style the label; other props and the ref reach the input.' } } },
 args: { children: 'Autosave', onChange: fn() },
 argTypes: { labelSide: { control: 'inline-radio', options: ['end', 'start'] } },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The painted pieces behind a switch, and the word a sighted reader sees in the slot. */
function pullTab(toggle: HTMLElement) {
 const track = toggle.nextElementSibling!, slot = track.querySelector('.kraft-toggle-slot')!, tab = track.querySelector('.kraft-toggle-tab')!;
 const written = () => [...slot.querySelectorAll('.kraft-toggle-word')].filter(word => word.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })).map(word => word.textContent);
 const settle = () => Promise.all(tab.getAnimations().map(animation => animation.finished));
 return { track, slot, tab, written, settle };
}

export const Default: Story = { play: async ({ canvasElement, args }) => {
 const toggle = within(canvasElement).getByRole('switch', { name: 'Autosave' });
 const { track, slot, tab, written, settle } = pullTab(toggle);
 await expect(written()).toEqual(['off']);
 await expect(tab.getBoundingClientRect().left).toBeCloseTo(track.getBoundingClientRect().left, 0);
 const offFace = getComputedStyle(slot).backgroundColor;
 await userEvent.click(toggle); await expect(toggle).toBeChecked();
 await settle();
 await expect(written()).toEqual(['on']);
 await expect(tab.getBoundingClientRect().right).toBeCloseTo(track.getBoundingClientRect().right, 0);
 await expect(getComputedStyle(slot).backgroundColor).not.toBe(offFace);
 await userEvent.keyboard(' '); await expect(toggle).not.toBeChecked();
 await expect(written()).toEqual(['off']);
 await expect(args.onChange).toHaveBeenCalledTimes(2);
} };
export const WithDescription: Story = { args: { children: 'Show paper texture', description: 'Turn off for a flatter, quieter desk.', defaultChecked: true } };
export const States: Story = { render: () => <Stack gap={12}>
 <Toggle>Off</Toggle>
 <Toggle defaultChecked>On</Toggle>
 <Toggle disabled>Disabled</Toggle>
 <Toggle disabled defaultChecked>Disabled and on</Toggle>
</Stack>, play: async ({ canvasElement }) => {
 const written = within(canvasElement).getAllByRole('switch').map(toggle => pullTab(toggle).written());
 await expect(written).toEqual([['off'], ['on'], ['off'], ['on']]);
} };
/** `labelSide="start"` makes the switch a settings row: the name and its note start the row and the switch ends it. The whole row is the label, so clicking the name or the note toggles. */
export const LabelBefore: Story = { args: { labelSide: 'start', description: 'Saves after each edit.' },
 render: args => <Surface style={{ width: 'min(100%, 360px)' }}><Toggle {...args} /></Surface>,
 play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const toggle = canvas.getByRole('switch', { name: 'Autosave' });
  const row = toggle.closest('label')!.getBoundingClientRect(), track = pullTab(toggle).track.getBoundingClientRect();
  const name = canvas.getByText('Autosave').getBoundingClientRect();
  await expect(name.left).toBeCloseTo(row.left, 0);
  await expect(track.right).toBeCloseTo(row.right, 0);
  await expect(name.right).toBeLessThan(track.left);
  await expect(row.width).toBeGreaterThan(300);
  await expect(toggle).toHaveAccessibleDescription('Saves after each edit.');
  await userEvent.click(canvas.getByText('Autosave')); await expect(toggle).toBeChecked();
  await userEvent.click(canvas.getByText('Saves after each edit.')); await expect(toggle).not.toBeChecked();
 } };
export const SettingsList: Story = { render: () => <Surface style={{ width: 'min(100%, 360px)' }}>
 <Stack gap={16}>
  <Toggle labelSide="start" defaultChecked description="Saves after each edit.">Autosave</Toggle>
  <Toggle labelSide="start" description="Rotates paper decorations slightly.">Tilt</Toggle>
  <Toggle labelSide="start" defaultChecked description="Plays motion when cards land.">Motion</Toggle>
  <Toggle labelSide="start" disabled description="Needs a connected printer.">Print on save</Toggle>
 </Stack>
</Surface>, play: async ({ canvasElement }) => {
 const ends = within(canvasElement).getAllByRole('switch').map(toggle => Math.round(pullTab(toggle).track.getBoundingClientRect().right));
 await expect(new Set(ends).size).toBe(1);
} };
export const IconOnly: Story = { args: { children: undefined, 'aria-label': 'Night mode' } };
/** The tab travels toward the end of the line, which is the left in right-to-left text, and a leading label sits on the right. */
export const RightToLeft: Story = { globals: { motion: 'off' }, render: () => <div dir="rtl" lang="ar" style={{ width: 'min(100%, 320px)' }}><Stack gap={12}>
 <Toggle defaultChecked>حفظ تلقائي</Toggle>
 <Toggle labelSide="start">الحركة</Toggle>
</Stack></div>, play: async ({ canvasElement }) => {
 const [on, off] = within(canvasElement).getAllByRole('switch');
 const end = pullTab(on), start = pullTab(off);
 await expect(end.tab.getBoundingClientRect().left).toBeCloseTo(end.track.getBoundingClientRect().left, 0);
 await expect(start.tab.getBoundingClientRect().right).toBeCloseTo(start.track.getBoundingClientRect().right, 0);
 await expect(within(canvasElement).getByText('الحركة').getBoundingClientRect().left).toBeGreaterThan(start.track.getBoundingClientRect().right);
} };
/** With motion off in the theme, or reduced by the system, the tab is at the other end on the next frame. */
export const WithoutMotion: Story = { globals: { motion: 'off' }, play: async ({ canvasElement }) => {
 const toggle = within(canvasElement).getByRole('switch', { name: 'Autosave' });
 const { track, tab } = pullTab(toggle);
 await userEvent.click(toggle);
 await expect(tab.getAnimations()).toEqual([]);
 await expect(tab.getBoundingClientRect().right).toBeCloseTo(track.getBoundingClientRect().right, 0);
} };
export const KeyboardFocus: Story = { render: () => <Toggle>Focused setting</Toggle>, play: async ({ canvasElement }) => {
 const toggle = within(canvasElement).getByRole('switch', { name: 'Focused setting' });
 await userEvent.tab();
 await expect(toggle).toHaveFocus();
 await expect(toggle.matches(':focus-visible')).toBe(true);
 await expect(getComputedStyle(toggle.nextElementSibling!).outlineStyle).toBe('solid');
 await userEvent.keyboard(' ');
 await expect(toggle).toBeChecked();
} };
