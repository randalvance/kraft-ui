import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Badge, Card, CardAddTile, Checkbox, Heading, Icon, IconButton, Text, ThemeProvider, type CardTone } from '../src';
import dogPortrait from './assets/avatar-dog.svg';

const meta = { title: 'Components/Card', component: Card, subcomponents: { CardAddTile } } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

const tones = {
  neutral: 'Workspaces', blue: 'Review board', sage: 'Scout agent', danger: 'Incident board', attention: 'Proof queue',
  ochre: 'Type studio', teal: 'Search skill', violet: 'Editorial desk', plum: 'Print factory', blush: 'Swatch book', navy: 'Archive',
} satisfies Record<CardTone, string>;

function CardGrid({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gap: 16, maxWidth: '64rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 13rem), 1fr))' }}>
    {children}
  </div>;
}

export const Slots: Story = {
  render: () => <div style={{ maxWidth: '19rem' }}>
    <Card tone="ochre" tilt={-1} header={<Heading as="h2">Scout</Heading>}
      corner={<Badge>Agent</Badge>}
      media={<img src={dogPortrait} width={76} height={76} alt="Scout’s illustrated portrait" />}
      footer="Runs on the Print Studio workspace">
      <Text>Checks proofs and flags missing assets before a print run.</Text>
    </Card>
  </div>,
};

export const SpineTones: Story = {
  render: () => <CardGrid>
    <Card header="All workspaces">Everything on the desk.</Card>
    {(Object.keys(tones) as CardTone[]).map(tone => <Card key={tone} tone={tone} header={tones[tone]}>{tone}</Card>)}
  </CardGrid>,
};

export const GridAndStates: Story = {
  render: () => <CardGrid>
    <Card as="a" href="#print-studio" aria-labelledby="print-studio" tone="teal" selected
      header={<Heading id="print-studio" as="h2">Print Studio</Heading>}
      footer="4 agents · 2 boards">Track packaging proofs and studio runs.</Card>
    <Card as="a" href="#type-library" aria-labelledby="type-library" tone="navy" off
      header={<Heading id="type-library" as="h2">Type Library</Heading>}
      footer="Paused">Reference files and foundry specimens.</Card>
    <Card as="button" aria-label="Import archive" disabled tone="neutral" header="Import archive"
      footer="Preparing files">Bring in boards from another workspace.</Card>
    <CardAddTile label="Add workspace" />
  </CardGrid>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Print Studio', current: true })).toHaveAttribute('href', '#print-studio');
    await expect(canvas.getByRole('link', { name: 'Type Library' }).closest('article')).toHaveAttribute('data-off', 'true');
    await expect(canvas.getByRole('button', { name: 'Import archive' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Add workspace' })).toBeEnabled();
  },
};

function PressableCards() {
  const [selected, setSelected] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [added, setAdded] = useState(false);
  return <CardGrid>
    <Card as="button" aria-labelledby="proofs-card-title" tone="plum" selected={selected}
      onClick={() => setSelected(value => !value)} header={<Heading as="h2" id="proofs-card-title">Print proofs</Heading>}
      corner={<IconButton aria-label="Pin print proofs" aria-pressed={pinned} onClick={() => setPinned(value => !value)}><Icon name="pin" /></IconButton>}
      footer={<Checkbox>Notify me</Checkbox>}>
      <Text>Review the spring catalogue.</Text>
    </Card>
    <Card as="a" href="#archive" aria-label="Open archive" tone="violet" header="Open archive"
      footer={<a href="#archive-guide">Archive guide</a>}>Browse approved print runs.</Card>
    <CardAddTile label="Add board" onClick={() => setAdded(true)} />
    {added && <p role="status">Board added</p>}
  </CardGrid>;
}

export const KeyboardAndPointer: Story = {
  render: () => <PressableCards />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('button', { name: 'Print proofs' });
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await expect(getComputedStyle(card).outlineStyle).toBe('solid');
    await userEvent.keyboard('{Enter}');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard(' ');
    await expect(card).toHaveAttribute('aria-pressed', 'false');

    const copy = canvas.getByText('Review the spring catalogue.').getBoundingClientRect();
    const hit = canvasElement.ownerDocument.elementFromPoint(copy.x + 4, copy.y + copy.height / 2);
    await expect(hit).toBe(card);
    await userEvent.click(hit!);
    await expect(card).toHaveAttribute('aria-pressed', 'true');

    const pin = canvas.getByRole('button', { name: 'Pin print proofs' });
    await userEvent.tab();
    await expect(pin).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(pin).toHaveAttribute('aria-pressed', 'true');
    const notify = canvas.getByRole('checkbox', { name: 'Notify me' });
    await userEvent.click(canvas.getByText('Notify me'));
    await expect(notify).toBeChecked();
    await expect(card).toHaveAttribute('aria-pressed', 'true');

    await userEvent.tab();
    const link = canvas.getByRole('link', { name: 'Open archive' });
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).outlineStyle).toBe('solid');
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Archive guide' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Add board' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Board added');
  },
};

