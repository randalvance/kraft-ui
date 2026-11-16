import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RadioGroup, type RadioOption } from '../src';

const options: RadioOption[] = [
  { value: 'fable', label: 'Fable', description: 'A careful choice', trailing: 'High' },
  { value: 'sonnet', label: 'Sonnet', description: 'Everyday work', trailing: 'Medium' },
  { value: 'haiku', label: 'Haiku', description: 'Quick and light', trailing: 'Low' },
  { value: 'retired', label: 'Retired model', disabled: true },
];
const meta = { title: 'Components/Radio group', component: RadioGroup,
  parameters: { docs: { description: { component: 'Native radio inputs on paper rows. Use for one choice from a small visible set. The group has a fieldset legend, participates in forms, and supports browser radio keyboard behavior.' } } },
  args: { label: 'Preferred model', name: 'model', options, defaultValue: 'sonnet', onValueChange: fn(), style: { maxWidth: 460 } },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('radio', { name: 'Sonnet' })).toBeChecked();
  await userEvent.click(canvas.getByRole('radio', { name: 'Fable' }));
  await expect(canvas.getByRole('radio', { name: 'Fable' })).toBeChecked();
  await expect(args.onValueChange).toHaveBeenCalledWith('fable', options[0]);
} };
export const Horizontal: Story = { args: { orientation: 'horizontal', options: options.slice(0, 3) } };
export const Disabled: Story = { args: { disabled: true } };
export const Night: Story = { ...Default, globals: { theme: 'night' } };
