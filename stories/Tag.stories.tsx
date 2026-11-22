import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Icon, Inline, Stack, Surface, Tag, Text, type TagVariant } from '../src';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  args: { children: 'KW-19', variant: 'kraft' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['kraft', 'paper'] satisfies TagVariant[] },
    leading: { control: false },
  },
} satisfies Meta<typeof Tag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Surface><Tag {...args} /></Surface>,
};

function TagSamples() {
  return <Surface>
    <Stack align="start" gap={12}>
      <Inline gap={8} wrap>
        <Tag tilt={-3}>KW-19</Tag>
        <Tag leading={<Icon name="branch" />}>main</Tag>
        <Tag>Claude Sonnet</Tag>
        <Tag as="a" href="#pull-request">PR #42</Tag>
      </Inline>
      <Inline gap={8} wrap>
        <Tag variant="paper" swatch="var(--kraft-teal)">Print Studio</Tag>
        <Tag variant="paper" swatch="var(--kraft-plum)" tilt={2}>Editorial</Tag>
        <Tag variant="paper" as="button" disabled swatch="var(--kraft-ochre)">Archive</Tag>
      </Inline>
    </Stack>
  </Surface>;
}

export const Forms: Story = {
  render: () => <TagSamples />,
  play: async ({ canvasElement }) => {
    const kraft = canvasElement.querySelector('.kraft-tag[data-variant="kraft"]')!;
    const paper = canvasElement.querySelector('.kraft-tag[data-variant="paper"]')!;
    await expect(getComputedStyle(kraft, '::after').maskImage).toContain('radial-gradient');
    await expect(getComputedStyle(kraft, '::after').clipPath).toContain('polygon');
    await expect(getComputedStyle(kraft).fontFamily).toContain('Courier');
    await expect(getComputedStyle(paper.querySelector('.kraft-tag-swatch')!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};

function TruncatedTags() {
  const [workspace, setWorkspace] = useState(true);
  const branchTarget = useRef<HTMLAnchorElement>(null);

  return <Surface>
    <Stack gap={8} align="start" style={{ maxInlineSize: 180 }}>
      <Tag as="a" ref={branchTarget} href="#branch" leading={<Icon name="branch" />}>feature/replace-cardboard-workspace-summaries</Tag>
      {workspace && <Tag variant="paper" swatch="var(--kraft-teal)" onRemove={() => {
        branchTarget.current?.focus();
        setWorkspace(false);
      }} removeLabel="Remove Print Studio and Production Proofs">Print Studio and Production Proofs</Tag>}
    </Stack>
  </Surface>;
}

export const Truncation: Story = {
  render: () => <TruncatedTags />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'feature/replace-cardboard-workspace-summaries' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove Print Studio and Production Proofs' })).toBeVisible();
    for (const label of canvasElement.querySelectorAll('.kraft-tag-label')) {
      const css = getComputedStyle(label);
      await expect(css.textOverflow).toBe('ellipsis');
      await expect(css.whiteSpace).toBe('nowrap');
      await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    }
  },
};

const followLink = fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
const openWorkspace = fn();
const openArchive = fn();

export const KeyboardAndPointer: Story = {
  render: () => <Surface>
    <Inline gap={8} wrap>
      <Tag as="a" href="#pull-request" onClick={followLink}>PR #42</Tag>
      <Tag as="button" variant="paper" swatch="var(--kraft-teal)" onClick={openWorkspace}>Print Studio</Tag>
      <Tag as="button" disabled onClick={openArchive}>Archive</Tag>
    </Inline>
  </Surface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'PR #42' });
    const button = canvas.getByRole('button', { name: 'Print Studio' });
    const disabled = canvas.getByRole('button', { name: 'Archive' });
    for (const target of [link, button]) {
      await userEvent.tab();
      await expect(target).toHaveFocus();
      await expect(getComputedStyle(target).outlineStyle).toBe('solid');
      await userEvent.keyboard('{Enter}');
    }
    await expect(followLink).toHaveBeenCalledOnce();
    await userEvent.keyboard(' ');
    await userEvent.click(button);
    await expect(openWorkspace).toHaveBeenCalledTimes(3);
    await expect(disabled).toBeDisabled();
    await userEvent.tab();
    await expect(disabled).not.toHaveFocus();
    await expect(openArchive).not.toHaveBeenCalled();
  },
};

const openTicket = fn();

function TagSlips() {
  const [ticket, setTicket] = useState(true);
  const [workspace, setWorkspace] = useState(true);
  const workspaceTarget = useRef<HTMLButtonElement>(null);
  const restore = useRef<HTMLButtonElement>(null);

  return <Surface>
    <Stack align="start" gap={12}>
      <Inline gap={8} wrap>
        {ticket && <Tag as="button" onClick={openTicket} removeLabel="Remove KW-19" onRemove={() => {
          (workspaceTarget.current ?? restore.current)?.focus();
          setTicket(false);
        }}>KW-19</Tag>}
        {workspace && <Tag as="button" ref={workspaceTarget} variant="paper" swatch="var(--kraft-plum)"
          removeLabel="Remove Editorial" onRemove={() => {
            restore.current?.focus();
            setWorkspace(false);
          }}>Editorial</Tag>}
        <Tag as="button" ref={restore} variant="paper" onClick={() => {
          setTicket(true);
          setWorkspace(true);
        }}>Restore tags</Tag>
      </Inline>
      <Text role="status">{Number(ticket) + Number(workspace)} tags attached</Text>
    </Stack>
  </Surface>;
}

export const Removable: Story = {
  render: () => <TagSlips />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ticket = canvas.getByRole('button', { name: 'KW-19' });
    const removeTicket = canvas.getByRole('button', { name: 'Remove KW-19' });
    const workspace = canvas.getByRole('button', { name: 'Editorial' });
    const restore = canvas.getByRole('button', { name: 'Restore tags' });
    await userEvent.tab();
    await expect(ticket).toHaveFocus();
    await userEvent.tab();
    await expect(removeTicket).toHaveFocus();
    await expect(getComputedStyle(removeTicket).outlineStyle).toBe('solid');
    await expect(removeTicket.getBoundingClientRect().width).toBeGreaterThanOrEqual(24);
    await expect(removeTicket.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    await userEvent.keyboard(' ');
    await expect(ticket).not.toBeInTheDocument();
    await expect(openTicket).not.toHaveBeenCalled();
    await expect(workspace).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Editorial' }));
    await expect(restore).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('0 tags attached');
  },
};

export const DecorationOff: Story = {
  globals: { texture: 'off', motion: 'off', tilt: 'off' },
  render: () => <TagSamples />,
  play: async ({ canvasElement }) => {
    for (const tag of canvasElement.querySelectorAll('.kraft-tag')) {
      const face = getComputedStyle(tag, '::after');
      await expect(getComputedStyle(tag).rotate).toBe('0deg');
      await expect(face.backgroundImage).toBe('none');
      await expect(face.transitionDuration).toBe('0s');
    }
  },
};
