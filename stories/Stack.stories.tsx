import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Stack,Text } from '../src';
const meta = { title: 'Primitives/Stack', component: Stack, parameters: { docs: { description: { component: "Vertical flow with token spacing. Native props and refs pass through to the selected element." } } }, argTypes: { gap: { control: 'select', options: [0,4,8,12,16,24] } }, args: { gap: 16, children: [<Text key="a">A group of related content.</Text>, <Text key="b">Arranged vertically.</Text>] } } satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
