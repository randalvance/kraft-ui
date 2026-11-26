import { createRef, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FormField, TagInput } from '../src';

describe('TagInput', () => {
  it('is a native text input beside a named list of slips, and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TagInput ref={ref} aria-label="Labels" defaultValue={['design', 'paper']} placeholder="Add a label" id="labels"
      className="wide" inputClassName="narrow" style={{ maxInlineSize: 300 }} inputStyle={{ minInlineSize: 40 }} data-app="desk" />);
    const input = screen.getByRole('textbox', { name: 'Labels' });
    expect(input).toBe(ref.current);
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('id', 'labels');
    expect(input).toHaveAttribute('placeholder', 'Add a label');
    expect(input).toHaveAttribute('data-app', 'desk');
    expect(input).toHaveClass('kraft-tag-input-field', 'narrow');
    expect(input).toHaveStyle({ minInlineSize: '40px' });
    const field = input.closest('.kraft-tag-input')!;
    expect(field).toHaveClass('wide');
    expect(field).toHaveStyle({ maxInlineSize: '300px' });
    const list = screen.getByRole('list', { name: 'Tags' });
    expect(within(list).getAllByRole('listitem').map(item => item.textContent)).toEqual(['design', 'paper']);
    expect(screen.getAllByRole('button').map(button => button.getAttribute('aria-label'))).toEqual(['Remove design', 'Remove paper']);
  });

  it('adds on Enter and on a comma, trims, splits pasted lists, and drops duplicates', async () => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Labels" defaultValue={['design']} onValueChange={onValueChange} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    await user.type(input, '  paper {Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['design', 'paper']);
    expect(input).toHaveValue('');
    await user.type(input, 'kraft,');
    expect(onValueChange).toHaveBeenLastCalledWith(['design', 'paper', 'kraft']);
    await user.click(input);
    await user.paste('night, paper,, board');
    expect(onValueChange).toHaveBeenLastCalledWith(['design', 'paper', 'kraft', 'night', 'board']);
    await user.type(input, 'design{Enter}');
    expect(onValueChange).toHaveBeenCalledTimes(3);
    expect(input).toHaveValue('');
  });

  it('lets Enter submit the form when nothing is typed, and submits each slip under the name', async () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      return new FormData(event.currentTarget).getAll('label');
    });
    render(<form onSubmit={onSubmit}><TagInput aria-label="Labels" name="label" defaultValue={['design']} /><button type="submit">Save</button></form>);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('name');
    await user.type(input, 'paper{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveReturnedWith(['design', 'paper']);
  });

  it('moves to the last slip on Backspace in the empty field, and moves focus sensibly after a removal', async () => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Labels" defaultValue={['a', 'b', 'c']} onValueChange={onValueChange} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    await user.type(input, 'x{Backspace}');
    expect(input).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(screen.getByRole('button', { name: 'Remove c' })).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Remove a' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['b', 'c']);
    expect(screen.getByRole('button', { name: 'Remove b' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Remove c' }));
    expect(screen.getByRole('button', { name: 'Remove b' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(input).toHaveFocus();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('follows a controlled value, custom labels, and the kraft variant', async () => {
    function Demo({ accept }: { accept: boolean }) {
      const [value, setValue] = useState(['Mina']);
      return <TagInput aria-label="Reviewers" value={value} onValueChange={next => { if (accept) setValue(next); }}
        variant="kraft" tagsLabel="Reviewers" removeLabel={person => `Remove reviewer ${person}`} />;
    }
    const { rerender } = render(<Demo accept={false} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'Pip{Enter}');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    rerender(<Demo accept />);
    await user.type(screen.getByRole('textbox'), 'Pip{Enter}');
    expect(within(screen.getByRole('list', { name: 'Reviewers' })).getAllByRole('listitem').map(item => item.textContent)).toEqual(['Mina', 'Pip']);
    expect(screen.getByRole('button', { name: 'Remove reviewer Pip' })).toBeInTheDocument();
    expect(document.querySelector('.kraft-tag')).toHaveAttribute('data-variant', 'kraft');
  });

  it('removes one slip at a time when a controlled value repeats a tag', async () => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Labels" value={['a', 'a', 'b']} onValueChange={onValueChange} />);
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'Remove a' })[1]);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(['a', 'b']);
  });

  it('takes its label, description, and error from FormField', () => {
    render(<FormField label="Labels" description="Enter adds one" error="Add at least one"><TagInput /></FormField>);
    const input = screen.getByRole('textbox', { name: 'Labels' });
    expect(input).toHaveAccessibleDescription('Enter adds one Add at least one');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the field and its slips', async () => {
    const onValueChange = vi.fn();
    render(<form><TagInput aria-label="Labels" name="label" disabled defaultValue={['locked']} onValueChange={onValueChange} /></form>);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('listitem')).toHaveTextContent('locked');
    expect(new FormData(document.querySelector('form')!).getAll('label')).toEqual([]);
    await userEvent.setup().click(screen.getByText('locked'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders on the server', () => {
    const html = renderToString(<FormField label="Labels"><TagInput name="label" defaultValue={['design']} /></FormField>);
    expect(html).toContain('aria-label="Remove design"');
    expect(html).toContain('type="hidden"');
    expect(html).toContain('value="design"');
  });
});
