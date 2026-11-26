import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, Icon, IconButton, SearchField, Stack, Surface, Toolbar, ToolbarGroup } from '../src';

const meta = {
  title: 'Components/Toolbar', component: Toolbar,
  parameters: { docs: { description: { component: 'A paper strip of grouped actions with `role="toolbar"` and a required `label`. `ToolbarGroup` clusters related controls, names them with an optional `label`, and draws a dashed rule between neighbours; `align="end"` pushes a group and those after it to the far end. The toolbar is one tab stop: the arrow keys, Home, and End move between its enabled controls, the arrows reverse in right-to-left text, and Tab returns to the control used last. Arrow keys inside a text field keep moving the caret.' } } },
  args: { label: 'Card actions' },
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

function CardToolbar() {
  const [pinned, setPinned] = useState(false);
  return <Toolbar label="Card actions">
    <ToolbarGroup label="Edit">
      <Button size="sm" variant="ghost" leading={<Icon name="pencil" />}>Rename</Button>
      <Button size="sm" variant="ghost" leading={<Icon name="copy" />}>Duplicate</Button>
      <Button size="sm" variant="ghost" disabled>Merge</Button>
    </ToolbarGroup>
    <ToolbarGroup label="Organise">
      <IconButton size="sm" variant="bare" aria-label="Pin card" aria-pressed={pinned} onClick={() => setPinned(value => !value)}><Icon name="pin" /></IconButton>
      <IconButton size="sm" variant="bare" aria-label="Share card"><Icon name="share" /></IconButton>
    </ToolbarGroup>
    <ToolbarGroup align="end" label="Remove">
      <Button size="sm" variant="text" tone="danger" leading={<Icon name="trash" />}>Delete</Button>
    </ToolbarGroup>
  </Toolbar>;
}

/** Start groups, a ruled second group, and an end group. */
export const Default: Story = {
  render: () => <Surface><Stack gap={12}><Button variant="ghost">Before</Button><CardToolbar /><Button variant="ghost">After</Button></Stack></Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar', { name: 'Card actions' });
    await expect(within(toolbar).getAllByRole('group').map(group => group.getAttribute('aria-label'))).toEqual(['Edit', 'Organise', 'Remove']);
    const name = (label: string) => within(toolbar).getByRole('button', { name: label });
    canvas.getByRole('button', { name: 'Before' }).focus();
    await userEvent.tab();
    await expect(name('Rename')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(name('Duplicate')).toHaveFocus();
    // The disabled control is skipped.
    await userEvent.keyboard('{ArrowRight}');
    await expect(name('Pin card')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(name('Pin card')).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{End}');
    await expect(name('Delete')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(name('Rename')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(name('Delete')).toHaveFocus();
    await userEvent.keyboard('{Home}{ArrowRight}');
    // One tab stop: Tab leaves, and Shift+Tab returns to the control used last.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'After' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(name('Duplicate')).toHaveFocus();
    await expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    // The end group sits at the far end, and only the second group is ruled.
    const groups = within(toolbar).getAllByRole('group');
    await expect(Math.round(groups[2].getBoundingClientRect().right)).toBe(Math.round(toolbar.getBoundingClientRect().right - 9));
    await expect(groups.map(group => getComputedStyle(group).borderInlineStartStyle)).toEqual(['none', 'dashed', 'none']);
  },
};

/** A text field keeps its arrow keys, the strip wraps when narrow, and it reads right to left. */
export const Variants: Story = {
  render: () => <Stack gap={12}>
    <Surface><Toolbar label="Filter cards">
      <ToolbarGroup><SearchField aria-label="Search cards" defaultValue="proof" style={{ inlineSize: 180 }} /></ToolbarGroup>
      <ToolbarGroup align="end"><Button size="sm">Sort</Button><Button size="sm" variant="blue">New card</Button></ToolbarGroup>
    </Toolbar></Surface>
    <Surface material="cardboard" style={{ inlineSize: 250 }}><Toolbar label="Narrow">
      <ToolbarGroup><Button size="sm" variant="ghost">Rename</Button><Button size="sm" variant="ghost">Duplicate</Button><Button size="sm" variant="ghost">Move</Button></ToolbarGroup>
      <ToolbarGroup align="end"><Button size="sm" variant="ghost">Archive</Button></ToolbarGroup>
    </Toolbar></Surface>
    <Surface dir="rtl"><Toolbar label="Right to left">
      <ToolbarGroup><Button size="sm" variant="ghost">One</Button><Button size="sm" variant="ghost">Two</Button></ToolbarGroup>
      <ToolbarGroup align="end"><Button size="sm" variant="ghost">Three</Button></ToolbarGroup>
    </Toolbar></Surface>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole<HTMLInputElement>('searchbox', { name: 'Search cards' });
    search.focus();
    search.setSelectionRange(5, 5);
    await userEvent.keyboard('{ArrowLeft}{Home}');
    await expect(search).toHaveFocus();
    const narrow = canvas.getByRole('toolbar', { name: 'Narrow' });
    await expect(narrow.scrollWidth).toBeLessThanOrEqual(narrow.clientWidth);
    const rtl = within(canvas.getByRole('toolbar', { name: 'Right to left' }));
    rtl.getByRole('button', { name: 'One' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(rtl.getByRole('button', { name: 'Two' })).toHaveFocus();
  },
};
