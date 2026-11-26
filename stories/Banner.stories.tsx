import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Banner, Button, Stack, Toggle, type Tone } from '../src';

const tones: Tone[] = ['neutral', 'blue', 'sage', 'danger', 'attention'];

const meta = {
  title: 'Components/Banner', component: Banner,
  parameters: { docs: { description: { component: 'A full-width paper strip that pairs one control with a line saying what its state means. `control` holds a Toggle or Button at the `start` or `end`; `title` is a short bold lead and `children` are the line of consequence. The strip is its own paper, so its ink is readable on any material. Add `role="status"` or `role="alert"` yourself if the line should be announced when it changes.' } } },
  argTypes: { tone: { control: 'select', options: tones }, controlSide: { control: 'inline-radio', options: ['start', 'end'] }, control: { control: false } },
  args: { title: 'Autopilot is on.', children: 'Agents merge approved work without asking you first.', tone: 'attention', controlSide: 'start' },
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

function AutopilotBanner() {
  const [on, setOn] = useState(true);
  return <Banner tone={on ? 'attention' : 'neutral'} title={on ? 'Autopilot is on.' : 'Autopilot is off.'} role="status"
    control={<Toggle checked={on} onChange={event => setOn(event.target.checked)}>Autopilot</Toggle>}>
    {on ? 'Agents merge approved work without asking you first.' : 'Every merge waits for your approval.'}
  </Banner>;
}

/** The switch changes the line of consequence, which is a polite live status here. */
export const Default: Story = {
  render: () => <AutopilotBanner />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const banner = canvasElement.querySelector<HTMLElement>('.kraft-banner')!;
    await expect(banner).toHaveTextContent('Agents merge approved work without asking you first.');
    // The strip fills the content width of whatever holds it.
    const stage = getComputedStyle(banner.parentElement!);
    await expect(Math.round(banner.getBoundingClientRect().width)).toBe(Math.round(banner.parentElement!.clientWidth - parseFloat(stage.paddingLeft) - parseFloat(stage.paddingRight)));
    await userEvent.click(canvas.getByRole('switch', { name: 'Autopilot' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Autopilot is off. Every merge waits for your approval.');
    await expect(banner).toHaveAttribute('data-tone', 'neutral');
  },
};

/** Every tone, with the control at the start and at the end. */
export const Tones: Story = {
  render: () => <Stack gap={12}>
    {tones.map((tone, index) => <Banner key={tone} tone={tone} title={`${tone[0].toUpperCase()}${tone.slice(1)}.`}
      controlSide={index % 2 ? 'end' : 'start'} control={<Button size="sm" variant="ghost">Review</Button>}>
      A line that says what follows from the control beside it.
    </Banner>)}
    <Banner tone="blue">A strip can carry the line alone.</Banner>
  </Stack>,
  play: async ({ canvasElement }) => {
    const banners = [...canvasElement.querySelectorAll<HTMLElement>('.kraft-banner')];
    await expect(banners).toHaveLength(6);
    // Reading order follows the visual order of control and line.
    await expect(banners[0].firstElementChild).toHaveClass('kraft-banner-control');
    await expect(banners[1].lastElementChild).toHaveClass('kraft-banner-control');
    await expect(new Set(banners.slice(0, 5).map(banner => getComputedStyle(banner).backgroundColor)).size).toBe(5);
  },
};

/** The control drops under a long line when the strip is narrow. */
export const Narrow: Story = {
  render: () => <div style={{ inlineSize: 260 }}><Banner tone="danger" title="Billing paused." controlSide="end"
    control={<Button size="sm" variant="danger">Update card</Button>}>
    Scheduled runs stop tonight unless the card on file is replaced.
  </Banner></div>,
  play: async ({ canvasElement }) => {
    const banner = canvasElement.querySelector<HTMLElement>('.kraft-banner')!;
    await expect(banner.scrollWidth).toBeLessThanOrEqual(banner.clientWidth);
  },
};
