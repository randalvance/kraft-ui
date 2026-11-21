import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { Badge, Button, Dialog, Icon, IconButton, Stack, Stamp, Text, type DialogProps } from '../src';

const meta = {
  title: 'Components/Dialog', component: Dialog,
  parameters: { controls: { include: ['title', 'description', 'dismissible', 'size'] }, docs: { description: { component: 'A controlled modal paper sheet built on native `<dialog>`. Use eyebrow for a stamp above the title and actions for controls beside close. Title and description can contain rich content. The sm, md, and lg widths share a stable top edge. Escape, close, and a backdrop click request dismissal when dismissible. Supply initialFocusRef for a task-specific starting point.' } } },
  args: { open: false, onOpenChange: () => {}, title: 'Keep this idea?', description: 'A note for your paper shelf', dismissible: true },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

function IdeaDialog({ initiallyOpen = false, dismissible = true, title = 'Keep this idea?', description = 'A note for your paper shelf', size }: Partial<Pick<DialogProps, 'dismissible' | 'title' | 'description' | 'size'>> & { initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <>
    <Button onClick={() => setOpen(true)}>Open dialog</Button>
    <Dialog open={open} onOpenChange={setOpen} title={title} description={description} dismissible={dismissible} size={size}
      leading={<Badge tone="attention">New</Badge>}
      footer={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="blue" onClick={() => setOpen(false)}>Keep idea</Button></>}>
      <Text>This idea will stay on your shelf, ready for another pass.</Text>
    </Dialog>
  </>;
}

export const Open: Story = { render: args => <IdeaDialog {...args} initiallyOpen />, play: async ({ canvasElement, args }) => {
  const dialog = within(canvasElement).getByRole('dialog', { name: String(args.title) });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription(String(args.description));
  await expect(within(dialog).getByRole('heading', { name: String(args.title) })).toHaveFocus();
} };

export const Dismissal: Story = { render: args => <IdeaDialog {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Open dialog' });
  await userEvent.click(trigger);
  const dialog = canvas.getByRole('dialog', { name: String(args.title) });
  await expect(dialog).toBeVisible();
  await fireEvent(dialog, new Event('cancel', { cancelable: true }));
  await waitFor(() => expect(dialog).not.toBeVisible());
  await expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await waitFor(() => expect(dialog).toBeVisible());
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close dialog' }));
  await waitFor(() => expect(dialog).not.toBeVisible());
  await userEvent.click(trigger);
  await waitFor(() => expect(dialog).toBeVisible());
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
  return <Dialog open={open} onOpenChange={setOpen} title="A longer note" size="lg"
    footer={<Button variant="blue" onClick={() => setOpen(false)}>Done</Button>}>
    <Stack gap={16}>{Array.from({ length: 24 }, (_, index) => <Text key={index}>Paragraph {index + 1}. Paper can carry a longer thought while the dialog keeps its header and actions visible.</Text>)}</Stack>
  </Dialog>;
}, play: async ({ canvasElement }) => {
  const dialog = within(canvasElement).getByRole('dialog', { name: 'A longer note' });
  const content = within(dialog);
  const body = await content.findByRole('region', { name: 'A longer note' });
  const heading = content.getByRole('heading');
  const footer = content.getByRole('button', { name: 'Done' });
  const headingTop = heading.getBoundingClientRect().top;
  const footerTop = footer.getBoundingClientRect().top;
  await expect(dialog.getBoundingClientRect().width).toBe(720);
  await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  await userEvent.tab();
  await userEvent.tab();
  await expect(body).toHaveFocus();
  body.scrollTop = body.scrollHeight;
  await expect(heading.getBoundingClientRect().top).toBe(headingTop);
  await expect(footer.getBoundingClientRect().top).toBe(footerTop);
} };

export const Small: Story = { ...Open, args: { size: 'sm' }, play: async context => {
  await Open.play?.(context);
  await expect(within(context.canvasElement).getByRole('dialog').getBoundingClientRect().width).toBe(400);
} };

export const ChangingContent: Story = { render: function ChangingContentDialog() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen} title={<>Review the <em>print proof</em></>}
    eyebrow={<Stamp size="sm" tone="blue">Draft</Stamp>}
    description={<p>Review the <strong>trim and margins</strong> before sending the proof to print. The notes below record what changed since the previous version and what still needs a decision.</p>}
    actions={<IconButton variant="bare" aria-label="Proof details" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><Icon name="chevron-down" /></IconButton>}>
    {expanded && <Stack gap={12}>
      <Text>Keep the new crop on the cover illustration.</Text>
      <Text>Move the credit line inside the trim marks.</Text>
      <Text>Confirm the paper weight with the printer.</Text>
    </Stack>}
  </Dialog>;
}, play: async ({ canvasElement }) => {
  const dialog = within(canvasElement).getByRole('dialog', { name: 'Review the print proof' });
  const content = within(dialog);
  const title = content.getByRole('heading');
  await expect(content.getByText('Draft').getBoundingClientRect().bottom).toBeLessThanOrEqual(title.getBoundingClientRect().top);
  await expect(dialog).toHaveAccessibleDescription(/Review the trim and margins/);
  const action = content.getByRole('button', { name: 'Proof details' });
  await userEvent.tab();
  await expect(action).toHaveFocus();
  await expect(getComputedStyle(action).outlineStyle).toBe('solid');
  const before = dialog.getBoundingClientRect();
  await userEvent.keyboard('{Enter}');
  await expect(action).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getBoundingClientRect().height).toBeGreaterThan(before.height);
  await expect(dialog.getBoundingClientRect().top).toBe(before.top);
  await userEvent.keyboard('{Enter}');
  await expect(dialog.getBoundingClientRect().height).toBe(before.height);
  await userEvent.tab();
  await expect(content.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
} };

export const Night: Story = { ...Open, globals: { theme: 'night' } };
export const PlainPaper: Story = { ...ChangingContent, globals: { theme: 'paper', texture: 'off', motion: 'off', tilt: 'off' } };
