import { useState, type CSSProperties, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Composer, FormField, Gauge, Icon, IconButton, Kbd, Select, Stack, Stamp, Surface, Tag, Text, type ComposerProps } from '../src';

const models = [
  { value: 'sonnet', label: 'Sonnet', description: 'Everyday work' },
  { value: 'opus', label: 'Opus', description: 'The hard ones' },
  { value: 'haiku', label: 'Haiku', description: 'Quick answers' },
];
const mic = <IconButton size="sm" aria-label="Dictate"><Icon name="microphone" /></IconButton>;
const send = <IconButton aria-label="Send message"><Icon name="send" /></IconButton>;
const lineHeight = 28;
// Accessible-name rules may or may not put spaces around the plus sign of a chord.
const enterHints = /^Enter send Shift ?\+ ?Enter new line$/;

const meta = {
  title: 'Components/Composer', component: Composer,
  parameters: { docs: { description: { component: 'The prompt box: a red cardboard frame around ruled paper that grows with the text. Enter sends and Shift+Enter adds a line; `sendKey="mod-enter"` sends on Ctrl+Enter or ⌘+Enter instead, and the key hints follow. The send key calls `onSend` and submits an enclosing form, as a single-line input would. `bar` holds the application\'s own controls, and `mic` and `send` hold its actions, drawn as discs. `busy` holds the send key and shows a pinwheel. The ref and native textarea props reach the textarea, which needs a name from `aria-label`, a label, or a `FormField`; `className` and `style` size the frame.' } } },
  argTypes: {
    sendKey: { control: 'inline-radio', options: ['enter', 'mod-enter'] },
    bar: { control: false }, mic: { control: false }, send: { control: false }, hints: { control: false },
  },
  args: { 'aria-label': 'Message the agent', placeholder: 'Write to the agent…', sendKey: 'enter', busy: false, disabled: false, mic, send, onSend: fn() },
  decorators: [Story => <div style={{ maxInlineSize: 720 }}><Story /></div>],
} satisfies Meta<typeof Composer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const box = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message the agent' });
  await expect(box).toHaveAccessibleDescription(enterHints);
  await expect(getComputedStyle(box, '::placeholder').fontFamily).toContain('Caveat');
  const rest = box.offsetHeight;
  await userEvent.type(box, 'Check the page numbers{Shift>}{Enter}{/Shift}and the margins');
  await expect(box.offsetHeight).toBe(rest);
  await userEvent.type(box, '{Shift>}{Enter}{/Shift}then the cover');
  await expect(box).toHaveValue('Check the page numbers\nand the margins\nthen the cover');
  // The paper grows by one ruled line and the frame shows the focus.
  await waitFor(() => expect(box.offsetHeight).toBe(rest + lineHeight));
  await expect(getComputedStyle(box.closest('.kraft-composer')!).outlineStyle).toBe('solid');
  await userEvent.keyboard('{Enter}');
  await expect(args.onSend).toHaveBeenCalledOnce();
  await expect(args.onSend).toHaveBeenLastCalledWith('Check the page numbers\nand the margins\nthen the cover');
  await expect(box).toHaveValue('Check the page numbers\nand the margins\nthen the cover');
  await userEvent.clear(box);
  await waitFor(() => expect(box.offsetHeight).toBe(rest));
  // Nothing is sent from blank paper, and the send key adds no line to it.
  await userEvent.keyboard('{Enter}');
  await expect(box).toHaveValue('');
  await expect(args.onSend).toHaveBeenCalledOnce();
} };

function Session({ busy = false, ...props }: ComposerProps) {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const [yolo, setYolo] = useState(false);
  const [listening, setListening] = useState(false);
  const post = () => {
    if (!draft.trim()) return;
    setSent([...sent, draft]);
    setDraft('');
  };
  return <Stack gap={16}>
    <Stack as="ol" aria-label="Sent" gap={4} style={{ margin: 0, paddingInlineStart: 20 }}>
      {sent.map((message, index) => <Text as="li" key={index}>{message}</Text>)}
    </Stack>
    <Composer aria-label="Message the agent" placeholder="Write to the agent…" {...props} busy={busy}
      value={draft} onChange={event => setDraft(event.currentTarget.value)} onSend={post}
      bar={<>
        <Select label="Model" hideLabel variant="compact" defaultValue="sonnet" options={models} />
        <Gauge label="Context left" value={64} size="sm" style={{ '--kraft-gauge-size': '56px' } as CSSProperties} />
        <Stamp as="button" size="sm" tone="danger" pressed={yolo} onClick={() => setYolo(!yolo)}>Yolo</Stamp>
        <Tag variant="paper" leading={<Icon name="folder" />}>lighthouse</Tag>
        <Tag leading={<Icon name="branch" />}>fix/flaky-login</Tag>
      </>}
      mic={<IconButton size="sm" aria-label="Dictate" aria-pressed={listening} onClick={() => setListening(!listening)}><Icon name="microphone" /></IconButton>}
      send={busy
        ? <IconButton variant="danger" aria-label="Stop the agent"><Icon name="stop" /></IconButton>
        : <IconButton variant={draft.trim() ? 'blue' : 'neutral'} aria-label="Send message" onClick={post}><Icon name="send" /></IconButton>} />
  </Stack>;
}

/** The bar holds the application's controls: a model picker, a gauge, a stamp, and folder and branch tags. */
export const SessionBar: Story = {
  args: { onSend: undefined },
  render: args => <Session sendKey={args.sendKey} busy={args.busy} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('textbox', { name: 'Message the agent' });
    const foot = canvasElement.querySelector('.kraft-composer-foot')!;
    await expect(within(foot.querySelector<HTMLElement>('.kraft-composer-bar')!).getByRole('meter', { name: 'Context left' })).toBeVisible();
    // The textarea comes first, then the bar, then the mic and send discs.
    await userEvent.click(box);
    await userEvent.tab();
    await expect(canvas.getByRole('combobox', { name: 'Model' })).toHaveFocus();
    await userEvent.tab();
    const yolo = canvas.getByRole('button', { name: 'Yolo' });
    await expect(yolo).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(yolo).toHaveAttribute('aria-pressed', 'true');
    await userEvent.tab();
    const dictate = canvas.getByRole('button', { name: 'Dictate' });
    await expect(dictate).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(dictate).toHaveAttribute('aria-pressed', 'true');
    await userEvent.tab();
    const sendDisc = canvas.getByRole('button', { name: 'Send message' });
    await expect(sendDisc).toHaveFocus();
    // Layout sizes, because the frame may still be rising under the discs.
    for (const disc of [dictate, sendDisc]) {
      await expect(disc.offsetWidth).toBe(disc.offsetHeight);
      await expect(getComputedStyle(disc).borderTopLeftRadius).toBe('50%');
      await expect(disc.offsetWidth).toBeGreaterThanOrEqual(24);
    }
    // Pressing the frame or a hint writes in the box; the bar keeps its own presses.
    await userEvent.click(canvas.getByText('new line'));
    await expect(box).toHaveFocus();
    await userEvent.type(box, 'Trim the covers{Enter}');
    await expect(box).toHaveValue('');
    await userEvent.type(box, 'Bind the proofs');
    await userEvent.click(sendDisc);
    await expect(within(canvas.getByRole('list', { name: 'Sent' })).getAllByRole('listitem').map(item => item.textContent))
      .toEqual(['Trim the covers', 'Bind the proofs']);
  },
};

/** `sendKey="mod-enter"` leaves Enter to add a line, for long prompts. The hints follow the setting. */
export const ModEnter: Story = {
  args: { sendKey: 'mod-enter', placeholder: 'Describe the job, or paste a ticket…', rows: 3 },
  play: async ({ canvasElement, args }) => {
    const box = within(canvasElement).getByRole('textbox', { name: 'Message the agent' });
    await expect(box).toHaveAccessibleDescription(/^Ctrl ?\+ ?Enter send Enter new line$/);
    await userEvent.type(box, 'Fix the flaky test{Enter}and tell me why it failed');
    await expect(box).toHaveValue('Fix the flaky test\nand tell me why it failed');
    await expect(args.onSend).not.toHaveBeenCalled();
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    await expect(args.onSend).toHaveBeenCalledOnce();
    await expect(args.onSend).toHaveBeenLastCalledWith('Fix the flaky test\nand tell me why it failed');
    await expect(box).toHaveValue('Fix the flaky test\nand tell me why it failed');
  },
};

