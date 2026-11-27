import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Icon, Inline } from '../src';

const variants = ['neutral', 'blue', 'sage', 'danger', 'attention', 'ochre', 'teal', 'violet', 'plum', 'blush', 'navy', 'ghost', 'text', 'dashed'] as const;
const meta = { title: 'Primitives/Button', component: Button,
 parameters: { docs: { description: { component: 'A native button with raised card, flat outlined, text, and dashed variants. Raised cards come in the five shared tones and six palette tones. A controlled aria-pressed state flattens the face in place. Use wrap for long labels in narrow layouts.' } } },
 argTypes: { variant: { control: 'select', options: variants }, size: { control: 'select', options: ['sm','md','lg'] } },
 args: { children: 'Keep this idea', onClick: fn() },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => { const button = within(canvasElement).getByRole('button', { name: 'Keep this idea' }); await userEvent.click(button); await expect(args.onClick).toHaveBeenCalledOnce(); button.focus(); await userEvent.keyboard('{Enter}'); await expect(args.onClick).toHaveBeenCalledTimes(2); } };
export const Variants: Story = {
  render: () => <Inline wrap gap={16}>
    {variants.map(variant => <Button key={variant} variant={variant}>{variant}</Button>)}
    <Button variant="text" tone="danger">Remove draft</Button>
  </Inline>,
};
export const Sizes: Story = { render: () => <Inline gap={16}>{(['sm','md','lg'] as const).map(size => <Button key={size} size={size}>{size}</Button>)}</Inline> };
export const Disabled: Story = { args: { disabled: true, children: 'Unavailable' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('button')).toBeDisabled(); } };
export const Loading: Story = { args: { loading: true, children: 'Saving idea' }, play: async ({ canvasElement }) => { const button = within(canvasElement).getByRole('button', { name: 'Saving idea' }); await expect(button).toBeDisabled(); await expect(button).toHaveAttribute('aria-busy', 'true'); } };
export const LeadingAction: Story = {
  args: { variant: 'dashed', leading: <Icon name="plus" />, children: 'Add a note' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Add a note' });
    await expect(button.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  },
};
export const Pressed: Story = {
  render: function PressedExample() {
    const [pressed, setPressed] = useState(true);
    return <Button variant="ghost" leading={<Icon name="pin" />} aria-pressed={pressed} onClick={() => setPressed(!pressed)}>Pin note</Button>;
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Pin note', pressed: true });
    button.focus();
    await userEvent.keyboard('[Space]');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};
export const PressedVariants: Story = {
  render: () => <Inline wrap gap={16} style={{ maxInlineSize: 520 }}>
    {variants.map(variant => <Button key={variant} variant={variant} aria-pressed>{variant}</Button>)}
    <Button variant="text" tone="danger" aria-pressed>Show deleted</Button>
  </Inline>,
};
/** The palette tones give a piece its own colour, such as one per workspace. Each keeps its label readable in both themes, and the label says what the button does. */
export const PaletteTones: Story = {
  render: () => <Inline wrap gap={16}>
    {(['ochre', 'teal', 'violet', 'plum', 'blush', 'navy'] as const).map(tone =>
      <Button key={tone} variant={tone} leading={<Icon name="folder" />}>Open {tone} workspace</Button>)}
  </Inline>,
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button');
    await expect(buttons).toHaveLength(6);
    await expect(new Set(buttons.map(button => getComputedStyle(button).backgroundColor)).size).toBe(6);
    await userEvent.tab();
    await expect(buttons[0]).toHaveFocus();
    await expect(getComputedStyle(buttons[0]).outlineStyle).toBe('solid');
  },
};

const longLabel = 'KeepThisVeryLongUnbrokenIdeaIdentifier'.repeat(3);
export const LongLabels: Story = {
  render: () => <div style={{ display: 'grid', gap: 24, width: 'min(100%, 240px)' }}>
    {(['sm', 'md', 'lg'] as const).map(size => <Button key={size} size={size} wrap>{longLabel}</Button>)}
    <Button wrap loading>{longLabel}</Button>
  </div>,
};
export const NarrowFlex: Story = {
  render: () => <Inline gap={12} align="start" style={{ width: 'min(100%, 240px)' }}>
    <Button wrap>{longLabel}</Button>
    <Button>Keep</Button>
  </Inline>,
};
export const TranslatedLabels: Story = {
  render: () => <div style={{ display: 'grid', gap: 24, width: 'min(100%, 240px)' }}>
    <Button wrap lang="de">Änderungen an dieser gemeinsamen Notiz endgültig speichern</Button>
    <Button wrap lang="ar" dir="rtl">حفظ هذه الملاحظة الطويلة للرجوع إليها لاحقًا</Button>
    <Button wrap lang="ja">この長いメモを次回の作業のために保存する</Button>
    <Button wrap>📎 Keep this idea for another day 📝</Button>
  </div>,
};
