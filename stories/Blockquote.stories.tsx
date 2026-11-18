import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Blockquote, Code, Surface, Text } from '../src';

const meta = {
  title: 'Components/Blockquote',
  component: Blockquote,
  parameters: { docs: { description: { component: 'A native blockquote beside a thick highlighter rule. Put the attribution outside the quote, for example in a `figcaption`.' } } },
  args: { children: <p>Cardboard holds things, paper carries words, and stickers mark things.</p> },
  decorators: [Story => <Surface padding={24} style={{ maxWidth: 640 }}><Story /></Surface>],
} satisfies Meta<typeof Blockquote>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const quote = canvasElement.querySelector('blockquote')!;
    const style = getComputedStyle(quote);
    await expect(quote).toHaveClass('kraft-blockquote');
    await expect(parseFloat(style.borderInlineStartWidth)).toBeGreaterThanOrEqual(6);
    await expect(style.borderInlineStartStyle).toBe('solid');
  },
};

export const WithAttribution: Story = {
  render: args => <figure style={{ margin: 0 }}>
    <Blockquote {...args} cite="https://example.com/design" />
    <Text as="figcaption" tone="muted" style={{ marginTop: 8 }}>— The Desk of Cut-outs</Text>
  </figure>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('figure')).toContainElement(canvasElement.querySelector('blockquote'));
  },
};

export const SeveralParagraphs: Story = {
  args: {
    children: <>
      <p>Light comes from the top left; cut edges and shadows fall down and right.</p>
      <p>Night is the same desk after dark. Run <Code>npm run check</Code> before you publish.</p>
    </>,
  },
};
