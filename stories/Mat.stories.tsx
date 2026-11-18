import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, Heading, Inline, Mat, Pinwheel, Stack, Tape, Text } from '../src';

const meta = {
  title: 'Primitives/Mat',
  component: Mat,
  argTypes: { tone: { control: 'select', options: ['kraft', 'amber', 'sage'] } },
  args: {
    as: 'section',
    'aria-label': 'Workshop notes',
    style: { maxWidth: 400 },
    children: <Stack gap={8}><Heading>Workshop notes</Heading><Text>Ideas from the first sketch.</Text></Stack>,
  },
} satisfies Meta<typeof Mat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Kraft: Story = {};

export const Amber: Story = {
  args: {
    tone: 'amber',
    'aria-label': 'Proof ready for review',
    children: <Stack gap={12} align="start">
      <Tape placement="top-right" />
      <Heading>Proof ready for review</Heading>
      <Button variant="attention">Review proof</Button>
    </Stack>,
  },
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', { name: 'Proof ready for review' });
    const button = within(region).getByRole('button', { name: 'Review proof' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).outlineStyle).toBe('solid');
  },
};

export const Sage: Story = {
  args: {
    tone: 'sage',
    'aria-label': 'Approved proof',
    children: <Stack gap={8}><Heading>Approved proof</Heading><Text>The proof is ready to print.</Text></Stack>,
  },
};

export const Working: Story = {
  args: {
    'aria-label': 'Print job',
    children: <Inline role="status" gap={6}><Pinwheel /><Text as="span">Preparing the proof…</Text></Inline>,
  },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');
    await expect(status).toHaveTextContent('Preparing the proof…');
    await expect(status.querySelector('.kraft-pinwheel')).toHaveAttribute('aria-hidden', 'true');
  },
};
