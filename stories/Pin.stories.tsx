import type { ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Inline, Pin, Surface, type PinProps, type PinTone } from '../src';

// The span and button forms are a union, so the stories describe the props they share.
type PinArgs = { as?: 'span' | 'button'; tone?: PinTone; label?: string; disabled?: boolean; onClick?: () => void };

const tones: PinTone[] = ['red', 'blue', 'green', 'amber'];

const meta = {
  title: 'Primitives/Pin',
  component: Pin as ComponentType<PinArgs>,
  render: args => <Pin {...args as PinProps} />,
  argTypes: {
    as: { control: 'select', options: ['span', 'button'] },
    tone: { control: 'select', options: tones },
  },
  decorators: [Story => <Surface material="cardboard" padding={24} style={{ inlineSize: 'fit-content' }}><Story /></Surface>],
} satisfies Meta<PinArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Decorative: Story = {
  play: async ({ canvasElement }) => {
    const pin = canvasElement.querySelector<HTMLElement>('.kraft-pin')!;
    await expect(pin).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(pin.firstElementChild!).backgroundImage).toContain('radial-gradient');
    await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Tones: Story = {
  render: () => <Inline gap={16}>{tones.map(tone => <Pin key={tone} tone={tone} label={`${tone} pin`} />)}</Inline>,
  play: async ({ canvasElement }) => {
    const pins = within(canvasElement).getAllByRole('img');
    await expect(pins.map(pin => pin.dataset.tone)).toEqual(tones);
    const faces = pins.map(pin => getComputedStyle(pin.firstElementChild!).backgroundColor);
    await expect(new Set(faces).size).toBe(tones.length);
  },
};

export const NightTones: Story = { ...Tones, globals: { theme: 'night' } };

export const PullToUnpin: Story = {
  args: { as: 'button', label: 'Unpin the poster proof', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const pin = within(canvasElement).getByRole('button', { name: 'Unpin the poster proof' });
    const box = pin.getBoundingClientRect();
    await expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
    await userEvent.tab();
    await expect(pin).toHaveFocus();
    await expect(getComputedStyle(pin).outlineStyle).toBe('solid');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await userEvent.click(pin);
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const Disabled: Story = {
  args: { as: 'button', label: 'Unpin the poster proof', disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const pin = within(canvasElement).getByRole('button', { name: 'Unpin the poster proof' });
    await expect(pin).toBeDisabled();
    await expect(getComputedStyle(pin.firstElementChild!).borderTopStyle).toBe('dashed');
    await userEvent.click(pin, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
