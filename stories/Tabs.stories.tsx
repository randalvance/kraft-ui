import { useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Badge, Button, Dialog, Drawer, Icon, Stack, Surface, Tabs, Text, type TabItem } from '../src';

const items: TabItem[] = [
  { id: 'notes', label: 'Notes', trailing: '3', content: <Stack gap={12}><Text>Small thoughts on a fresh paper pane.</Text><Button size="sm">Add a note</Button></Stack> },
  { id: 'sketches', label: 'Sketches', content: <Text>Lines, shapes, and ideas in progress.</Text> },
  { id: 'clippings', label: 'Clippings', trailing: <Badge tone="sage">New</Badge>, content: <Text>Things worth keeping close.</Text> },
  { id: 'archive', label: 'Archive', disabled: true, content: <Text>Older material.</Text> },
];

const meta = {
  title: 'Components/Tabs', component: Tabs,
  parameters: { controls: { include: ['activationMode', 'orientation', 'panel', 'fill'] }, docs: { description: { component: 'A tab strip with paper, bare, or application-rendered panels. Arrow keys, Home, and End move through enabled tabs. Tab enters the active pane. Choose manual activation when loading a pane may take time, or use value and onValueChange to control selection.' } } },
  argTypes: { activationMode: { control: 'radio', options: ['automatic', 'manual'] }, orientation: { control: 'radio', options: ['horizontal', 'vertical'] }, panel: { control: 'radio', options: ['paper', 'bare', 'external'] } },
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

export const ExternalPanel: Story = { render: function ExternalTabs(args) {
  const prefix = useId();
  const [value, setValue] = useState('notes');
  const sections = [items[0], items[1]].map(({ id, label, content }) => ({
    id, label, content, tabId: `${prefix}-tab-${id}`, panelId: `${prefix}-panel-${id}`,
  }));
  return <Stack gap={16} style={{ maxWidth: 620 }}>
    <Tabs {...args} panel="external" value={value} onValueChange={setValue} items={sections} />
    {sections.map(section => <div key={section.id} role="tabpanel" tabIndex={0} hidden={section.id !== value}
      id={section.panelId} aria-labelledby={section.tabId}>
      <Surface padding={24}>{section.content}</Surface>
    </div>)}
  </Stack>;
}, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const sketches = canvas.getByRole('tab', { name: 'Sketches' });
  await userEvent.tab();
  await userEvent.keyboard('{ArrowRight}');
  await expect(sketches).toHaveFocus();
  const panel = canvas.getByRole('tabpanel', { name: 'Sketches' });
  await expect(sketches).toHaveAttribute('aria-controls', panel.id);
  await expect(sketches.closest('.kraft-tabs')).not.toContainElement(panel);
  await userEvent.tab();
  await expect(panel).toHaveFocus();
} };

async function checkBarePanel(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('tab', { name: 'Sketches' }));
  const panel = canvas.getByRole('tabpanel', { name: 'Sketches' });
  const css = getComputedStyle(panel);
  await expect(css.padding).toBe('0px');
  await expect(css.backgroundImage).toBe('none');
  await expect(css.borderWidth).toBe('0px');
  await expect(css.boxShadow).toBe('none');
  await expect(panel.clientHeight).toBeLessThan(160);
}

export const BareInDrawer: Story = { render: function DrawerTabs(args) {
  const [open, setOpen] = useState(true);
  return open ? <Drawer title="Notebook" onClose={() => setOpen(false)} style={{ maxWidth: 480 }}>
    <Tabs {...args} panel="bare" />
  </Drawer> : <Button onClick={() => setOpen(true)}>Open notebook</Button>;
}, play: ({ canvasElement }) => checkBarePanel(canvasElement) };

export const BareInDialog: Story = { render: function DialogTabs(args) {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>Open notebook</Button>
    <Dialog title="Notebook" open={open} onOpenChange={setOpen}><Tabs {...args} panel="bare" /></Dialog>
  </>;
}, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Open notebook' }));
  await canvas.findByRole('dialog', { name: 'Notebook' });
  await checkBarePanel(canvasElement);
} };

