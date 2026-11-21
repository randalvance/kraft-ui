import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ActionableList, ActionableListItem, Badge, Button, Icon, IconButton } from '../src';

const open = fn(), more = fn();
const rows = <>
  <ActionableListItem label="Plan the release" description="Working · Lighthouse Web" current trailing={<Badge tone="attention">Busy</Badge>}
    onActivate={open} actions={<Button size="sm" onClick={more}>More</Button>} />
  <ActionableListItem label="Review the copy" description="Ready for your attention" trailing={<Badge tone="danger">1</Badge>} onActivate={open} />
  <ActionableListItem label="Archived note" description="No longer active" disabled onActivate={open} />
</>;
const meta = { title: 'Components/Actionable list', component: ActionableList,
  parameters: { docs: { description: { component: 'A named list of paper rows with rich copy and optional actions. Use compact density for long lists and hover actions for controls that should appear on hover or keyboard focus.' } } },
  argTypes: { density: { control: 'radio', options: ['default', 'compact'] } },
  args: { 'aria-label': 'Sessions', children: rows, style: { maxWidth: 460 } },
} satisfies Meta<typeof ActionableList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const list = within(canvasElement).getByRole('list', { name: 'Sessions' });
  await userEvent.click(within(list).getByRole('button', { name: 'More' }));
  await expect(more).toHaveBeenCalled();
  await expect(open).not.toHaveBeenCalled();
  await userEvent.click(within(list).getByRole('button', { name: /Plan the release/ }));
  await expect(open).toHaveBeenCalled();
} };
export const Night: Story = { args: { children: rows }, globals: { theme: 'night' } };

const pin = fn();
const compactRows = <>
  <ActionableListItem label={<><code>KW-128</code> Review the print-ready workspace layout</>}
    description={<>Verify the <strong>cover margins</strong> before sending the long print proof to the production desk.</>}
    leading={<Icon name="inbox" />} trailing={<Badge size="sm" tone="attention">Review</Badge>}
    current href="#print-proof" truncateLabel clampDescription={1}
    actionsVisibility="hover" actions={<IconButton variant="bare" size="sm" aria-label="Pin print proof" onClick={pin}><Icon name="pin" /></IconButton>} />
  <ActionableListItem label="Proofs" trailing="Handed off to the production desk" done />
  <ActionableListItem label="Archive" href="#archive" disabled />
  <ActionableListItem label="Production notes" description="A default-height row within the compact list." density="default" />
</>;

export const Compact: Story = { args: { 'aria-label': 'Print queue', children: compactRows, density: 'compact', style: { width: 300, maxWidth: '100%' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const proof = canvas.getByRole('link', { name: /^KW-128 Review/ });
    const action = canvas.getByRole('button', { name: 'Pin print proof' });
    const slot = action.parentElement!;
    const label = proof.querySelector('.kraft-list-label')!;
    const description = proof.querySelector('.kraft-list-description')!;
    const height = proof.closest('li')!.getBoundingClientRect().height;
    const reservedWidth = slot.getBoundingClientRect().width;
    await expect(height).toBeGreaterThanOrEqual(26);
    await expect(height).toBeLessThanOrEqual(32);
    await expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(getComputedStyle(description).webkitLineClamp).toBe('1');
    await expect(getComputedStyle(slot).opacity).toBe('0');
    await userEvent.tab();
    await expect(proof).toHaveFocus();
    await expect(getComputedStyle(proof).outlineStyle).toBe('solid');
    await expect(getComputedStyle(slot).opacity).toBe('1');
    await expect(slot.getBoundingClientRect().width).toBe(reservedWidth);
    await userEvent.tab();
    await expect(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(pin).toHaveBeenCalled();
    const done = canvas.getByText('Proofs');
    const trailing = canvas.getByText('Handed off to the production desk');
    await expect(getComputedStyle(done).textDecorationLine).toBe('line-through');
    await expect(trailing.getBoundingClientRect().width).toBeGreaterThan(0.35 * done.closest('li')!.clientWidth);
    await expect(canvas.queryByRole('button', { name: /Proofs/ })).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Archive' })).toBeDisabled();
  },
};

export const CompactWithoutDecoration: Story = { ...Compact, globals: { texture: 'off', motion: 'off', tilt: 'off' } };
