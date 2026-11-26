import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Callout, Icon, Link, Stack, Surface, type Tone } from '../src';

const tones: Tone[] = ['neutral', 'blue', 'sage', 'danger', 'attention'];

const meta = {
  title: 'Components/Callout', component: Callout,
  parameters: { docs: { description: { component: 'A bordered note set apart from the text around it, with a thick tone edge at the start. `title`, a decorative `leading` icon, and an `action` slot are optional. `tone="danger"` with an `action` is the danger form: it explains a destructive step beside the button that performs it. The note has `role="note"`; pass `role="alert"` for one that appears in response to an error.' } } },
  argTypes: { tone: { control: 'select', options: tones }, leading: { control: false }, action: { control: false } },
  args: { title: 'Heads up', children: 'Drafts are saved on this device only until you publish.', tone: 'neutral' },
} satisfies Meta<typeof Callout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Surface><Callout {...args} /></Surface>,
  play: async ({ canvasElement }) => {
    const note = within(canvasElement).getByRole('note');
    await expect(note).toHaveTextContent('Heads up');
    await expect(getComputedStyle(note).borderInlineStartWidth).toBe('4px');
  },
};

/** Every tone, with and without a title and icon. */
export const Tones: Story = {
  render: () => <Surface><Stack gap={12}>
    {tones.map(tone => <Callout key={tone} tone={tone} title={`${tone[0].toUpperCase()}${tone.slice(1)} note`} leading={<Icon name="pin" />}>
      Body text keeps the paper ink. <Link href="#more">Read more</Link>
    </Callout>)}
    <Callout>A plain note with no title.</Callout>
  </Stack></Surface>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('note')).toHaveLength(6);
    await expect(canvasElement.querySelectorAll('.kraft-callout-leading[aria-hidden="true"]')).toHaveLength(5);
  },
};

/** The danger form: the consequence in words, with the action that carries it out. */
export const DangerWithAction: Story = {
  render: () => {
    const remove = fn();
    return <Surface><Callout tone="danger" title="Delete this workspace" leading={<Icon name="trash" />}
      action={<Button variant="danger" onClick={remove} data-testid="delete">Delete workspace</Button>}>
      All boards, cards, and history are removed for everyone. This cannot be undone.
    </Callout></Surface>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Delete workspace' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(canvas.getByRole('note')).toContainElement(button);
  },
};

/** On kraft and cardboard the note keeps its own paper. */
export const OnMaterials: Story = {
  render: () => <Stack gap={12}>
    {(['kraft', 'cardboard'] as const).map(material => <Surface key={material} material={material}>
      <Callout tone="attention" title="Review needed" action={<Button size="sm" variant="ghost">Open</Button>}>Two cards have waited more than a day.</Callout>
    </Surface>)}
  </Stack>,
};
