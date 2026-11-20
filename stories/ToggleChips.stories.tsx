import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ToggleChips, type SegmentOption } from '../src';

const options: SegmentOption[] = [
  { value: 'notes', label: 'Notes', count: 5 },
  { value: 'search', label: 'Search', description: 'Find files' },
  { value: 'export', label: 'Export', disabled: true },
];

const meta = {
  title: 'Components/ToggleChips',
  component: ToggleChips,
  args: { label: 'Tools', name: 'tools', options, defaultValue: ['notes'], onValueChange: fn() },
} satisfies Meta<typeof ToggleChips>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Chips: Story = {
  render: args => <form aria-label="Enabled tools">
    <ToggleChips {...args} />
    <button type="reset">Reset tools</button>
  </form>,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const notes = canvas.getByRole('checkbox', { name: 'Notes' });
    const search = canvas.getByRole('checkbox', { name: 'Search' });
    await userEvent.tab();
    await expect(notes).toHaveFocus();
    await userEvent.tab();
    await expect(search).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(notes).toBeChecked();
    await expect(search).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['notes', 'search'], options[1]);
    const form = canvas.getByRole<HTMLFormElement>('form', { name: 'Enabled tools' });
    await expect(new FormData(form).getAll('tools')).toEqual(['notes', 'search']);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset tools' }));
    await expect(search).not.toBeChecked();
  },
};

export const InkJoined: Story = {
  args: { variant: 'joined', tone: 'ink' },
  globals: { theme: 'night', motion: 'off', texture: 'off', tilt: 'off' },
  render: function Controlled(args) {
    const [value, setValue] = useState<readonly string[]>([]);
    return <ToggleChips {...args} value={value} onValueChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const notes = within(canvasElement).getByRole('checkbox', { name: 'Notes' });
    await userEvent.click(notes);
    await expect(notes).toBeChecked();
    await userEvent.click(notes);
    await expect(notes).not.toBeChecked();
  },
};

export const Disabled: Story = { args: { disabled: true } };