export const DecorationOff: Story = {
  render: (_, { globals }) => <ThemeProvider theme={globals.theme} texture={false} motion={false} tilt={false}>
    <CardGrid>
      <Card as="button" aria-label="Print factory" tone="plum" tilt={2} header="Print factory">Send a new proof.</Card>
      <ThemeProvider theme={globals.theme}>
        <Card as="button" aria-label="Proof queue" tone="attention" tilt={-2} header="Proof queue">Review submitted proofs.</Card>
      </ThemeProvider>
      <CardAddTile label="Add factory" />
    </CardGrid>
  </ThemeProvider>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const flat = getComputedStyle(canvas.getByRole('button', { name: 'Print factory' }).closest('article')!);
    const tilted = getComputedStyle(canvas.getByRole('button', { name: 'Proof queue' }).closest('article')!);
    await expect(flat.rotate).toBe('0deg');
    await expect(flat.transitionDuration).toBe('0s');
    await expect(flat.backgroundImage).not.toContain('url(');
    await expect(tilted.rotate).toBe('-2deg');
    await expect(tilted.backgroundImage).toContain('url(');
    const tile = getComputedStyle(canvas.getByRole('button', { name: 'Add factory' }));
    await expect(tile.backgroundImage).not.toContain('url(');
    await expect(tile.transitionDuration).toBe('0s');
  },
};

const threads = [
  { id: 'csv-export', title: 'Add CSV export', line: 'Waiting on your review', tone: 'attention' },
  { id: 'proof-colours', title: 'Fix proof colours', line: 'Scout is checking the red ink', tone: 'blue' },
  { id: 'archive-move', title: 'Move the archive', line: 'Done yesterday', tone: 'sage' },
] satisfies { id: string; title: string; line: string; tone: CardTone }[];

export const Compact: Story = {
  render: () => <div style={{ display: 'grid', gap: 12, maxWidth: '20rem' }}>
    {threads.map((thread, index) => <Card key={thread.id} size="compact" as="a" href={`#${thread.id}`}
      aria-labelledby={thread.id} tone={thread.tone} selected={index === 0}
      header={<Heading as="h2" size="sm" id={thread.id}>{thread.title}</Heading>}>
      <Text tone="muted">{thread.line}</Text>
    </Card>)}
    <Card size="compact">A compact card is as tall as its content.</Card>
    <CardAddTile size="compact" label="Start a thread" />
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const baseHeight = 10 * parseFloat(getComputedStyle(canvasElement.ownerDocument.documentElement).fontSize);
    const cards = canvas.getAllByRole('article');
    await expect(cards).toHaveLength(4);
    for (const card of cards) await expect(card.offsetHeight).toBeLessThan(baseHeight);
    await expect(canvas.getByRole('button', { name: 'Start a thread' }).offsetHeight).toBeLessThan(baseHeight);
  },
};

export const AddTile: Story = {
  render: () => <CardGrid><CardAddTile label="Add a workspace" /><CardAddTile label="Add a factory" disabled /></CardGrid>,
};
