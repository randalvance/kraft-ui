import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Avatar, RadioGroup, Text, type RadioOption } from '../src';

const options: RadioOption[] = [
  { value: 'fable', label: 'Fable', description: 'A careful choice', trailing: 'High' },
  { value: 'sonnet', label: 'Sonnet', description: 'Everyday work', trailing: 'Medium' },
  { value: 'haiku', label: 'Haiku', description: 'Quick and light', trailing: 'Low' },
  { value: 'retired', label: 'Retired model', disabled: true },
];
const plans: RadioOption[] = [
  { value: 'pup', label: 'Pup', description: 'One pet, weekly walks, and a monthly groom' },
  { value: 'pack', label: 'Pack', description: 'Up to four pets with daily walks and vet reminders' },
  { value: 'shelter', label: 'Shelter', description: 'Unlimited pets, a shared calendar, and a care log' },
];
const swatches: RadioOption[] = ['ochre', 'teal', 'violet', 'plum', 'blush'].map(tone => ({
  value: tone, label: tone[0].toUpperCase() + tone.slice(1), swatch: `var(--kraft-${tone})`,
}));
const portraits: RadioOption[] = [
  { value: 'pip', label: 'Pip', picture: <Avatar initial="P" tone="blue" size={36} tilt={-4} decorative /> },
  { value: 'kit', label: 'Kit', description: 'Sleeps all afternoon', picture: <Avatar initial="K" tone="sage" size={36} tilt={3} decorative /> },
  { value: 'mochi', label: 'Mochi', picture: <Avatar initial="M" tone="attention" size={36} decorative /> },
  { value: 'rex', label: 'Rex', disabled: true, picture: <Avatar initial="R" size={36} decorative /> },
];

const meta = { title: 'Components/Radio group', component: RadioGroup,
  parameters: { docs: { description: { component: 'Native radio inputs for one choice from a small visible set. Options sit on paper rows by default; `columns` lays them out as equal-width cards, `variant="flat"` highlights only the picked row, and `variant="swatch"` or `"picture"` draw colour swatches or pictures named by the option label. The group has a fieldset legend, participates in forms, and supports browser radio keyboard behavior.' } } },
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

export const Horizontal: Story = {
  args: { orientation: 'horizontal', options: options.slice(0, 3) },
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll('.kraft-radio-option')].map(row => row.getBoundingClientRect());
    await expect(new Set(rows.map(row => Math.round(row.top))).size).toBe(1);
    await expect(Math.abs(rows[0].width - rows[2].width)).toBeLessThan(1);
  },
};

export const Columns: Story = {
  args: { label: 'Care plan', name: 'plan', options: plans, defaultValue: 'pack', columns: 3, style: { maxWidth: 640 } },
  play: async ({ canvasElement }) => {
    const cards = [...canvasElement.querySelectorAll('.kraft-radio-option')].map(card => card.getBoundingClientRect());
    await expect(new Set(cards.map(card => Math.round(card.top))).size).toBe(1);
    for (const card of cards) await expect(Math.abs(card.width - cards[0].width)).toBeLessThan(1);
    for (const card of cards) await expect(Math.abs(card.height - cards[0].height)).toBeLessThan(1);
  },
};

export const ColumnsWrap: Story = {
  name: 'Columns with fewer options than columns',
  args: { label: 'Care plan', name: 'plan-few', options: plans.slice(0, 2), defaultValue: 'pup', columns: 3, style: { maxWidth: 640 } },
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('.kraft-radio-options')!.getBoundingClientRect();
    const card = canvasElement.querySelector('.kraft-radio-option')!.getBoundingClientRect();
    await expect(card.width).toBeLessThan(group.width / 2);
  },
};

export const Flat: Story = {
  args: { variant: 'flat', label: 'Sort by', name: 'sort', defaultValue: 'recent', options: [
    { value: 'recent', label: 'Most recent' }, { value: 'name', label: 'Name' },
    { value: 'due', label: 'Due date', description: 'Undated items last' }, { value: 'owner', label: 'Owner', disabled: true },
  ] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rowOf = (name: string) => canvas.getByRole('radio', { name }).closest('label')!;
    await expect(getComputedStyle(rowOf('Name')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(rowOf('Most recent')).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await userEvent.click(canvas.getByText('Name'));
    await expect(getComputedStyle(rowOf('Most recent')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(rowOf('Name')).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};

export const Swatches: Story = {
  args: { variant: 'swatch', label: 'Workspace colour', name: 'colour', options: swatches, defaultValue: 'teal' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Teal')).toBeNull();
    const teal = canvas.getByRole('radio', { name: 'Teal' });
    await expect(teal).toBeChecked();
    await userEvent.tab();
    await expect(teal).toHaveFocus();
    const target = teal.closest('label')!;
    await expect(getComputedStyle(target).outlineStyle).toBe('solid');
    await expect(target.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Violet' })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledWith('violet', swatches[2]);
    const swatch = canvas.getByRole('radio', { name: 'Violet' }).closest('label')!.querySelector('.kraft-radio-swatch')!;
    await waitFor(() => expect(getComputedStyle(swatch).boxShadow).toMatch(/0px 0px 0px 4px$/));
  },
};

export const SwatchesDisabled: Story = {
  name: 'Swatches with a disabled colour',
  args: { variant: 'swatch', label: 'Workspace colour', name: 'colour-off', defaultValue: 'teal',
    options: swatches.map(option => option.value === 'violet' ? { ...option, disabled: true } : option) },
};

export const Pictures: Story = {
  args: { variant: 'picture', label: 'Portrait', name: 'portrait', options: portraits, defaultValue: 'pip',
    description: 'Shown beside every note you pin.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const kit = canvas.getByRole('radio', { name: 'Kit' });
    await expect(kit).toHaveAccessibleDescription('Sleeps all afternoon');
    await expect(canvasElement.querySelector('.kraft-visually-hidden:not(legend)')).toBeNull();
    await userEvent.click(kit.closest('label')!);
    await expect(kit).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Rex' })).toBeDisabled();
  },
};

export const HandwrittenTrailing: Story = {
  name: 'Handwritten trailing note',
  args: { label: 'Walker', name: 'walker', defaultValue: 'sam', options: [
    { value: 'sam', label: 'Sam', description: 'Weekday mornings', trailing: <Text as="span" variant="hand" size="md">knows the shortcut by the river</Text> },
    { value: 'ana', label: 'Ana', description: 'Weekends', trailing: <Text as="span" variant="hand" size="md">bring treats</Text> },
  ] },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.kraft-radio-option')!.getBoundingClientRect();
    const note = canvasElement.querySelector('.kraft-radio-trailing')!.getBoundingClientRect();
    await expect(note.width).toBeGreaterThan(row.width * .4);
  },
};

export const Disabled: Story = { args: { disabled: true } };
export const Night: Story = { ...Default, globals: { theme: 'night' } };
export const NightLayouts: Story = {
  name: 'Night layouts',
  globals: { theme: 'night' },
  render: () => <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
    <RadioGroup label="Care plan" name="night-plan" options={plans} defaultValue="pack" columns={3} />
    <RadioGroup label="Sort by" name="night-sort" variant="flat" defaultValue="name"
      options={[{ value: 'recent', label: 'Most recent' }, { value: 'name', label: 'Name' }]} />
    <RadioGroup label="Workspace colour" name="night-colour" variant="swatch" options={swatches} defaultValue="plum" />
    <RadioGroup label="Portrait" name="night-portrait" variant="picture" options={portraits} defaultValue="kit" />
  </div>,
};
export const Quiet: Story = { ...NightLayouts, name: 'Texture, motion, and tilt off', globals: { texture: 'off', motion: 'off', tilt: 'off' } };
