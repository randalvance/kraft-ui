import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, CollapsibleGroup, Stack, Surface, Text, type CardTone } from '../src';

const tones: CardTone[] = ['neutral', 'blue', 'sage', 'danger', 'attention', 'ochre', 'teal', 'violet', 'plum', 'blush', 'navy'];

const meta = {
  title: 'Components/CollapsibleGroup', component: CollapsibleGroup,
  parameters: { docs: { description: { component: 'A native disclosure (`details` and `summary`) with a tinted header, a count sticker, and a paper body. `tone` takes any `CardTone`. `count` prints in the header, and `countLabel` says what it counts for assistive technology. Use `defaultOpen`, or control `open` with `onOpenChange`. Groups that share a `name` open one at a time. The summary is a native button-like control: Enter and Space toggle it, and closed content stays findable with find-in-page.' } } },
  argTypes: { tone: { control: 'select', options: tones } },
  args: { title: 'Waiting on review', count: 3, tone: 'attention', defaultOpen: true, onOpenChange: fn(), children: 'Three cards have been waiting for more than a day.' },
} satisfies Meta<typeof CollapsibleGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { countLabel: count => `${count} cards` },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group');
    const summary = group.querySelector('summary')!;
    await expect(summary).toHaveTextContent('Waiting on review, 3 cards3');
    await expect(summary.querySelector('.kraft-badge')).toHaveAttribute('aria-hidden', 'true');
    await expect(group).toHaveAttribute('open');
    // The summary is a native tab stop; the browser toggles it with Enter and Space.
    await userEvent.tab();
    await expect(summary).toHaveFocus();
    await expect(getComputedStyle(summary).outlineStyle).toBe('solid');
    await userEvent.click(summary);
    await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
    await expect(group).not.toHaveAttribute('open');
    await expect(canvas.getByText('Three cards have been waiting for more than a day.')).not.toBeVisible();
    await userEvent.click(summary);
    await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(true));
    await waitFor(() => expect(getComputedStyle(summary.querySelector('svg')!).rotate).toBe('90deg'));
  },
};

/** Every header tint, closed and open. */
export const Tones: Story = {
  args: { onOpenChange: undefined },
  render: () => <Surface material="cardboard"><Stack gap={0}>
    {tones.map((tone, index) => <CollapsibleGroup key={tone} tone={tone} title={`${tone[0].toUpperCase()}${tone.slice(1)}`} count={index + 1} defaultOpen={index < 2}>
      <Text tone="muted">Body text on the group's own paper.</Text>
    </CollapsibleGroup>)}
    <CollapsibleGroup title="No count" />
  </Stack></Surface>,
  play: async ({ canvasElement }) => {
    const summaries = [...canvasElement.querySelectorAll<HTMLElement>('.kraft-collapsible-summary')];
    await expect(new Set(summaries.slice(0, 11).map(summary => getComputedStyle(summary).backgroundColor)).size).toBe(11);
    await expect(canvasElement.querySelectorAll('details[open]')).toHaveLength(2);
    await expect(summaries[11].querySelector('.kraft-badge')).toBeNull();
  },
};

/** Groups sharing a `name` open one at a time. */
export const OneOpenAtATime: Story = {
  args: { onOpenChange: undefined },
  render: () => <Surface><Stack gap={0}>
    {(['To do', 'Doing', 'Done'] as const).map((title, index) => <CollapsibleGroup key={title} name="board-columns" title={title}
      count={[4, 2, 9][index]} tone={(['blue', 'attention', 'sage'] as const)[index]} defaultOpen={index === 0}>
      <Text>{title} cards</Text>
    </CollapsibleGroup>)}
  </Stack></Surface>,
  play: async ({ canvasElement }) => {
    const groups = [...canvasElement.querySelectorAll('details')];
    const open = () => groups.map(group => group.open);
    await expect(open()).toEqual([true, false, false]);
    await userEvent.click(groups[2].querySelector('summary')!);
    await waitFor(() => expect(open()).toEqual([false, false, true]));
    await userEvent.click(groups[1].querySelector('summary')!);
    await waitFor(() => expect(open()).toEqual([false, true, false]));
    await userEvent.click(groups[1].querySelector('summary')!);
    await waitFor(() => expect(open()).toEqual([false, false, false]));
  },
};

function ControlledGroup() {
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  return <Stack gap={12} align="start">
    <Button variant="ghost" onClick={() => setOpen(value => !value)}>{open ? 'Close' : 'Open'} from outside</Button>
    <Button variant="ghost" aria-pressed={locked} onClick={() => setLocked(value => !value)}>Lock</Button>
    <CollapsibleGroup title="Controlled" tone="teal" open={open} onOpenChange={next => { if (!locked) setOpen(next); }} style={{ inlineSize: 280 }}>
      <Text>The application owns this state.</Text>
    </CollapsibleGroup>
  </Stack>;
}

/** Controlled from outside. While locked, the application declines the change and the group stays as it is. */
export const Controlled: Story = {
  args: { onOpenChange: undefined },
  render: () => <Surface><ControlledGroup /></Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector('details')!;
    await userEvent.click(canvas.getByRole('button', { name: 'Open from outside' }));
    await waitFor(() => expect(group.open).toBe(true));
    await userEvent.click(group.querySelector('summary')!);
    await waitFor(() => expect(group.open).toBe(false));
    await userEvent.click(canvas.getByRole('button', { name: 'Lock' }));
    await userEvent.click(group.querySelector('summary')!);
    await new Promise(resolve => setTimeout(resolve, 100));
    await expect(group.open).toBe(false);
  },
};
