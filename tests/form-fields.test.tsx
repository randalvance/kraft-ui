import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FormField, InlineEdit, SearchField, Select, Textarea, TextField } from '../src';

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
    const html = renderToString(<FormField label="Server note" labelStyle="uppercase" description="Keep it short">
      <Textarea name="note" variant="ruled" mono autoGrow defaultValue="Hello" footer="5 characters" />
    </FormField>);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const textarea = doc.querySelector('textarea')!;
    expect(textarea.value).toBe('Hello');
    expect(doc.querySelector('label')?.htmlFor).toBe(textarea.id);
    expect(doc.querySelector('label')?.dataset.labelStyle).toBe('uppercase');
    expect(textarea.dataset.variant).toBe('ruled');
    expect(textarea.getAttribute('aria-describedby')?.split(' ').map(id => doc.getElementById(id)?.textContent))
      .toEqual(['Keep it short', '5 characters']);
  });

  it('keeps numeric input sizes and native refs across visual variants', () => {
    const inputRef = createRef<HTMLInputElement>();
    const fieldRef = createRef<HTMLDivElement>();
    const { rerender } = render(<FormField ref={fieldRef} label="Agent" labelStyle="uppercase">
      <TextField ref={inputRef} variant="underline" size={20} defaultValue="Curator" />
    </FormField>);
    expect(inputRef.current).toBe(screen.getByRole('textbox', { name: 'Agent' }));
    expect(fieldRef.current).toContainElement(inputRef.current);
    expect(inputRef.current).toHaveAttribute('size', '20');
    rerender(<FormField ref={fieldRef} label="Agent" labelStyle="uppercase">
      <TextField ref={inputRef} variant="underline" size="title" defaultValue="Curator" />
    </FormField>);
    expect(inputRef.current).toHaveAttribute('data-size', 'title');
    expect(inputRef.current).not.toHaveAttribute('size');
    expect(inputRef.current).toHaveValue('Curator');
  });

  it('adds a footer without replacing the native textarea or dropping its descriptions', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    const field = (footer?: string) => <form><FormField label="Notes" description="Keep it short" error="Try again">
      <Textarea ref={ref} name="notes" variant="ruled" autoGrow mono rows={2} defaultValue="Draft" footer={footer} />
    </FormField></form>;
    const { container, rerender } = render(field());
    const input = ref.current!;
    const user = userEvent.setup();
    await user.type(input, ' note');
    rerender(field('10 characters'));
    expect(input).toBe(ref.current);
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription('Keep it short Try again 10 characters');
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('notes')).toBe('Draft note');
    form.reset();
    expect(input).toHaveValue('Draft');
  });
});

describe('InlineEdit', () => {
  it('uses a named heading and native button, commits with Enter, and cancels with Escape', async () => {
    const ref = createRef<HTMLDivElement>();
    const change = vi.fn(), submit = vi.fn(), parentKeyDown = vi.fn();
    const user = userEvent.setup();
    render(<form onSubmit={submit} onKeyDown={parentKeyDown}>
      <InlineEdit ref={ref} titleAs="h2" label="Edit page title" defaultValue="Draft" onValueChange={change} />
    </form>);
    expect(ref.current).toContainElement(screen.getByRole('heading', { level: 2, name: 'Draft' }));
    expect(screen.getByRole('button', { name: /Edit page title.*Draft/ })).toHaveAttribute('type', 'button');
    await user.tab();
    const editor = screen.getByRole('textbox', { name: 'Edit page title' });
    expect(editor).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Draft' })).toBeInTheDocument();
    await user.type(editor, ' proof');
    fireEvent.keyDown(editor, { key: 'Enter', isComposing: true });
    expect(editor).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(change).toHaveBeenCalledExactlyOnceWith('Draft proof');
    expect(submit).not.toHaveBeenCalled();
    const title = screen.getByRole('button', { name: /Edit page title.*Draft proof/ });
    expect(title).toHaveFocus();
    await user.click(title);
    await user.type(screen.getByRole('textbox'), ' discarded');
    parentKeyDown.mockClear();
    await user.keyboard('{Escape}');
    expect(parentKeyDown).not.toHaveBeenCalled();
    expect(change).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: /Draft proof/ })).toHaveFocus();
  });

  it('commits on blur and lets the caller control the title without moving focus back', async () => {
    const change = vi.fn();
    const page = (value: string) => <><InlineEdit label="Edit title" value={value} onValueChange={change} />
      <button type="button">Next</button></>;
    const user = userEvent.setup();
    const { rerender } = render(page(''));
    await user.click(screen.getByRole('button', { name: /Untitled/ }));
    await user.type(screen.getByRole('textbox'), 'Proof');
    await user.tab();
    expect(change).toHaveBeenCalledExactlyOnceWith('Proof');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Untitled' })).toBeInTheDocument();
    rerender(page('Proof'));
    expect(screen.getByRole('heading', { name: 'Proof' })).toBeInTheDocument();

    await user.tab({ shift: true });
    expect(screen.getByRole('textbox')).toHaveValue('Proof');
    rerender(page('Renamed elsewhere'));
    await user.tab();
    expect(change).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { name: 'Renamed elsewhere' })).toBeInTheDocument();
  });

  it('renders an editable or disabled title on the server', () => {
    const doc = new DOMParser().parseFromString(renderToString(<>
      <InlineEdit label="Edit print title" defaultValue="Print proof" />
      <InlineEdit label="Edit locked title" defaultValue="Approved proof" titleAs="h2" disabled />
    </>), 'text/html');
    const title = doc.querySelector('h1')!;
    expect(doc.getElementById(title.getAttribute('aria-labelledby')!)?.textContent).toBe('Print proof');
    expect(title.querySelector('button')?.getAttribute('type')).toBe('button');
    expect(doc.querySelector('h2')?.textContent).toBe('Approved proof');
    expect(doc.querySelector('h2 button, input')).toBeNull();
  });
});

describe('compact Select', () => {
  const options = [{ value: 'ready', label: 'Ready', leading: <span>Icon</span>, statusDot: 'sage' }] as const;

  it('forwards its button ref and exposes the current value and description', () => {
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(<Select ref={ref} label="Status" description="For the print team" options={options}
      variant="compact" value="ready" hideLabel />);
    const trigger = screen.getByRole('combobox', { name: 'Status' });
    expect(ref.current).toBe(trigger);
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAccessibleDescription('For the print team Ready');
    expect(trigger.querySelector('[data-tone="sage"]')).toHaveAttribute('aria-hidden', 'true');
    rerender(<Select ref={ref} label="Status" options={options} variant="compact" value="" />);
    expect(trigger).toHaveAccessibleDescription('Choose an option');
    expect(trigger.querySelector('[data-tone]')).toBeNull();
  });

  it('renders the selected compact label and its marks on the server', () => {
    const html = renderToString(<Select label="Status" options={options} variant="compact" defaultValue="ready" />);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const trigger = doc.querySelector('button[role="combobox"]')!;
    expect(doc.querySelector('label')?.htmlFor).toBe(trigger.id);
    expect(doc.getElementById(trigger.getAttribute('aria-describedby')!)?.textContent).toBe('Ready');
    expect(trigger.querySelector('[data-tone="sage"]')?.getAttribute('aria-hidden')).toBe('true');
    expect(trigger.querySelector('.kraft-select-leading')?.textContent).toBe('Icon');
  });
});
