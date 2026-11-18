import { expect, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon, IconButton } from '../src';
const plus = <Icon name="plus" />;
const meta = { title: 'Primitives/IconButton', component: IconButton, args: { 'aria-label': 'Add note', children: plus }, parameters: { docs: { description: { component: 'A named native button with an icon. aria-label is required. Default 44px target; the small 28px disc needs adequate separation from other controls.' } } }, argTypes: { size: { control: 'select', options: ['sm','md','lg'] }, variant: { control: 'select', options: ['neutral','blue','sage','danger','attention'] } } } satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' }, play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button');
  const rect = button.getBoundingClientRect();
  await expect(rect.width).toBe(28);
  await expect(rect.height).toBe(28);
  const icon = button.querySelector('svg')!.getBoundingClientRect();
  await expect(icon.left).toBeGreaterThanOrEqual(rect.left);
  await expect(icon.right).toBeLessThanOrEqual(rect.right);
} };
export const Disabled: Story = { args: { disabled: true } };
export const SmallLoading: Story = { args: { size: 'sm', loading: true }, play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button', { name: 'Add note' });
  const rect = button.getBoundingClientRect();
  await expect(rect.width).toBe(28);
  await expect(rect.height).toBe(28);
  const pinwheel = button.querySelector('.kraft-pinwheel')!;
  await expect(pinwheel.getBoundingClientRect().width).toBe(16);
  await expect(pinwheel).toHaveAttribute('aria-hidden', 'true');
  await expect(button.querySelectorAll('svg')).toHaveLength(1);
} };