export const IconTabs: Story = { args: { items: [
  { ...items[0], iconOnly: true, leading: <Icon name="file" />, trailing: <Badge tone="blue">3</Badge> },
  { ...items[1], iconOnly: true, leading: <Icon name="pencil" /> },
  { ...items[3], iconOnly: true, leading: <Icon name="folder" /> },
] }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const notes = canvas.getByRole('tab', { name: 'Notes 3' });
  await userEvent.tab();
  await expect(notes).toHaveFocus();
  await canvas.findByRole('tooltip', { name: 'Notes' });
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(canvas.queryByRole('tooltip')).toBeNull());
  await userEvent.hover(canvas.getByRole('tab', { name: 'Sketches' }));
  await canvas.findByRole('tooltip', { name: 'Sketches' });
  const archive = canvas.getByRole('tab', { name: 'Archive' });
  await expect(archive).toBeDisabled();
  await userEvent.unhover(canvas.getByRole('tab', { name: 'Sketches' }));
  await userEvent.hover(archive.parentElement!);
  await canvas.findByRole('tooltip', { name: 'Archive' });
} };

export const LabelsAndStatus: Story = { args: { items: [
  { ...items[0], description: 'This week', trailing: <Badge tone="attention">3</Badge> },
  { ...items[1], description: 'Ready to share', trailing: <Icon name="check" label="Complete" /> },
  { ...items[3], description: 'Past notebooks' },
] }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const sketches = canvas.getByRole('tab', { name: 'Sketches Complete' });
  await expect(sketches).toHaveAccessibleDescription('Ready to share');
  await userEvent.click(sketches);
  await expect(canvas.getByRole('tabpanel', { name: 'Sketches Complete' })).toBeVisible();
} };

export const FillPanel: Story = { args: { fill: true, style: { maxWidth: 480, blockSize: 220 }, items: [
  { ...items[0], content: <Text as="div"><ol>{Array.from({ length: 20 }, (_, index) => <li key={index}>Notebook entry {index + 1}</li>)}</ol></Text> },
  items[1],
] }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  await userEvent.tab();
  const panel = canvas.getByRole('tabpanel', { name: 'Notes 3' });
  const strip = canvas.getByRole('tablist', { name: 'Idea sections' });
  await expect(panel).toHaveFocus();
  await expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
  await expect(getComputedStyle(panel).overflowY).toBe('auto');
  const top = strip.getBoundingClientRect().top;
  panel.scrollTop = panel.scrollHeight;
  await expect(panel.scrollTop).toBeGreaterThan(0);
  await expect(strip.getBoundingClientRect().top).toBe(top);
} };

function cueShows(strip: Element, edge: 'start' | 'end') {
  return getComputedStyle(strip, edge === 'start' ? '::before' : '::after').content === '""';
}

export const Overflow: Story = {
  args: { items: Array.from({ length: 8 }, (_, index) => ({ id: `page-${index}`, label: `Paper section ${index + 1}`, content: <Text>Section {index + 1} has its own paper pane.</Text> })), style: { maxWidth: 320 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const strip = canvas.getByRole('tablist').closest('.kraft-tab-strip')!;
    await waitFor(() => expect(cueShows(strip, 'end')).toBe(true));
    await expect(cueShows(strip, 'start')).toBe(false);
    await userEvent.tab();
    await userEvent.keyboard('{End}');
    const lastTab = canvas.getByRole('tab', { name: 'Paper section 8' });
    await expect(lastTab).toHaveFocus();
    await expect(lastTab).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => {
      expect(cueShows(strip, 'start')).toBe(true);
      expect(cueShows(strip, 'end')).toBe(false);
    });
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'Paper section 1' })).toHaveFocus();
    await waitFor(() => {
      expect(cueShows(strip, 'start')).toBe(false);
      expect(cueShows(strip, 'end')).toBe(true);
    });
  },
};

export const VerticalOverflow: Story = { ...Overflow, args: {
  ...Overflow.args, orientation: 'vertical', panel: 'bare', fill: true, style: { maxWidth: 480, blockSize: 220 },
} };

export const RightToLeftOverflow: Story = { ...Overflow, args: { ...Overflow.args, dir: 'rtl' } };

export const Night: Story = { ...Default, globals: { theme: 'night' } };

export const DecorationOff: Story = { ...IconTabs, globals: { texture: 'off', motion: 'off', tilt: 'off' } };
