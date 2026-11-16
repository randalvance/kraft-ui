import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { Badge, Button, Dialog, Stack, Text } from '../src';

const meta = {
  title: 'Components/Dialog', component: Dialog,
  parameters: { controls: { include: ['title', 'description', 'dismissible'] }, docs: { description: { component: 'A controlled modal paper sheet built on native `<dialog>`. Pass open and onOpenChange, plus a title, body, and optional footer. Escape, the close button, and a backdrop click request dismissal when dismissible. The browser keeps focus inside the modal and returns it to the opener. Supply initialFocusRef for a task-specific starting point.' } } },
  args: { open: false, onOpenChange: () => {}, title: 'Keep this idea?', description: 'A note for your paper shelf', dismissible: true },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

function IdeaDialog({ initiallyOpen = false, dismissible = true, title = 'Keep this idea?', description = 'A note for your paper shelf' }: { initiallyOpen?: boolean; dismissible?: boolean; title?: string; description?: string }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <>
    <Button onClick={() => setOpen(true)}>Open dialog</Button>
    <Dialog open={open} onOpenChange={setOpen} title={title} description={description} dismissible={dismissible}
      leading={<Badge tone="attention">New</Badge>}
      footer={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="blue" onClick={() => setOpen(false)}>Keep idea</Button></>}>
      <Text>This idea will stay on your shelf, ready for another pass.</Text>
    </Dialog>
  </>;
}

export const Open: Story = { render: args => <IdeaDialog initiallyOpen title={args.title} description={args.description} dismissible={args.dismissible} />, play: async ({ canvasElement, args }) => {
  const dialog = within(canvasElement).getByRole('dialog', { name: args.title });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription(args.description);
  await expect(within(dialog).getByRole('heading', { name: args.title })).toHaveFocus();
} };

export const Dismissal: Story = { render: args => <IdeaDialog title={args.title} description={args.description} dismissible={args.dismissible} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Open dialog' });
  await userEvent.click(trigger);
  const dialog = canvas.getByRole('dialog', { name: args.title });
  await expect(dialog).toBeVisible();
  await fireEvent(dialog, new Event('cancel', { cancelable: true }));
  await waitFor(() => expect(dialog).not.toBeVisible());
  await expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close dialog' }));
  await waitFor(() => expect(dialog).not.toBeVisible());
  await userEvent.click(trigger);
  await fireEvent(dialog, new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));
  await waitFor(() => expect(dialog).not.toBeVisible());
} };

export const CustomFocus: Story = { render: function CustomFocusDialog() {
  const [open, setOpen] = useState(true);
  const actionRef = useRef<HTMLButtonElement>(null);
  return <Dialog open={open} onOpenChange={setOpen} title="Ready to continue?" initialFocusRef={actionRef}
    footer={<Button ref={actionRef} variant="blue" onClick={() => setOpen(false)}>Continue</Button>}>
    <Text>The primary action receives initial focus in this example.</Text>
  </Dialog>;
}, play: async ({ canvasElement }) => {
  const dialog = within(canvasElement).getByRole('dialog', { name: 'Ready to continue?' });
  await expect(within(dialog).getByRole('button', { name: 'Continue' })).toHaveFocus();
} };

export const RequiredAction: Story = { render: () => <IdeaDialog initiallyOpen dismissible={false} />, play: async ({ canvasElement }) => {
  const dialog = within(canvasElement).getByRole('dialog', { name: 'Keep this idea?' });
  await fireEvent(dialog, new Event('cancel', { cancelable: true }));
  await expect(dialog).toBeVisible();
  await expect(within(dialog).queryByRole('button', { name: 'Close dialog' })).toBeNull();
  await fireEvent(dialog, new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));
  await expect(dialog).toBeVisible();
} };

export const LongContent: Story = { render: function LongDialog() {
  const [open, setOpen] = useState(true);
  return <Dialog open={open} onOpenChange={setOpen} title="A longer note" style={{ '--kraft-dialog-width': '680px' } as React.CSSProperties}
    footer={<Button variant="blue" onClick={() => setOpen(false)}>Done</Button>}>
    <Stack gap={16}>{Array.from({ length: 12 }, (_, index) => <Text key={index}>Paragraph {index + 1}. Paper can carry a longer thought while the dialog keeps its header and actions visible.</Text>)}</Stack>
  </Dialog>;
} };

export const Night: Story = { ...Open, globals: { theme: 'night' } };
