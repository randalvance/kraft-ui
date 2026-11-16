import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { IconButton, Inline, Tooltip, TooltipProvider } from '../src';

const plus = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
const search = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>;

const meta = { title: 'Components/Tooltip', component: Tooltip,
  parameters: { docs: { description: { component: 'A short, noninteractive paper label. It opens on hover or keyboard focus, stays while hovered, and closes on Escape or activation. The trigger must have its own accessible name. Wrap neighboring tooltips in TooltipProvider to share their hover delay.' } } },
  args: { trigger: <IconButton aria-label="New session">{plus}</IconButton>, content: 'Start a new session', delayDuration: 0 },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'New session' });
  await userEvent.hover(trigger);
  const tip = await canvas.findByRole('tooltip');
  await expect(tip).toHaveTextContent('Start a new session');
  await userEvent.hover(tip);
  await expect(tip).toBeVisible();
  await userEvent.unhover(tip);
  await waitFor(() => expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument());
  trigger.focus();
  await expect(await canvas.findByRole('tooltip')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const Open: Story = { args: { defaultOpen: true } };
export const Right: Story = { args: { side: 'right', defaultOpen: true } };
export const Grouped: Story = { render: () => <TooltipProvider delayDuration={0}><Inline gap={8}>
  <Tooltip trigger={<IconButton aria-label="New session">{plus}</IconButton>} content="Start a new session" />
  <Tooltip trigger={<IconButton aria-label="Search sessions">{search}</IconButton>} content="Find a session" />
</Inline></TooltipProvider>, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.hover(canvas.getByRole('button', { name: 'Search sessions' }));
  await expect(canvas.getByRole('tooltip')).toHaveTextContent('Find a session');
} };
export const Night: Story = { ...Open, globals: { theme: 'night' } };
