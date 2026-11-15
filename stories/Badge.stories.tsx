import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Text } from '../src';
const meta = { title: 'Primitives/Badge', component: Badge, parameters: { docs: { description: { component: "A compact, noninteractive label with text-safe semantic colors. Status meaning must be carried by text." } } }, argTypes: { tone: { control: 'select', options: ['neutral','blue','sage','danger','attention'] } }, args: { children: 'Ready for review', tone: 'sage' } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Tones: Story = { render: () => <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>{(["neutral","blue","sage","danger","attention"] as const).map(tone => <Badge key={tone} tone={tone}>{tone}</Badge>)}</div> };
