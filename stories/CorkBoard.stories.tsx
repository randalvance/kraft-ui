import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  CorkBoard, CorkBoardColumn, CorkBoardItem, Pin, StickyNote, ThemeProvider,
  type CorkBoardPosition, type PinTone, type StickyNoteTone,
} from '../src';

type Note = { id: string; text: string; tone: StickyNoteTone; pin: PinTone; tilt: number };

const notes: Note[] = [
  { id: 'paper', text: 'Order cream paper', tone: 'attention', pin: 'red', tilt: -2 },
  { id: 'proof', text: 'Review the poster proof', tone: 'blush', pin: 'blue', tilt: 1 },
  { id: 'photos', text: 'Pick three photographs', tone: 'blue', pin: 'amber', tilt: -1 },
  { id: 'studio', text: 'Book the print studio', tone: 'sage', pin: 'green', tilt: 2 },
  { id: 'cover', text: 'Try smaller cover lettering', tone: 'ochre', pin: 'red', tilt: -1.5 },
  { id: 'garden', text: 'Ask the garden team about spring', tone: 'attention', pin: 'blue', tilt: 1.5 },
];

const meta = {
  title: 'Components/CorkBoard',
  component: CorkBoard,
  argTypes: {
    as: { control: 'select', options: ['div', 'section'] },
    layout: { control: 'select', options: ['grid', 'free', 'columns'] },
  },
  args: { as: 'section', 'aria-label': 'Poster plan' },
} satisfies Meta<typeof CorkBoard>;
export default meta;
type Story = StoryObj<typeof meta>;

function pinned(note: Note) {
  return <CorkBoardItem key={note.id} pin={<Pin tone={note.pin} />}>
    <StickyNote tone={note.tone} tilt={note.tilt}>{note.text}</StickyNote>
  </CorkBoardItem>;
}

export const Grid: Story = {
  args: { children: notes.map(pinned) },
  play: async ({ canvasElement }) => {
    const board = within(canvasElement).getByRole('region', { name: 'Poster plan' });
    const body = board.querySelector<HTMLElement>('.kraft-cork-board-body')!;
    const cork = getComputedStyle(body);
    await expect(board).toHaveAttribute('data-layout', 'grid');
    await expect(cork.display).toBe('grid');
    await expect(cork.backgroundImage).toContain('radial-gradient');
    await expect(cork.backgroundImage).toContain('url(');
    await expect(getComputedStyle(board).backgroundImage).toContain('repeating-linear-gradient');
    await expect(within(body).getAllByRole('article')).toHaveLength(notes.length);
    await expect(body.querySelectorAll('.kraft-pin[aria-hidden="true"]')).toHaveLength(notes.length);
  },
};

export const NightGrid: Story = { ...Grid, globals: { theme: 'night' } };

export const Scrolling: Story = {
  args: { maxHeight: 220, scrollLabel: 'Poster plan notes', children: notes.map(pinned) },
  play: async ({ canvasElement }) => {
    const body = await within(canvasElement).findByRole('region', { name: 'Poster plan notes' });
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await userEvent.tab();
    await expect(body).toHaveFocus();
    await expect(getComputedStyle(body).outlineStyle).toBe('solid');
    await expect(getComputedStyle(body).backgroundAttachment).toContain('local');
  },
};

const start: Record<string, CorkBoardPosition & { z: number }> = {
  paper: { x: 24, y: 32, z: 1 },
  proof: { x: 96, y: 96, z: 2 },
  photos: { x: 40, y: 208, z: 3 },
};

function FreeBoard(props: Story['args']) {
  const [places, setPlaces] = useState(start);
  return <CorkBoard {...props} layout="free" height={400}>
    {notes.slice(0, 3).map(note => <CorkBoardItem key={note.id} label={note.text} pin={<Pin tone={note.pin} />}
      {...places[note.id]}
      onMove={position => setPlaces(current => ({ ...current, [note.id]: { ...current[note.id], ...position } }))}>
      <StickyNote tone={note.tone} tilt={note.tilt}>{note.text}</StickyNote>
    </CorkBoardItem>)}
  </CorkBoard>;
}

export const FreePosition: Story = {
  args: { scrollLabel: 'Poster plan notes' },
  render: args => <FreeBoard {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByRole('group', { name: 'Order cream paper' });
    const proof = canvas.getByRole('group', { name: 'Review the poster proof' });
    await expect(getComputedStyle(paper).position).toBe('absolute');
    await expect(getComputedStyle(paper).left).toBe('24px');
    await expect(getComputedStyle(paper).top).toBe('32px');
    await expect(getComputedStyle(paper).zIndex).toBe('1');
    await expect(getComputedStyle(proof).zIndex).toBe('2');

    for (let stops = 0; stops < 3 && document.activeElement !== paper; stops++) await userEvent.tab();
    await expect(paper).toHaveFocus();
    await expect(getComputedStyle(paper).outlineStyle).toBe('solid');
    await expect(Number(getComputedStyle(paper).zIndex)).toBeGreaterThan(3);

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(getComputedStyle(paper).left).toBe('32px'));
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await waitFor(() => expect(getComputedStyle(paper).top).toBe('72px'));
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    await waitFor(() => expect(getComputedStyle(paper).left).toBe('0px'));
    await expect(paper).toHaveFocus();

    await userEvent.tab();
    await expect(proof).toHaveFocus();
    await expect(getComputedStyle(paper).zIndex).toBe('1');
  },
};

