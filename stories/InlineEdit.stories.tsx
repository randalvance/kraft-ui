import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { Button, InlineEdit, Stack } from '../src';

const meta = {
  title: 'Components/InlineEdit', component: InlineEdit,
  args: { label: 'Edit proof title', defaultValue: 'Letterpress proof', onValueChange: fn() },
  parameters: { docs: { description: { component: 'A handwriting title that becomes a text field on click or focus. Enter saves, Escape cancels, and leaving the field saves and follows focus.' } } },
} satisfies Meta<typeof InlineEdit>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Stack gap={16} align="start" style={{ width: 'min(100%, 480px)' }}>
    <InlineEdit {...args} style={{ alignSelf: 'stretch' }} />
    <Button>Review proof</Button>
  </Stack>,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Letterpress proof/ }));
    const input = await canvas.findByRole('textbox', { name: 'Edit proof title' });
    await expect(input).toHaveFocus();
    await fireEvent.input(input, { target: { value: 'Letterpress proof revised' } });
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith('Letterpress proof revised');
    const trigger = canvas.getByRole('button', { name: /Letterpress proof revised/ });
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await fireEvent.input(await canvas.findByRole('textbox'), { target: { value: 'Discard this title' } });
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('heading', { name: 'Letterpress proof revised' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /Letterpress proof revised/ }));
    await fireEvent.input(await canvas.findByRole('textbox'), { target: { value: 'Letterpress proof revised again' } });
    const review = canvas.getByRole('button', { name: 'Review proof' });
    await userEvent.click(review);
    await expect(await canvas.findByRole('heading', { name: 'Letterpress proof revised again' })).toBeVisible();
    await expect(review).toHaveFocus();
  },
};

export const Editing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Letterpress proof/ }));
    await expect(await canvas.findByRole('textbox', { name: 'Edit proof title' })).toHaveFocus();
  },
};

export const Empty: Story = {
  render: function ControlledTitle(args) {
    const [value, setValue] = useState('');
    return <InlineEdit {...args} value={value} onValueChange={setValue} placeholder="Name this proof" />;
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Approved letterpress proof' } };
export const QuietNight: Story = { ...Editing, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };
