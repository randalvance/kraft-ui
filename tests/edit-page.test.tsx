import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, FormField, FormSection, Link, PageHeader, TextField } from '../src';

describe('FormSection', () => {
  it('labels the native section, forwards native props and ref, and groups form controls', () => {
    const ref = createRef<HTMLElement>();
    render(<form aria-label="Profile">
      <FormSection ref={ref} title="Profile details" hint="Shown on your profile" id="details" className="details">
        <FormField label="Display name"><TextField name="displayName" defaultValue="Mochi" /></FormField>
      </FormSection>
    </form>);

    const section = screen.getByRole('region', { name: 'Profile details' });
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveAttribute('id', 'details');
    expect(section).toHaveClass('details');
    expect(ref.current).toBe(section);
    expect(within(section).getByRole('heading', { level: 2, name: 'Profile details' })).toBeVisible();
    expect(within(section).getByText('Shown on your profile')).toBeVisible();
    expect(within(section).getByRole('textbox', { name: 'Display name' })).toHaveValue('Mochi');
    expect(new FormData(screen.getByRole<HTMLFormElement>('form', { name: 'Profile' })).get('displayName')).toBe('Mochi');
  });

  it('honors explicit naming and preserves the chosen nested heading levels', () => {
    render(<>
      <p id="delivery-label">Delivery preferences</p>
      <FormSection title="Notifications" aria-label="Notification settings">
        <FormSection title="Email" titleAs="h3" aria-labelledby="delivery-label" />
      </FormSection>
    </>);

    const outer = screen.getByRole('region', { name: 'Notification settings' });
    const nested = within(outer).getByRole('region', { name: 'Delivery preferences' });
    expect(within(outer).getByRole('heading', { level: 2, name: 'Notifications' })).toBeVisible();
    expect(within(nested).getByRole('heading', { level: 3, name: 'Email' })).toBeVisible();
  });
});

describe('PageHeader', () => {
  it('forwards the native header attributes and ref and keeps slot controls native', () => {
    const ref = createRef<HTMLElement>();
    render(<main>
      <PageHeader ref={ref} title="Edit profile" id="edit-heading" className="editor"
        back={<Link href="/profiles">All profiles</Link>}
        leading={<img src="/mochi.png" alt="Mochi" />}
        status={<span role="status">All saved</span>}
        actions={<Button type="submit" form="profile">Save changes</Button>} />
      <form id="profile" aria-label="Profile" />
    </main>);

    const heading = screen.getByRole('heading', { level: 1, name: 'Edit profile' });
    const header = heading.closest('header');
    expect(ref.current).toBe(header);
    expect(header).toHaveAttribute('id', 'edit-heading');
    expect(header).toHaveClass('editor');
    expect(header?.parentElement).toBe(screen.getByRole('main'));
    expect(screen.getByRole('link', { name: 'All profiles' })).toHaveAttribute('href', '/profiles');
    expect(screen.getByRole('img', { name: 'Mochi' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('All saved');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save changes' }).form).toBe(screen.getByRole('form'));
  });
});

it('server-renders the header and distinct name references for nested sections', () => {
  const html = renderToString(<main>
    <PageHeader title="Edit profile" titleAs="h2" />
    <FormSection title="Notifications" titleAs="h3">
      <FormSection title="Email" titleAs="h4" />
    </FormSection>
  </main>);
  const { getByRole } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
  const server = getByRole('main');
  const view = within(server);
  expect(view.getByRole('heading', { level: 2 }).closest('header')).toBe(server.firstElementChild);
  const outer = view.getByRole('region', { name: 'Notifications' });
  const nested = within(outer).getByRole('region', { name: 'Email' });
  const outerHeading = within(outer).getByRole('heading', { level: 3 });
  const innerHeading = within(nested).getByRole('heading', { level: 4 });
  expect(outer).toHaveAttribute('aria-labelledby', outerHeading.id);
  expect(nested).toHaveAttribute('aria-labelledby', innerHeading.id);
  expect(outerHeading.id).not.toBe(innerHeading.id);
});
