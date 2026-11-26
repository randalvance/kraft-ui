import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Inline, Sparkline, Stack, Surface, Text, type SparklinePoint } from '../src';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const week: SparklinePoint[] = [3, 5, 9, 4, 12, 0, 6].map((value, index) => ({ label: days[index], value }));
const month: SparklinePoint[] = Array.from({ length: 30 }, (_, index) => ({ label: `${index + 1} Nov`, value: (index * 7) % 11 }));
const materials = ['paper', 'kraft', 'cardboard'] as const;

const meta = {
  title: 'Components/Sparkline', component: Sparkline,
  parameters: { docs: { description: { component: 'A small bar for each day of usage, oldest first. Bars print in the ink of the surrounding material, and a day with nothing keeps a 1px stub. `limit` draws a dashed line; bars past it are hatched in danger ink, so they differ in form as well as colour. The sparkline is one named image: its text alternative is the `label` followed by every point, or your own `summary` for a long series.' } } },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { label: 'Messages per day', data: week, size: 'md' },
  decorators: [Story => <Surface><Story /></Surface>],
} satisfies Meta<typeof Sparkline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const chart = within(canvasElement).getByRole('img', { name: 'Messages per day: Mon 3, Tue 5, Wed 9, Thu 4, Fri 12, Sat 0, Sun 6' });
  await expect(chart).not.toHaveAttribute('tabindex');
  const bars = [...chart.querySelectorAll('.kraft-sparkline-bar')].map(bar => bar.getBoundingClientRect());
  await expect(bars).toHaveLength(7);
  await expect(bars[4].height).toBe(24);
  await expect(bars[0].height).toBeCloseTo(6, 0);
  await expect(bars[5].height).toBe(1);
  for (const bar of bars) await expect(bar.bottom).toBeCloseTo(chart.getBoundingClientRect().bottom, 0);
} };

/** A limit line, with the days past it hatched. */
export const Limit: Story = {
  args: { limit: 8 },
  play: async ({ canvasElement }) => {
    const chart = within(canvasElement).getByRole('img', { name: /limit 8$/ });
    const over = [...chart.querySelectorAll<HTMLElement>('.kraft-sparkline-bar[data-over]')];
    await expect(over).toHaveLength(2);
    await expect(getComputedStyle(over[0]).backgroundImage).toContain('repeating-linear-gradient');
    await expect(getComputedStyle(over[0]).color).not.toBe(getComputedStyle(chart).color);
    const line = chart.querySelector('.kraft-sparkline-limit')!.getBoundingClientRect();
    await expect(chart.getBoundingClientRect().bottom - line.bottom).toBeCloseTo(16, 0);
  },
};

/** Both sizes, a fixed scale, a month with its own summary, and no data. */
export const SizesAndSeries: Story = {
  render: args => <Stack gap={12}>
    <Inline gap={16} align="end">
      <Sparkline {...args} label="Medium" />
      <Sparkline {...args} label="Small" size="sm" />
      <Sparkline {...args} label="Out of 24" max={24} />
    </Inline>
    <Sparkline {...args} label="November" data={month} size="sm" summary="30 days, 0 to 10 a day, 150 in all" />
    <Sparkline {...args} label="No usage yet" data={[]} />
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: /^Small:/ }).getBoundingClientRect().height).toBe(16);
    await expect(canvas.getByRole('img', { name: /^Out of 24:/ }).querySelectorAll('.kraft-sparkline-bar')[4].getBoundingClientRect().height).toBe(12);
    await expect(canvas.getByRole('img', { name: 'November: 30 days, 0 to 10 a day, 150 in all' }).querySelectorAll('.kraft-sparkline-bar')).toHaveLength(30);
    await expect(canvas.getByRole('img', { name: 'No usage yet' }).querySelector('.kraft-sparkline-bar')).toBeNull();
  },
};

/** Beside a caption on each material. */
export const InContext: Story = {
  decorators: [],
  args: { limit: 8 },
  render: args => <Stack gap={12} style={{ maxInlineSize: 320 }}>
    {materials.map(material => <Surface key={material} material={material} padding={12}>
      <Inline gap={12} justify="between">
        <Text variant="label">Usage on {material}</Text>
        <Sparkline {...args} label={`Usage on ${material}`} />
      </Inline>
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('img')).toHaveLength(3);
  },
};

export const Night: Story = { ...Limit, globals: { theme: 'night' } };
export const NightContext: Story = { ...InContext, globals: { theme: 'night' } };
export const QuietNight: Story = { ...InContext, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };
