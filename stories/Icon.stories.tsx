import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  ActionableList, ActionableListItem, Badge, Button, Icon, IconButton, Inline,
  Stack, Surface, Tabs, Text, createIcon, iconNames, searchIcon, closeIcon,
} from '../src';

const meta = {
  title: 'Primitives/Icon', component: Icon,
  parameters: { docs: { description: { component: 'Single-ink SVG glyphs that inherit the surrounding text color. Icons are decorative by default; give a standalone image a label. Put interactive icons inside a named Button or IconButton. The size prop accepts pixels or a CSS length; without it, icons follow their surrounding text or component slot. Use createIcon with named glyph imports to include only an application’s chosen icons in its bundle.' } } },
  args: { name: 'search' },
  argTypes: { name: { control: 'select', options: iconNames }, size: { control: 'text' }, label: { control: 'text' } },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const icon = canvasElement.querySelector('svg')!;
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  await expect(icon).toHaveAttribute('focusable', 'false');
  await expect(within(canvasElement).queryByRole('img')).not.toBeInTheDocument();
} };

export const Gallery: Story = {
  render: () => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
    {iconNames.map(name => <Surface key={name} padding={12}><Inline gap={10}><Icon name={name} size={24} /><Text as="span" variant="code">{name}</Text></Inline></Surface>)}
  </div>,
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('svg');
    await expect(icons).toHaveLength(iconNames.length);
    for (const icon of icons) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(icon.children.length).toBeGreaterThan(0);
      await expect(getComputedStyle(icon).color).toBe(getComputedStyle(icon.parentElement!).color);
    }
  },
};

export const Sizes: Story = {
  render: () => <Stack gap={16}>
    <Inline wrap gap={24}>{[12, 16, 20, 24, 32, 48].map(size => <Inline key={size} gap={6}><Icon name="search" size={size} data-testid={`size-${size}`} /><Text as="span" variant="code">{size}px</Text></Inline>)}</Inline>
    <Text style={{ fontSize: 24 }}>An icon follows text: <Icon name="search" data-testid="relative-size" /></Text>
    <Icon name="search" size="2rem" label="Search at a custom size" />
    <IconButton aria-label="Custom size search"><Icon name="search" size={24} data-testid="explicit-button-size" /></IconButton>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const size of [12, 16, 20, 24, 32, 48]) {
      const bounds = canvas.getByTestId(`size-${size}`).getBoundingClientRect();
      await expect(bounds.width).toBe(size);
      await expect(bounds.height).toBe(size);
    }
    await expect(canvas.getByTestId('relative-size').getBoundingClientRect().width).toBe(24);
    await expect(canvas.getByTestId('explicit-button-size').getBoundingClientRect().width).toBe(24);
  },
};

export const Labelled: Story = {
  args: { name: 'pin', label: 'Pinned note', size: 32 },
  play: async ({ canvasElement }) => {
    const icon = within(canvasElement).getByRole('img', { name: 'Pinned note' });
    await expect(icon).not.toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('focusable', 'false');
  },
};

export const NativeLabels: Story = {
  render: () => <Inline gap={24}>
    <Icon name="search" aria-label="Find a note" size={24} />
    <span><Icon name="pin" aria-labelledby="icon-pin-description" size={24} /> <Text as="span" id="icon-pin-description">Pinned note</Text></span>
  </Inline>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Find a note' })).toBeVisible();
    await expect(canvas.getByRole('img', { name: 'Pinned note' })).toBeVisible();
  },
};

export const Controls: Story = {
  render: function Controls() {
    const [pinned, setPinned] = useState(false);
    return <Stack gap={24}>
      <Inline wrap gap={16}>{(['neutral', 'blue', 'sage', 'danger', 'attention'] as const).map(variant => <Button key={variant} variant={variant}><Icon name="search" />{variant} search</Button>)}</Inline>
      <Inline wrap gap={16}>{(['sm', 'md', 'lg'] as const).map(size => <IconButton key={size} size={size} aria-label={`${size} search`}><Icon name="search" /></IconButton>)}</Inline>
      <Inline wrap gap={16}>
        <Button disabled><Icon name="search" />Unavailable search</Button>
        <Button loading><Icon name="search" />Searching</Button>
        <IconButton disabled aria-label="Unavailable close"><Icon name="close" /></IconButton>
        <IconButton loading aria-label="Closing"><Icon name="close" /></IconButton>
        <IconButton aria-label="Pin note" aria-pressed={pinned} onClick={() => setPinned(value => !value)}><Icon name="pin" /></IconButton>
      </Inline>
    </Stack>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [size, pixels] of [['sm', 16], ['md', 20], ['lg', 20]] as const) {
      const button = canvas.getByRole('button', { name: `${size} search` });
      const icon = button.querySelector('svg')!;
      const bounds = icon.getBoundingClientRect(), target = button.getBoundingClientRect();
      await expect(bounds.width).toBe(pixels);
      await expect(bounds.height).toBe(pixels);
      await expect(Math.abs((bounds.left + bounds.right) / 2 - (target.left + target.right) / 2)).toBeLessThan(1);
      await expect(Math.abs((bounds.top + bounds.bottom) / 2 - (target.top + target.bottom) / 2)).toBeLessThan(1);
    }
    for (const icon of canvasElement.querySelectorAll('button svg')) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(getComputedStyle(icon).color).toBe(getComputedStyle(icon.closest('button')!).color);
    }
    await expect(canvas.getByRole('button', { name: 'Unavailable search' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Searching' })).toHaveAttribute('aria-busy', 'true');
    const closing = canvas.getByRole('button', { name: 'Closing' });
    await expect(closing).toBeDisabled();
    await expect(closing.querySelector('.kraft-pinwheel svg')).toBeInTheDocument();
    await expect(closing.querySelectorAll('svg')).toHaveLength(1);
    const pin = canvas.getByRole('button', { name: 'Pin note' });
    pin.focus();
    await userEvent.keyboard('{Enter}');
    await expect(pin).toHaveAttribute('aria-pressed', 'true');
    await expect(pin).toHaveFocus();
    await expect(getComputedStyle(pin).outlineStyle).toBe('solid');
    await userEvent.keyboard(' ');
    await expect(pin).toHaveAttribute('aria-pressed', 'false');
  },
};

export const Composition: Story = {
  render: () => <Stack gap={24} style={{ maxWidth: 620 }}>
    <Inline wrap gap={12}>{(['neutral', 'blue', 'sage', 'danger', 'attention'] as const).map(tone => <Badge key={tone} tone={tone}><Icon name="pin" />{tone} note</Badge>)}</Inline>
    <Tabs aria-label="Work panes" items={[
      { id: 'files', label: 'Files', leading: <Icon name="folder" />, content: <Text>Files on your desk.</Text> },
      { id: 'search', label: 'Search', leading: <Icon name="search" />, content: <Text>Find a saved note.</Text> },
    ]} />
    <ActionableList aria-label="Notes">
      <ActionableListItem label="Project notes" leading={<Icon name="file" />} actions={<IconButton size="sm" aria-label="Pin project notes"><Icon name="pin" /></IconButton>} />
      <ActionableListItem label="Archived notes" leading={<Icon name="folder" />} disabled />
    </ActionableList>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const files = canvas.getByRole('tab', { name: 'Files' });
    files.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Search' })).toHaveFocus();
    await expect(canvas.getByRole('tabpanel', { name: 'Search' })).toBeVisible();
    for (const [selector, pixels] of [['.kraft-tab-leading svg', 16], ['.kraft-list-leading svg', 18]] as const) {
      for (const icon of canvasElement.querySelectorAll(selector)) await expect(icon.getBoundingClientRect().width).toBe(pixels);
    }
    await expect(canvas.getByText('Project notes').closest('.kraft-list-target')?.tagName).toBe('SPAN');
    await expect(canvas.getByText('Archived notes').closest('.kraft-list-target')).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getByRole('button', { name: 'Pin project notes' })).toBeEnabled();
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
  },
};

export const Quiet: Story = { ...Composition, globals: { texture: 'off', motion: 'off', tilt: 'off' } };

const SearchIcon = createIcon({ search: searchIcon, close: closeIcon });
export const ScopedSubset: Story = {
  render: () => <Inline gap={16}><Button><SearchIcon name="search" />Search</Button><IconButton aria-label="Close search"><SearchIcon name="close" /></IconButton></Inline>,
};
