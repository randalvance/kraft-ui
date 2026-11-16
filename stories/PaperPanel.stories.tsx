import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge, Button, IconButton, Inline, PaperPanel, Surface, Text } from '../src';

const CloseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>;

const meta = {
  title: 'Compositions/PaperPanel',
  component: PaperPanel,
  parameters: { controls: { include: ['title', 'titleAs'] }, docs: { description: { component: 'A titled paper workspace with a persistent blank body. Put app-specific controls, navigation, and footer content into the named slots. The title labels its section; choose titleAs to match the page heading hierarchy. Use --kraft-panel-body-min-height to size an empty body.' } } },
  argTypes: { titleAs: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] } },
  args: {
    title: 'A fresh conversation',
    titleAs: 'h2',
    leading: <Badge tone="attention">New</Badge>,
    controls: <><Button size="sm">Rename</Button><IconButton size="sm" aria-label="Close panel"><CloseIcon /></IconButton></>,
    style: { maxWidth: 850 },
  },
} satisfies Meta<typeof PaperPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'A fresh conversation' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { level: 2, name: 'A fresh conversation' })).toBeInTheDocument();
  },
};

export const WithContent: Story = {
  args: {
    title: 'Idea notes',
    leading: <Badge tone="sage">Open</Badge>,
    children: <Text>Keep the content on the paper, with room for longer thoughts.</Text>,
  },
};

export const TintedFrame: Story = {
  args: { title: 'Garden workspace', style: { maxWidth: 850, '--kraft-panel-frame': 'var(--kraft-mat-green)', '--kraft-panel-frame-edge': 'var(--kraft-mat-green-2)' } as CSSProperties },
};

export const WithNavigationAndFooter: Story = {
  args: {
    title: 'Workshop notes',
    navigation: <nav aria-label="Workshop views"><Inline gap={8} wrap><Button size="sm" aria-pressed="true">Notes</Button><Button size="sm">Tasks</Button></Inline></nav>,
    footer: <Surface elevation={0} padding={12}><Inline justify="between" wrap gap={8}><Text variant="label-sm">Add a thought to the sheet</Text><Button variant="blue" size="sm">New note</Button></Inline></Surface>,
  },
};

export const Night: Story = { ...Empty, globals: { theme: 'night' } };
