import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppShell, Badge, Heading, Icon, Inline, RailTile, SearchField, Stack, Text, type AppShellProps } from '../src';

const rail = <ul>
  <li><RailTile href="#inbox" tone="blue" label="Inbox" current count={4}><Icon name="inbox" /></RailTile></li>
  <li><RailTile href="#boards" tone="sage" label="Boards"><Icon name="kanban" /></RailTile></li>
  <li><RailTile href="#reviews" tone="plum" label="Reviews" count={12}><Icon name="pull-requests" /></RailTile></li>
  <li><RailTile href="#files" tone="ochre" label="Files"><Icon name="folder" /></RailTile></li>
</ul>;
const railFooter = <RailTile href="#settings" label="Settings"><Icon name="settings" /></RailTile>;
const board = <Stack gap={8} align="start">
  <Text variant="label">Saved filters</Text>
  {['Unread', 'Flagged', 'From the team', 'This week'].map(name => <a key={name} className="kraft-link" href={`#${name}`}>{name}</a>)}
</Stack>;
const sheetHead = <Inline justify="between" wrap gap={12}><Heading as="h1" size="lg">Inbox</Heading><Badge tone="blue">4 new</Badge></Inline>;
const paragraphs = (count: number) => Array.from({ length: count }, (_, i) =>
  <Text key={i}>Letter {i + 1}. A short note on paper, filed in the inbox for later reading.</Text>);

const meta = {
  title: 'Components/AppShell',
  component: AppShell,
  args: { rail, railFooter, board, boardLabel: 'Filters', sheetHead, sheetLabel: 'Inbox', style: { blockSize: 560 } } as AppShellProps,
  argTypes: { rail: { control: false }, railFooter: { control: false }, board: { control: false }, sheetHead: { control: false }, topBar: { control: false } },
  render: args => <AppShell {...args}><Stack gap={12}>{paragraphs(6)}</Stack></AppShell>,
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(canvas.getByRole('complementary', { name: 'Filters' })).toBeVisible();
    await expect(canvas.getByRole('main')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Show Filters' })).toBeNull();
    // The current tile's count badge and focus ring (2px outline, 3px offset) fit inside the rail, which clips overflow.
    const nav = canvas.getByRole('navigation', { name: 'Main' }).getBoundingClientRect();
    const current = canvas.getByRole('link', { current: 'page' });
    const tile = current.getBoundingClientRect();
    const badge = current.querySelector('.kraft-rail-tile-count')!.getBoundingClientRect();
    await expect(badge.right).toBeLessThanOrEqual(nav.right);
    await expect(tile.right + 5).toBeLessThanOrEqual(nav.right);
    await expect(tile.left - 5).toBeGreaterThanOrEqual(nav.left);
  },
};

export const WithTopBar: Story = {
  args: { topBar: <SearchField aria-label="Search letters" placeholder="Search letters" /> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('banner')).toBeVisible();
  },
};

export const WithoutBoard: Story = {
  args: { board: undefined, boardLabel: undefined } as Partial<AppShellProps>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('complementary')).toBeNull();
  },
};

export const LongContent: Story = {
  args: { board: <Stack gap={8} align="start">{Array.from({ length: 40 }, (_, i) => <a key={i} className="kraft-link" href={`#f${i}`}>Filter {i + 1}</a>)}</Stack> },
  render: args => <AppShell {...args}><Stack gap={12}>{paragraphs(60)}</Stack></AppShell>,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('.kraft-app-shell')!;
    const body = canvasElement.querySelector<HTMLElement>('.kraft-app-sheet-body')!;
    const boardBody = canvasElement.querySelector<HTMLElement>('.kraft-app-board-body')!;
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await expect(boardBody.scrollHeight).toBeGreaterThan(boardBody.clientHeight);
    await expect(root.scrollHeight).toBe(root.clientHeight);
  },
};

export const SheetHead: Story = {
  render: args => <AppShell {...args}><Stack gap={12}>{paragraphs(60)}</Stack></AppShell>,
  play: async ({ canvasElement }) => {
    const head = canvasElement.querySelector<HTMLElement>('.kraft-app-sheet-head')!;
    const body = canvasElement.querySelector<HTMLElement>('.kraft-app-sheet-body')!;
    const top = head.getBoundingClientRect().top;
    body.scrollTop = 400;
    await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0));
    await expect(head.getBoundingClientRect().top).toBe(top);
  },
};

export const Narrow: Story = {
  render: args => <div style={{ inlineSize: 375, maxInlineSize: '100%' }}><AppShell {...args}><Stack gap={12}>{paragraphs(8)}</Stack></AppShell></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('complementary', { name: 'Filters' })).toBeNull();
    const toggle = canvas.getByRole('button', { name: 'Show Filters' });
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    const boardRegion = await canvas.findByRole('complementary', { name: 'Filters' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(boardRegion).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('complementary', { name: 'Filters' })).toBeNull();
    await expect(toggle).toHaveFocus();
  },
};

export const Night: Story = { globals: { theme: 'night' } };

export const Undecorated: Story = { globals: { texture: 'off', motion: 'off', tilt: 'off' } };
