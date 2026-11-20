import { useEffect, useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import {
  Avatar, Badge, Button, FormField, FormSection, Icon, Inline, Link, PageHeader, Stack, Text, Textarea, TextField,
  Toggle, type PageHeaderProps,
} from '../src';
import portrait from './assets/avatar-dog.svg';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  args: { title: 'Edit Mochi’s profile' },
  parameters: { docs: { description: { component: 'A sticky edit-page header. Supply the back link, portrait or mark, status line, and actions as slots. Place the header above an independently scrolling form to keep the fields and their focus rings clear of the header.' } } },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

const saveMessages = { clean: 'All saved', dirty: 'Unsaved changes', saved: 'Saved' };

function SettingRow() {
  const id = useId();
  return <Inline gap={16} align="center" justify="between" wrap>
    <Stack gap={4}>
      <Text id={`${id}-name`} variant="label">Adoption inquiries</Text>
      <Text id={`${id}-note`} tone="muted">Receive messages about this profile.</Text>
    </Stack>
    <Inline gap={8}>
      <Text as="span" tone="muted" variant="label-sm">Email</Text>
      <Toggle aria-labelledby={`${id}-name`} aria-describedby={`${id}-note`} name="inquiries" defaultChecked />
    </Inline>
  </Inline>;
}

function ProfileEditor(args: PageHeaderProps) {
  const formId = useId();
  const [saveState, setSaveState] = useState<keyof typeof saveMessages>('clean');
  useEffect(() => {
    if (saveState !== 'saved') return;
    const timeout = window.setTimeout(() => setSaveState('clean'), 1600);
    return () => window.clearTimeout(timeout);
  }, [saveState]);

  return <main style={{ maxInlineSize: 680, blockSize: 394, marginInline: 'auto', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' }}>
    <PageHeader {...args}
      back={<Link href="#profiles"><Icon name="chevron-left" size={14} />All profiles</Link>}
      leading={<Avatar src={portrait} decorative size={52} tilt={-4} />}
      status={<span role="status">{saveMessages[saveState]}</span>}
      actions={<Button variant="blue" type="submit" form={formId}>Save changes</Button>}
    />
    <form id={formId} aria-label="Profile settings" style={{ overflow: 'auto', padding: 16 }}
      onChange={() => setSaveState('dirty')}
      onSubmit={event => { event.preventDefault(); setSaveState('saved'); }}>
      <Stack gap={16}>
        <FormSection title="Profile details" hint="Shown on the adoption page">
          <Stack gap={16}>
            <FormField label="Display name"><TextField name="name" defaultValue="Mochi" required /></FormField>
            <FormField label="About"><Textarea name="about" rows={4} defaultValue="Finds the sunniest spot in every room." /></FormField>
          </Stack>
        </FormSection>
        <FormSection title="Notifications" hint="For the shelter team">
          <SettingRow />
        </FormSection>
      </Stack>
    </form>
  </main>;
}

export const EditProfile: Story = {
  render: args => <ProfileEditor {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole('form', { name: 'Profile settings' });
    const header = canvas.getByRole('heading', { level: 1, name: 'Edit Mochi’s profile' }).closest('header')!;
    const link = canvas.getByRole('link', { name: 'All profiles' });
    const save = canvas.getByRole('button', { name: 'Save changes' });
    const status = canvas.getByRole('status');
    const toggle = canvas.getByRole('switch', { name: 'Adoption inquiries' });
    const headerTop = header.getBoundingClientRect().top;

    await expect(status).toHaveTextContent('All saved');
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).outlineStyle).toBe('solid');
    await userEvent.tab();
    await expect(save).toHaveFocus();
    await expect(getComputedStyle(save).outlineStyle).toBe('solid');
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: 'Display name' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAccessibleDescription('Receive messages about this profile.');
    await expect(form.scrollTop).toBeGreaterThan(0);
    await expect(header.getBoundingClientRect().top).toBeCloseTo(headerTop, 0);
    const switchBounds = toggle.closest('label')!.getBoundingClientRect();
    const bodyBounds = form.getBoundingClientRect();
    await expect(switchBounds.top).toBeGreaterThanOrEqual(bodyBounds.top);
    await expect(switchBounds.bottom).toBeLessThanOrEqual(bodyBounds.bottom);
    await userEvent.keyboard(' ');
    await expect(toggle).not.toBeChecked();
    await expect(status).toHaveTextContent('Unsaved changes');

    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    await expect(save).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(status).toHaveTextContent(/^Saved$/);
    await waitFor(() => expect(status).toHaveTextContent('All saved'), { timeout: 3500 });
  },
};

export const StickyInScrollContainer: Story = {
  args: { title: 'Profile activity' },
  render: args => <main aria-label="Profile activity" tabIndex={0} style={{ maxInlineSize: 640, blockSize: 220, overflow: 'auto' }}>
    <PageHeader {...args} />
    <ul>
      <li><Text>Profile created</Text></li>
      <li><Text>Portrait uploaded</Text></li>
      <li><Text>Profile published</Text></li>
      <li><Text>Adoption inquiries turned on</Text></li>
      <li><Text>Visiting hours added</Text></li>
      <li><Text>Foster contact updated</Text></li>
      <li><Text>Adoption listing renewed</Text></li>
    </ul>
  </main>,
  play: async ({ canvasElement }) => {
    const view = within(canvasElement);
    const scroller = view.getByRole('main', { name: 'Profile activity' });
    const header = view.getByRole('heading', { level: 1, name: 'Profile activity' }).closest('header')!;
    const top = header.getBoundingClientRect().top;
    scroller.scrollTop = scroller.scrollHeight;
    await expect(scroller.scrollTop).toBeGreaterThan(0);
    await expect(header.getBoundingClientRect().top).toBeCloseTo(top, 0);
  },
};

export const CompactWithMark: Story = {
  globals: { texture: 'off', motion: 'off', tilt: 'off' },
  args: {
    title: 'Adoption contact preferences', titleAs: 'h2', style: { maxInlineSize: 280 },
    leading: <Badge size="sm" tone="sage">Public</Badge>,
    status: 'Unsaved changes',
    actions: <><Button size="sm">Revert edits</Button><Button variant="blue" size="sm">Save changes</Button></>,
  },
  render: args => <section aria-label="Adoption settings"><PageHeader {...args} /></section>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole('heading', { level: 2, name: 'Adoption contact preferences' });
    const header = title.closest('header')!;
    await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
    await expect(canvas.getByRole('button', { name: 'Save changes' }).getBoundingClientRect().top)
      .toBeGreaterThan(title.getBoundingClientRect().bottom);
  },
};
