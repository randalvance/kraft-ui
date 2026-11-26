import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Icon, Stack, Surface, Text, Toast, ToastRegion, type ToastDismissReason, type ToastPlacement } from '../src';

const meta = {
  title: 'Components/Toast', component: Toast,
  parameters: { docs: { description: { component: 'A brief kraft slip confirming an action. `onUndo` adds an Undo button and `onDismiss` adds a close button; the application removes the toast when `onDismiss` reports `"undo"`, `"close"`, or `"timeout"`. `duration` starts a countdown that restarts after the pointer or keyboard focus leaves, and Escape dismisses a focused toast. Each toast is a polite live status. Render toasts inside a mounted `ToastRegion`, a named landmark fixed to an edge of the viewport. When a toast is dismissed from inside, focus returns to whatever had it when the toast appeared.' } } },
  argTypes: { leading: { control: false }, duration: { control: 'number' } },
  args: { children: 'Card archived', onUndo: fn(), onDismiss: fn() },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toast = canvas.getByRole('status');
    await expect(toast).toHaveTextContent('Card archived');
    await expect(toast).toHaveAttribute('aria-atomic', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(args.onUndo).toHaveBeenCalledOnce();
    await expect(args.onDismiss).toHaveBeenLastCalledWith('undo');
    canvas.getByRole('button', { name: 'Dismiss' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect(args.onDismiss).toHaveBeenLastCalledWith('close');
  },
};

/** Message only, with an icon, with Undo, with close, and a long message that wraps. */
export const Variants: Story = {
  args: { onUndo: undefined, onDismiss: undefined },
  render: () => <Stack gap={12} align="start">
    <Toast>Saved</Toast>
    <Toast leading={<Icon name="check" />}>Link copied</Toast>
    <Toast onUndo={() => {}}>Card archived</Toast>
    <Toast onDismiss={() => {}} dismissLabel="Dismiss sync notice">Sync finished</Toast>
    <Toast onUndo={() => {}} undoLabel="Restore" onDismiss={() => {}} style={{ maxInlineSize: 280 }}>
      Twelve cards moved to the archive of the Print Studio workspace
    </Toast>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('status')).toHaveLength(5);
    // The slip fades in while motion is on.
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Restore' })).toBeVisible());
    for (const button of canvas.getAllByRole('button')) {
      const { width, height } = button.getBoundingClientRect();
      await expect(Math.min(width, height)).toBeGreaterThanOrEqual(24);
    }
    const long = canvas.getAllByRole('status')[4];
    await expect(long.getBoundingClientRect().width).toBeLessThanOrEqual(280);
  },
};

type Note = { id: number; name: string };

function ArchiveDemo({ placement = 'bottom', duration, onLeave }: { placement?: ToastPlacement; duration?: number; onLeave?: (reason: ToastDismissReason) => void }) {
  const [cards, setCards] = useState(['Cover proof', 'Spine copy', 'Back flap']);
  const [notes, setNotes] = useState<Note[]>([]);
  const nextId = useRef(0);
  const archive = (name: string) => {
    setCards(current => current.filter(card => card !== name));
    setNotes(current => [...current, { id: nextId.current++, name }]);
  };
  return <Surface>
    <Stack gap={8} align="start">
      <Text variant="label">Cards</Text>
      {cards.map(card => <Button key={card} variant="ghost" onClick={() => archive(card)}>Archive {card}</Button>)}
      {cards.length === 0 && <Text tone="muted">Everything is archived.</Text>}
    </Stack>
    <ToastRegion placement={placement}>
      {notes.map(note => <Toast key={note.id} duration={duration}
        onUndo={() => setCards(current => [...current, note.name])}
        onDismiss={reason => { onLeave?.(reason); setNotes(current => current.filter(other => other.id !== note.id)); }}>
        {note.name} archived
      </Toast>)}
    </ToastRegion>
  </Surface>;
}

/** Archive a card, then undo it from the toast. Focus returns to the page when the toast leaves. */
export const UndoInRegion: Story = {
  args: { onUndo: undefined, onDismiss: undefined },
  render: () => <ArchiveDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Notifications' });
    await expect(getComputedStyle(region).position).toBe('fixed');
    await userEvent.click(canvas.getByRole('button', { name: 'Archive Spine copy' }));
    const toast = await canvas.findByRole('status');
    await expect(region).toContainElement(toast);
    await expect(toast).toHaveTextContent('Spine copy archived');
    await expect(canvas.queryByRole('button', { name: 'Archive Spine copy' })).toBeNull();
    await userEvent.click(within(toast).getByRole('button', { name: 'Undo' }));
    await expect(canvas.queryByRole('status')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Archive Spine copy' })).toBeVisible();
  },
};

/** A timed toast leaves by itself, but waits while it has the pointer or keyboard focus. */
export const Timed: Story = {
  args: { onUndo: undefined, onDismiss: undefined },
  render: () => <ArchiveDemo placement="top-end" duration={600} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Archive Cover proof' }));
    const toast = await canvas.findByRole('status');
    within(toast).getByRole('button', { name: 'Undo' }).focus();
    await new Promise(resolve => setTimeout(resolve, 900));
    await expect(toast).toBeVisible();
    canvas.getByRole('button', { name: 'Archive Back flap' }).focus();
    await waitFor(() => expect(canvas.queryByRole('status')).toBeNull(), { timeout: 3000 });
  },
};
