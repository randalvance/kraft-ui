import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AvatarGroup, Icon, type AvatarProps } from '../src';
import cat from './assets/avatar-cat.svg';
import dog from './assets/avatar-dog.svg';

const avatars: AvatarProps[] = [
  { src: cat, alt: 'Mochi' }, { src: dog, alt: 'Pip' },
  { initial: 'R', alt: 'Rue', tone: 'blue' }, { glyph: <Icon name="agent" />, alt: 'Kit', tone: 'sage' },
  { initial: 'J', alt: 'Jun', tone: 'attention' }, { initial: 'B', alt: 'Bo', tone: 'danger' },
];
const meta = { title: 'Components/Avatar group', component: AvatarGroup,
  parameters: { docs: { description: { component: 'An overlapping native list with a named overflow count. Supply a group label and portrait props, then choose a shared size and the maximum visible portraits. The overflow count is informational.' } } },
  args: { label: 'Desk helpers', avatars, max: 4, size: 36 },
} satisfies Meta<typeof AvatarGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('list', { name: 'Desk helpers' })).toBeInTheDocument();
  await expect(canvas.getAllByRole('listitem')).toHaveLength(5);
  await expect(canvas.getByRole('img', { name: '2 more avatars' })).toHaveTextContent('+2');
} };
export const AllVisible: Story = { args: { max: 8 } };
export const Compact: Story = { args: { size: 18, max: 3 } };
export const Large: Story = { args: { size: 84, max: 3 } };
export const CountOnly: Story = { args: { max: 0 } };
export const Empty: Story = { args: { avatars: [] } };
export const RightToLeft: Story = { args: { dir: 'rtl' } };
export const Night: Story = { ...Default, globals: { theme: 'night' } };
