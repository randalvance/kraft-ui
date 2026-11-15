import { expect, within } from 'storybook/test';
import { Stack } from '../src';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Surface,Text } from '../src';
const meta = { title: 'Primitives/Surface', component: Surface, parameters: { docs: { description: { component: "A material boundary. Paper carries content; cardboard supports groups and labels. Use as for article or section semantics." } } }, argTypes: { material: { control: 'select', options: ['paper','cardboard','kraft'] }, elevation: { control: 'select', options: [0,1,2,3] }, padding: { control: 'select', options: [0,4,8,12,16,24] } }, args: { material: 'paper', elevation: 1, padding: 24, children: <Text>A separate piece of paper, with its own cut edge.</Text> } } satisfies Meta<typeof Surface>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};

export const NestedLayout: Story = { render: () => <Surface padding={24}><Stack gap={8} data-testid="nested-layout"><Text>A child layout starts with no padding.</Text><Text>Only the surface supplies the inset.</Text></Stack></Surface>, play: async ({ canvasElement }) => { const child = within(canvasElement).getByTestId('nested-layout'); await expect(getComputedStyle(child).padding).toBe('0px'); await expect(getComputedStyle(child).gap).toBe('8px'); } };