/** In a form the send key presses the form's submit button, so validation and `onSubmit` run as they do for an input. */
export const InForm: Story = {
  args: { onSend: undefined },
  render: function NewSession() {
    const [note, setNote] = useState('Nothing sent yet.');
    return <Stack as="form" aria-label="New session" gap={16} onSubmit={(event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setNote(`Sent “${new FormData(event.currentTarget).get('job')}”.`);
      event.currentTarget.reset();
    }}>
      <FormField label="Describe the job" description="Or paste a ticket">
        <Composer name="job" required rows={3} placeholder="What needs doing?"
          send={<IconButton type="submit" variant="blue" aria-label="Start the session"><Icon name="send" /></IconButton>} />
      </FormField>
      <Text role="status" data-testid="note">{note}</Text>
    </Stack>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Describe the job' });
    await expect(box).toHaveAccessibleDescription(new RegExp(`^Or paste a ticket ${enterHints.source.slice(1)}`));
    await expect(box).toBeRequired();
    const rest = box.offsetHeight;
    await userEvent.type(box, 'one{Shift>}{Enter}{/Shift}two{Shift>}{Enter}{/Shift}three{Shift>}{Enter}{/Shift}four');
    await waitFor(() => expect(box.offsetHeight).toBe(rest + lineHeight));
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('note')).toHaveTextContent('Sent “one two three four”.');
    // The form reset empties the paper and it shrinks back.
    await expect(box).toHaveValue('');
    await waitFor(() => expect(box.offsetHeight).toBe(rest));
    // The simulated keyboard keeps its own copy of the value, which a form reset does not reach.
    await userEvent.clear(box);
    await userEvent.type(box, 'Print the labels');
    await userEvent.click(canvas.getByRole('button', { name: 'Start the session' }));
    await expect(canvas.getByTestId('note')).toHaveTextContent('Sent “Print the labels”.');
  },
};

/** Disabled, busy, busy with the application's own hint, and invalid. A disabled composer's actions are disabled by the application. */
export const States: Story = {
  args: { onSend: undefined },
  render: () => <Stack gap={24}>
    <Composer aria-label="Archived session" disabled defaultValue="This session was archived on Tuesday."
      bar={<Button size="sm" variant="ghost" disabled>Sonnet</Button>}
      mic={<IconButton size="sm" aria-label="Dictate" disabled><Icon name="microphone" /></IconButton>}
      send={<IconButton aria-label="Send message" disabled><Icon name="send" /></IconButton>} />
    <Composer aria-label="Working session" busy defaultValue="And check the margins too."
      send={<IconButton variant="danger" aria-label="Stop the agent"><Icon name="stop" /></IconButton>} />
    <Composer aria-label="Steered session" busy busyLabel="The agent is working" placeholder="Write what to do instead…"
      hints={<span><Kbd size="sm">Esc</Kbd> stop</span>}
      send={<IconButton variant="danger" aria-label="Stop the agent"><Icon name="stop" /></IconButton>} />
    <FormField label="Reply" error="Write a reply before sending"><Composer placeholder="Or write your answer…" send={send} /></FormField>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const archived = canvas.getByRole('textbox', { name: 'Archived session' });
    await expect(archived).toBeDisabled();
    await userEvent.click(archived.closest('.kraft-composer')!);
    await expect(archived).not.toHaveFocus();

    const working = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Working session' });
    await expect(working).toHaveAttribute('aria-busy', 'true');
    await expect(working).not.toHaveAccessibleDescription();
    // Every composer keeps a status region; only a busy one has anything in it.
    await expect(canvas.getAllByRole('status').map(status => status.textContent)).toEqual(['', 'Working…', 'The agent is working', '']);
    // The text can still be edited while the agent works, but the send key is held.
    await userEvent.type(working, ' Twice.{Enter}');
    await expect(working).toHaveValue('And check the margins too. Twice.');
    await expect(canvas.getByRole('textbox', { name: 'Steered session' })).toHaveAccessibleDescription('Esc stop');

    const reply = canvas.getByRole('textbox', { name: 'Reply' });
    await expect(reply).toHaveAttribute('aria-invalid', 'true');
    await expect(reply).toHaveAccessibleDescription(new RegExp(`^Write a reply before sending ${enterHints.source.slice(1)}`));
    await expect(getComputedStyle(reply.closest('.kraft-composer-card')!).borderBottomStyle).toBe('dashed');
  },
};

