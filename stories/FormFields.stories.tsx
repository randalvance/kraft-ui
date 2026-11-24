import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { Button, FormField, IconButton, Inline, Kbd, SearchField, Stack, Textarea, TextField } from '../src';

const meta = {
  title: 'Components/Form fields', component: FormField,
  parameters: { docs: { description: { component: 'Paper text, search, and multiline inputs. FormField supplies the native label, hint, and validation relationships for one field. Each control also works alone with a visible external label or aria-label. Refs and native input props reach the underlying input or textarea.' } } },
  args: { label: 'Agent name', description: 'Shown beside the agent portrait', children: <TextField placeholder="Name this agent" /> },
} satisfies Meta<typeof FormField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('textbox', { name: 'Agent name' });
  await userEvent.type(input, 'Curator');
  await expect(input).toHaveValue('Curator');
} };

export const Form: Story = { render: () => <Stack as="form" gap={24} style={{ width: 'min(100%, 620px)' }}>
  <FormField label="Agent name" description="Shown in sessions"><TextField name="name" placeholder="Name this agent" required /></FormField>
  <FormField label="Description" description="One line on the agent card"><Textarea name="description" rows={2} placeholder="What does this agent do?" /></FormField>
  <FormField label="System prompt" description="Read before every session"><Textarea name="prompt" rows={6} defaultValue="Write a clear summary and stop for review." /></FormField>
  <Button type="submit" style={{ alignSelf: 'flex-start' }}>Save agent</Button>
</Stack> };

export const Search: Story = { render: () => <FormField label="Find notes" description="Search titles and text" style={{ maxWidth: 360 }}><SearchField name="query" placeholder="Search notes…" /></FormField>, play: async ({ canvasElement }) => {
  const search = within(canvasElement).getByRole('searchbox', { name: 'Find notes' });
  await userEvent.type(search, 'paper');
  await expect(search).toHaveValue('paper');
} };

const funnel = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" /></svg>;

// The trailing slot must sit after the input box, which holds the native clear button.
async function expectClearOfTrailing(input: HTMLInputElement) {
  const trailing = input.parentElement!.querySelector('.kraft-search-trailing')!.getBoundingClientRect();
  const box = input.getBoundingClientRect();
  const rtl = getComputedStyle(input).direction === 'rtl';
  if (rtl) await expect(trailing.right).toBeLessThanOrEqual(box.left + 0.5);
  else await expect(trailing.left).toBeGreaterThanOrEqual(box.right - 0.5);
  await expect(box.width).toBeGreaterThan(40);
}

export const SearchSlots: Story = {
  render: () => <Stack gap={16} style={{ width: 'min(100%, 420px)' }}>
    <FormField label="Search letters"><SearchField placeholder="Search letters…" trailing={<Kbd size="sm">/</Kbd>} /></FormField>
    <FormField label="Command"><SearchField placeholder="Jump to…" trailing={<Kbd size="sm" keys={['Ctrl', 'K']} />} /></FormField>
    <FormField label="Filter senders"><SearchField icon={funnel} defaultValue="studio" trailing="12 results" /></FormField>
    <FormField label="Plain search"><SearchField icon={null} placeholder="No mark" /></FormField>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const letters = canvas.getByRole<HTMLInputElement>('searchbox', { name: 'Search letters' });
    await userEvent.type(letters, 'a long query that runs right up to the keycap hint');
    await expectClearOfTrailing(letters);
    await expect(letters).toHaveFocus();
    await expect(getComputedStyle(letters.parentElement!).outlineStyle).toBe('solid');
    await userEvent.clear(letters);
    await expect(letters).toHaveValue('');

    const filter = canvas.getByRole<HTMLInputElement>('searchbox', { name: 'Filter senders' });
    await expect(filter).toHaveAccessibleName('Filter senders');
    await expectClearOfTrailing(filter);
    await userEvent.click(canvas.getByText('12 results'));
    await expect(filter).toHaveFocus();

    const plain = canvas.getByRole('searchbox', { name: 'Plain search' });
    await expect(parseFloat(getComputedStyle(plain).paddingInlineStart)).toBeLessThan(16);
  },
};

export const SearchToolbar: Story = {
  render: () => <Inline as="div" role="toolbar" aria-label="Letters" gap={8} style={{ alignItems: 'center', width: 'min(100%, 560px)' }}>
    <SearchField aria-label="Search letters" placeholder="Search…" style={{ width: 240 }} trailing={<Kbd size="sm">/</Kbd>} />
    <SearchField aria-label="Filter" icon={funnel} placeholder="Filter…" style={{ flex: 1 }} />
    <IconButton aria-label="New letter">+</IconButton>
  </Inline>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole<HTMLInputElement>('searchbox', { name: 'Search letters' });
    const filter = canvas.getByRole<HTMLInputElement>('searchbox', { name: 'Filter' });
    await expect(search.parentElement!.getBoundingClientRect().width).toBe(240);
    await expect(search.parentElement!.parentElement).toBe(filter.parentElement!.parentElement);
    await expect(filter.parentElement!.getBoundingClientRect().width).toBeGreaterThan(100);
    await userEvent.click(search);
    await userEvent.tab();
    await expect(filter).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'New letter' })).toHaveFocus();
  },
};

export const SearchStates: Story = {
  render: () => <Stack gap={16} style={{ width: 'min(100%, 420px)' }}>
    <FormField label="Archived letters"><SearchField disabled defaultValue="spring" trailing={<Kbd size="sm">/</Kbd>} /></FormField>
    <FormField label="Sender" error="Use at least two letters"><SearchField defaultValue="a" trailing="0 results" /></FormField>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const archived = canvas.getByRole('searchbox', { name: 'Archived letters' });
    await expect(archived).toBeDisabled();
    await userEvent.click(canvas.getByText('/'));
    await expect(archived).not.toHaveFocus();
    const sender = canvas.getByRole('searchbox', { name: 'Sender' });
    await expect(sender).toHaveAttribute('aria-invalid', 'true');
    await expect(sender).toHaveAccessibleDescription('Use at least two letters');
    await expect(getComputedStyle(sender.parentElement!).borderBottomStyle).toBe('dashed');
  },
};

export const SearchRightToLeft: Story = {
  render: () => <div dir="rtl" lang="ar" style={{ maxWidth: 430 }}>
    <FormField label="ابحث في الرسائل"><SearchField defaultValue="ورق" trailing={<Kbd size="sm">/</Kbd>} /></FormField>
  </div>,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole<HTMLInputElement>('searchbox');
    await expectClearOfTrailing(input);
    const mark = input.parentElement!.querySelector('.kraft-search-mark')!.getBoundingClientRect();
    await expect(mark.left).toBeGreaterThan(input.getBoundingClientRect().right - 40);
  },
};

export const SearchNight: Story = { ...SearchSlots, globals: { theme: 'night' } };
export const SearchQuietNight: Story = { ...SearchStates, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };

export const Validation: Story = { render: function ValidationForm() {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  return <FormField label="Workspace name" description="Required to save this workspace" error={touched && !name.trim() ? 'It needs a name' : undefined} style={{ maxWidth: 420 }}>
    <TextField name="workspace" value={name} onChange={event => setName(event.target.value)} onBlur={() => setTouched(true)} required placeholder="Name this workspace" />
  </FormField>;
}, play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('textbox', { name: 'Workspace name' });
  await userEvent.click(input);
  await userEvent.tab();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('Required to save this workspace It needs a name');
} };

export const States: Story = { render: () => <Stack gap={16} style={{ width: 'min(100%, 460px)' }}>
  <FormField label="Ready"><TextField defaultValue="Fresh paper" /></FormField>
  <FormField label="Disabled"><TextField defaultValue="Kept for reference" disabled /></FormField>
  <FormField label="Needs a name" error="It needs a name"><TextField aria-required="true" /></FormField>
</Stack> };

