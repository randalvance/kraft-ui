import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge,Text } from '../src';
const meta = { title: 'Primitives/Text', component: Text, parameters: { docs: { description: { component: "Body, label, handwritten, and code roles. Use as to preserve document semantics." } } }, argTypes: { variant: { control: 'select', options: ['body','label','label-sm','hand','code'] }, tone: { control: 'select', options: ['default','muted'] } }, args: { children: 'A fresh sheet, ready for your next idea.', variant: 'body', tone: 'default' } } satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongContent: Story = { args: { children: "Averylongunbrokenpieceofcontentthatstillneedstofitonsmallviewportwithoutcausinghorizontalscrolling" } };
