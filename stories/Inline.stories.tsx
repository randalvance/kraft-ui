import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Inline,Text } from '../src';
const meta = { title: 'Primitives/Inline', component: Inline, parameters: { docs: { description: { component: "Horizontal flow. Enable wrap when the group must fit narrow viewports." } } }, argTypes: { gap: { control: 'select', options: [0,4,8,12,16,24] }, wrap: { control: 'boolean' } }, args: { gap: 16, wrap: true, children: [<Badge key="a">Draft</Badge>, <Badge key="b" tone="blue">Review</Badge>] } } satisfies Meta<typeof Inline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
