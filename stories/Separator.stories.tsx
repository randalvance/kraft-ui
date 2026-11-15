import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Separator,Text } from '../src';
const meta = { title: 'Primitives/Separator', component: Separator, parameters: { docs: { description: { component: "A semantic separator. Use decorative for purely visual rules; vertical rules need a parent with height." } } }, argTypes: { orientation: { control: 'select', options: ['horizontal','vertical'] }, decorative: { control: 'boolean' } }, args: { orientation: 'horizontal', decorative: false } } satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
