import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, Popover, Text } from '../src';

const meta = { title: 'Components/Popover', component: Popover,
  parameters: { docs: { description: { component: 'A nonmodal paper popup anchored to its trigger. Use it for a small amount of structured content; the popup has a title, a close target, outside click dismissal, Escape handling, and managed focus.' } } },
  args: { title: 'Context window', description: 'A little room remains', trigger: <Button>Show context</Button>, children: <Text>31% left · 62k of 200k tokens</Text> },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Show context' });
  await userEvent.click(trigger);
  await expect(canvas.getByRole('dialog', { name: 'Context window' })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  await expect(trigger).toHaveFocus();
} };
export const Open: Story = { args: { defaultOpen: true } };
export const Night: Story = { ...Open, globals: { theme: 'night' } };
