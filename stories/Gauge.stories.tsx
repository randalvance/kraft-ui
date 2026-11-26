import { useState } from 'react';
import type { ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, Gauge, Inline, Stack, Surface, type StatusTone, type GaugeProps } from '../src';

const tones: StatusTone[] = ['working', 'waiting', 'blocked', 'done', 'idle'];
const materials = ['paper', 'kraft', 'cardboard'] as const;
const turnOf = (gauge: Element) => parseFloat(getComputedStyle(gauge.querySelector('.kraft-gauge-needle')!).rotate);

// Stories switch between `label` and `aria-labelledby`, so they use one loose shape for the name.
type StoryProps = Omit<GaugeProps, 'label' | 'aria-labelledby'> & { label?: string; 'aria-labelledby'?: string };

const LooseGauge = Gauge as ComponentType<StoryProps>;

const meta = {
  title: 'Components/Gauge', component: LooseGauge,
  parameters: { docs: { description: { component: 'A half dial with a needle for a percentage. `value` sits between `min` and `max` (0 to 100 by default), the arc fills in a status `tone`, and the figure prints in handwriting under the needle. `limit` marks the dial and draws the arc past it as a danger zone; a value past the limit is said in the text alternative. The gauge is one `role="meter"` with a value, a range, and a text alternative. It needs a `label` or `aria-labelledby`, and it is not interactive. The needle swings only when motion is on; the figure tilts only when tilt is on.' } } },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    tone: { control: 'select', options: tones },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: { label: 'Disk used', value: 62, tone: 'working', size: 'md', showValue: true },
  decorators: [Story => <Surface><Story /></Surface>],
} satisfies Meta<StoryProps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const gauge = within(canvasElement).getByRole('meter', { name: 'Disk used' });
  await expect(gauge).toHaveAttribute('aria-valuenow', '62');
  await expect(gauge).toHaveAttribute('aria-valuemin', '0');
  await expect(gauge).toHaveAttribute('aria-valuemax', '100');
  await expect(gauge).toHaveAttribute('aria-valuetext', '62%');
  await expect(gauge).not.toHaveAttribute('tabindex');
  await expect(gauge.getBoundingClientRect().width).toBe(120);
  await expect(turnOf(gauge)).toBeCloseTo(111.6, 1);
  await expect(gauge.querySelector('.kraft-gauge-value')).toHaveTextContent('62%');
  const hub = gauge.querySelector('.kraft-gauge-hub')!.getBoundingClientRect();
  const needle = gauge.querySelector('.kraft-gauge-needle-ink')!.getBoundingClientRect();
  await expect(needle.bottom).toBeLessThanOrEqual(hub.bottom + 1);
  await expect(needle.top).toBeLessThan(hub.top - 20);
} };

/** The ends of the dial, every tone, and the three sizes. */
export const Values: Story = {
  render: args => <Stack gap={16}>
    <Inline gap={16} wrap align="end">
      {[0, 25, 50, 75, 100].map((value, index) => <LooseGauge key={value} {...args} label={`At ${value}`} value={value} tone={tones[index]} />)}
    </Inline>
    <Inline gap={16} wrap align="end">
      {(['sm', 'md', 'lg'] as const).map(size => <LooseGauge key={size} {...args} label={`Size ${size}`} size={size} />)}
      <LooseGauge {...args} label="No figure" showValue={false} />
      <LooseGauge {...args} label="Kilometres" min={20} max={80} value={65} formatValue={value => `${value} km`} />
    </Inline>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(turnOf(canvas.getByRole('meter', { name: 'At 0' }))).toBe(0);
    await expect(turnOf(canvas.getByRole('meter', { name: 'At 100' }))).toBe(180);
    await expect(canvas.getByRole('meter', { name: 'At 0' }).querySelector('.kraft-gauge-fill')).toBeNull();
    await expect((['sm', 'md', 'lg'] as const).map(size => canvas.getByRole('meter', { name: `Size ${size}` }).getBoundingClientRect().width)).toEqual([72, 120, 168]);
    await expect(canvas.getByRole('meter', { name: 'No figure' }).querySelector('.kraft-gauge-value')).toBeNull();
    const km = canvas.getByRole('meter', { name: 'Kilometres' });
    await expect(km).toHaveAttribute('aria-valuetext', '65 km');
    await expect(turnOf(km)).toBeCloseTo(135, 1);
  },
};

/** A limit mark with its danger zone, under and over. */
export const Limit: Story = {
  args: { limit: 80 },
  render: args => <Inline gap={24} wrap align="end">
    <LooseGauge {...args} label="Under the limit" value={54} tone="done" />
    <LooseGauge {...args} label="Over the limit" value={93} tone="done" />
  </Inline>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const under = canvas.getByRole('meter', { name: 'Under the limit' });
    await expect(under).not.toHaveAttribute('data-over');
    await expect(under.querySelector('.kraft-gauge-zone')).not.toBeNull();
    await expect(under.querySelector('.kraft-gauge-spill')).toBeNull();
    const over = canvas.getByRole('meter', { name: 'Over the limit' });
    await expect(over).toHaveAttribute('data-over', 'true');
    await expect(over).toHaveAttribute('aria-valuetext', '93%, over the limit of 80%');
    await expect(over.querySelector('.kraft-gauge-spill')).not.toBeNull();
  },
};

/** The needle follows a changing value. */
export const Changing: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(20);
    return <Stack gap={12} align="start">
      <LooseGauge {...args} value={value} />
      <Button onClick={() => setValue(current => (current + 30) % 120)}>Add 30</Button>
    </Stack>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gauge = canvas.getByRole('meter', { name: 'Disk used' });
    await userEvent.click(canvas.getByRole('button', { name: 'Add 30' }));
    await expect(gauge).toHaveAttribute('aria-valuenow', '50');
    await expect(gauge).toHaveAttribute('aria-valuetext', '50%');
    await expect(gauge.style.getPropertyValue('--kraft-gauge-turn')).toBe('0.5');
  },
};

export const InContext: Story = {
  decorators: [],
  args: { limit: 80 },
  render: args => <Inline gap={12} wrap>
    {materials.map((material, index) => <Surface key={material} material={material} padding={12}>
      <LooseGauge {...args} label={`Load on ${material}`} value={[35, 70, 95][index]} tone={tones[index]} />
    </Surface>)}
  </Inline>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('meter')).toHaveLength(3);
  },
};

export const Night: Story = { ...Values, globals: { theme: 'night' } };
export const NightContext: Story = { ...InContext, globals: { theme: 'night' } };
export const QuietNight: Story = { ...InContext, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' },
  play: async ({ canvasElement }) => {
    for (const gauge of canvasElement.querySelectorAll('.kraft-gauge')) {
      await expect(getComputedStyle(gauge.querySelector('.kraft-gauge-needle')!).transitionDuration).toMatch(/^0s/);
      await expect(getComputedStyle(gauge.querySelector('.kraft-gauge-value')!).rotate).toMatch(/^(none|0deg)$/);
    }
  },
};
