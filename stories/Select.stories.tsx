import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Select, type SelectOption } from '../src';

const options: SelectOption[] = [
  { value: 'all', label: 'All workspaces' },
  { value: 'lighthouse', label: 'Lighthouse Web', description: 'Three sessions' },
  { value: 'orbit', label: 'Orbit Billing', description: 'Thirteen sessions' },
  { value: 'retired', label: 'Retired workspace', disabled: true },
];
const meta = { title: 'Components/Select', component: Select,
  parameters: { docs: { description: { component: 'A single choice paper control with an accessible listbox, typeahead, disabled options, and native form submission. Use Menu for actions; Select changes a value.' } } },
  args: { label: 'Workspace', options, defaultValue: 'all', name: 'workspace', onValueChange: fn(), style: { width: 320 } },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('combobox', { name: 'Workspace' }));
  const listbox = canvas.getByRole('listbox');
  await userEvent.click(within(listbox).getByRole('option', { name: 'Orbit Billing' }));
  await expect(args.onValueChange).toHaveBeenCalledWith('orbit', options[2]);
  await expect(canvas.getByRole('combobox', { name: 'Workspace' })).toHaveTextContent('Orbit Billing');
} };
export const Empty: Story = { args: { defaultValue: undefined, placeholder: 'Choose a workspace' } };
export const Disabled: Story = { args: { disabled: true } };
export const FormValue: Story = { render: () => <form aria-label="Workspace form">
  <Select label="Workspace" name="workspace" options={options} defaultValue="all" required style={{ width: 320 }} />
</form>, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole('form', { name: 'Workspace form' }) as HTMLFormElement;
  await expect(new FormData(form).get('workspace')).toBe('all');
  await userEvent.click(canvas.getByRole('combobox', { name: 'Workspace' }));
  await userEvent.click(within(canvas.getByRole('listbox')).getByRole('option', { name: 'Orbit Billing' }));
  await expect(new FormData(form).get('workspace')).toBe('orbit');
} };
export const Night: Story = { ...Default, globals: { theme: 'night' } };
