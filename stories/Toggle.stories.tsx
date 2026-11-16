import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Stack, Surface, Toggle } from '../src';
const meta = { title: 'Primitives/Toggle', component: Toggle,
 parameters: { docs: { description: { component: 'An on/off switch: a native checkbox with `role="switch"`, drawn as a paper knob in a recessed rail. Use it for settings that take effect immediately. For a pressed/unpressed action, use Button with `aria-pressed`. `className` and `style` style the label; other props and the ref reach the input.' } } },
 args: { children: 'Autosave', onChange: fn() },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => { const toggle = within(canvasElement).getByRole('switch', { name: 'Autosave' }); await userEvent.click(toggle); await expect(toggle).toBeChecked(); await userEvent.keyboard(' '); await expect(toggle).not.toBeChecked(); await expect(args.onChange).toHaveBeenCalledTimes(2); } };
export const WithDescription: Story = { args: { children: 'Show paper texture', description: 'Turn off for a flatter, quieter desk.', defaultChecked: true } };
export const States: Story = { render: () => <Stack gap={12}>
 <Toggle>Off</Toggle>
 <Toggle defaultChecked>On</Toggle>
 <Toggle disabled>Disabled</Toggle>
 <Toggle disabled defaultChecked>Disabled and on</Toggle>
</Stack> };
export const SettingsList: Story = { render: () => <Surface style={{ width: 'min(100%, 360px)' }}>
 <Stack gap={16}>
  <Toggle defaultChecked description="Saves after each edit.">Autosave</Toggle>
  <Toggle description="Rotates paper decorations slightly.">Tilt</Toggle>
  <Toggle defaultChecked description="Plays motion when cards land.">Motion</Toggle>
 </Stack>
</Surface> };
export const IconOnly: Story = { args: { children: undefined, 'aria-label': 'Night mode' } };
export const RightToLeft: Story = { globals: { motion: 'off' }, render: () => <div dir="rtl" lang="ar"><Toggle defaultChecked>حفظ تلقائي</Toggle></div>, play: async ({ canvasElement }) => {
 const knob = canvasElement.querySelector('.kraft-toggle-knob')!;
 await expect(getComputedStyle(knob).transform).toContain('-18');
} };
export const KeyboardFocus: Story = { render: () => <Toggle>Focused setting</Toggle>, play: async ({ canvasElement }) => {
 const toggle = within(canvasElement).getByRole('switch', { name: 'Focused setting' });
 await userEvent.tab();
 await expect(toggle).toHaveFocus();
 await expect(toggle.matches(':focus-visible')).toBe(true);
 await expect(getComputedStyle(toggle.nextElementSibling!).outlineStyle).toBe('solid');
} };
