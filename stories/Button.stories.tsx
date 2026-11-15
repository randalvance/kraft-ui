import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Inline } from '../src';
const meta = { title: 'Primitives/Button', component: Button,
 parameters: { docs: { description: { component: 'A native button cut from thick card. It travels down/right when pressed. Loading disables activation and preserves its label. Use aria-pressed with application state for toggle behavior.' } } },
 argTypes: { variant: { control: 'select', options: ['neutral','blue','sage','danger','attention'] }, size: { control: 'select', options: ['sm','md','lg'] } },
 args: { children: 'Keep this idea', onClick: fn() },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => { const button = within(canvasElement).getByRole('button', { name: 'Keep this idea' }); await userEvent.click(button); await expect(args.onClick).toHaveBeenCalledOnce(); button.focus(); await userEvent.keyboard('{Enter}'); await expect(args.onClick).toHaveBeenCalledTimes(2); } };
export const Variants: Story = { render: () => <Inline wrap gap={16}>{(['neutral','blue','sage','danger','attention'] as const).map(variant => <Button key={variant} variant={variant}>{variant}</Button>)}</Inline> };
export const Sizes: Story = { render: () => <Inline gap={16}>{(['sm','md','lg'] as const).map(size => <Button key={size} size={size}>{size}</Button>)}</Inline> };
export const Disabled: Story = { args: { disabled: true, children: 'Unavailable' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('button')).toBeDisabled(); } };
export const Loading: Story = { args: { loading: true, children: 'Saving idea' }, play: async ({ canvasElement }) => { const button = within(canvasElement).getByRole('button'); await expect(button).toBeDisabled(); await expect(button).toHaveAttribute('aria-busy', 'true'); } };
export const Pressed: Story = { args: { 'aria-pressed': true, children: 'Pinned' } };

const longLabel = 'KeepThisVeryLongUnbrokenIdeaIdentifier'.repeat(3);
export const LongLabels: Story = {
  render: () => <div style={{ display: 'grid', gap: 24, width: 'min(100%, 240px)' }}>
    {(['sm', 'md', 'lg'] as const).map(size => <Button key={size} size={size}>{longLabel}</Button>)}
    <Button loading>{longLabel}</Button>
  </div>,
};
export const NarrowFlex: Story = {
  render: () => <Inline gap={12} align="start" style={{ width: 'min(100%, 240px)' }}>
    <Button>{longLabel}</Button>
    <Button>Keep</Button>
  </Inline>,
};
export const TranslatedLabels: Story = {
  render: () => <div style={{ display: 'grid', gap: 24, width: 'min(100%, 240px)' }}>
    <Button lang="de">Änderungen an dieser gemeinsamen Notiz endgültig speichern</Button>
    <Button lang="ar" dir="rtl">حفظ هذه الملاحظة الطويلة للرجوع إليها لاحقًا</Button>
    <Button lang="ja">この長いメモを次回の作業のために保存する</Button>
    <Button>📎 Keep this idea for another day 📝</Button>
  </div>,
};