const longDraft = Array.from({ length: 12 }, (_, index) => `Step ${index + 1}: check the proof.`).join('\n');

/** The paper grows from `rows` to `maxRows` lines and then scrolls, with its rules moving with the text. */
export const Growth: Story = {
  args: { onSend: undefined },
  render: () => <Stack gap={24}>
    <Composer aria-label="Seven lines" defaultValue={longDraft} send={send} />
    <Composer aria-label="Four lines" rows={1} maxRows={4} defaultValue={longDraft} send={send} />
    <Composer aria-label="One line" rows={1} placeholder="Ask on the side…" hints={null} />
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inset = 12;
    const seven = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Seven lines' });
    await waitFor(() => expect(seven.offsetHeight).toBe(7 * lineHeight + inset));
    await expect(seven.scrollHeight).toBe(12 * lineHeight + inset);
    const four = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Four lines' });
    await expect(four.offsetHeight).toBe(4 * lineHeight + inset);
    const one = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'One line' });
    await expect(one.offsetHeight).toBe(lineHeight + inset);
    await expect(one).not.toHaveAccessibleDescription();
    await userEvent.type(one, 'a{Shift>}{Enter}{/Shift}b');
    await waitFor(() => expect(one.offsetHeight).toBe(2 * lineHeight + inset));
  },
};

/** The card is its own paper, so the frame can sit on the desk, paper, kraft, or cardboard. */
export const OnMaterials: Story = {
  args: { onSend: undefined },
  render: () => <Stack gap={24}>
    {(['paper', 'kraft', 'cardboard'] as const).map(material => <Surface key={material} material={material} padding={16}>
      <Composer aria-label={`Message on ${material}`} placeholder="Write to the agent…"
        bar={<><Text tone="muted" variant="label-sm">lighthouse</Text><Button size="sm" variant="text">Change</Button></>} mic={mic} send={send} />
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    const inks = [...canvasElement.querySelectorAll('.kraft-composer-bar .kraft-text')].map(note => getComputedStyle(note).color);
    await expect(new Set(inks).size).toBe(1);
  },
};

/** In a narrow column the hints and actions drop below the bar, and nothing spills out of the frame. */
export const Narrow: Story = {
  args: { onSend: undefined },
  render: () => <div style={{ inlineSize: 272 }}><Session /></div>,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('.kraft-composer-card')!;
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    const frame = canvasElement.querySelector('.kraft-composer')!.getBoundingClientRect();
    for (const piece of card.querySelectorAll('.kraft-composer-foot *')) {
      const box = piece.getBoundingClientRect();
      await expect(box.right).toBeLessThanOrEqual(frame.right);
      await expect(box.left).toBeGreaterThanOrEqual(frame.left);
    }
  },
};

export const RightToLeft: Story = {
  args: { onSend: undefined },
  render: () => <div dir="rtl" lang="ar"><Composer aria-label="اكتب رسالة" placeholder="اكتب إلى الوكيل…"
    hints={<span><Kbd size="sm">Enter</Kbd> إرسال</span>}
    bar={<Tag variant="paper" leading={<Icon name="folder" />}>المنارة</Tag>} mic={mic} send={send} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('textbox').getBoundingClientRect();
    const sendDisc = canvas.getByRole('button', { name: 'Send message' }).getBoundingClientRect();
    const bar = canvasElement.querySelector('.kraft-composer-bar')!.getBoundingClientRect();
    await expect(sendDisc.left).toBeLessThan(box.left + 40);
    await expect(bar.right).toBeGreaterThan(sendDisc.right);
  },
};

export const Night: Story = { ...SessionBar, globals: { theme: 'night' } };
/** Texture, motion, and tilt off: the frame and card are flat colour, the frame rises at once, and the stamp sits straight. */
export const Quiet: Story = { ...SessionBar, globals: { texture: 'off', motion: 'off', tilt: 'off' } };
export const QuietNight: Story = { ...States, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };
