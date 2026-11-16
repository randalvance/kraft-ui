import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ActionableList, ActionableListItem, Badge, Button } from '../src';

const open = fn(), more = fn();
const rows = <>
  <ActionableListItem label="Plan the release" description="Working · Lighthouse Web" current trailing={<Badge tone="attention">Busy</Badge>}
    onActivate={open} actions={<Button size="sm" onClick={more}>More</Button>} />
  <ActionableListItem label="Review the copy" description="Ready for your attention" trailing={<Badge tone="danger">1</Badge>} onActivate={open} />
  <ActionableListItem label="Archived note" description="No longer active" disabled />
</>;
const meta = { title: 'Components/Actionable list', component: ActionableList,
  parameters: { docs: { description: { component: 'A named list of paper rows. Each row has one primary link or button, descriptive text, noninteractive metadata, and an optional separate action area. Use TreeView for hierarchy and Select for listbox selection.' } } },
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
