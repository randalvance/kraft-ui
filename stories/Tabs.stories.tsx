import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Badge, Button, Stack, Tabs, Text, type TabItem } from '../src';

const items: TabItem[] = [
  { id: 'notes', label: 'Notes', trailing: '3', content: <Stack gap={12}><Text>Small thoughts on a fresh paper pane.</Text><Button size="sm">Add a note</Button></Stack> },
  { id: 'sketches', label: 'Sketches', content: <Text>Lines, shapes, and ideas in progress.</Text> },
  { id: 'clippings', label: 'Clippings', trailing: <Badge tone="sage">New</Badge>, content: <Text>Things worth keeping close.</Text> },
  { id: 'archive', label: 'Archive', disabled: true, content: <Text>Older material.</Text> },
];

const meta = {
  title: 'Components/Tabs', component: Tabs,
  parameters: { controls: { include: ['activationMode', 'orientation'] }, docs: { description: { component: 'A paper tab strip with linked panes. Give each item a stable ID, label, and content. Arrow keys, Home, and End move through enabled tabs; Tab enters the active pane. Automatic activation is best when pane content is already available. Choose manual activation when loading a pane may take time. Selection can be controlled with value/onValueChange or initialized with defaultValue.' } } },
  argTypes: { activationMode: { control: 'radio', options: ['automatic', 'manual'] }, orientation: { control: 'radio', options: ['horizontal', 'vertical'] } },
  args: { 'aria-label': 'Idea sections', items, defaultValue: 'notes', activationMode: 'automatic', orientation: 'horizontal', style: { maxWidth: 620 } },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const list = canvas.getByRole('tablist', { name: 'Idea sections' });
  await expect(within(list).getByRole('tab', { name: 'Notes 3' })).toHaveAttribute('aria-selected', 'true');
  await userEvent.click(within(list).getByRole('tab', { name: 'Sketches' }));
  await expect(canvas.getByRole('tabpanel', { name: 'Sketches' })).toBeVisible();
} };

export const ManualActivation: Story = { args: { activationMode: 'manual' }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const notes = canvas.getByRole('tab', { name: 'Notes 3' });
  const sketches = canvas.getByRole('tab', { name: 'Sketches' });
  await userEvent.tab();
  await userEvent.keyboard('{ArrowRight}');
  await expect(sketches).toHaveFocus();
  await expect(notes).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard('{Enter}');
  await expect(sketches).toHaveAttribute('aria-selected', 'true');
} };

export const Controlled: Story = { render: function ControlledTabs(args) {
  const [value, setValue] = useState('notes');
  return <Tabs {...args} value={value} onValueChange={setValue} />;
}, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('tab', { name: 'Clippings New' }));
  await expect(canvas.getByRole('tabpanel', { name: 'Clippings New' })).toBeVisible();
} };

export const Vertical: Story = { args: { orientation: 'vertical' }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('tablist', { name: 'Idea sections' })).toHaveAttribute('aria-orientation', 'vertical');
  await userEvent.tab();
  await userEvent.keyboard('{ArrowDown}');
  await expect(canvas.getByRole('tab', { name: 'Sketches' })).toHaveFocus();
} };

export const RightToLeft: Story = { render: () => <div dir="rtl" lang="ar"><Tabs aria-label="صفحات" items={[
  { id: 'notes', label: 'ملاحظات', content: <Text>ورقة جديدة للأفكار.</Text> },
  { id: 'sketches', label: 'رسوم', content: <Text>أفكار مرسومة.</Text> },
]} style={{ maxWidth: 500 }} /></div>, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  await userEvent.keyboard('{ArrowLeft}');
  await expect(canvas.getByRole('tab', { name: 'رسوم' })).toHaveFocus();
} };

export const Overflow: Story = { args: { items: Array.from({ length: 8 }, (_, index) => ({ id: `page-${index}`, label: `Paper section ${index + 1}`, content: <Text>Section {index + 1} has its own paper pane.</Text> })), style: { maxWidth: 320 } } };

export const Night: Story = { ...Default, globals: { theme: 'night' } };
