import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, DescriptionList, Surface } from '../src';

const changeWorkspace = fn();
const items = [
  { id: 'workspace', label: 'Workspace', value: 'Product design', action: <Button size="sm" onClick={changeWorkspace}>Change workspace</Button> },
  { id: 'agent', label: 'Agent', value: 'Rollout assistant' },
  { id: 'created', label: 'Created', value: <time dateTime="2026-11-17">17 November 2026</time> },
  { id: 'updated', label: 'Updated', value: <time dateTime="2026-11-18">18 November 2026</time> },
  { id: 'command', label: 'Command', value: <code>npm run deploy -- --workspace=product-design</code>, wide: true },
];

const meta = {
  title: 'Components/Description list', component: DescriptionList,
  args: { items },
  decorators: [Story => <Surface padding={16} style={{ width: 'min(100%, 640px)' }}><Story /></Surface>],
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Stacked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Change workspace' });
    await expect(canvas.getByText('Workspace').tagName).toBe('DT');
    await expect(action.closest('dd')).toContainElement(canvas.getByText('Product design'));
    action.focus();
    await userEvent.keyboard('{Enter}');
    await expect(changeWorkspace).toHaveBeenCalled();
  },
};

export const Inline: Story = { args: { layout: 'inline' } };

export const TwoColumns: Story = {
  args: { columns: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const start = canvas.getByText('Workspace').getBoundingClientRect();
    const next = canvas.getByText('Agent').getBoundingClientRect();
    const wide = canvas.getByText('Command').getBoundingClientRect();
    await expect(next.top).toBeCloseTo(start.top);
    await expect(next.left).toBeGreaterThan(start.left);
    await expect(wide.width).toBeGreaterThan(start.width * 2);
  },
};

export const InlineTwoColumns: Story = { args: { columns: 2, layout: 'inline' } };

export const Narrow: Story = {
  args: { columns: 2, layout: 'inline', style: { maxWidth: 280 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const start = canvas.getByText('Workspace').getBoundingClientRect();
    const next = canvas.getByText('Agent').getBoundingClientRect();
    await expect(next.left).toBeCloseTo(start.left);
    await expect(next.top).toBeGreaterThan(start.bottom);
  },
};
