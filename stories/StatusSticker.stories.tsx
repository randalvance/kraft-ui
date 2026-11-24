import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Inline, Stack, StatusSticker, Surface, Text, type StatusStickerVariant, type StatusTone } from '../src';

const tones: StatusTone[] = ['working', 'waiting', 'blocked', 'done', 'idle'];
const variants: StatusStickerVariant[] = ['solid', 'paper', 'ghost'];
const words: Record<StatusTone, string> = { working: 'Running', waiting: 'Queued', blocked: 'Blocked', done: 'Done', idle: 'Idle' };

const meta = {
  title: 'Primitives/StatusSticker', component: StatusSticker,
  parameters: { docs: { description: { component: 'A small uppercase sticker for a state such as RUNNING, IDLE, or BLOCKED. The words carry the meaning and are read as written; the capitals are only drawn. `variant` gives a `solid` tone face, a plain `paper` face with a tone edge, or a dashed `ghost` outline. `indicator` adds a decorative `dot` in the tone\'s form or the shared `spinner`, which stops when motion is off. Lengths are in em, so the sticker keeps its shape from 8px to 12px text. Stickers stay upright when tilt is on.' } } },
  argTypes: {
    tone: { control: 'select', options: tones },
    variant: { control: 'inline-radio', options: variants },
    indicator: { control: 'inline-radio', options: [undefined, 'dot', 'spinner'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  args: { children: 'Running', tone: 'working', variant: 'solid', size: 'md' },
} satisfies Meta<typeof StatusSticker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const sticker = canvasElement.querySelector<HTMLElement>('.kraft-status-sticker')!;
  await expect(sticker).toHaveTextContent(/^Running$/);
  await expect(getComputedStyle(sticker).textTransform).toBe('uppercase');
  await expect(getComputedStyle(sticker).rotate).toBe('none');
} };

/** Every tone in every form, with and without an indicator. */
export const Variants: Story = {
  render: () => <Stack gap={12}>
    {variants.map(variant => (['none', 'dot', 'spinner'] as const).map(indicator =>
      <Inline key={`${variant}-${indicator}`} gap={12} style={{ alignItems: 'center' }}>
        <Text variant="label-sm" style={{ inlineSize: 110 }}>{variant} {indicator}</Text>
        {tones.map(tone => <StatusSticker key={tone} tone={tone} variant={variant}
          indicator={indicator === 'none' ? undefined : indicator}>{words[tone]}</StatusSticker>)}
      </Inline>))}
  </Stack>,
  play: async ({ canvasElement }) => {
    const stickers = [...canvasElement.querySelectorAll<HTMLElement>('.kraft-status-sticker')];
    await expect(stickers).toHaveLength(45);
    for (const sticker of stickers) {
      const style = getComputedStyle(sticker);
      await expect(style.borderTopStyle).toBe(sticker.dataset.variant === 'ghost' ? 'dashed' : 'solid');
      await expect(style.whiteSpace).toBe('nowrap');
    }
    await expect(canvasElement.querySelectorAll('.kraft-status-sticker-indicator[aria-hidden="true"]')).toHaveLength(30);
  },
};

/** The default 11px and `sm` 10px sizes, then custom text from 8 to 12px. Indicators stay square and labels stay on one line. */
export const Sizes: Story = {
  render: () => <Stack gap={12}>
    <Inline gap={12} style={{ alignItems: 'center' }}>
      <StatusSticker tone="working" indicator="spinner">Running</StatusSticker>
      <StatusSticker tone="blocked" size="sm" indicator="dot">Blocked</StatusSticker>
    </Inline>
    {[8, 9, 10, 11, 12].map(fontSize => <Inline key={fontSize} gap={12} style={{ alignItems: 'center' }}>
      {variants.map(variant => <StatusSticker key={variant} tone="waiting" variant={variant} indicator="dot"
        style={{ fontSize }}>Waiting on review</StatusSticker>)}
    </Inline>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    for (const sticker of canvasElement.querySelectorAll<HTMLElement>('.kraft-status-sticker')) {
      const fontSize = parseFloat(getComputedStyle(sticker).fontSize);
      const rect = sticker.getBoundingClientRect();
      await expect(rect.height).toBeCloseTo(fontSize * 2, 0);
      const mark = sticker.querySelector('.kraft-status-sticker-indicator svg')!.getBoundingClientRect();
      await expect(mark.width).toBeCloseTo(mark.height, 1);
      const label = sticker.querySelector('.kraft-status-sticker-label')!.getBoundingClientRect();
      await expect(label.height).toBeLessThan(fontSize * 1.5);
    }
  },
};

export const InContext: Story = {
  render: () => <Stack gap={12} style={{ maxInlineSize: 420 }}>
    {(['paper', 'kraft', 'cardboard'] as const).map((material, index) => <Surface key={material} material={material} padding={12}>
      <Inline gap={12} justify="between" style={{ alignItems: 'center' }}>
        <Text>{['Print the poster proof', 'Trim the cover stock', 'Bind the sample books'][index]}</Text>
        <StatusSticker tone={(['working', 'blocked', 'idle'] as const)[index]} variant={variants[index]}
          indicator={index === 0 ? 'spinner' : 'dot'}>{['Running', 'Blocked', 'Idle'][index]}</StatusSticker>
      </Inline>
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Running')).toBeVisible();
    for (const sticker of canvasElement.querySelectorAll('.kraft-status-sticker')) await expect(sticker).not.toHaveAttribute('tabindex');
  },
};

export const Night: Story = { ...Variants, globals: { theme: 'night' } };
export const NightContext: Story = { ...InContext, globals: { theme: 'night' } };
export const QuietNight: Story = {
  ...Variants, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' },
  play: async ({ canvasElement }) => {
    for (const glyph of canvasElement.querySelectorAll('.kraft-pinwheel > svg')) {
      await expect(getComputedStyle(glyph).animationPlayState).toBe('paused');
    }
  },
};