export const RightToLeft: Story = { render: () => <div dir="rtl" lang="ar" style={{ maxWidth: 430 }}><FormField label="ابحث في الملاحظات" description="ابحث بالعنوان"><SearchField placeholder="ابحث…" /></FormField></div> };
export const Night: Story = { ...Form, globals: { theme: 'night' } };

export const Underline: Story = {
  render: () => <Stack gap={24} style={{ width: 'min(100%, 480px)' }}>
    <FormField label="Desk" labelStyle="uppercase"><TextField variant="underline" size="sm" defaultValue="Binding room" /></FormField>
    <FormField label="Proofreader" labelStyle="uppercase"><TextField variant="underline" size="md" placeholder="Name and surname" /></FormField>
    <FormField label="Edition" labelStyle="uppercase"><TextField variant="underline" size="lg" defaultValue="Second printing" readOnly /></FormField>
    <FormField label="Project title" labelStyle="uppercase"><TextField variant="underline" size="title" defaultValue="Field notes" /></FormField>
    <FormField label="Approved title"><TextField variant="underline" defaultValue="Letterpress guide" disabled /></FormField>
    <FormField label="Project code" error="Enter the code stamped on the proof"><TextField variant="underline" required /></FormField>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole('textbox', { name: 'Project title' });
    await userEvent.click(canvas.getByText('Project title'));
    await expect(title).toHaveFocus();
    await expect(title).toHaveValue('Field notes');
    await expect(canvas.getByRole('textbox', { name: 'Project code' })).toHaveAccessibleDescription('Enter the code stamped on the proof');
  },
};

export const RuledPaper: Story = {
  render: function RuledFields() {
    const [prompt, setPrompt] = useState('Check the page numbers.');
    return <Stack as="form" aria-label="Proof notes" gap={24} style={{ width: 'min(100%, 480px)' }}>
      <FormField label="Margin notes" labelStyle="uppercase"><Textarea variant="ruled" rows={3} placeholder="Mark up the proof…" /></FormField>
      <FormField label="Proofing prompt" labelStyle="uppercase" description="Saved with the proof">
        <Textarea variant="ruled" mono autoGrow rows={2} value={prompt} onChange={event => setPrompt(event.currentTarget.value)}
          footer={`${prompt.length} characters`} />
      </FormField>
      <FormField label="Checklist" labelStyle="uppercase">
        <Textarea name="notes" variant="ruled" autoGrow rows={2} defaultValue="Trim the covers." />
      </FormField>
      <FormField label="Archived notes"><Textarea variant="ruled" disabled rows={2} defaultValue="Signed off on Tuesday." /></FormField>
      <Button type="reset" style={{ alignSelf: 'flex-start' }}>Reset notes</Button>
    </Stack>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prompt = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Proofing prompt' });
    const initialHeight = prompt.offsetHeight;
    const initialPrompt = prompt.value;
    await fireEvent.input(prompt, { target: { value: `${initialPrompt}\nCheck the margins.\nRead the caption.\nKeep the cover.` } });
    await waitFor(() => expect(prompt.offsetHeight).toBeGreaterThan(initialHeight));
    await expect(prompt).toHaveAccessibleDescription(`Saved with the proof ${prompt.value.length} characters`);
    await fireEvent.input(prompt, { target: { value: initialPrompt } });
    await waitFor(() => expect(prompt.offsetHeight).toBe(initialHeight));

    const notes = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Checklist' });
    const notesHeight = notes.offsetHeight;
    await fireEvent.input(notes, { target: { value: `${notes.value}\nCheck the margins.\nRead the caption.` } });
    await waitFor(() => expect(notes.offsetHeight).toBeGreaterThan(notesHeight));
    await userEvent.click(canvas.getByRole('button', { name: 'Reset notes' }));
    await expect(notes).toHaveValue('Trim the covers.');
    await waitFor(() => expect(notes.offsetHeight).toBe(notesHeight));
  },
};

export const QuietNight: Story = { ...RuledPaper, globals: { theme: 'night', texture: 'off', motion: 'off', tilt: 'off' } };
