import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Link, Stack, Surface, Text } from '../src';

const meta = {
  title: 'Primitives/Link',
  component: Link,
  parameters: { docs: { description: { component: 'A native anchor. Always supply an href for navigation and descriptive link text.' } } },
  argTypes: {
    href: { control: 'text' },
    tone: { control: 'inline-radio', options: ['link', 'inherit'] },
    underline: { control: 'inline-radio', options: ['always', 'hover'] },
  },
  args: { href: '#installation', children: 'Read the installation guide', tone: 'link', underline: 'always' },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Styles: Story = {
  render: () => <Surface>
    <Stack gap={12}>
      <Text>Start with <Link href="#guide">the installation guide</Link>.</Text>
      <Text tone="muted"><Link href="#muted" tone="inherit">A link in the surrounding ink</Link></Text>
      <Text variant="label"><Link href="#quiet" tone="inherit" underline="hover">A quiet link, underlined on hover and focus</Link></Text>
    </Stack>
  </Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [standard, inherited, quiet] = canvas.getAllByRole('link');
    await expect(getComputedStyle(standard).textDecorationLine).toBe('underline');
    await expect(getComputedStyle(standard).color).not.toBe(getComputedStyle(standard.parentElement!).color);
    await expect(getComputedStyle(inherited).color).toBe(getComputedStyle(inherited.parentElement!).color);
    await expect(getComputedStyle(inherited).textDecorationLine).toBe('underline');
    await expect(getComputedStyle(quiet).textDecorationLine).toBe('none');
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(quiet).toHaveFocus();
    await expect(getComputedStyle(quiet).outlineStyle).toBe('solid');
    await expect(getComputedStyle(quiet).textDecorationLine).toBe('underline');
  },
};
