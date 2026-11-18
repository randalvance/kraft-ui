import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { CodeBlock } from '../src';

const source = `import { Surface } from '@randalvance/kraft-ui';

export function Note({ children }) {
  return <Surface padding={16}>{children}</Surface>;
}`;

const meta = {
  title: 'Components/Code block',
  component: CodeBlock,
  parameters: { docs: { description: { component: 'A recessed monospaced well for source code, with an optional language label, copy button, line numbers, and added or removed line marks. Marked lines use native `ins` and `del` elements and show a + or − sign as well as a tint.' } } },
  args: { code: source },
  decorators: [Story => <div style={{ maxWidth: 640 }}><Story /></div>],
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  play: async ({ canvasElement }) => {
    const pre = canvasElement.querySelector('pre')!;
    await expect(getComputedStyle(pre).fontFamily).toContain('Courier');
    await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  },
};

export const WithLanguage: Story = { args: { language: 'tsx' } };

export const Copyable: Story = {
  args: { language: 'tsx', copyable: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const write = spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    try {
      const button = canvas.getByRole('button', { name: 'Copy code' });
      button.focus();
      await expect(getComputedStyle(button).outlineStyle).toBe('solid');
      await userEvent.keyboard('{Enter}');
      await expect(write).toHaveBeenCalledWith(args.code);
      await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Copied'));
    } finally {
      write.mockRestore();
    }
  },
};

export const CopyFailed: Story = {
  args: { copyable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const write = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Denied'));
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy code' }));
      await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Copy failed'));
    } finally {
      write.mockRestore();
    }
  },
};

export const LineNumbers: Story = {
  args: { language: 'tsx', lineNumbers: true },
  play: async ({ canvasElement }) => {
    const numbers = canvasElement.querySelectorAll('.kraft-code-line-number');
    await expect(numbers).toHaveLength(5);
    await expect(numbers[0]).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(numbers[4], '::before').content).toBe('"5"');
    await expect(canvasElement.querySelector('code')!.textContent).toBe(source.replaceAll('\n', ''));
  },
};

export const Diff: Story = {
  args: {
    language: 'diff', lineNumbers: true, copyable: true, added: [4], removed: [3],
    code: `export function Note({ children }) {
  return (
    <div className="note">{children}</div>
    <Surface padding={16}>{children}</Surface>
  );
}`,
  },
  play: async ({ canvasElement }) => {
    const inserted = canvasElement.querySelector('ins')!;
    const deleted = canvasElement.querySelector('del')!;
    await expect(inserted).toHaveTextContent('<Surface padding={16}>{children}</Surface>');
    await expect(deleted).toHaveTextContent('<div className="note">{children}</div>');
    await expect(getComputedStyle(inserted, '::before').content).toContain('+');
    await expect(getComputedStyle(deleted, '::before').content).toContain('−');
    await expect(getComputedStyle(inserted).textDecorationLine).toBe('none');
    await expect(getComputedStyle(deleted).textDecorationLine).toBe('none');
  },
};

export const Overflowing: Story = {
  args: {
    language: 'shell', scrollLabel: 'Install command',
    code: 'npm install @randalvance/kraft-ui @fontsource-variable/fraunces @fontsource-variable/nunito @fontsource/caveat react react-dom',
  },
  decorators: [Story => <div style={{ maxWidth: 320 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = await canvas.findByRole('region', { name: 'Install command' });
    await expect(region).toHaveAttribute('tabindex', '0');
    await userEvent.tab();
    await expect(region).toHaveFocus();
    await expect(getComputedStyle(region).outlineStyle).toBe('solid');
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
  },
};
