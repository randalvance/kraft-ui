import { expect, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon, IconButton, Inline, Sticker } from '../src';

const plus = <Icon name="plus" />;
const variants = ['neutral', 'blue', 'sage', 'danger', 'attention', 'bare'] as const;
const meta = { title: 'Primitives/IconButton', component: IconButton, args: { 'aria-label': 'Add note', children: plus }, parameters: { docs: { description: { component: 'A native icon button with a required aria-label. Use bare in dense rows and badge for a count sticker. The default target is 44px and the small target is 28px.' } } }, argTypes: { size: { control: 'select', options: ['sm','md','lg'] }, variant: { control: 'select', options: variants } } } satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Variants: Story = {
  render: () => <Inline wrap gap={16}>
    {variants.map(variant => <IconButton key={variant} aria-label={`Add note (${variant})`} variant={variant}>{plus}</IconButton>)}
  </Inline>,
};
export const Small: Story = { args: { size: 'sm' }, play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button');
  const rect = button.getBoundingClientRect();
  await expect(rect.width).toBe(28);
  await expect(rect.height).toBe(28);
  const icon = button.querySelector('svg')!.getBoundingClientRect();
  await expect(icon.left).toBeGreaterThanOrEqual(rect.left);
  await expect(icon.right).toBeLessThanOrEqual(rect.right);
} };
export const Large: Story = { args: { size: 'lg' } };
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
export const CountBadge: Story = {
  args: { variant: 'bare', 'aria-label': 'Inbox, 12 unread', badge: <Sticker size="count" tone="attention">12</Sticker>, children: <Icon name="inbox" /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Inbox, 12 unread' });
    const count = within(button).getByText('12');
    await expect(count.parentElement).toHaveAttribute('aria-hidden', 'true');
    await expect(count.getBoundingClientRect().right).toBeGreaterThan(button.getBoundingClientRect().right);
  },
};
export const PressedVariants: Story = {
  render: () => <Inline wrap gap={16}>
    {variants.map(variant => <IconButton key={variant} aria-label={`Pin note (${variant})`} variant={variant} aria-pressed>
      <Icon name="pin" />
    </IconButton>)}
  </Inline>,
};
