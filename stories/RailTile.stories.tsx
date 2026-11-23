import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon, RailTile, type CardTone } from '../src';

const tones: CardTone[] = ['neutral', 'blue', 'sage', 'danger', 'attention', 'ochre', 'teal', 'violet', 'plum', 'blush', 'navy'];
const strip = { display: 'flex', flexWrap: 'wrap', gap: 14, width: 'max-content', maxWidth: '100%', margin: 0, padding: 14, listStyle: 'none', background: 'var(--kraft-rail)', borderRadius: 4 } as const;

const meta = {
  title: 'Components/RailTile',
  component: RailTile,
  args: { label: 'Inbox', href: '#inbox', tone: 'blue', children: <Icon name="inbox" /> },
  argTypes: {
    tone: { control: 'select', options: tones },
    children: { control: false },
  },
} satisfies Meta<typeof RailTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <ul style={strip}><li><RailTile {...args} /></li></ul>,
};

export const Tones: Story = {
  render: () => <ul style={strip}>
    {tones.map(tone => <li key={tone}><RailTile href={`#${tone}`} tone={tone} label={`${tone} tile`}><Icon name="kanban" /></RailTile></li>)}
  </ul>,
};

export const Current: Story = {
  render: () => <ul style={strip}>
    <li><RailTile href="#inbox" tone="blue" label="Inbox" current><Icon name="inbox" /></RailTile></li>
    <li><RailTile href="#boards" tone="sage" label="Boards"><Icon name="kanban" /></RailTile></li>
    <li><RailTile href="#settings" label="Settings"><Icon name="settings" /></RailTile></li>
  </ul>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Inbox', current: 'page' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Boards' })).not.toHaveAttribute('aria-current');
  },
};

export const Counts: Story = {
  render: () => <ul style={strip}>
    <li><RailTile href="#a" tone="blue" label="Inbox" count={1}><Icon name="inbox" /></RailTile></li>
    <li><RailTile href="#b" tone="teal" label="Reviews" count={12}><Icon name="pull-requests" /></RailTile></li>
    <li><RailTile href="#c" tone="plum" label="Mentions" count={120}><Icon name="send" /></RailTile></li>
  </ul>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tile = canvas.getByRole('link', { name: 'Mentions, 120 new' });
    await expect(tile).toHaveTextContent('99+');
    await expect(canvas.getByRole('link', { name: 'Inbox, 1 new' })).toBeVisible();
  },
};

const RouterLink = forwardRef<HTMLAnchorElement, { to: string } & ComponentPropsWithoutRef<'a'>>(
  function RouterLink({ to, ...props }, ref) { return <a ref={ref} href={`#${to}`} {...props} />; });

export const RouterLinkTile: Story = {
  name: 'Router link',
  render: () => <ul style={strip}><li><RailTile as={RouterLink} to="/boards" tone="ochre" label="Boards"><Icon name="kanban" /></RailTile></li></ul>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Boards' })).toHaveAttribute('href', '#/boards');
  },
};

export const Focus: Story = {
  render: () => <ul style={strip}><li><RailTile href="#inbox" tone="blue" label="Inbox"><Icon name="inbox" /></RailTile></li></ul>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Inbox' })).toHaveFocus();
    await expect(await canvas.findByRole('tooltip')).toHaveTextContent('Inbox');
  },
};
