import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Avatar, Icon, Inline, Stack, Text, ThemeProvider, type AvatarStatus, type Tone } from '../src';
import cat from './assets/avatar-cat.svg';
import dog from './assets/avatar-dog.svg';

const tones: Tone[] = ['neutral', 'blue', 'sage', 'danger', 'attention'];
const statuses: AvatarStatus[] = [
  { tone: 'working', label: 'Working' }, { tone: 'waiting', label: 'Waiting' },
  { tone: 'blocked', label: 'Blocked' }, { tone: 'done', label: 'Done' }, { tone: 'idle', label: 'Idle' },
];
const meta = {
  title: 'Components/Avatar', component: Avatar,
  parameters: { docs: { description: { component: 'Portraits, monograms, and glyphs with a white cut border. Supply alt text or explicitly mark the portrait decorative. Status is included in the accessible name. Numeric size is the complete diameter in pixels; optional tilt follows the theme preference.' } } },
  args: { src: cat, alt: 'Mochi', size: 48 },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Portrait: Story = { play: async ({ canvasElement }) => {
  const portrait = within(canvasElement).getByRole('img', { name: 'Mochi' });
  const img = portrait.querySelector('img')!;
  await expect(img.complete && img.naturalWidth > 0).toBe(true);
} };
export const Sizes: Story = { render: () => <Inline gap={16} wrap align="end">
  {[18, 24, 32, 36, 48, 64, 84].map(size => <Stack key={size} gap={8} align="center">
    <Avatar src={cat} alt={`Mochi at ${size} pixels`} size={size} />
    <Text as="span" variant="label-sm">{size}px</Text>
  </Stack>)}
</Inline> };
export const Monograms: Story = { render: () => <Inline gap={16} wrap>
  {tones.map(tone => <Stack key={tone} gap={8} align="center">
    <Avatar initial="M" alt={`Mochi, ${tone} monogram`} tone={tone} size={48} />
    <Text as="span" variant="label-sm">{tone}</Text>
  </Stack>)}
</Inline> };
export const Glyphs: Story = { render: () => <Inline gap={16} wrap>
  {tones.map(tone => <Avatar key={tone} glyph={<Icon name="agent" />} alt={`Helper, ${tone} glyph`} tone={tone} size={48} />)}
</Inline> };
export const Statuses: Story = { render: () => <Stack gap={16} align="start">
  {[18, 36, 84].map(size => <Inline gap={16} key={size} wrap>
    {statuses.map(status => <Stack gap={8} align="center" key={status.tone}>
      <Avatar src={dog} alt="Pip" size={size} status={status} />
      <Text as="span" variant="label-sm">{status.label}</Text>
    </Stack>)}
  </Inline>)}
</Stack> };
export const Tilted: Story = { args: { tilt: -8, status: statuses[0] } };
export const Decorative: Story = { render: () => <Inline gap={8}>
  <Avatar src={cat} decorative /><Text as="span">Mochi</Text>
</Inline>, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('img')).not.toBeInTheDocument();
} };
export const Preferences: Story = { render: () => <Inline gap={24} wrap>
  {(['paper', 'night'] as const).flatMap(theme => [true, false].map(decoration => <ThemeProvider
    key={`${theme}-${decoration}`} theme={theme} texture={decoration} motion={decoration} tilt={decoration}
    style={{ padding: 24, borderRadius: 8 }}>
    <Stack gap={16} align="start">
      <Text variant="label">{theme} · decoration {decoration ? 'on' : 'off'}</Text>
      <Inline gap={16}>
        <Avatar src={cat} alt="Mochi" size={64} tilt={-8} status={statuses[0]} />
        <Avatar initial="P" alt="Pip" tone="sage" size={64} tilt={6} status={statuses[2]} />
      </Inline>
    </Stack>
  </ThemeProvider>))}
</Inline>, play: async ({ canvasElement }) => {
  for (const root of canvasElement.querySelectorAll<HTMLElement>('[data-kraft-theme]')) {
    const portrait = root.querySelector('.kraft-avatar')!;
    await expect(getComputedStyle(portrait).rotate).toBe(root.dataset.kraftTilt === 'off' ? '0deg' : '-8deg');
  }
} };
export const Night: Story = { args: { src: dog, alt: 'Pip', status: statuses[3] }, globals: { theme: 'night' } };
