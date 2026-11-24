import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Heading, Link, Stack, Surface, type HeadingSize } from '../src';

const sizes = ['sm', 'md', 'lg', 'title-sm', 'title', 'display'] satisfies HeadingSize[];
const pixels: Record<HeadingSize, string> = { sm: '15px', md: '17px', lg: '20px', 'title-sm': '26px', title: '38px', display: '52px' };

const meta = {
  title: 'Primitives/Heading',
  component: Heading,
  parameters: { docs: { description: { component: 'Heading appearance is independent of level. Select as to fit the document outline.' } } },
  argTypes: {
    size: { control: 'select', options: sizes },
    as: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
    balance: { control: 'boolean' },
  },
  args: { children: 'Words worth keeping', as: 'h2', size: 'lg', balance: true },
} satisfies Meta<typeof Heading>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => <Surface>
    <Stack gap={12}>{sizes.map(size => <Heading key={size} as="h3" size={size}>Words worth keeping ({size})</Heading>)}</Stack>
  </Surface>,
  play: async ({ canvasElement }) => {
    for (const size of sizes) {
      const css = getComputedStyle(canvasElement.querySelector(`.kraft-heading[data-size="${size}"]`)!);
      await expect(css.fontSize).toBe(pixels[size]);
      await expect(css.fontFamily).toContain(size === 'sm' || size === 'md' || size === 'lg' ? 'Fraunces' : 'Caveat');
    }
  },
};

export const Balance: Story = {
  render: () => <Surface style={{ inlineSize: 'min(100%, 360px)' }}>
    <Stack gap={16}>
      <Heading as="h3" size="lg">A balanced heading shares its words evenly across the lines</Heading>
      <Heading as="h3" size="lg" balance={false}>An unbalanced heading fills each line before it starts the next</Heading>
    </Stack>
  </Surface>,
  play: async ({ canvasElement }) => {
    const [balanced, plain] = canvasElement.querySelectorAll('.kraft-heading');
    await expect(getComputedStyle(balanced).textWrap).toContain('balance');
    await expect(getComputedStyle(plain).textWrap).not.toContain('balance');
  },
};

export const WithLink: Story = {
  render: () => <Stack gap={16}>
    {(['paper', 'kraft', 'cardboard'] as const).map(material => <Surface key={material} material={material} padding={16}>
      <Heading as="h3" size="title-sm"><Link href={`#${material}-proofs`} tone="inherit" underline="hover">Proofs on {material}</Link></Heading>
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole('link');
    await expect(canvas.getByRole('heading', { level: 3, name: 'Proofs on paper' })).toBeVisible();
    for (const link of links) {
      await expect(getComputedStyle(link).color).toBe(getComputedStyle(link.parentElement!).color);
      await expect(getComputedStyle(link).textDecorationLine).toBe('none');
    }
    await userEvent.tab();
    await expect(links[0]).toHaveFocus();
    await expect(getComputedStyle(links[0]).outlineStyle).toBe('solid');
    await expect(getComputedStyle(links[0]).textDecorationLine).toBe('underline');
  },
};
