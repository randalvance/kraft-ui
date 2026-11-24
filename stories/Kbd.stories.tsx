import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Inline, Kbd, Stack, Surface, Text } from '../src';

const meta = {
  title: 'Primitives/Kbd', component: Kbd,
  parameters: { docs: { description: { component: 'A small paper keycap for a key hint. Pass one key as children, or a chord as `keys`; a chord renders nested `<kbd>` elements joined by a plus sign. `size="sm"` fits inside a field or a menu row. Keycaps stay upright when tilt is on.' } } },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { children: 'K', size: 'md' },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const key = canvasElement.querySelector('kbd')!;
  await expect(key).toHaveTextContent('K');
  await expect(key.getBoundingClientRect().height).toBe(22);
} };

export const Chord: Story = { args: { keys: ['Ctrl', 'Shift', 'K'] }, play: async ({ canvasElement }) => {
  const chord = canvasElement.querySelector('kbd.kraft-kbd-chord')!;
  await expect(chord.querySelectorAll(':scope > kbd')).toHaveLength(3);
  await expect(chord).toHaveTextContent('Ctrl+Shift+K');
  await expect(getComputedStyle(chord).whiteSpace).toBe('nowrap');
} };

export const Sizes: Story = {
  render: () => <Inline gap={16} style={{ alignItems: 'center' }}>
    <Kbd>Esc</Kbd><Kbd keys={['⌘', 'K']} /><Kbd size="sm">/</Kbd><Kbd size="sm" keys={['Ctrl', 'Enter']} />
  </Inline>,
  play: async ({ canvasElement }) => {
    const caps = [...canvasElement.querySelectorAll<HTMLElement>('kbd.kraft-kbd')];
    await expect(caps.map(cap => cap.getBoundingClientRect().height)).toEqual([22, 22, 22, 18, 18, 18]);
    for (const cap of caps) await expect(cap.getBoundingClientRect().width).toBeGreaterThanOrEqual(cap.getBoundingClientRect().height);
  },
};

export const InText: Story = {
  render: () => <Stack gap={12} style={{ maxWidth: 420 }}>
    <Text>Press <Kbd>/</Kbd> to search the letters, or <Kbd keys={['Ctrl', 'K']} /> to open the command list.</Text>
    <Surface material="kraft" padding={16}><Text>Press <Kbd>Esc</Kbd> to put the card back.</Text></Surface>
  </Stack>,
  play: async ({ canvasElement }) => {
    const sentence = within(canvasElement).getByText(/to search the letters/);
    await expect(sentence).toHaveTextContent('Press / to search the letters, or Ctrl+K to open the command list.');
  },
};

export const Night: Story = { ...Sizes, globals: { theme: 'night' } };
export const QuietNight: Story = { ...InText, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };
