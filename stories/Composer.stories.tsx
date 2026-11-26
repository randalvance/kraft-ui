import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Composer, FormField, Gauge, Icon, IconButton, Inline, Kbd, Select, Stack, Stamp, Surface, Text } from '../src';

const models = [{ value: 'fable', label: 'Fable' }, { value: 'sonnet', label: 'Sonnet' }, { value: 'haiku', label: 'Haiku' }];
const mic = <IconButton aria-label="Dictate"><Icon name="microphone" /></IconButton>;
const bar = <>
  <Select label="Model" hideLabel variant="compact" defaultValue="fable" options={models} />
  <Gauge label="Context used" value={38} size="sm" showValue={false} />
  <Stamp size="sm" tone="sage">Plan</Stamp>
  <Button variant="ghost" size="sm" leading={<Icon name="folder" />}>letters</Button>
  <Button variant="ghost" size="sm" leading={<Icon name="branch" />}>main</Button>
</>;

const meta = {
  title: 'Components/Composer', component: Composer,
  parameters: { docs: { description: { component: 'The prompt box: a red cardboard frame around ruled paper. The native textarea grows with its text up to `--kraft-composer-max-height` and then scrolls. Enter sends and Shift+Enter starts a new line; `submitKey` changes that, and the key hints follow it. Sending calls `onSend` with the text and submits a surrounding form. `mic` and `send` hold disc actions, and `bar` holds the application\'s own controls. `disabled` turns off the text and the send disc; `busy` keeps the text editable while sending waits. Give it a name with `aria-label`, `aria-labelledby`, or a `FormField`. `className` and `style` apply to the frame; other props and the ref reach the textarea.' } } },
  argTypes: { submitKey: { control: 'inline-radio', options: ['enter', 'mod-enter', 'none'] } },
  args: { 'aria-label': 'Message', placeholder: 'Ask for a draft…', submitKey: 'enter', disabled: false, busy: false, onSend: fn() },
  decorators: [Story => <div style={{ width: 'min(100%, 620px)' }}><Story /></div>],
} satisfies Meta<typeof Composer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  const text = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });
  const send = canvas.getByRole('button', { name: 'Send' });
  await expect(text).toHaveAccessibleDescription('Enter to send Shift + Enter for a new line');
  await expect(getComputedStyle(text, '::placeholder').fontFamily).toContain('Caveat');
  await expect(send).toBeDisabled();
  await userEvent.type(text, 'Write a thank-you note{Shift>}{Enter}{/Shift}for the printer');
  await expect(text).toHaveValue('Write a thank-you note\nfor the printer');
  await expect(args.onSend).not.toHaveBeenCalled();
  await expect(send).toBeEnabled();
  await userEvent.keyboard('{Enter}');
  await expect(args.onSend).toHaveBeenCalledWith('Write a thank-you note\nfor the printer');
  await expect(text).toHaveValue('Write a thank-you note\nfor the printer');
  await userEvent.click(send);
  await expect(args.onSend).toHaveBeenCalledTimes(2);
  await expect(text).toHaveFocus();
  const disc = send.getBoundingClientRect();
  await expect([disc.width, disc.height]).toEqual([36, 36]);
  await expect(getComputedStyle(send).borderRadius).toBe('50%');
} };

export const WithBarAndMic: Story = {
  args: { bar, barLabel: 'Message options', mic, defaultValue: 'Sort the letters by sender.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const options = canvas.getByRole('group', { name: 'Message options' });
    await expect(within(options).getByRole('combobox', { name: 'Model' })).toBeVisible();
    await expect(within(options).getByRole('meter', { name: 'Context used' })).toBeVisible();
    await expect(within(options).getByRole('button', { name: 'main' })).toBeVisible();
    const dictate = canvas.getByRole('button', { name: 'Dictate' });
    const send = canvas.getByRole('button', { name: 'Send' });
    await expect(getComputedStyle(dictate).borderRadius).toBe('50%');
    await expect(dictate.getBoundingClientRect().right).toBeLessThan(send.getBoundingClientRect().left);
    // Tab moves from the text to the mic, the send disc, and then the bar.
    const text = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.click(text);
    await userEvent.tab();
    await expect(dictate).toHaveFocus();
    await userEvent.tab();
    await expect(send).toHaveFocus();
    await userEvent.tab();
    await expect(options).toContainElement(document.activeElement as HTMLElement);
    const frame = text.closest('.kraft-composer')!.getBoundingClientRect();
    const strip = options.getBoundingClientRect();
    await expect(strip.left).toBeGreaterThan(frame.left);
    await expect(strip.bottom).toBeLessThan(frame.bottom);
  },
};

export const ModEnterSends: Story = {
  args: { submitKey: 'mod-enter' },
  play: async ({ args, canvasElement }) => {
    const text = within(canvasElement).getByRole('textbox', { name: 'Message' });
    await expect(text).toHaveAccessibleDescription('Ctrl + Enter to send Enter for a new line');
    await userEvent.type(text, 'First line{Enter}second line');
    await expect(text).toHaveValue('First line\nsecond line');
    await expect(args.onSend).not.toHaveBeenCalled();
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    await expect(args.onSend).toHaveBeenCalledWith('First line\nsecond line');
    await userEvent.keyboard('{Meta>}{Enter}{/Meta}');
    await expect(args.onSend).toHaveBeenCalledTimes(2);
  },
};

export const SendDiscOnly: Story = {
  args: { submitKey: 'none' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByRole('textbox', { name: 'Message' });
    await expect(text).not.toHaveAccessibleDescription();
    await expect(canvasElement.querySelector('kbd')).toBeNull();
    await userEvent.type(text, 'One{Enter}two');
    await expect(text).toHaveValue('One\ntwo');
    await expect(args.onSend).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(args.onSend).toHaveBeenCalledWith('One\ntwo');
  },
};

export const CustomHints: Story = {
  args: {
    submitKey: 'mod-enter', sendLabel: 'Send to the printer',
    hints: <><span><Kbd size="sm" keys={['⌘', 'Enter']} /> to send</span>{' '}<span><Kbd size="sm">/</Kbd> for commands</span></>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Message' })).toHaveAccessibleDescription('⌘ + Enter to send / for commands');
    await expect(canvas.getByRole('button', { name: 'Send to the printer' })).toBeVisible();
  },
};

export const Grows: Story = {
  args: { style: { '--kraft-composer-max-height': '128px' } as React.CSSProperties },
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });
    const empty = text.offsetHeight;
    await expect(empty).toBe(64);
    await fireEvent.input(text, { target: { value: 'One\ntwo\nthree\nfour' } });
    await waitFor(() => expect(text.offsetHeight).toBe(112));
    await expect(text.scrollHeight).toBe(text.clientHeight);
    await fireEvent.input(text, { target: { value: 'One\ntwo\nthree\nfour\nfive\nsix\nseven\neight' } });
    await waitFor(() => expect(text.offsetHeight).toBe(128));
    await expect(text.scrollHeight).toBeGreaterThan(text.clientHeight);
    await fireEvent.input(text, { target: { value: '' } });
    await waitFor(() => expect(text.offsetHeight).toBe(empty));
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'The desk is closed for the night.', bar, mic: <IconButton aria-label="Dictate" disabled><Icon name="microphone" /></IconButton> },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByRole('textbox', { name: 'Message' });
    await expect(text).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await expect(getComputedStyle(text).cursor).toBe('not-allowed');
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }), { pointerEventsCheck: 0 });
    await expect(args.onSend).not.toHaveBeenCalled();
  },
};

export const Busy: Story = {
  args: { busy: true, defaultValue: 'Next, sort the stamps.' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByRole('textbox', { name: 'Message' });
    const send = canvas.getByRole('button', { name: 'Send' });
    await expect(send).toBeDisabled();
    await expect(send).toHaveAttribute('aria-busy', 'true');
    await expect(send.querySelector('.kraft-pinwheel')).not.toBeNull();
    await userEvent.type(text, ' Then the tape.{Enter}');
    await expect(text).toHaveValue('Next, sort the stamps. Then the tape.');
    await expect(args.onSend).not.toHaveBeenCalled();
  },
};

const stop = fn();
export const BusyWithStop: Story = {
  args: { busy: true, send: <IconButton variant="danger" aria-label="Stop" onClick={stop}><Icon name="stop" /></IconButton> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Send' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }));
    await expect(stop).toHaveBeenCalledTimes(1);
  },
};

