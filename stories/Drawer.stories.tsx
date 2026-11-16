import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, Drawer, ResizablePane, Stack, Surface, Text } from '../src';

const meta = { title: 'Components/Drawer and resizable pane', component: ResizablePane,
  parameters: { docs: { description: { component: 'A paper Drawer can sit in a ResizablePane beside main content. Drag its divider or focus it and use arrow keys, Home, or End. On narrow screens, the pane covers the available width. The caller owns open state and focus policy.' } } },
  args: { main: <Text>Main content</Text>, pane: <Text>Side content</Text> },
} satisfies Meta<typeof ResizablePane>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: function DrawerDemo() {
  const [open, setOpen] = useState(true);
  const [size, setSize] = useState(320);
  return <ResizablePane style={{ width: 'min(100%, 840px)', minHeight: 340 }} main={<Surface as="section" padding={16} style={{ height: '100%' }}>
    <Stack gap={12}><Text>Session notes stay visible beside the artifact sheet.</Text><Button onClick={() => setOpen(true)}>Open artifacts</Button></Stack>
  </Surface>} pane={<Drawer title="Artifacts" description="Pinned from this session" onClose={() => setOpen(false)}
    footer={<Button size="sm">Download plan</Button>}><Text>Rollout plan</Text><Text>Version 2 of 2</Text></Drawer>}
    open={open} size={size} onSizeChange={setSize} />;
}, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const handle = canvas.getByRole('separator', { name: 'Resize side pane' });
  handle.focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect(handle).toHaveAttribute('aria-valuenow', '336');
  await userEvent.click(canvas.getByRole('button', { name: 'Close panel' }));
  await expect(canvas.queryByRole('complementary', { name: 'Artifacts' })).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: 'Open artifacts' }));
  await expect(canvas.getByRole('complementary', { name: 'Artifacts' })).toBeVisible();
} };
export const Night: Story = { ...Default, globals: { theme: 'night' } };
