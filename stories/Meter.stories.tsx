import type { ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Meter, Stack, Surface, Text, type MeterSegment, type MeterProps } from '../src';

const seats: MeterSegment[] = [
  { id: 'used', label: 'Used', value: 12 },
  { id: 'held', label: 'Held', value: 4, fill: 'hatched', tone: 'waiting' },
  { id: 'free', label: 'Free', value: 8, fill: 'free', tone: 'idle' },
];
const materials = ['paper', 'kraft', 'cardboard'] as const;

// Stories switch between `label` and `aria-labelledby`, so they use one loose shape for the name.
type StoryProps = Omit<MeterProps, 'label' | 'aria-labelledby'> & { label?: string; 'aria-labelledby'?: string };

const LooseMeter = Meter as ComponentType<StoryProps>;

const meta = {
  title: 'Components/Meter', component: LooseMeter,
  parameters: { docs: { description: { component: 'A ruler that shows how much of something is used. Pass one `value`, or `segments` laid end to end: `solid` and `hatched` parts count toward the value and `free` is outlined room that does not, so the parts differ in fill as well as colour. `ticks` and `tickLabels` mark the ruler, `limit` draws a limit mark, and any amount past the limit is drawn as a cross-hatched spill. `variant="bar"` is a thin strip without ticks or a legend. The meter is one `role="meter"` with a value, a range, and a text alternative; it needs a `label` or `aria-labelledby`, and it is not interactive.' } } },
  argTypes: {
    variant: { control: 'inline-radio', options: ['ruler', 'bar'] },
    tone: { control: 'select', options: ['working', 'waiting', 'blocked', 'done', 'idle'] },
  },
  args: { label: 'Seats', segments: seats, max: 24, ticks: 4, tickLabels: true, variant: 'ruler' },
  decorators: [Story => <Surface style={{ maxInlineSize: 420 }}><Story /></Surface>],
} satisfies Meta<StoryProps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const meter = within(canvasElement).getByRole('meter', { name: 'Seats' });
  await expect(meter).toHaveAttribute('aria-valuenow', '16');
  await expect(meter).toHaveAttribute('aria-valuemin', '0');
  await expect(meter).toHaveAttribute('aria-valuemax', '24');
  await expect(meter).toHaveAttribute('aria-valuetext', 'Used 12, Held 4, Free 8, of 24');
  await expect(meter).not.toHaveAttribute('tabindex');
  const track = meter.querySelector('.kraft-meter-track')!.getBoundingClientRect();
  const [used, held, free] = [...meter.querySelectorAll<HTMLElement>('.kraft-meter-track .kraft-meter-segment')];
  await expect(used.getBoundingClientRect().width).toBeCloseTo((track.width - 2) / 2, 0);
  await expect(held.getBoundingClientRect().left).toBeCloseTo(used.getBoundingClientRect().right, 0);
  await expect(free.getBoundingClientRect().right).toBeCloseTo(track.right - 1, 0);
  await expect(getComputedStyle(held).backgroundImage).toContain('repeating-linear-gradient');
  await expect(getComputedStyle(free).outlineStyle).toBe('dashed');
  await expect(meter.querySelectorAll('.kraft-meter-tick')).toHaveLength(7);
  await expect(meter.querySelectorAll('.kraft-meter-legend-item')).toHaveLength(3);
  for (const label of meter.querySelectorAll('.kraft-meter-tick-label')) {
    const rect = label.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(track.left - 1);
    await expect(rect.right).toBeLessThanOrEqual(track.right + 1);
  }
} };

/** A single value in each tone, with and without ticks. */
export const SingleValue: Story = {
  args: { segments: undefined, label: 'Storage', value: 62, max: 100, ticks: 10, tickLabels: false },
  render: args => <Stack gap={16}>
    <LooseMeter {...args} />
    <LooseMeter {...args} label="Uploads" value={35} tone="done" ticks={[0, 25, 50, 75, 100]} tickLabels formatValue={value => `${value}%`} />
    <LooseMeter {...args} label="Queue" value={80} tone="waiting" ticks={undefined} />
    <LooseMeter {...args} label="Nothing yet" value={0} ticks={undefined} />
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('meter', { name: 'Storage' })).toHaveAttribute('aria-valuetext', '62 of 100');
    await expect(canvas.getByRole('meter', { name: 'Uploads' })).toHaveAttribute('aria-valuetext', '35% of 100%');
    await expect(canvas.getByRole('meter', { name: 'Nothing yet' }).querySelector('.kraft-meter-segment')).toBeNull();
    await expect(canvasElement.querySelector('.kraft-meter-legend')).toBeNull();
  },
};

/** A limit mark, and the spill drawn past it. */
export const LimitAndSpill: Story = {
  args: { label: 'Monthly messages', max: 120, limit: 100, ticks: 20, tickLabels: true },
  render: args => <Stack gap={16}>
    <LooseMeter {...args} segments={[{ id: 'sent', label: 'Sent', value: 64 }, { id: 'queued', label: 'Queued', value: 18, fill: 'hatched' }]} />
    <LooseMeter {...args} label="Monthly messages, over" segments={[{ id: 'sent', label: 'Sent', value: 92 }, { id: 'queued', label: 'Queued', value: 20, fill: 'hatched' }]} />
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const under = canvas.getByRole('meter', { name: 'Monthly messages' });
    await expect(under).not.toHaveAttribute('data-over');
    await expect(under.querySelector('.kraft-meter-spill')).toBeNull();
    const over = canvas.getByRole('meter', { name: 'Monthly messages, over' });
    await expect(over).toHaveAttribute('data-over', 'true');
    await expect(over).toHaveAttribute('aria-valuenow', '112');
    await expect(over).toHaveAttribute('aria-valuetext', 'Sent 92, Queued 20, of 120, over the limit of 100');
    const limit = over.querySelector('.kraft-meter-limit')!.getBoundingClientRect();
    const spill = over.querySelector('.kraft-meter-spill')!.getBoundingClientRect();
    await expect(Math.abs(spill.left - (limit.left + limit.width / 2))).toBeLessThan(1.5);
    await expect(spill.width).toBeGreaterThan(20);
    const track = over.querySelector('.kraft-meter-track')!.getBoundingClientRect();
    await expect(limit.top).toBeLessThan(track.top);
    await expect(limit.bottom).toBeGreaterThan(track.bottom);
  },
};

/** The compact bar keeps the fills, the limit mark, and the spill in 8px. */
export const Bar: Story = {
  args: { variant: 'bar' },
  render: args => <Stack gap={12} style={{ maxInlineSize: 220 }}>
    <LooseMeter {...args} />
    <LooseMeter {...args} label="Storage" segments={undefined} value={45} max={100} />
    <LooseMeter {...args} label="Messages" segments={undefined} value={115} max={120} limit={100} tone="done" />
  </Stack>,
  play: async ({ canvasElement }) => {
    for (const track of canvasElement.querySelectorAll('.kraft-meter-track')) await expect(track.getBoundingClientRect().height).toBe(8);
    await expect(canvasElement.querySelector('.kraft-meter-tick, .kraft-meter-tick-label, .kraft-meter-legend')).toBeNull();
    await expect(within(canvasElement).getByRole('meter', { name: 'Messages' })).toHaveAttribute('aria-valuetext', '115 of 120, over the limit of 100');
    await expect(canvasElement.querySelectorAll('.kraft-meter-spill')).toHaveLength(1);
  },
};

/** Named by visible text, on each material. */
export const InContext: Story = {
  decorators: [],
  render: args => <Stack gap={12} style={{ maxInlineSize: 420 }}>
    {materials.map(material => <Surface key={material} material={material} padding={12}>
      <Stack gap={6}>
        <Text variant="label" id={`meter-${material}`}>Seats on {material}</Text>
        <LooseMeter {...args} label={undefined} aria-labelledby={`meter-${material}`} limit={20} />
      </Stack>
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('meter', { name: 'Seats on kraft' })).toBeVisible();
  },
};

export const Night: Story = { ...LimitAndSpill, globals: { theme: 'night' } };
export const NightContext: Story = { ...InContext, globals: { theme: 'night' } };
export const QuietNight: Story = { ...InContext, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' },
  play: async ({ canvasElement }) => {
    for (const segment of canvasElement.querySelectorAll('.kraft-meter-track .kraft-meter-segment')) {
      await expect(getComputedStyle(segment).transitionDuration).toMatch(/^0s/);
    }
  },
};