const submitted = fn();
export const InForm: Story = {
  args: { onSend: undefined },
  render: args => <Stack as="form" aria-label="New message" gap={16} onSubmit={event => {
    event.preventDefault();
    submitted(Object.fromEntries(new FormData(event.currentTarget)));
    event.currentTarget.reset();
  }}>
    <Composer {...args} name="prompt" required />
    <Inline gap={8}><Button type="reset" variant="ghost">Clear</Button></Inline>
  </Stack>,
  play: async ({ canvasElement }) => {
    submitted.mockClear();
    const canvas = within(canvasElement);
    const text = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });
    const send = canvas.getByRole('button', { name: 'Send' });
    await expect(text).toBeRequired();
    await userEvent.type(text, 'Post the parcel{Enter}');
    await expect(submitted).toHaveBeenCalledWith({ prompt: 'Post the parcel' });
    // The form reset empties the text, so the send disc waits for more.
    await waitFor(() => expect(send).toBeDisabled());
    await expect(text).toHaveValue('');
    // The simulated keyboard keeps its own record of the text, which a form reset does not clear.
    await userEvent.clear(text);
    await userEvent.type(text, 'Weigh it first');
    await userEvent.click(send);
    await expect(submitted).toHaveBeenLastCalledWith({ prompt: 'Weigh it first' });
    await expect(submitted).toHaveBeenCalledTimes(2);
    await userEvent.clear(text);
    await userEvent.type(text, 'Draft');
    await expect(send).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(send).toBeDisabled());
  },
};

export const InFormField: Story = {
  args: { 'aria-label': undefined },
  render: args => <FormField label="Reply" description="Sent to the whole desk" error="Write a reply before sending">
    <Composer {...args} />
  </FormField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByRole('textbox', { name: 'Reply' });
    await expect(text).toHaveAccessibleDescription('Enter to send Shift + Enter for a new line Sent to the whole desk Write a reply before sending');
    await expect(text).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(canvas.getByText('Reply'));
    await expect(text).toHaveFocus();
  },
};

export const FocusAndPress: Story = {
  args: { mic },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByRole('textbox', { name: 'Message' });
    const frame = text.closest<HTMLElement>('.kraft-composer')!;
    await userEvent.tab();
    await expect(text).toHaveFocus();
    await expect(getComputedStyle(frame).outlineStyle).toBe('solid');
    await expect(getComputedStyle(text).outlineStyle).toBe('none');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Dictate' })).toHaveFocus();
    await expect(getComputedStyle(frame).outlineStyle).toBe('none');
    // Pressing the paper beside the hints puts the caret in the text.
    await userEvent.click(canvasElement.querySelector('.kraft-composer-hints')!);
    await expect(text).toHaveFocus();
  },
};

export const OnMaterials: Story = {
  render: args => <Stack gap={24}>
    {(['paper', 'kraft', 'cardboard'] as const).map(material => <Surface key={material} material={material} padding={16}>
      <Stack gap={8}>
        <Text variant="label">On {material}</Text>
        <Composer {...args} aria-label={`Message on ${material}`} bar={<Text tone="muted">Replies go to the whole desk.</Text>} />
      </Stack>
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    const inks = [...canvasElement.querySelectorAll('.kraft-composer-bar .kraft-text')].map(text => getComputedStyle(text).color);
    await expect(new Set(inks).size).toBe(1);
  },
};

export const RightToLeft: Story = {
  args: { 'aria-label': 'رسالة', placeholder: 'اكتب رسالة…', sendLabel: 'إرسال', mic, dir: 'rtl' },
  render: args => <div dir="rtl" lang="ar"><Composer {...args} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const send = canvas.getByRole('button', { name: 'إرسال' }).getBoundingClientRect();
    const hints = canvasElement.querySelector('.kraft-composer-hints')!.getBoundingClientRect();
    await expect(send.right).toBeLessThan(hints.left);
  },
};

export const Night: Story = { ...WithBarAndMic, globals: { theme: 'night' } };
export const QuietNight: Story = {
  args: { bar, mic, busy: true, defaultValue: 'Fold the corners.' },
  globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvasElement.querySelector<HTMLElement>('.kraft-composer')!;
    await expect(getComputedStyle(frame).backgroundImage).not.toContain('url(');
    await expect(getComputedStyle(frame).rotate).toBe('none');
    const wheel = canvas.getByRole('button', { name: 'Send' }).querySelector('.kraft-pinwheel > svg')!;
    await expect(getComputedStyle(wheel).animationPlayState).toBe('paused');
  },
};
