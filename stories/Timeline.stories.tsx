import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge, Stack, Surface, Timeline, type TimelineItem } from '../src';

const history: TimelineItem[] = [
  { id: 'opened', time: '09:14', dateTime: '2026-11-24T09:14', title: 'Pip opened the pull request', description: 'Replace cardboard workspace summaries', tone: 'done' },
  { id: 'review', time: '09:40', dateTime: '2026-11-24T09:40', title: 'Review requested from Mina', tone: 'waiting', trailing: <Badge size="sm">2 files</Badge> },
  { id: 'checks', time: '10:02', dateTime: '2026-11-24T10:02', title: 'Checks are running', description: 'Unit, contrast, and story tests', tone: 'working', current: true },
  { id: 'failed', time: '10:20', dateTime: '2026-11-24T10:20', title: 'Deploy blocked by a failing check', tone: 'blocked' },
  { id: 'note', time: '10:31', title: 'Note added without a state' },
];
const schedule: TimelineItem[] = [
  { id: 'a', time: 'Mon 09:00', title: 'Plan sprint', description: 'Board walk-through', tone: 'done' },
  { id: 'b', time: 'Tue 14:00', title: 'Design review', tone: 'done' },
  { id: 'c', time: 'Wed 10:30', title: 'Build night theme', description: 'Now', tone: 'working', current: true },
  { id: 'd', time: 'Thu 16:00', title: 'Contrast audit', tone: 'waiting' },
  { id: 'e', time: 'Fri 11:00', title: 'Release', tone: 'idle', trailing: <Badge size="sm">v0.7</Badge> },
];

const meta = {
  title: 'Components/Timeline', component: Timeline,
  parameters: { docs: { description: { component: 'An ordered list of dated events. `orientation="vertical"` draws ruled history rows: a time column, a marker on a thread, the event, and a dashed rule under each row. `orientation="horizontal"` draws a schedule lane of slots along one thread, which becomes a named, focusable scroll region when it overflows. Each item takes a `title`, optional `time` with a machine-readable `dateTime`, `description`, `trailing`, a marker `tone`, and `current`, which sets `aria-current="time"`, a heavier marker-pen title, and a ringed marker. The tone only colours the marker, so say the state in the title.' } } },
  argTypes: { orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
  args: { items: history, orientation: 'vertical' },
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Ruled history rows. */
export const History: Story = {
  render: args => <Surface><Timeline {...args} aria-label="Pull request history" /></Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Pull request history' });
    await expect(list.tagName).toBe('OL');
    const rows = within(list).getAllByRole('listitem');
    await expect(rows).toHaveLength(5);
    await expect(getComputedStyle(rows[0]).borderBottomStyle).toBe('dashed');
    await expect(rows[2]).toHaveAttribute('aria-current', 'time');
    await expect(rows[0].querySelector('time')).toHaveAttribute('datetime', '2026-11-24T09:14');
    await expect(rows[4].querySelector('time')).toBeNull();
    // Times share one column, so every marker sits on the same thread.
    const lefts = rows.map(row => Math.round(row.querySelector('.kraft-timeline-marker')!.getBoundingClientRect().left));
    await expect(new Set(lefts).size).toBe(1);
  },
};

/** Rows without times drop the time column, on kraft and cardboard. */
export const WithoutTimes: Story = {
  render: () => <Stack gap={12}>
    {(['kraft', 'cardboard'] as const).map(material => <Surface key={material} material={material}>
      <Timeline items={history.map(({ time, dateTime, ...item }) => item)} />
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.kraft-timeline')).not.toHaveAttribute('data-has-time');
    await expect(canvasElement.querySelectorAll('.kraft-timeline-time')).toHaveLength(0);
  },
};

/** The horizontal schedule lane. */
export const ScheduleLane: Story = {
  args: { items: schedule, orientation: 'horizontal' },
  render: args => <Surface><Timeline {...args} aria-label="This week" /></Surface>,
  play: async ({ canvasElement }) => {
    const slots = within(canvasElement).getAllByRole('listitem');
    const tops = slots.map(slot => Math.round(slot.getBoundingClientRect().top));
    await expect(new Set(tops).size).toBe(1);
    await expect(slots[1].getBoundingClientRect().left).toBeGreaterThan(slots[0].getBoundingClientRect().left);
    await expect(slots[2]).toHaveAttribute('aria-current', 'time');
  },
};

/** A lane wider than its container scrolls sideways from the keyboard. */
export const ScheduleLaneOverflow: Story = {
  args: { items: schedule, orientation: 'horizontal', scrollLabel: 'This week, scrollable' },
  render: args => <Surface style={{ inlineSize: 360 }}><Timeline {...args} /></Surface>,
  play: async ({ canvasElement }) => {
    const region = await within(canvasElement).findByRole('region', { name: 'This week, scrollable' });
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
  },
};