export const NightFreePosition: Story = { ...FreePosition, globals: { theme: 'night' } };

const lanes = [
  { name: 'To do', notes: notes.slice(0, 3) },
  { name: 'In progress', notes: notes.slice(3, 5) },
  { name: 'Done', notes: notes.slice(5) },
];

export const Columns: Story = {
  args: {
    layout: 'columns',
    maxHeight: 420,
    scrollLabel: 'Poster plan columns',
    children: lanes.map((lane, index) => <CorkBoardColumn key={lane.name} name={lane.name} count={lane.notes.length}
      countLabel={`${lane.notes.length} ${lane.notes.length === 1 ? 'note' : 'notes'}`}
      pinTone={(['red', 'amber', 'green'] as const)[index]}>
      {lane.notes.map(note => <StickyNote key={note.id} tone={note.tone} tilt={note.tilt}
        status={lane.name === 'Done' ? 'done' : undefined}>{note.text}</StickyNote>)}
    </CorkBoardColumn>),
  },
  play: async ({ canvasElement }) => {
    const board = within(canvasElement).getByRole('region', { name: 'Poster plan' });
    const todo = within(board).getByRole('region', { name: 'To do' });
    await expect(within(board).getByRole('region', { name: 'In progress' })).toBeVisible();
    await expect(within(board).getByRole('region', { name: 'Done' })).toBeVisible();
    await expect(within(todo).getByRole('heading', { level: 3, name: 'To do' })).toBeVisible();
    await expect(within(todo).getByText('3 notes')).toBeInTheDocument();
    await expect(within(todo).getAllByRole('article')).toHaveLength(3);
    const header = getComputedStyle(todo.querySelector('.kraft-cork-board-column-header')!);
    await expect(header.position).toBe('sticky');
    await expect(header.rotate).toBe('-1deg');
    await expect(todo.querySelector('.kraft-cork-board-column-header .kraft-pin')).toHaveAttribute('data-tone', 'red');
  },
};

export const NightColumns: Story = { ...Columns, globals: { theme: 'night' } };

function UnpinBoard(props: Story['args']) {
  const [kept, setKept] = useState(notes.slice(0, 3));
  return <CorkBoard {...props}>
    {kept.map(note => <CorkBoardItem key={note.id}
      pin={<Pin as="button" tone={note.pin} label={`Unpin ${note.text}`}
        onClick={() => setKept(current => current.filter(other => other.id !== note.id))} />}>
      <StickyNote tone={note.tone} tilt={note.tilt}>{note.text}</StickyNote>
    </CorkBoardItem>)}
  </CorkBoard>;
}

export const PullToUnpin: Story = {
  render: args => <UnpinBoard {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('article')).toHaveLength(3);
    await userEvent.tab();
    const first = canvas.getByRole('button', { name: 'Unpin Order cream paper' });
    await expect(first).toHaveFocus();
    await expect(getComputedStyle(first).outlineStyle).toBe('solid');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByText('Order cream paper')).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Unpin Pick three photographs' }));
    await waitFor(() => expect(canvas.getAllByRole('article')).toHaveLength(1));
    await expect(canvas.getByText('Review the poster proof')).toBeVisible();
  },
};

export const DecorationOff: Story = {
  render: (args, { globals }) => <ThemeProvider theme={globals.theme} texture={false} motion={false} tilt={false}>
    <CorkBoard {...args} layout="columns">
      <CorkBoardColumn name="To do" count={1}>
        <CorkBoardItem pin={<Pin as="button" label="Unpin Order cream paper" />}>
          <StickyNote tilt={3}>Order cream paper</StickyNote>
        </CorkBoardItem>
      </CorkBoardColumn>
    </CorkBoard>
  </ThemeProvider>,
  play: async ({ canvasElement }) => {
    const board = within(canvasElement).getByRole('region', { name: 'Poster plan' });
    const frame = getComputedStyle(board);
    const cork = getComputedStyle(board.querySelector('.kraft-cork-board-body')!);
    await expect(cork.backgroundImage).not.toContain('url(');
    await expect(cork.backgroundImage).not.toContain('radial-gradient');
    await expect(cork.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(frame.backgroundImage).not.toContain('repeating-linear-gradient');
    await expect(getComputedStyle(board.querySelector('.kraft-cork-board-column-header')!).rotate).toBe('0deg');
    const head = within(board).getByRole('button', { name: 'Unpin Order cream paper' }).firstElementChild!;
    await expect(getComputedStyle(head).transitionDuration).toBe('0s, 0s');
  },
};
