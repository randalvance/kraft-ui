import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Menu, type MenuEntry } from '../src';

const items: MenuEntry[] = [
  { id: 'open', label: 'Open session' },
  { id: 'duplicate', label: 'Duplicate', trailing: '⌘D' },
  { id: 'unavailable', label: 'Share', disabled: true },
  { separator: true, id: 'divider' },
  { id: 'remove', label: 'Remove from list', destructive: true },
];
const meta = { title: 'Components/Menu', component: Menu,
  parameters: { docs: { description: { component: 'A dropdown menu for actions. Arrow keys, typeahead, Escape, disabled items, focus return, and outside dismissal come from its interaction primitive. Choose Select for picking a value.' } } },
  args: { trigger: <Button>Session actions</Button>, label: 'Session actions', items, onAction: fn() },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Session actions' }));
  const menu = canvas.getByRole('menu', { name: 'Session actions' });
  await expect(within(menu).getByRole('menuitem', { name: 'Share' })).toHaveAttribute('data-disabled');
  await userEvent.click(within(menu).getByRole('menuitem', { name: 'Duplicate ⌘D' }));
  await expect(args.onAction).toHaveBeenCalledWith('duplicate', items[1]);
  await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
} };
export const Open: Story = { args: { defaultOpen: true } };
export const Night: Story = { ...Open, globals: { theme: 'night' } };
