import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button, Icon, IconButton, Inline, Pinwheel } from '../src';

const meta = {
  title: 'Primitives/Pinwheel',
  component: Pinwheel,
  argTypes: { size: { control: 'select', options: ['row', 'button'] } },
  args: { label: 'Preparing the proof', size: 'row' },
} satisfies Meta<typeof Pinwheel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status', { name: 'Preparing the proof' })).toBeVisible();
  },
};

export const ButtonSize: Story = { args: { size: 'button' } };

export const LoadingButtons: Story = {
  render: () => <Inline gap={12} wrap>
    <Button variant="blue" loading>Save proof</Button>
    <IconButton aria-label="Update preview" loading><Icon name="sync" /></IconButton>
  </Inline>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Save proof', 'Update preview']) {
      const button = canvas.getByRole('button', { name });
      await expect(button).toBeDisabled();
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button.querySelector('.kraft-pinwheel')).toHaveAttribute('aria-hidden', 'true');
    }
  },
};

export const MotionOff: Story = {
  globals: { motion: 'off' },
  play: async ({ canvasElement }) => {
    const glyph = within(canvasElement).getByRole('status').querySelector('svg')!;
    await expect(getComputedStyle(glyph).animationPlayState).toBe('paused');
  },
};
