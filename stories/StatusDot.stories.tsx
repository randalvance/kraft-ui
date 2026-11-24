import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Avatar, Inline, Stack, StatusDot, Surface, Text, type StatusDotSize, type StatusTone } from '../src';

const tones: StatusTone[] = ['working', 'waiting', 'blocked', 'done', 'idle'];
const sizes: StatusDotSize[] = [8, 10, 12];
const names: Record<StatusTone, string> = { working: 'Working', waiting: 'Waiting', blocked: 'Blocked', done: 'Done', idle: 'Idle' };

const meta = {
  title: 'Primitives/StatusDot', component: StatusDot,
  parameters: { docs: { description: { component: 'A small coloured mark for the state of something: beside a word, in a legend, or on the corner of a portrait. Colour is never the only signal. Pass visible `children`, or an accessible `label` when the dot stands alone; the five tones also differ in form by default (a solid disc, a dashed ring, a solid square, a ticked disc, and a hollow ring). `variant` (`solid`, `hollow`, `dashed`) and `shape` (`round`, `square`) override the form. A cut ring in the theme\'s backing keeps each dot readable on paper, kraft, and board. Sizes are 8, 10, and 12px. Dots stay upright when tilt is on.' } } },
  argTypes: {
    tone: { control: 'select', options: tones },
    variant: { control: 'inline-radio', options: [undefined, 'solid', 'hollow', 'dashed'] },
    shape: { control: 'inline-radio', options: [undefined, 'round', 'square'] },
    size: { control: 'inline-radio', options: sizes },
  },
  args: { tone: 'working', label: 'Working', size: 10 },
} satisfies Meta<typeof StatusDot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const dot = within(canvasElement).getByRole('img', { name: 'Working' });
  const mark = dot.querySelector('svg')!.getBoundingClientRect();
  await expect([mark.width, mark.height]).toEqual([10, 10]);
} };

export const WithLabel: Story = {
  args: { label: undefined, children: 'Working on the proof' } as never,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('img')).toBeNull();
    await expect(within(canvasElement).getByText('Working on the proof')).toBeVisible();
  },
};

/** The default form for each tone, so the states are told apart without colour. */
export const Tones: Story = {
  render: () => <Inline gap={16} wrap>{tones.map(tone => <StatusDot key={tone} tone={tone}>{names[tone]}</StatusDot>)}</Inline>,
  play: async ({ canvasElement }) => {
    const forms = [...canvasElement.querySelectorAll('.kraft-status-dot')].map(dot => `${dot.getAttribute('data-variant')}-${dot.getAttribute('data-shape')}`);
    await expect(forms).toEqual(['solid-round', 'dashed-round', 'solid-square', 'solid-round', 'hollow-round']);
    await expect(canvasElement.querySelectorAll('.kraft-status-dot-tick')).toHaveLength(1);
  },
};

/** Every tone in every form and shape. */
export const Forms: Story = {
  render: () => <Stack gap={12}>
    {(['solid', 'hollow', 'dashed'] as const).map(variant => (['round', 'square'] as const).map(shape =>
      <Inline key={`${variant}-${shape}`} gap={16} style={{ alignItems: 'center' }}>
        <Text variant="label-sm" style={{ inlineSize: 110 }}>{variant} {shape}</Text>
        {tones.map(tone => <StatusDot key={tone} tone={tone} variant={variant} shape={shape} label={`${names[tone]}, ${variant} ${shape}`} />)}
      </Inline>))}
  </Stack>,
  play: async ({ canvasElement }) => {
    const dots = within(canvasElement).getAllByRole('img');
    await expect(dots).toHaveLength(30);
    for (const dot of dots) {
      const stroke = getComputedStyle(dot.querySelector('.kraft-status-dot-stroke')!);
      await expect(stroke.strokeDasharray === 'none').toBe(dot.getAttribute('data-variant') !== 'dashed');
    }
  },
};

/** 8, 10, and 12px. The cut ring, stroke, and dash count scale together, so every size keeps its shape. */
export const Sizes: Story = {
  render: () => <Stack gap={12}>{sizes.map(size => <Inline key={size} gap={16} style={{ alignItems: 'center' }}>
    {tones.map(tone => <StatusDot key={tone} tone={tone} size={size} label={`${names[tone]} at ${size}px`} />)}
  </Inline>)}</Stack>,
  play: async ({ canvasElement }) => {
    for (const dot of within(canvasElement).getAllByRole('img')) {
      const rect = dot.querySelector('svg')!.getBoundingClientRect();
      const size = Number(dot.getAttribute('data-size'));
      await expect(rect.width).toBe(size);
      await expect(rect.height).toBe(size);
      await expect(getComputedStyle(dot).rotate).toBe('none');
    }
  },
};

export const Legend: Story = {
  render: () => <Surface material="paper" padding={16} style={{ maxInlineSize: 320 }}>
    <Stack gap={8}>
      <Text variant="label" id="legend-title">Helpers</Text>
      <Stack as="ul" gap={6} aria-labelledby="legend-title" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {tones.map(tone => <li key={tone}><StatusDot tone={tone}>{names[tone]}</StatusDot></li>)}
      </Stack>
    </Stack>
  </Surface>,
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Helpers' });
    await expect(within(list).getAllByRole('listitem').map(item => item.textContent)).toEqual(Object.values(names));
  },
};

/** A dot on the corner of a portrait takes an accessible label, since there is no text beside it. */
export const OnPortrait: Story = {
  render: () => <Inline gap={24} style={{ alignItems: 'center' }}>
    {(['working', 'blocked', 'idle'] as const).map((tone, index) => <span key={tone} style={{ position: 'relative', display: 'inline-flex' }}>
      <Avatar initial={['P', 'K', 'M'][index]} alt={['Pip', 'Kit', 'Mochi'][index]} size={48} />
      <StatusDot tone={tone} size={12} label={names[tone]} style={{ position: 'absolute', insetInlineEnd: -2, insetBlockEnd: -2 }} />
    </span>)}
  </Inline>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Working', 'Blocked', 'Idle']) await expect(canvas.getByRole('img', { name })).toBeInTheDocument();
  },
};

export const OnMaterials: Story = {
  render: () => <Stack gap={12}>
    {(['paper', 'kraft', 'cardboard'] as const).map(material => <Surface key={material} material={material} padding={12}>
      <Inline gap={16} wrap>{tones.map(tone => <StatusDot key={tone} tone={tone}>{names[tone]}</StatusDot>)}</Inline>
    </Surface>)}
  </Stack>,
};

export const Night: Story = { ...Forms, globals: { theme: 'night' } };
export const NightMaterials: Story = { ...OnMaterials, globals: { theme: 'night' } };
export const QuietNight: Story = { ...Sizes, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };
