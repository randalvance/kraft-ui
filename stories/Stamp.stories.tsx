import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Inline, Stamp, Surface, ThemeProvider, type StampProps, type StampSize } from '../src';

const samples = [
  ['neutral', 'Yolo'],
  ['blue', 'Jira'],
  ['sage', 'Done'],
  ['danger', 'Failed'],
  ['attention', 'Welcome'],
] as const satisfies readonly (readonly [StampProps['tone'], string])[];
const sizes: StampSize[] = ['sm', 'md', 'lg'];

const meta = {
  title: 'Components/Stamp',
  component: Stamp,
  args: { children: 'Done', tone: 'sage' },
  argTypes: {
    tone: { control: 'select', options: samples.map(([tone]) => tone) },
    size: { control: 'select', options: sizes },
  },
} satisfies Meta<typeof Stamp>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Surface><Stamp {...args} /></Surface>,
};

export const TonesAndSizes: Story = {
  render: () => <Surface>
    {sizes.map(size => <Inline key={size} gap={16} wrap style={{ paddingBlock: 12 }}>
      {samples.map(([tone, word]) => <Stamp key={tone} size={size} tone={tone}
        signature={tone === 'sage' ? 'Mara' : undefined}>{word}</Stamp>)}
    </Inline>)}
  </Surface>,
};

export const Night: Story = { ...TonesAndSizes, globals: { theme: 'night' } };

export const ToggleStates: Story = {
  render: () => <Surface>
    <Inline gap={16} wrap>
      <Stamp as="button" tone="sage">Done</Stamp>
      <Stamp as="button" tone="sage" pressed signature="Mara">Done</Stamp>
      <Stamp as="button" tone="danger" disabled>Failed</Stamp>
      <Stamp as="button" tone="blue" pressed disabled>Jira</Stamp>
    </Inline>
  </Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const off = canvas.getByRole('button', { name: /^Done$/i, pressed: false });
    const on = canvas.getByRole('button', { name: /^Done Mara$/i, pressed: true });
    await expect(getComputedStyle(off.firstElementChild!).borderTopStyle).toBe('dashed');
    await expect(getComputedStyle(on.firstElementChild!).borderTopStyle).toBe('solid');
    await expect(canvas.getByRole('button', { name: /failed/i, pressed: false })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /jira/i, pressed: true })).toBeDisabled();
  },
};

function StampApproval() {
  const [pressed, setPressed] = useState(false);
  return <Stamp as="button" size="sm" tone="sage" signature="Mara" animate
    pressed={pressed} onClick={() => setPressed(value => !value)}>Done</Stamp>;
}

export const KeyboardAndPointer: Story = {
  render: () => <Surface><StampApproval /></Surface>,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: /done mara/i, pressed: false });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).outlineStyle).toBe('solid');
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};

export const DecorationOff: Story = {
  render: (_, { globals }) => <ThemeProvider theme={globals.theme} texture={false} motion={false} tilt={false}>
    <Surface>
      <Inline gap={16} wrap>
        <Stamp data-testid="flat-stamp" size="sm" tone="blue" animate>Jira</Stamp>
        <Stamp as="button" size="sm" tone="danger" animate pressed>Failed</Stamp>
      </Inline>
    </Surface>
  </ThemeProvider>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stamp = canvas.getByTestId('flat-stamp');
    const button = canvas.getByRole('button', { name: /failed/i, pressed: true });
    for (const element of [stamp, button]) {
      const impression = getComputedStyle(element.firstElementChild!);
      await expect(impression.rotate).toBe('0deg');
      await expect(impression.animationDuration).toBe('0s');
      await expect(impression.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    }
    await expect(getComputedStyle(stamp.closest('.kraft-surface')!).backgroundImage).not.toContain('url(');
  },
};
