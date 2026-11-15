import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Heading,Text } from '../src';
const meta = { title: 'Primitives/Heading', component: Heading, parameters: { docs: { description: { component: "Heading appearance is independent of level. Select as to fit the document outline." } } }, argTypes: { size: { control: 'select', options: ['sm','md','lg','title'] }, as: { control: 'select', options: ['h1','h2','h3','h4','h5','h6'] } }, args: { children: 'Words worth keeping', as: 'h2', size: 'lg' } } satisfies Meta<typeof Heading>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
