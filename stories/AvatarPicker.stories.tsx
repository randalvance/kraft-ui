import { useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AvatarPicker, Button, Icon, Stack, Text, type AvatarOption } from '../src';
import cat from './assets/avatar-cat.svg';
import dog from './assets/avatar-dog.svg';

const options: AvatarOption[] = [
  { value: 'mochi', label: 'Mochi', src: cat, status: { tone: 'working', label: 'Working' } },
  { value: 'pip', label: 'Pip', src: dog, description: 'A patient helper' },
  { value: 'rue', label: 'Rue (unavailable)', initial: 'R', tone: 'blue', disabled: true },
  { value: 'kit', label: 'Kit', glyph: <Icon name="agent" />, tone: 'sage' },
];
const meta = { title: 'Components/Avatar picker', component: AvatarPicker,
  parameters: { docs: { description: { component: 'A fieldset of native radio inputs. Labels name each option and descriptions announce supporting text and status. Arrow keys follow browser radio behavior. The selection has a ring; keyboard focus outlines the whole target. Each target is at least 44px even for small portraits.' } } },
  args: { label: 'Choose a helper', name: 'helper', options, defaultValue: 'mochi', onValueChange: fn() },
} satisfies Meta<typeof AvatarPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('radio', { name: 'Mochi' })).toBeChecked();
  await userEvent.click(canvas.getByRole('radio', { name: 'Pip' }));
  await expect(args.onValueChange).toHaveBeenCalledWith('pip', options[1]);
  await userEvent.keyboard('{ArrowRight}');
  const kit = canvas.getByRole('radio', { name: 'Kit' });
  await expect(kit).toBeChecked();
  await expect(kit).toHaveFocus();
  await expect(getComputedStyle(kit.closest('label')!).outlineStyle).toBe('solid');
  await userEvent.keyboard('{ArrowRight}');
  await expect(canvas.getByRole('radio', { name: 'Mochi' })).toBeChecked();
} };
export const Unselected: Story = { args: { defaultValue: undefined } };
export const SmallTargets: Story = { args: { size: 18 } };
export const Large: Story = { args: { size: 84 } };
export const Disabled: Story = { args: { disabled: true } };
export const Described: Story = { args: { description: 'One helper per desk.', required: true } };
export const HiddenLegend: Story = { args: { hideLabel: true } };
export const RightToLeft: Story = { args: { dir: 'rtl' } };
export const Controlled: Story = { render: function Controlled(args) {
  const [value, setValue] = useState('mochi');
  return <Stack gap={16}>
    <AvatarPicker {...args} defaultValue={undefined} value={value} onValueChange={setValue} />
    <Text>Selected helper: {value}</Text>
  </Stack>;
} };
export const ExternalForm: Story = {
  render: function ExternalForm(args) {
    const formId = useId();
    return <Stack gap={16}>
      <AvatarPicker {...args} form={formId} defaultValue={undefined} required />
      <form id={formId} aria-label="Profile"><Button type="reset">Reset profile</Button></form>
    </Stack>;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole('form', { name: 'Profile' }) as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole('radio', { name: 'Pip' }));
    await expect(new FormData(form).get(args.name)).toBe('pip');
    await expect(form.checkValidity()).toBe(true);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset profile' }));
    await expect(new FormData(form).get(args.name)).toBeNull();
    await expect(form.checkValidity()).toBe(false);
    await expect(canvas.getByRole('radio', { name: 'Pip' })).not.toBeChecked();
  },
};
export const Night: Story = { ...Default, globals: { theme: 'night' } };
export const Quiet: Story = { globals: { texture: 'off', motion: 'off', tilt: 'off' } };
