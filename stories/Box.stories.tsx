import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Box,Text } from '../src';
const meta = { title: 'Primitives/Box', component: Box, parameters: { docs: { description: { component: "A minimal container. Choose its semantic element with as and use token-based padding." } } }, argTypes: { padding: { control: 'select', options: [0,2,3,4,6,8,10,12,14,16,24] } }, args: { padding: 24, children: 'A semantic container.', style: { background: 'var(--kraft-paper-2)' } } } satisfies Meta<typeof Box>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
