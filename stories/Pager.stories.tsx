import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Pager, Stack, Surface } from '../src';

const meta = {
  title: 'Components/Pager', component: Pager,
  parameters: { docs: { description: { component: 'Previous and next buttons around an optional `range` and optional page `dots`, in a navigation landmark named by `label`. Pages are numbered from 1 through `pageCount`; control `page` with `onPageChange` or set `defaultPage`. The range is announced politely when it changes. Each dot is a 24px button named by `pageLabel`, and the current one has `aria-current="page"` and a larger filled mark. The arrows reverse in right-to-left text.' } } },
  args: { pageCount: 5, defaultPage: 2, dots: true, onPageChange: fn() },
} satisfies Meta<typeof Pager>;
export default meta;
type Story = StoryObj<typeof meta>;

function RangePager({ onPageChange }: { onPageChange?: (page: number) => void }) {
  const [page, setPage] = useState(2);
  const total = 87, size = 20;
  return <Pager pageCount={Math.ceil(total / size)} page={page} dots label="Cards pages"
    range={`${(page - 1) * size + 1}–${Math.min(total, page * size)} of ${total}`}
    onPageChange={next => { setPage(next); onPageChange?.(next); }} />;
}

/** Previous, next, range, and page dots together. */
export const Default: Story = {
  render: args => <Surface><RangePager onPageChange={args.onPageChange} /></Surface>,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Cards pages' });
    await expect(nav).toHaveTextContent('21–40 of 87');
    const next = canvas.getByRole('button', { name: 'Next page' });
    const previous = canvas.getByRole('button', { name: 'Previous page' });
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(next);
    await expect(args.onPageChange).toHaveBeenLastCalledWith(3);
    await expect(nav).toHaveTextContent('41–60 of 87');
    await userEvent.click(canvas.getByRole('button', { name: 'Page 5' }));
    await expect(nav).toHaveTextContent('81–87 of 87');
    await expect(next).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Page 1' }));
    await expect(previous).toBeDisabled();
    await expect(canvas.getAllByRole('button', { current: 'page' })).toHaveLength(1);
    for (const dot of canvasElement.querySelectorAll('.kraft-pager-dot')) await expect(dot.getBoundingClientRect().width).toBeGreaterThanOrEqual(24);
    // The arrows point away from each other.
    await expect(getComputedStyle(previous.querySelector('svg')!).rotate).toBe('180deg');
    await expect(getComputedStyle(next.querySelector('svg')!).rotate).toBe('none');
  },
};

/** Arrows alone, with a range, with dots, uncontrolled, on one page, and right to left. */
export const Variants: Story = {
  args: { onPageChange: undefined },
  render: () => <Stack gap={12}>
    <Surface><Stack gap={12} align="start">
      <Pager pageCount={9} defaultPage={4} label="Arrows only" />
      <Pager pageCount={9} defaultPage={1} range="Page 1 of 9" label="Range only" />
      <Pager pageCount={4} defaultPage={4} dots label="Dots only" pageLabel={page => `Slide ${page}`} previousLabel="Previous slide" nextLabel="Next slide" />
      <Pager pageCount={1} range="1–3 of 3" label="One page" />
      <div dir="rtl"><Pager pageCount={3} defaultPage={2} dots range="2 / 3" label="Right to left" /></div>
    </Stack></Surface>
    <Surface material="cardboard"><Pager pageCount={6} defaultPage={3} dots range="41–60 of 112" label="On cardboard" /></Surface>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dots = within(canvas.getByRole('navigation', { name: 'Dots only' }));
    await userEvent.click(dots.getByRole('button', { name: 'Previous slide' }));
    await expect(dots.getByRole('button', { name: 'Slide 3' })).toHaveAttribute('aria-current', 'page');
    const one = within(canvas.getByRole('navigation', { name: 'One page' }));
    await expect(one.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(one.getByRole('button', { name: 'Next page' })).toBeDisabled();
    const rtl = within(canvas.getByRole('navigation', { name: 'Right to left' }));
    await expect(getComputedStyle(rtl.getByRole('button', { name: 'Next page' }).querySelector('svg')!).rotate).toBe('180deg');
  },
};
