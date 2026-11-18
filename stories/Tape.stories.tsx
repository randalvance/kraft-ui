import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Surface, Tape, Text, type TapeProps } from '../src';

const placements = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const satisfies readonly TapeProps['placement'][];
const meta = {
  title: 'Primitives/Tape',
  component: Tape,
  argTypes: { placement: { control: 'select', options: placements } },
  args: { placement: 'top' },
  render: args => <Surface style={{ position: 'relative', maxWidth: 224, textAlign: 'center' }}>
    <Tape {...args} />
    <Text>Paper swatch</Text>
  </Surface>,
} satisfies Meta<typeof Tape>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Decorative: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.kraft-tape')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Labelled: Story = {
  args: { label: 'Masking tape' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Masking tape' })).toBeVisible();
  },
};

export const Placements: Story = {
  render: () => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24, maxWidth: 680 }}>
    {placements.map(placement => <Surface key={placement} style={{ position: 'relative', textAlign: 'center' }}>
      <Tape placement={placement} />
      <Text>{placement}</Text>
    </Surface>)}
  </div>,
};

export const Flat: Story = { args: { placement: 'top-right' }, globals: { texture: 'off', tilt: 'off' } };
