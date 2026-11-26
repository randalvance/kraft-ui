import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FormField, Stack, Surface, TagInput, Text } from '../src';

const meta = {
  title: 'Components/TagInput', component: TagInput,
  parameters: { docs: { description: { component: 'A field of removable slips with an inline add field. Enter or a comma adds what was typed, and a slip already present is not added twice. Backspace in the empty field moves to the last slip\'s remove button; removing a slip moves focus to the one that took its place, or back to the field. Place it in a `FormField` for its label, description, and error. The ref and native input props reach the add field, and `name` submits each slip under one form name.' } } },
  argTypes: { variant: { control: 'inline-radio', options: ['paper', 'kraft'] } },
  args: { defaultValue: ['design', 'night-theme'], placeholder: 'Add a label', onValueChange: fn() },
} satisfies Meta<typeof TagInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Surface style={{ maxInlineSize: 420 }}><FormField label="Labels" description="Enter or comma adds one"><TagInput {...args} /></FormField></Surface>,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Labels' });
    await expect(field).toHaveAccessibleDescription('Enter or comma adds one');
    await userEvent.type(field, 'paper{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['design', 'night-theme', 'paper']);
    await expect(field).toHaveValue('');
    await userEvent.type(field, 'kraft, ');
    await expect(within(canvas.getByRole('list', { name: 'Tags' })).getAllByRole('listitem')).toHaveLength(4);
    // A duplicate is dropped.
    await userEvent.type(field, 'design{Enter}');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    // Backspace in the empty field reaches the last slip; removing it returns to the field.
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.getByRole('button', { name: 'Remove kraft' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('button', { name: 'Remove paper' })).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove design' }));
    await expect(canvas.getByRole('button', { name: 'Remove night-theme' })).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['night-theme', 'paper']);
  },
};

function ControlledReviewers() {
  const [people, setPeople] = useState(['Mina Park']);
  return <Stack gap={8}>
    <FormField label="Reviewers" error={people.length ? undefined : 'Add at least one reviewer'}>
      <TagInput value={people} onValueChange={setPeople} variant="kraft" name="reviewer" removeLabel={person => `Remove reviewer ${person}`} tagsLabel="Reviewers" />
    </FormField>
    <Text tone="muted" data-testid="count">{people.length} selected</Text>
  </Stack>;
}

/** Controlled kraft slips with an error once the last one is removed. */
export const ControlledWithError: Story = {
  args: { onValueChange: undefined },
  render: () => <Surface style={{ maxInlineSize: 420 }}><form><ControlledReviewers /></form></Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reviewers' });
    await expect(new FormData(canvasElement.querySelector('form')!).getAll('reviewer')).toEqual(['Mina Park']);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove reviewer Mina Park' }));
    await expect(field).toHaveFocus();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('Add at least one reviewer');
    await expect(canvas.queryByRole('list')).toBeNull();
    await expect(canvas.getByTestId('count')).toHaveTextContent('0 selected');
  },
};

/** Empty, disabled, and wrapping in a narrow field. */
export const States: Story = {
  args: { onValueChange: undefined },
  render: () => <Surface style={{ maxInlineSize: 300 }}><Stack gap={16}>
    <FormField label="Empty"><TagInput placeholder="Add a label" /></FormField>
    <FormField label="Disabled"><TagInput disabled defaultValue={['locked', 'archive']} /></FormField>
    <FormField label="Wrapping"><TagInput defaultValue={['letterpress', 'second-printing', 'cover-proof', 'a-very-long-label-that-truncates-inside-the-field']} /></FormField>
  </Stack></Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Disabled' })).toBeDisabled();
    await expect(canvas.queryByRole('button', { name: 'Remove locked' })).toBeNull();
    const wrapping = canvas.getByRole('textbox', { name: 'Wrapping' }).closest<HTMLElement>('.kraft-tag-input')!;
    await expect(wrapping.scrollWidth).toBeLessThanOrEqual(wrapping.clientWidth);
    await expect(wrapping.getBoundingClientRect().height).toBeGreaterThan(60);
  },
};
