import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Breadcrumb, Stack, Surface, type BreadcrumbItem } from '../src';

const items: BreadcrumbItem[] = [
  { label: 'Workspaces', href: '#workspaces' },
  { label: 'Print Studio', href: '#print-studio' },
  { label: 'Boards', href: '#boards' },
  { label: 'Autumn catalogue' },
];

const meta = {
  title: 'Components/Breadcrumb', component: Breadcrumb,
  parameters: { docs: { description: { component: 'The trail of pages above the current one: an ordered list in a navigation landmark named by `label`. Each item is a link when it has an `href` and plain text otherwise. The last item is the current page unless another sets `current`; it has `aria-current="page"` and prints in ink. Separators are decorative and reverse in right-to-left text. `linkAs` renders links with a router component.' } } },
  args: { items },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Surface><Breadcrumb {...args} /></Surface>,
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Breadcrumb' });
    await expect(within(nav).getAllByRole('listitem')).toHaveLength(4);
    await expect(within(nav).getAllByRole('link').map(link => link.textContent)).toEqual(['Workspaces', 'Print Studio', 'Boards']);
    const current = within(nav).getByText('Autumn catalogue');
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(nav.querySelectorAll('.kraft-breadcrumb-separator[aria-hidden="true"]')).toHaveLength(3);
    await userEvent.tab();
    await expect(within(nav).getByRole('link', { name: 'Workspaces' })).toHaveFocus();
    await expect(getComputedStyle(within(nav).getByRole('link', { name: 'Workspaces' })).outlineStyle).toBe('solid');
  },
};

const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(function RouterLink(props, ref) {
  return <a {...props} ref={ref} data-router="" />;
});

/** A linked current page, a custom link component, a narrow trail that wraps, right to left, and other materials. */
export const Variants: Story = {
  render: () => <Stack gap={12}>
    <Surface><Stack gap={12}>
      <Breadcrumb label="Linked current page" items={[{ label: 'Home', href: '#home' }, { label: 'Settings', href: '#settings', current: true }]} />
      <Breadcrumb label="Router links" linkAs={RouterLink} items={items} />
      <div style={{ inlineSize: 220 }}><Breadcrumb label="Narrow" items={items} /></div>
      <div dir="rtl"><Breadcrumb label="Right to left" items={items.slice(0, 3)} /></div>
      <Breadcrumb label="Single" items={[{ label: 'Home' }]} />
    </Stack></Surface>
    <Surface material="kraft"><Breadcrumb label="On kraft" items={items} /></Surface>
    <Surface material="cardboard"><Breadcrumb label="On cardboard" items={items} /></Surface>
  </Stack>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(within(canvas.getByRole('navigation', { name: 'Linked current page' })).getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('navigation', { name: 'Router links' }).querySelectorAll('a[data-router]')).toHaveLength(3);
    const narrow = canvas.getByRole('navigation', { name: 'Narrow' });
    await expect(narrow.scrollWidth).toBeLessThanOrEqual(narrow.clientWidth);
    await expect(canvas.getByRole('navigation', { name: 'Single' }).querySelector('.kraft-breadcrumb-separator')).toBeNull();
    await expect(getComputedStyle(canvas.getByRole('navigation', { name: 'Right to left' }).querySelector('.kraft-nav-chevron')!).rotate).toBe('180deg');
  },
};
