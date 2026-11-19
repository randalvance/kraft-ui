import { useState, type MouseEventHandler, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StickyNote, Surface, ThemeProvider, type StickyNoteTone } from '../src';

const tones: StickyNoteTone[] = ['attention', 'blush', 'blue', 'sage', 'ochre'];

const meta = {
  title: 'Components/StickyNote',
  component: StickyNote,
  args: { header: 'Print studio', children: 'Bring a copy of the poster proof.', footer: 'Tuesday · 10 a.m.' },
  argTypes: {
    as: { control: 'select', options: ['article', 'button'] },
    tone: { control: 'select', options: tones },
    status: { control: 'select', options: ['waiting', 'done'] },
    tilt: { control: { type: 'number', step: 0.5 } },
  },
} satisfies Meta<typeof StickyNote>;
export default meta;
type Story = StoryObj<typeof meta>;

function Board({ children }: { children: ReactNode }) {
  return <Surface material="cardboard" padding={24} style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
    {children}
  </Surface>;
}

export const Default: Story = {};

export const Tones: Story = {
  render: () => <Board>
    <StickyNote tone="attention" tilt={-2} header="Print studio" footer="Tuesday">Bring the poster proof.</StickyNote>
    <StickyNote tone="blush" tilt={1} header="Cover ideas" footer="Mara">Try the smaller lettering.</StickyNote>
    <StickyNote tone="blue" tilt={-1} header="Photographs" footer="Wednesday">Pick three for the spread.</StickyNote>
    <StickyNote tone="sage" tilt={2} header="Field notes" footer="Jo">Ask the garden team about spring.</StickyNote>
    <StickyNote tone="ochre" tilt={-1.5} header="Paper order" footer="Thursday">Get two packs of cream stock.</StickyNote>
  </Board>,
  play: async ({ canvasElement }) => {
    const notes = within(canvasElement).getAllByRole('article');
    await expect(notes.map(note => note.dataset.tone)).toEqual(tones);
    await expect(notes.map(note => getComputedStyle(note).rotate)).toEqual(['-2deg', '1deg', '-1deg', '2deg', '-1.5deg']);
  },
};

export const NightTones: Story = { ...Tones, globals: { theme: 'night' } };

export const States: Story = {
  render: () => <Board>
    <StickyNote as="button" aria-label="Draft the poster" selected tone="attention" tilt={-2}>Draft the poster</StickyNote>
    <StickyNote as="button" status="waiting" tone="blush" tilt={1}>Order more paper</StickyNote>
    <StickyNote as="button" status="done" tone="sage" tilt={-1}>Book the print studio</StickyNote>
    <StickyNote as="button" disabled tone="blue" tilt={2}>Archived proof</StickyNote>
  </Board>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByRole('button', { name: 'Draft the poster', pressed: true });
    const waiting = canvas.getByRole('button', { name: 'Order more paper Waiting' });
    const done = canvas.getByRole('button', { name: 'Book the print studio Done' });
    await expect(getComputedStyle(selected).borderTopStyle).toBe('dashed');
    await expect(getComputedStyle(waiting).backgroundImage).toContain('repeating-linear-gradient');
    await expect(getComputedStyle(canvas.getByText('Book the print studio')).textDecorationLine).toBe('line-through');
    await expect(done).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Archived proof' })).toBeDisabled();
  },
};

function SelectableNote({ onClick }: { onClick?: MouseEventHandler<HTMLButtonElement> }) {
  const [selected, setSelected] = useState(false);
  return <StickyNote as="button" tone="blue" selected={selected}
    onClick={event => { setSelected(value => !value); onClick?.(event); }}>
    Review the poster
  </StickyNote>;
}

export const KeyboardAndPointer: Story = {
  args: { onClick: fn() },
  render: ({ onClick }) => <SelectableNote onClick={onClick} />,
  play: async ({ canvasElement, args }) => {
    const note = within(canvasElement).getByRole('button', { name: 'Review the poster', pressed: false });
    await userEvent.tab();
    await expect(note).toHaveFocus();
    await expect(getComputedStyle(note).outlineStyle).toBe('solid');
    await userEvent.keyboard('{Enter}');
    await expect(note).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard(' ');
    await expect(note).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(note);
    await expect(note).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const DecorationOff: Story = {
  render: (_, { globals }) => <ThemeProvider theme={globals.theme} texture={false} motion={false} tilt={false}>
    <Board>
      <StickyNote as="button" tone="ochre" tilt={3} status="waiting">Check the samples</StickyNote>
      <ThemeProvider theme={globals.theme}>
        <StickyNote as="button" tone="blue" tilt={2}>Check the proofs</StickyNote>
      </ThemeProvider>
    </Board>
  </ThemeProvider>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const flat = getComputedStyle(canvas.getByRole('button', { name: 'Check the samples Waiting' }));
    const tilted = getComputedStyle(canvas.getByRole('button', { name: 'Check the proofs' }));
    await expect(flat.rotate).toBe('0deg');
    await expect(flat.transitionDuration).toBe('0s');
    await expect(flat.backgroundImage).not.toContain('url(');
    await expect(flat.backgroundImage).toContain('repeating-linear-gradient');
    await expect(tilted.rotate).toBe('2deg');
    await expect(tilted.backgroundImage).toContain('url(');
  },
};
