import { expect } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Sticker,Text } from '../src';
const meta = { title: 'Primitives/Sticker', component: Sticker, parameters: { docs: { description: { component: "An upright printed mark with a cut outline and no cast shadow. Round marks have a fixed 64px diameter, customizable with --kraft-sticker-size; use pills for longer labels. Hide redundant decoration with decorative; provide an accessible name for icon-only meaning." } } }, argTypes: { tone: { control: 'select', options: ['neutral','blue','sage','danger','attention'] }, shape: { control: 'select', options: ['round','pill','square'] }, decorative: { control: 'boolean' } }, args: { children: 'Keep', tone: 'blue', shape: 'round', decorative: false } } satisfies Meta<typeof Sticker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Tones: Story = { render: () => <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>{(["neutral","blue","sage","danger","attention"] as const).map(tone => <Sticker key={tone} tone={tone}>{tone}</Sticker>)}</div> };
export const CircleGeometry: Story = {
  render: () => <div style={{ display: 'flex', alignItems: 'stretch', gap: 16, width: 280 }}>{['K', 'Keep', 'Attention'].map(label => <Sticker key={label}>{label}</Sticker>)}</div>,
  play: async ({ canvasElement }) => {
    for (const sticker of canvasElement.querySelectorAll<HTMLElement>('.kraft-sticker')) {
      const rect = sticker.getBoundingClientRect();
      await expect(rect.width).toBeCloseTo(rect.height, 1);
      await expect(rect.width).toBe(64);
      await expect(getComputedStyle(sticker).transform).toBe('none');
    }
  },
};
export const Shapes: Story = {
  render: () => <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'start', gap: 24 }}>{(['round', 'pill', 'square'] as const).map(shape => <Sticker key={shape} shape={shape}>{shape}</Sticker>)}</div>,
  play: async ({ canvasElement }) => {
    for (const sticker of canvasElement.querySelectorAll<HTMLElement>('.kraft-sticker')) await expect(getComputedStyle(sticker).transform).toBe('none');
  },
};
export const CustomDiameter: Story = { args: { children: 'Keep', style: { '--kraft-sticker-size': '96px' } as import('react').CSSProperties }, play: async ({ canvasElement }) => {
  const sticker = canvasElement.querySelector<HTMLElement>('.kraft-sticker')!;
  const rect = sticker.getBoundingClientRect();
  await expect(rect.width).toBe(96);
  await expect(rect.height).toBe(96);
  await expect(getComputedStyle(sticker).transform).toBe('none');
} };
