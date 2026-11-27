import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Badge } from '../src';
const tones = ['neutral', 'blue', 'sage', 'danger', 'attention', 'ochre', 'teal', 'violet', 'plum', 'blush', 'navy'] as const;
const meta = { title: 'Primitives/Badge', component: Badge, parameters: { docs: { description: { component: "A compact, noninteractive label with text-safe colors: five shared tones and six palette tones. Status meaning must be carried by text." } } }, argTypes: { tone: { control: 'select', options: tones } }, args: { children: 'Ready for review', tone: 'sage' } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Tones: Story = { render: () => <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>{tones.map(tone => <Badge key={tone} tone={tone}>{tone}</Badge>)}</div> };
export const Sizes: Story = {
  render: () => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <Badge>Ready for review</Badge><Badge size="sm">Ready</Badge><Badge size="count">12</Badge>
  </div>,
  play: async ({ canvasElement }) => {
    const count = canvasElement.querySelector('[data-size="count"]')!;
    await expect(count.getBoundingClientRect().height).toBe(18);
    await expect(getComputedStyle(count).whiteSpace).toBe('nowrap');
    await expect(getComputedStyle(count).flexShrink).toBe('0');
  },
};
