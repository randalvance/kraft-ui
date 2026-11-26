import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Inline, Stack, Stat, Surface, type StatSize, type Tone } from '../src';

const tones: Tone[] = ['neutral', 'blue', 'sage', 'danger', 'attention'];
const sizes: StatSize[] = ['sm', 'md', 'lg'];

const meta = {
  title: 'Components/Stat', component: Stat,
  parameters: { docs: { description: { component: 'A large handwritten figure over a small caption. `tone` inks the figure in a colour that stays readable on paper, kraft, and cardboard in both themes; the caption says what the figure means, so the tone is never the only signal. `size` sets the figure at 26, 38, or 52px, and `align` places the pair.' } } },
  argTypes: { tone: { control: 'select', options: tones }, size: { control: 'inline-radio', options: sizes }, align: { control: 'inline-radio', options: ['start', 'center', 'end'] } },
  args: { value: '12', label: 'Open cards', tone: 'neutral', size: 'md', align: 'start' },
} satisfies Meta<typeof Stat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Surface><Stat {...args} /></Surface>,
  play: async ({ canvasElement }) => {
    const stat = canvasElement.querySelector<HTMLElement>('.kraft-stat')!;
    await expect(stat).toHaveTextContent(/^12Open cards$/);
    const value = stat.querySelector<HTMLElement>('.kraft-stat-value')!;
    await expect(getComputedStyle(value).fontSize).toBe('38px');
    await expect(value.getBoundingClientRect().bottom).toBeLessThanOrEqual(stat.querySelector('.kraft-stat-label')!.getBoundingClientRect().top + 1);
  },
};

/** Every tone on each material. */
export const Tones: Story = {
  render: () => <Stack gap={12}>
    {(['paper', 'kraft', 'cardboard'] as const).map(material => <Surface key={material} material={material}>
      <Inline gap={24} wrap>
        {tones.map((tone, index) => <Stat key={tone} tone={tone} value={[12, 7, 31, 3, 5][index]} label={['Open', 'In review', 'Shipped', 'Blocked', 'Waiting'][index]} />)}
      </Inline>
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    const paper = [...canvasElement.querySelectorAll<HTMLElement>('.kraft-surface[data-material="paper"] .kraft-stat-value')];
    await expect(new Set(paper.map(value => getComputedStyle(value).color)).size).toBe(5);
  },
};

/** The three sizes and alignments. */
export const SizesAndAlignment: Story = {
  render: () => <Surface><Stack gap={16}>
    <Inline gap={24} align="end">{sizes.map(size => <Stat key={size} size={size} value="98%" label={`Size ${size}`} />)}</Inline>
    {(['start', 'center', 'end'] as const).map(align => <Stat key={align} align={align} value="1,204" label={`Aligned ${align}`} />)}
  </Stack></Surface>,
  play: async ({ canvasElement }) => {
    const values = [...canvasElement.querySelectorAll<HTMLElement>('.kraft-stat-value')].slice(0, 3);
    await expect(values.map(value => getComputedStyle(value).fontSize)).toEqual(['26px', '38px', '52px']);
    await expect(getComputedStyle(canvasElement.querySelector('.kraft-stat[data-align="end"]')!).textAlign).toBe('end');
  },
};
