import type { ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Inline, SlotMeter, Stack, Surface, Text, type StatusTone, type SlotMeterProps } from '../src';

const tones: StatusTone[] = ['working', 'waiting', 'blocked', 'done', 'idle'];
const materials = ['paper', 'kraft', 'cardboard'] as const;

// Stories switch between `label` and `aria-labelledby`, so they use one loose shape for the name.
type StoryProps = Omit<SlotMeterProps, 'label' | 'aria-labelledby'> & { label?: string; 'aria-labelledby'?: string };

const LooseSlotMeter = SlotMeter as ComponentType<StoryProps>;

const meta = {
  title: 'Components/SlotMeter', component: LooseSlotMeter,
  parameters: { docs: { description: { component: 'One paper slot for each place under a `cap`. `slots` lists the taken places in a status tone; the rest are empty dashed cuts. The tones differ in form as well as colour: working is solid, waiting hatched, blocked crossed, done ticked, and idle hollow. The whole row is one `role="meter"` whose text alternative counts the taken places and each tone. It needs a `label` or `aria-labelledby`, and it is not interactive.' } } },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { label: 'Agents', cap: 8, slots: ['working', 'working', 'waiting', 'blocked', 'done'], size: 'md' },
  decorators: [Story => <Surface><Story /></Surface>],
} satisfies Meta<StoryProps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const meter = within(canvasElement).getByRole('meter', { name: 'Agents' });
  await expect(meter).toHaveAttribute('aria-valuenow', '5');
  await expect(meter).toHaveAttribute('aria-valuemax', '8');
  await expect(meter).toHaveAttribute('aria-valuetext', '5 of 8, 2 working, 1 waiting, 1 blocked, 1 done');
  await expect(meter).not.toHaveAttribute('tabindex');
  const slots = [...meter.querySelectorAll<HTMLElement>('.kraft-slot')];
  await expect(slots).toHaveLength(8);
  await expect(meter.querySelectorAll('.kraft-slot[data-empty]')).toHaveLength(3);
  for (const slot of slots) {
    const rect = slot.getBoundingClientRect();
    await expect(rect.width).toBeCloseTo(15, 0);
    await expect(rect.height).toBeCloseTo(21, 0);
  }
  await expect(getComputedStyle(slots[7]).borderTopStyle).toBe('dashed');
} };

/** Every tone, an empty row, and a full row, in both sizes. */
export const TonesAndSizes: Story = {
  render: args => <Stack gap={12}>
    {(['md', 'sm'] as const).map(size => <Inline key={size} gap={16} wrap>
      <LooseSlotMeter {...args} size={size} label={`Every tone ${size}`} cap={6} slots={tones} toneLabels={{ working: 'running', idle: 'parked' }} />
      <LooseSlotMeter {...args} size={size} label={`Empty ${size}`} cap={4} slots={[]} />
      <LooseSlotMeter {...args} size={size} label={`Full ${size}`} cap={3} slots={['done', 'done', 'done', 'working']} />
    </Inline>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const every = canvas.getByRole('meter', { name: 'Every tone md' });
    await expect(every).toHaveAttribute('aria-valuetext', '5 of 6, 1 running, 1 waiting, 1 blocked, 1 done, 1 parked');
    const forms = [...every.querySelectorAll('.kraft-slot:not([data-empty])')].map(slot =>
      `${getComputedStyle(slot.querySelector('.kraft-slot-fill')!).fill === getComputedStyle(slot).backgroundColor ? 'open' : 'filled'} ${slot.querySelector('.kraft-slot-glyph')?.getAttribute('d') ?? ''}`);
    await expect(new Set(forms).size).toBe(5);
    await expect(canvas.getByRole('meter', { name: 'Empty md' })).toHaveAttribute('aria-valuetext', '0 of 4');
    const full = canvas.getByRole('meter', { name: 'Full sm' });
    await expect(full).toHaveAttribute('aria-valuenow', '3');
    await expect(full.querySelectorAll('.kraft-slot')).toHaveLength(3);
    await expect(full.querySelector('.kraft-slot')!.getBoundingClientRect().width).toBeCloseTo(10, 0);
  },
};

/** Beside visible text on each material; a long row wraps. */
export const InContext: Story = {
  decorators: [],
  render: args => <Stack gap={12} style={{ maxInlineSize: 260 }}>
    {materials.map(material => <Surface key={material} material={material} padding={12}>
      <Stack gap={6}>
        <Text variant="label" id={`slots-${material}`}>Runners on {material}</Text>
        <LooseSlotMeter {...args} label={undefined} aria-labelledby={`slots-${material}`} cap={material === 'paper' ? 20 : 8}
          slots={[...tones, 'working', 'working']} valueText="7 runners busy" />
      </Stack>
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    const paper = within(canvasElement).getByRole('meter', { name: 'Runners on paper' });
    await expect(paper).toHaveAttribute('aria-valuetext', '7 runners busy');
    const tops = new Set([...paper.querySelectorAll('.kraft-slot')].map(slot => Math.round(slot.getBoundingClientRect().top)));
    await expect(tops.size).toBeGreaterThan(1);
    await expect(paper.getBoundingClientRect().right).toBeLessThanOrEqual(paper.parentElement!.getBoundingClientRect().right + 1);
  },
};

export const Night: Story = { ...TonesAndSizes, globals: { theme: 'night' } };
export const NightContext: Story = { ...InContext, globals: { theme: 'night' } };
export const QuietNight: Story = { ...InContext, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };
