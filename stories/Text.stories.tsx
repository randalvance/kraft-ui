import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Inline, Stack, Surface, Text, type HandSize, type TextTone, type TextVariant } from '../src';

const variants = ['body', 'label', 'label-sm', 'hand', 'serif', 'lead', 'code'] satisfies TextVariant[];
const tones = ['default', 'muted', 'faint', 'danger', 'attention'] satisfies TextTone[];
const handSizes = ['sm', 'md', 'lg', 'xl', 'display'] satisfies HandSize[];
const materials = ['paper', 'kraft', 'cardboard'] as const;
const long = 'A long line of copy that keeps running well past a comfortable reading measure so that the cap, or its absence, is easy to see on a wide sheet of paper.';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  parameters: { docs: { description: { component: 'Body, label, handwritten, serif, lead, and code roles. Use as to preserve document semantics.' } } },
  argTypes: {
    variant: { control: 'select', options: variants },
    tone: { control: 'select', options: tones },
    size: { control: 'select', options: handSizes, description: 'Size of the hand variant.' },
    measure: { control: 'boolean' },
  },
  args: { children: 'A fresh sheet, ready for your next idea.', variant: 'body', tone: 'default', size: 'sm', measure: true },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongContent: Story = { args: { children: 'Averylongunbrokenpieceofcontentthatstillneedstofitonsmallviewportwithoutcausinghorizontalscrolling' } };

export const Variants: Story = {
  render: () => <Surface>
    <Stack gap={12}>{variants.map(variant => <Text key={variant} variant={variant} data-variant={variant}>{variant}: a fresh sheet, ready for your next idea.</Text>)}</Stack>
  </Surface>,
  play: async ({ canvasElement }) => {
    const css = (variant: TextVariant) => getComputedStyle(canvasElement.querySelector(`[data-variant="${variant}"]`)!);
    await expect(css('serif').fontFamily).toContain('Fraunces');
    await expect(css('serif').fontStyle).toBe('normal');
    await expect(css('lead').fontFamily).toContain('Fraunces');
    await expect(css('lead').fontStyle).toBe('italic');
    await expect(css('lead').fontSize).toBe('16px');
    await expect(css('hand').fontFamily).toContain('Caveat');
    await expect(css('code').fontFamily).toContain('Courier');
  },
};

const handPixels: Record<HandSize, string> = { sm: '17px', md: '22px', lg: '26px', xl: '38px', display: '52px' };

export const HandSizes: Story = {
  render: () => <Surface>
    <Stack gap={12}>{handSizes.map(size => <Text key={size} variant="hand" size={size}>Good morning, Mina ({size})</Text>)}</Stack>
  </Surface>,
  play: async ({ canvasElement }) => {
    for (const size of handSizes) {
      const css = getComputedStyle(canvasElement.querySelector(`.kraft-type-hand[data-size="${size}"]`)!);
      await expect(css.fontFamily).toContain('Caveat');
      await expect(css.fontSize).toBe(handPixels[size]);
    }
  },
};

function ToneSamples() {
  return <Stack gap={16}>
    <Inline gap={16} wrap>{tones.map(tone => <Text key={tone} as="span" tone={tone}>Desk {tone}</Text>)}</Inline>
    <Inline gap={16} wrap align="stretch">{materials.map(material => <Surface key={material} material={material} padding={16} data-material-sample={material}>
      <Stack gap={8}>
        {tones.map(tone => <Text key={tone} as="span" tone={tone}>{tone === 'danger' ? 'Overdue by two days' : tone === 'attention' ? 'Waiting for review' : tone === 'faint' ? 'Edited last week' : tone === 'muted' ? 'Second printing' : 'Letterpress proof'}</Text>)}
        <Text variant="hand" size="md" tone="danger">Check the margins!</Text>
        <Text variant="lead" tone="attention">Proofs are due on Friday.</Text>
      </Stack>
    </Surface>)}</Inline>
  </Stack>;
}

export const Tones: Story = {
  render: () => <ToneSamples />,
  play: async ({ canvasElement }) => {
    for (const material of materials) {
      const surface = canvasElement.querySelector(`[data-material-sample="${material}"]`)!;
      const ink = (tone: TextTone) => getComputedStyle(surface.querySelector(`span[data-tone="${tone}"]`)!).color;
      const inks = new Set(tones.map(ink));
      await expect(ink('danger')).not.toBe(ink('default'));
      await expect(ink('attention')).not.toBe(ink('danger'));
      await expect(ink('faint')).not.toBe(ink('default'));
      await expect(inks.size).toBeGreaterThanOrEqual(4);
    }
  },
};

export const TonesDecorationOff: Story = {
  globals: { texture: 'off', motion: 'off', tilt: 'off' },
  render: () => <ToneSamples />,
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-material-sample="kraft"]')!;
    await expect(getComputedStyle(surface).backgroundImage).not.toContain('url(');
    await expect(getComputedStyle(surface.querySelector('span[data-tone="danger"]')!).color)
      .not.toBe(getComputedStyle(surface.querySelector('span[data-tone="default"]')!).color);
  },
};

export const Measure: Story = {
  render: () => <Surface style={{ inlineSize: 1100, maxInlineSize: 'none' }}>
    <Stack gap={12}>
      <Text data-sample="capped">{long}</Text>
      <Text measure={false} data-sample="open">{long}</Text>
      <Text as="pre" variant="code" data-sample="pre">{`$ npm run check -- --reporter=verbose --project unit --project buttons --project contrast --project storybook`}</Text>
      <pre style={{ margin: 0 }}><Text as="code" variant="code" data-sample="pre-code">{'const proof = await press.print({ sheet, ink });'}</Text></pre>
      <Text variant="code" data-sample="code">A code paragraph outside a pre keeps the measure.</Text>
    </Stack>
  </Surface>,
  play: async ({ canvasElement }) => {
    const css = (sample: string) => getComputedStyle(canvasElement.querySelector(`[data-sample="${sample}"]`)!);
    await expect(css('capped').maxWidth).not.toBe('none');
    await expect(css('open').maxWidth).toBe('none');
    await expect(css('pre').maxWidth).toBe('none');
    await expect(css('pre-code').maxWidth).toBe('none');
    await expect(css('code').maxWidth).not.toBe('none');
    const capped = canvasElement.querySelector('[data-sample="capped"]')!.getBoundingClientRect().width;
    const open = canvasElement.querySelector('[data-sample="open"]')!.getBoundingClientRect().width;
    await expect(open).toBeGreaterThan(capped);
  },
};
