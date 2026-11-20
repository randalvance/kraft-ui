import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { FormField, FormSection, Heading, Stack, Textarea, TextField, Toggle } from '../src';

const meta = {
  title: 'Components/FormSection',
  component: FormSection,
  args: { title: 'Profile details', hint: 'Shown on the adoption page', style: { maxWidth: 640 } },
  parameters: { docs: { description: { component: 'A named paper sheet with a serif heading, an optional handwritten hint, and form content. Set titleAs for the heading hierarchy.' } } },
} satisfies Meta<typeof FormSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithHint: Story = {
  args: {
    children: <Stack gap={16}>
      <FormField label="Display name"><TextField defaultValue="Mochi" /></FormField>
      <FormField label="About"><Textarea rows={3} /></FormField>
    </Stack>,
  },
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole('region', { name: 'Profile details' });
    const heading = within(section).getByRole('heading', { name: 'Profile details', level: 2 });
    const hint = within(section).getByText('Shown on the adoption page');
    const field = within(section).getByRole('textbox', { name: 'Display name' });
    await expect(heading.getBoundingClientRect().right).toBeLessThan(hint.getBoundingClientRect().left);
    await expect(hint.getBoundingClientRect().top).toBeLessThan(heading.getBoundingClientRect().bottom);
    await expect(field).toHaveValue('Mochi');
  },
};

export const Nested: Story = {
  args: {
    title: 'Notifications', hint: undefined,
    children: <FormSection title="Email updates" titleAs="h3" hint="Sent weekly">
      <Toggle defaultChecked>Adoption summary</Toggle>
    </FormSection>,
  },
  render: args => <Stack gap={16}>
    <Heading as="h1" size="lg">Adoption preferences</Heading>
    <FormSection {...args} />
  </Stack>,
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole('region', { name: 'Notifications' });
    const nested = within(section).getByRole('region', { name: 'Email updates' });
    await expect(within(nested).getByRole('heading', { name: 'Email updates', level: 3 })).toBeVisible();
    await expect(within(nested).getByRole('switch', { name: 'Adoption summary' })).toBeChecked();
  },
};

export const Narrow: Story = {
  globals: { texture: 'off', motion: 'off', tilt: 'off' },
  args: {
    title: 'Public contact information', hint: 'Visible when the profile is published', style: { maxWidth: 280 },
    children: <FormField label="Contact email"><TextField type="email" /></FormField>,
  },
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole('region', { name: 'Public contact information' });
    await expect(section.scrollWidth).toBeLessThanOrEqual(section.clientWidth);
  },
};
