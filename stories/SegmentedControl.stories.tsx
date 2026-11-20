import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SegmentedControl, type SegmentOption } from '../src';

const options: SegmentOption[] = [
  { value: 'all', label: 'All', count: 12 },
  { value: 'on', label: 'On', description: 'Running now', count: 8 },
  { value: 'paused', label: 'Paused', disabled: true },
  { value: 'off', label: 'Off', description: 'Ready to start', count: 0 },
];

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  args: { label: 'Show', name: 'show', options, defaultValue: 'all', onValueChange: fn() },
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Joined: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('radio', { name: 'All' });
    const on = canvas.getByRole('radio', { name: 'On' });
    const off = canvas.getByRole('radio', { name: 'Off' });
    await userEvent.tab();
    await expect(all).toHaveFocus();
    await expect(all).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    await expect(on).toBeChecked();
    await expect(on).toHaveAccessibleDescription('Running now Count 8');
    await userEvent.keyboard('{ArrowRight}');
    await expect(off).toHaveFocus();
    await expect(off).toBeChecked();
    await expect(off).toHaveAccessibleDescription('Ready to start Count 0');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('off', options[3]);
    await userEvent.keyboard('{ArrowRight}');
    await expect(all).toHaveFocus();
    await expect(all).toBeChecked();
  },
};

export const InkChips: Story = {
  args: { variant: 'chips', tone: 'ink', hideLabel: true },
  globals: { theme: 'night', motion: 'off', texture: 'off', tilt: 'off' },
  render: function Controlled(args) {
    const [value, setValue] = useState('all');
    return <SegmentedControl {...args} value={value} onValueChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Show' });
    const off = within(group).getByRole('radio', { name: 'Off' });
    await userEvent.click(off);
    await expect(off).toBeChecked();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const RequiredInForm: Story = {
  args: { defaultValue: undefined, required: true },
  render: args => <form aria-label="Filter">
    <SegmentedControl {...args} />
    <button type="reset">Reset filter</button>
  </form>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>('form', { name: 'Filter' });
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole('radio', { name: 'On' }));
    await expect(new FormData(form).get('show')).toBe('on');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset filter' }));
    await expect(form.checkValidity()).toBe(false);
  },
};
