import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider, Stack, Surface, Text, Button, Sticker, Inline } from '../src';
const meta = {
  title: 'Primitives/ThemeProvider', component: ThemeProvider,
  parameters: { docs: { description: { component: 'An SSR-safe scoped theme boundary. Providers may nest and never modify the document. Applications own theme persistence and font loading. Reduced motion overrides transition preferences.' } } },
  argTypes: { theme: { control: 'select', options: ['paper', 'night'] }, texture: { control: 'boolean' }, motion: { control: 'boolean' }, tilt: { control: 'boolean' } },
  args: { theme: 'paper', texture: true, motion: true, tilt: true, style: { padding: 24 }, children: <Stack gap={24}><Surface><Text>A sheet inside this theme boundary.</Text></Surface><Inline wrap gap={24}><Button variant="blue">Try the material</Button><Sticker shape="pill">A printed mark</Sticker></Inline></Stack> },
} satisfies Meta<typeof ThemeProvider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Paper: Story = {};
export const Night: Story = { args: { theme: 'night' } };
export const Quiet: Story = { args: { texture: false, motion: false, tilt: false } };
