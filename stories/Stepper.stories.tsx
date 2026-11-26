import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stack, Stepper, Surface, Text, type StepperStep } from '../src';

const steps: StepperStep[] = [
  { id: 'plan', label: 'Plan', description: 'Scope agreed with the team', status: 'done', trailing: '2m' },
  { id: 'build', label: 'Build', description: 'Twelve components', status: 'done', trailing: '41m' },
  { id: 'review', label: 'Review', description: 'Waiting on two reviewers', status: 'current' },
  { id: 'ship', label: 'Ship', description: 'Publish to npm' },
];
const blocked: StepperStep[] = [
  { id: 'lint', label: 'Lint', status: 'done' },
  { id: 'test', label: 'Test', description: 'Contrast check failed on Night', status: 'blocked' },
  { id: 'deploy', label: 'Deploy' },
];

const meta = {
  title: 'Components/Stepper', component: Stepper,
  parameters: { docs: { description: { component: 'Progress through an ordered set of steps. `variant="pipeline"` stacks labelled steps on a thread with optional descriptions and trailing notes; `variant="track"` is one compact row that prints only the current step\'s label. Each step has a `status` of `done`, `current`, `upcoming` (default), or `blocked`. The marks differ in form as well as colour, every label is followed by its state in words for assistive technology (`statusLabels` renames them), and the current step has `aria-current="step"`. The stepper is not interactive.' } } },
  argTypes: { variant: { control: 'inline-radio', options: ['pipeline', 'track'] } },
  args: { steps, variant: 'pipeline' },
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The vertical pipeline. */
export const Pipeline: Story = {
  render: args => <Surface style={{ maxInlineSize: 360 }}><Stepper {...args} aria-label="Release pipeline" /></Surface>,
  play: async ({ canvasElement }) => {
    const items = within(within(canvasElement).getByRole('list', { name: 'Release pipeline' })).getAllByRole('listitem');
    await expect(items.map(item => item.textContent)).toEqual([
      'Plan, DoneScope agreed with the team2m', 'Build, DoneTwelve components41m', 'Review, CurrentWaiting on two reviewers', 'Ship, UpcomingPublish to npm',
    ]);
    await expect(items[2]).toHaveAttribute('aria-current', 'step');
    await expect(items.filter(item => item.hasAttribute('aria-current'))).toHaveLength(1);
    await expect(items[1].getBoundingClientRect().top).toBeGreaterThan(items[0].getBoundingClientRect().bottom - 1);
  },
};

/** The compact step track prints only the current label. */
export const Track: Story = {
  args: { variant: 'track' },
  render: args => <Surface><Stepper {...args} aria-label="Release progress" /></Surface>,
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    const tops = items.map(item => Math.round(item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2));
    await expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
    await expect(items[0]).toHaveTextContent('Plan, Done');
    await expect(items[0].querySelector('.kraft-stepper-text')).toHaveClass('kraft-visually-hidden');
    await expect(items[2].querySelector('.kraft-stepper-text')).not.toHaveClass('kraft-visually-hidden');
    await expect(canvasElement.querySelectorAll('.kraft-stepper-description')).toHaveLength(0);
  },
};

/** Every state in both forms, with renamed state words, on each material. */
export const States: Story = {
  render: () => <Stack gap={12}>
    {(['paper', 'kraft', 'cardboard'] as const).map(material => <Surface key={material} material={material}>
      <Stack gap={12}>
        <Text variant="label-sm">{material}</Text>
        <Stepper steps={blocked} statusLabels={{ blocked: 'Failed', upcoming: 'Not started' }} />
        <Stepper steps={blocked} variant="track" />
        <Stepper steps={[...steps.slice(0, 2), { ...steps[2], status: 'done' }, { ...steps[3], status: 'current' }]} variant="track" />
      </Stack>
    </Surface>)}
  </Stack>,
  play: async ({ canvasElement }) => {
    const first = canvasElement.querySelector<HTMLElement>('.kraft-stepper')!;
    await expect(within(first).getAllByRole('listitem').map(item => item.dataset.status)).toEqual(['done', 'blocked', 'upcoming']);
    await expect(first).toHaveTextContent('Test, Failed');
    await expect(first).toHaveTextContent('Deploy, Not started');
    await expect(first.querySelector('[data-status="blocked"] rect')).not.toBeNull();
    await expect(first.querySelector('[data-status="done"] circle')).not.toBeNull();
  },
};
