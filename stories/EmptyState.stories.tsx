import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button, EmptyState, Icon, Stack, Surface } from '../src';

const meta = {
  title: 'Components/EmptyState', component: EmptyState,
  parameters: { docs: { description: { component: 'A dashed placeholder for a list or page with nothing in it. `title` says what is missing, `children` explain why, and `action` offers the next step. It has no face, so it prints in the ink of the material that holds it. The title is a paragraph by default; set `titleAs` to a heading level that fits the page outline.' } } },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] }, titleAs: { control: 'select', options: ['p', 'h2', 'h3', 'h4', 'h5', 'h6'] }, leading: { control: false }, action: { control: false } },
  args: { title: 'No cards yet', children: 'Cards appear here when an agent picks up a task from the inbox.', size: 'md' },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Surface><EmptyState {...args} leading={<Icon name="inbox" />} action={<Button variant="dashed" leading={<Icon name="plus" />}>Add a card</Button>} /></Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvasElement.querySelector<HTMLElement>('.kraft-empty-state')!;
    await expect(getComputedStyle(empty).borderTopStyle).toBe('dashed');
    await expect(canvas.getByText('No cards yet').tagName).toBe('P');
    await expect(canvas.getByRole('button', { name: 'Add a card' })).toBeVisible();
  },
};

/** Both sizes, with and without the optional parts, on each material. */
export const Variants: Story = {
  render: () => <Stack gap={12}>
    <Surface><Stack gap={12}>
      <EmptyState title="Nothing matches" titleAs="h2" size="sm">Try a shorter search or clear the filters.</EmptyState>
      <EmptyState title="All caught up" size="sm" />
    </Stack></Surface>
    <Surface material="kraft"><EmptyState title="No pins" leading={<Icon name="pin" />}>Pin a card to keep it at the top of this column.</EmptyState></Surface>
    <Surface material="cardboard"><EmptyState title="Empty board" action={<><Button>New column</Button><Button variant="text">Import</Button></>}>This board has no columns.</EmptyState></Surface>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Nothing matches' })).toBeVisible();
    await expect(canvasElement.querySelectorAll('.kraft-empty-state')).toHaveLength(4);
    const small = canvasElement.querySelector<HTMLElement>('.kraft-empty-state[data-size="sm"] .kraft-empty-state-title')!;
    await expect(getComputedStyle(small).fontSize).toBe('22px');
  },
};
