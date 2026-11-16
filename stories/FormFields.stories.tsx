import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, FormField, SearchField, Stack, Textarea, TextField } from '../src';

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
