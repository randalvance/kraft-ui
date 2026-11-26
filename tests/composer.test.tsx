import { createRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Composer, FormField, IconButton, Kbd } from '../src';

describe('Composer', () => {
  it('wraps one native textarea and forwards the ref and native attributes to it', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { container } = render(<Composer ref={ref} aria-label="Message" id="prompt" name="prompt" placeholder="Ask away"
      maxLength={400} data-app="desk" className="wide" style={{ width: 320 }} textareaClassName="text" textareaStyle={{ color: 'red' }} />);
    const text = screen.getByRole('textbox', { name: 'Message' });
    expect(ref.current).toBe(text);
    expect(text.tagName).toBe('TEXTAREA');
    expect(container.querySelectorAll('textarea')).toHaveLength(1);
    expect(text).toHaveAttribute('id', 'prompt');
    expect(text).toHaveAttribute('name', 'prompt');
    expect(text).toHaveAttribute('placeholder', 'Ask away');
    expect(text).toHaveAttribute('maxlength', '400');
    expect(text).toHaveAttribute('data-app', 'desk');
    expect(text).toHaveAttribute('rows', '2');
    expect(text).toHaveAttribute('data-auto-grow', 'true');
    expect(text).toHaveClass('kraft-composer-input', 'kraft-textarea', 'text');
    expect(text).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    const frame = container.firstElementChild!;
    expect(frame).toHaveClass('kraft-composer', 'wide');
    expect(frame).toHaveStyle({ width: '320px' });
    expect(frame).not.toHaveAttribute('role');
    expect(frame).not.toHaveAttribute('data-app');
  });

  it('sends on Enter, starts a new line on Shift+Enter, and describes the text with the key hints', async () => {
    const onSend = vi.fn(), onKeyDown = vi.fn();
    render(<><span id="note">Sent to the desk</span><Composer aria-label="Message" aria-describedby="note" onSend={onSend} onKeyDown={onKeyDown} /></>);
    const text = screen.getByRole('textbox', { name: 'Message' });
    expect(text).toHaveAccessibleDescription('Sent to the desk Enter to send Shift+Enter for a new line');
    expect([...document.querySelectorAll('.kraft-composer-hints kbd.kraft-kbd')].map(key => key.textContent)).toEqual(['Enter', 'Shift', 'Enter']);
    await userEvent.type(text, '{Enter}');
    expect(onSend).not.toHaveBeenCalled();
    expect(text).toHaveValue('');
    await userEvent.type(text, 'One{Shift>}{Enter}{/Shift}two');
    expect(text).toHaveValue('One\ntwo');
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledExactlyOnceWith('One\ntwo');
    expect(text).toHaveValue('One\ntwo');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('leaves Enter alone during composition, when the application handles it, and for blank text', async () => {
    const onSend = vi.fn();
    const { rerender } = render(<Composer aria-label="Message" onSend={onSend} defaultValue="かな" />);
    const text = screen.getByRole('textbox', { name: 'Message' });
    expect(fireEvent.keyDown(text, { key: 'Enter', isComposing: true })).toBe(true);
    expect(fireEvent.keyDown(text, { key: 'Enter', keyCode: 229 })).toBe(true);
    expect(fireEvent.keyDown(text, { key: 'Enter', altKey: true })).toBe(true);
    expect(onSend).not.toHaveBeenCalled();
    rerender(<Composer aria-label="Message" onSend={onSend} defaultValue="かな" onKeyDown={event => event.preventDefault()} />);
    fireEvent.keyDown(text, { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    rerender(<Composer aria-label="Message" onSend={onSend} defaultValue="かな" />);
    await userEvent.clear(text);
    await userEvent.type(text, '   ');
    expect(fireEvent.keyDown(text, { key: 'Enter' })).toBe(false);
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('sends on Ctrl+Enter or Command+Enter with submitKey="mod-enter" and only from the disc with "none"', async () => {
    const onSend = vi.fn();
    const { rerender } = render(<Composer aria-label="Message" submitKey="mod-enter" onSend={onSend} />);
    const text = screen.getByRole('textbox', { name: 'Message' });
    expect(text).toHaveAccessibleDescription('Ctrl+Enter to send Enter for a new line');
    await userEvent.type(text, 'One{Enter}two');
    expect(text).toHaveValue('One\ntwo');
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    await userEvent.keyboard('{Meta>}{Enter}{/Meta}');
    expect(onSend).toHaveBeenCalledTimes(2);
    expect(onSend).toHaveBeenLastCalledWith('One\ntwo');

    rerender(<Composer aria-label="Message" submitKey="none" onSend={onSend} />);
    expect(text).not.toHaveAttribute('aria-describedby');
    expect(document.querySelector('.kraft-composer-hints')).toBeNull();
    await userEvent.type(text, '{Control>}{Enter}{/Control}');
    expect(onSend).toHaveBeenCalledTimes(2);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).toHaveBeenCalledTimes(3);
  });

  it('enables the send disc only while there is text and returns focus to the text after sending', async () => {
    function Controlled({ onSend }: { onSend: (value: string) => void }) {
      const [value, setValue] = useState('');
      return <Composer aria-label="Message" sendLabel="Post" value={value} onChange={event => setValue(event.currentTarget.value)}
        onSend={text => { onSend(text); setValue(''); }} />;
    }
    const onSend = vi.fn();
    render(<Controlled onSend={onSend} />);
    const text = screen.getByRole('textbox', { name: 'Message' });
    const send = screen.getByRole('button', { name: 'Post' });
    expect(send).toHaveAttribute('type', 'button');
    expect(send).toBeDisabled();
    await userEvent.type(text, 'Hello');
    expect(send).toBeEnabled();
    await userEvent.click(send);
    expect(onSend).toHaveBeenCalledExactlyOnceWith('Hello');
    expect(text).toHaveValue('');
    expect(send).toBeDisabled();
    expect(text).toHaveFocus();
  });

  it('submits a surrounding form from the keyboard and the send disc, with native validation', async () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      return Object.fromEntries(new FormData(event.currentTarget));
    });
    const { container } = render(<form onSubmit={onSubmit}>
      <Composer aria-label="Message" name="prompt" required />
      <button type="reset">Clear</button>
    </form>);
    const form = container.querySelector('form')!;
    const text = screen.getByRole('textbox', { name: 'Message' });
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toBeDisabled();
    await userEvent.type(text, 'Post the parcel{Enter}');
    expect(send).toBeEnabled();
    await userEvent.click(send);
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveLastReturnedWith({ prompt: 'Post the parcel' });
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(send).toBeDisabled());
    expect(form.checkValidity()).toBe(false);
    await userEvent.type(text, '{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('turns off the text and the send disc when disabled', async () => {
    const onSend = vi.fn();
    const { container } = render(<Composer aria-label="Message" disabled defaultValue="Closed" onSend={onSend} />);
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(container.firstElementChild).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('keeps the text editable and holds sending while busy', async () => {
    const onSend = vi.fn();
    const { container, rerender } = render(<Composer aria-label="Message" busy defaultValue="Next" onSend={onSend} />);
    const text = screen.getByRole('textbox', { name: 'Message' });
    const send = screen.getByRole('button', { name: 'Send' });
    expect(container.firstElementChild).toHaveAttribute('data-busy', 'true');
    expect(text).toBeEnabled();
    expect(send).toBeDisabled();
    expect(send).toHaveAttribute('aria-busy', 'true');
    expect(send.querySelector('.kraft-pinwheel')).not.toBeNull();
    await userEvent.type(text, ' up{Enter}');
    expect(text).toHaveValue('Next up');
    expect(onSend).not.toHaveBeenCalled();
    rerender(<Composer aria-label="Message" defaultValue="Next" onSend={onSend} />);
    expect(send).toBeEnabled();
    expect(send).not.toHaveAttribute('aria-busy', 'true');
    await userEvent.type(text, '{Enter}');
    expect(onSend).toHaveBeenCalledExactlyOnceWith('Next up');
  });

  it('places the mic, a replacement send action, custom hints, and a named bar', async () => {
    const stop = vi.fn();
    const { container, rerender } = render(<Composer aria-label="Message" barLabel="Message options"
      bar={<button type="button">Model</button>}
      mic={<IconButton aria-label="Dictate"><svg /></IconButton>}
      send={<IconButton aria-label="Stop" onClick={stop}><svg /></IconButton>}
      hints={<span><Kbd size="sm">/</Kbd> for commands</span>} />);
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveAccessibleDescription('/ for commands');
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    expect([...container.querySelectorAll('.kraft-composer-actions > button')].map(button => button.getAttribute('aria-label'))).toEqual(['Dictate', 'Stop']);
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(stop).toHaveBeenCalledTimes(1);
    const options = screen.getByRole('group', { name: 'Message options' });
    expect(options).toHaveClass('kraft-composer-bar');
    expect(options).toContainElement(screen.getByRole('button', { name: 'Model' }));
    expect(container.querySelector('.kraft-composer-sheet')).not.toContainElement(options);

    rerender(<Composer aria-label="Message" bar={<button type="button">Model</button>} hints={null} send={null} />);
    expect(container.querySelector('.kraft-composer-bar')).not.toHaveAttribute('role');
    expect(container.querySelector('.kraft-composer-footer')).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Message' })).not.toHaveAttribute('aria-describedby');
  });

  it('takes its name, hint, and error from a FormField', async () => {
    render(<FormField label="Reply" description="Sent to the desk" error="Write a reply">
      <Composer />
    </FormField>);
    const text = screen.getByRole('textbox', { name: 'Reply' });
    expect(text).toHaveAccessibleDescription('Enter to send Shift+Enter for a new line Sent to the desk Write a reply');
    expect(text).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByText('Reply'));
    expect(text).toHaveFocus();
  });

  it('focuses the text when the paper is pressed, but not from an action', () => {
    const { container } = render(<Composer aria-label="Message" mic={<IconButton aria-label="Dictate"><svg /></IconButton>} />);
    const text = screen.getByRole('textbox', { name: 'Message' });
    expect(fireEvent.mouseDown(container.querySelector('.kraft-composer-hints')!)).toBe(false);
    expect(text).toHaveFocus();
    text.blur();
    expect(fireEvent.mouseDown(screen.getByRole('button', { name: 'Dictate' }))).toBe(true);
    expect(text).not.toHaveFocus();
  });

  it('renders on the server and hydrates without a mismatch', async () => {
    const tree = <form><Composer aria-label="Message" name="prompt" defaultValue="Hello" bar={<span>Model</span>} barLabel="Options" /></form>;
    const html = renderToString(tree);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.querySelector('textarea')!;
    expect(text.textContent).toBe('Hello');
    expect(text.getAttribute('aria-label')).toBe('Message');
    expect(doc.getElementById(text.getAttribute('aria-describedby')!)?.textContent).toBe('Enter to send Shift+Enter for a new line');
    expect(doc.querySelector('button[aria-label="Send"]')?.hasAttribute('disabled')).toBe(false);
    expect(doc.querySelector('[role="group"][aria-label="Options"]')?.textContent).toBe('Model');
    expect(renderToString(<Composer aria-label="Message" />)).toMatch(/<button[^>]*disabled=""[^>]*aria-label="Send"|<button[^>]*aria-label="Send"[^>]*disabled=""/);

    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = html;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => { root = hydrateRoot(container, tree); });
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector('button[aria-label="Send"]')).toBeEnabled();
    await act(async () => root.unmount());
    errors.mockRestore();
    container.remove();
  });
});
