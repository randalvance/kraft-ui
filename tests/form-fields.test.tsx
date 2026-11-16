import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FormField, SearchField, Textarea, TextField } from '../src';

describe('form fields', () => {
  it('links the label, hint, and error to a native input', async () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<><span id="outside">From the workspace</span><FormField label="Agent name" description="Shown in sessions" error="It needs a name" controlId="agent-name">
      <TextField ref={ref} name="agent" required aria-describedby="outside" />
    </FormField></>);
    const input = screen.getByRole('textbox', { name: 'Agent name' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('id', 'agent-name');
    expect(input).toHaveAccessibleDescription('From the workspace Shown in sessions It needs a name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    await userEvent.click(screen.getByText('Agent name'));
    expect(input).toHaveFocus();
    rerender(<><span id="outside">From the workspace</span><FormField label="Agent name" description="Shown in sessions" controlId="agent-name">
      <TextField ref={ref} name="agent" required aria-describedby="outside" />
    </FormField></>);
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('From the workspace Shown in sessions');
  });

  it('keeps native values, validation, and form submission', async () => {
    const { container } = render(<form>
      <FormField label="Email"><TextField type="email" name="email" defaultValue="hello@example.com" required /></FormField>
      <FormField label="Notes"><Textarea name="notes" defaultValue="Paper and ink" rows={2} /></FormField>
      <FormField label="Filter"><SearchField name="query" defaultValue="drafts" /></FormField>
    </form>);
    const form = container.querySelector('form')!;
    expect(form.checkValidity()).toBe(true);
    expect(Object.fromEntries(new FormData(form))).toEqual({ email: 'hello@example.com', notes: 'Paper and ink', query: 'drafts' });
    await userEvent.clear(screen.getByRole('textbox', { name: 'Email' }));
    expect(form.checkValidity()).toBe(false);
  });

  it('supports standalone labels, refs, and disabled fields', async () => {
    const searchRef = createRef<HTMLInputElement>();
    const textareaRef = createRef<HTMLTextAreaElement>();
    render(<>
      <label htmlFor="title">Title</label><TextField id="title" defaultValue="Draft" />
      <SearchField ref={searchRef} aria-label="Search notes" placeholder="Find notes" />
      <Textarea ref={textareaRef} aria-label="Description" disabled defaultValue="Saved text" />
    </>);
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Draft');
    expect(searchRef.current).toBe(screen.getByRole('searchbox', { name: 'Search notes' }));
    await userEvent.type(searchRef.current!, 'ideas');
    expect(searchRef.current).toHaveValue('ideas');
    expect(textareaRef.current).toBeDisabled();
    expect(textareaRef.current).toHaveValue('Saved text');
  });

  it('renders labelled form controls on the server', () => {
    const html = renderToString(<FormField label="Server note" description="Keep it short"><Textarea name="note" defaultValue="Hello" /></FormField>);
    expect(html).toContain('<label');
    expect(html).toContain('aria-describedby=');
    expect(html).toContain('Hello</textarea>');
  });
});
