import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Link,Text } from '../src';
const meta = { title: 'Primitives/Link', component: Link, parameters: { docs: { description: { component: "A native anchor. Always supply an href for navigation and descriptive link text." } } }, argTypes: { href: { control: 'text' } }, args: { href: '#installation', children: 'Read the installation guide' } } satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
