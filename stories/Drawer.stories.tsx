import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Badge, Button, Drawer, Icon, IconButton, ResizablePane, Stack, Surface, Text } from '../src';

const meta = { title: 'Components/Drawer and resizable pane', component: ResizablePane,
  parameters: { docs: { description: { component: 'ResizablePane fills a bounded container with two scrolling flex columns. Use one or more Drawers in its side pane. Drag the divider or focus it and use arrow keys, Home, or End. In a narrow container the open side pane takes the full width. The caller owns open state and focus return.' } } },
  args: { main: <Text>Main content</Text>, pane: <Text>Side content</Text> },
} satisfies Meta<typeof ResizablePane>;
export default meta;
type Story = StoryObj<typeof meta>;

function DrawerDemo() {
  const [open, setOpen] = useState(true);
  const [size, setSize] = useState(320);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) trigger.current?.focus(); }, [open]);
  return <ResizablePane style={{ maxWidth: 840, height: 340 }} main={<Surface as="section" padding={16} style={{ flex: 1 }}>
    <Stack gap={12}><Text>Session notes stay visible beside the artifact sheet.</Text><Button ref={trigger} onClick={() => setOpen(true)}>Open artifacts</Button></Stack>
  </Surface>} pane={<Drawer title="Artifacts" description="Pinned from this session" onClose={() => setOpen(false)}
    footer={<Button size="sm">Download plan</Button>}><Text>Rollout plan</Text><Text>Version 2 of 2</Text></Drawer>}
    open={open} size={size} onSizeChange={setSize} />;
}

export const Default: Story = { render: () => <DrawerDemo />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const handle = canvas.getByRole('separator', { name: 'Resize side pane' });
  handle.focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect(handle).toHaveAttribute('aria-valuenow', '336');
  await expect(getComputedStyle(handle).outlineStyle).toBe('solid');
  await userEvent.click(canvas.getByRole('button', { name: 'Close panel' }));
  await expect(canvas.queryByRole('complementary', { name: 'Artifacts' })).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: 'Open artifacts' }));
  await expect(canvas.getByRole('complementary', { name: 'Artifacts' })).toBeVisible();
} };

export const ScrollWithFooter: Story = { render: () => <div style={{ height: 320, maxWidth: 840 }}>
  <ResizablePane side="start" defaultSize={360} main={
    <Stack gap={16}>{Array.from({ length: 24 }, (_, i) => <Text key={i}>Session note {i + 1}</Text>)}</Stack>
  } pane={<Drawer title={<>Review <em>artifacts</em></>}
    eyebrow={<Badge tone="attention">In progress</Badge>}
    description={<p>Check the <strong>print-ready files</strong> and their revision notes before archiving this session.</p>}
    actions={<IconButton variant="bare" aria-label="Pin artifacts"><Icon name="pin" /></IconButton>}
    footerPlacement="scroll" footer={<Button size="sm">Archive files</Button>}>
    <Stack gap={12}>{Array.from({ length: 16 }, (_, i) => <Text key={i}>Print proof {i + 1}</Text>)}</Stack>
  </Drawer>} />
</div>, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const drawer = canvas.getByRole('complementary', { name: 'Review artifacts' });
  const content = within(drawer);
  await expect(drawer).toHaveAccessibleDescription(/Check the print-ready files/);
  await expect(content.queryByRole('button', { name: 'Close panel' })).toBeNull();
  const action = content.getByRole('button', { name: 'Pin artifacts' });
  const footer = content.getByRole('button', { name: 'Archive files' });
  await expect(footer.getBoundingClientRect().top).toBeGreaterThan(drawer.getBoundingClientRect().bottom);
  action.focus();
  await userEvent.tab();
  await expect(content.getByRole('region', { name: 'Review artifacts' })).toHaveFocus();
  await userEvent.tab();
  await expect(footer).toHaveFocus();
  await expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(drawer.getBoundingClientRect().bottom);
  const handle = canvas.getByRole('separator');
  await userEvent.tab();
  await expect(handle).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect(handle).toHaveAttribute('aria-valuenow', '376');
  const mainPane = canvas.getByRole('region', { name: 'Main pane' });
  const pane = document.getElementById(handle.getAttribute('aria-controls')!)!;
  await expect(pane.parentElement!.getBoundingClientRect().height).toBe(320);
  for (const column of [mainPane, pane]) {
    await expect(getComputedStyle(column).flexDirection).toBe('column');
    await expect(getComputedStyle(column).overflowY).toBe('auto');
  }
  await expect(mainPane.scrollHeight).toBeGreaterThan(mainPane.clientHeight);
  await userEvent.tab();
  await expect(mainPane).toHaveFocus();
} };

export const Stacked: Story = { render: () => <div style={{ height: 260, maxWidth: 840 }}>
  <ResizablePane main={<Text>Session notes</Text>} pane={<>
    <Drawer title="Print files" description="Final proofs"><Text>Cover and insert</Text></Drawer>
    <Drawer title="Approvals" description="Production sign-off" footer={<Button size="sm">Approve</Button>}>
      <Text>Confirm the trim marks.</Text>
    </Drawer>
  </>} />
</div>, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const first = canvas.getByRole('complementary', { name: 'Print files' });
  const second = canvas.getByRole('complementary', { name: 'Approvals' });
  await expect(first.getBoundingClientRect().bottom).toBeLessThan(second.getBoundingClientRect().top);
  const pane = second.parentElement!;
  await expect(pane.scrollHeight).toBeGreaterThan(pane.clientHeight);
  const approve = within(second).getByRole('button', { name: 'Approve' });
  approve.focus();
  await expect(approve.getBoundingClientRect().bottom).toBeLessThanOrEqual(pane.getBoundingClientRect().bottom);
} };

export const Narrow: Story = { render: () => <div style={{ maxWidth: 380 }}><DrawerDemo /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const drawer = canvas.getByRole('complementary', { name: 'Artifacts' });
    await expect(canvas.queryByRole('separator')).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Open artifacts' })).toBeNull();
    await expect(drawer.getBoundingClientRect().width).toBe(drawer.parentElement!.parentElement!.getBoundingClientRect().width);
    await userEvent.click(within(drawer).getByRole('button', { name: 'Close panel' }));
    await expect(canvas.getByRole('button', { name: 'Open artifacts' })).toHaveFocus();
  },
};

export const Night: Story = { ...Default, globals: { theme: 'night' } };
export const PlainNight: Story = { ...ScrollWithFooter, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };
