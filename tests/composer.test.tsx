import { createRef, useState, type FormEvent } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Composer, FormField, IconButton, Kbd } from '../src';

// Accessible-name rules may or may not put spaces around the plus sign of a chord.
const described = (box: HTMLElement) => box.getAttribute('aria-describedby')!.split(' ')
  .map(id => document.getElementById(id)!.textContent!.replace(/\s+/g, ' ').trim());

describe('Composer', () => {
  it('is a native textarea that takes the ref and native props, while the frame takes className and style', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Composer ref={ref} aria-label="Message the agent" name="message" placeholder="Write to the agent…" defaultValue="Hello"
      className="dock" style={{ maxWidth: 640 }} inputClassName="draft" inputStyle={{ letterSpacing: '1px' }}
      maxLength={4000} spellCheck={false} data-app="chat" />);
    const box = screen.getByRole('textbox', { name: 'Message the agent' });
    expect(ref.current).toBe(box);
    expect(box.tagName).toBe('TEXTAREA');
    expect(box).toHaveClass('kraft-composer-input', 'draft');
    expect(box).toHaveValue('Hello');
    expect(box).toHaveAttribute('rows', '2');
    expect(box).toHaveAttribute('name', 'message');
    expect(box).toHaveAttribute('placeholder', 'Write to the agent…');
    expect(box).toHaveAttribute('maxlength', '4000');
    expect(box).toHaveAttribute('spellcheck', 'false');
    expect(box).toHaveAttribute('data-app', 'chat');
    expect(box.style.letterSpacing).toBe('1px');
    expect(box).not.toHaveAttribute('aria-busy');
    const frame = box.closest<HTMLElement>('.kraft-composer')!;
    expect(frame).toHaveClass('dock');
    expect(frame.style.maxWidth).toBe('640px');
    expect(frame).not.toHaveAttribute('data-app');
    expect(box).not.toHaveClass('dock');
    expect(box.getAttribute('style')).not.toContain('max-width');
  });

  it('describes the textarea with keycap hints that follow the send key, or with the application\'s own', () => {
    const { rerender } = render(<Composer aria-label="Message" aria-describedby="outside" />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    const hints = () => box.closest('.kraft-composer')!.querySelector('.kraft-composer-hints');
    expect(box.getAttribute('aria-describedby')).toMatch(/^outside \S+-hints$/);
    expect(hints()).toHaveTextContent('Enter send Shift+Enter new line');
    expect([...hints()!.querySelectorAll('kbd.kraft-kbd')].map(key => key.textContent)).toEqual(['Enter', 'Shift', 'Enter']);
    expect(hints()!.querySelector('kbd')).toHaveAttribute('data-size', 'sm');

    rerender(<Composer aria-label="Message" sendKey="mod-enter" />);
    expect(described(box)).toEqual(['Ctrl+Enter send Enter new line']);

    rerender(<Composer aria-label="Message" hints={<><Kbd size="sm">Esc</Kbd> stop</>} />);
    expect(described(box)).toEqual(['Esc stop']);

    rerender(<Composer aria-label="Message" hints={null} />);
    expect(hints()).toBeNull();
    expect(box).not.toHaveAttribute('aria-describedby');
  });

  it('sends on Enter, and leaves Shift+Enter, composition, key repeat, and blank text alone', async () => {
    const send = vi.fn();
    const user = userEvent.setup();
    render(<Composer aria-label="Message" onSend={send} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await user.type(box, '  {Enter}');
    expect(send).not.toHaveBeenCalled();
    expect(box).toHaveValue('  ');
    await user.clear(box);
    await user.type(box, 'Trim the covers{Shift>}{Enter}{/Shift}and bind them');
    expect(box).toHaveValue('Trim the covers\nand bind them');
    expect(send).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: 'Enter', isComposing: true });
    // Safari reports the Enter that confirms a composition after the composition has ended.
    fireEvent.keyDown(box, { key: 'Enter', keyCode: 229 });
    fireEvent.keyDown(box, { key: 'Enter', repeat: true });
    fireEvent.keyDown(box, { key: 'Enter', altKey: true });
    expect(send).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(send).toHaveBeenCalledExactlyOnceWith('Trim the covers\nand bind them');
    // The text belongs to the application, and the send key adds no line.
    expect(box).toHaveValue('Trim the covers\nand bind them');
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('sends on Ctrl+Enter or ⌘+Enter and adds a line on Enter with sendKey="mod-enter"', async () => {
    const send = vi.fn();
    const user = userEvent.setup();
    render(<Composer aria-label="Message" sendKey="mod-enter" onSend={send} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await user.type(box, 'One{Enter}two');
    expect(box).toHaveValue('One\ntwo');
    expect(send).not.toHaveBeenCalled();
    await user.keyboard('{Control>}{Enter}{/Control}');
    await user.keyboard('{Meta>}{Enter}{/Meta}');
    expect(send.mock.calls).toEqual([['One\ntwo'], ['One\ntwo']]);
    await user.keyboard('{Control>}{Shift>}{Enter}{/Shift}{/Control}');
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('clears and sends again when the application controls the text, and lets its onKeyDown take the key', async () => {
    const sent: string[] = [];
    function Chat({ veto = false }: { veto?: boolean }) {
      const [draft, setDraft] = useState('');
      return <Composer aria-label="Message" value={draft} onChange={event => setDraft(event.currentTarget.value)}
        onKeyDown={event => { if (veto) event.preventDefault(); }}
        onSend={text => { sent.push(text); setDraft(''); }} />;
    }
    const user = userEvent.setup();
    const { rerender } = render(<Chat />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await user.type(box, 'First{Enter}');
    expect(box).toHaveValue('');
    await user.type(box, 'Second{Enter}');
    expect(sent).toEqual(['First', 'Second']);
    rerender(<Chat veto />);
    fireEvent.change(box, { target: { value: 'Third' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(sent).toEqual(['First', 'Second']);
    expect(box).toHaveValue('Third');
  });

  it('holds the send key, marks the textarea, and fills its status region while busy', async () => {
    const send = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<Composer aria-label="Message" onSend={send} defaultValue="Wait for me" />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();
    const frame = box.closest('.kraft-composer')!;
    expect(frame).not.toHaveAttribute('data-busy');

    rerender(<Composer aria-label="Message" onSend={send} busy defaultValue="Wait for me" />);
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('Working…');
    expect(status.querySelector('.kraft-pinwheel')).toHaveAttribute('aria-hidden', 'true');
    expect(box).toHaveAttribute('aria-busy', 'true');
    expect(frame).toHaveAttribute('data-busy', 'true');
    // The default hints would promise a send that is held, so they give way to the status.
    expect(box).not.toHaveAttribute('aria-describedby');
    expect(box).toBeEnabled();
    await user.type(box, ' please{Enter}');
    expect(box).toHaveValue('Wait for me please');
    expect(send).not.toHaveBeenCalled();

    rerender(<Composer aria-label="Message" onSend={send} busy busyLabel="The agent is working" hints="Esc stops it" defaultValue="Wait for me" />);
    expect(status).toHaveTextContent('The agent is working');
    expect(box).toHaveAccessibleDescription('Esc stops it');
    rerender(<Composer aria-label="Message" onSend={send} busy busyLabel={null} defaultValue="Wait for me" />);
    expect(status).toHaveTextContent('');
    expect(status.querySelector('.kraft-pinwheel')).toBeInTheDocument();

    rerender(<Composer aria-label="Message" onSend={send} defaultValue="Wait for me" />);
    expect(status).toBeEmptyDOMElement();
    expect(box).not.toHaveAttribute('aria-busy');
    await user.keyboard('{Enter}');
    expect(send).toHaveBeenCalledExactlyOnceWith('Wait for me please');
  });

  it('submits its form through the submit button, as an input would, and a disabled button holds it', async () => {
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      return [(event.nativeEvent as SubmitEvent).submitter, Object.fromEntries(new FormData(event.currentTarget))];
    });
    const press = vi.fn(), send = vi.fn();
    const user = userEvent.setup();
    const form = (locked = false) => <form onSubmit={submit}>
      <input type="hidden" name="session" value="s-1" />
      <Composer aria-label="Message" name="message" onSend={send} bar={<button type="button">Model</button>}
        send={<IconButton type="submit" aria-label="Send message" disabled={locked} onClick={press}>↑</IconButton>} />
    </form>;
    const { rerender } = render(form());
    const box = screen.getByRole('textbox', { name: 'Message' });
    await user.type(box, 'Print the labels{Enter}');
    expect(send).toHaveBeenCalledExactlyOnceWith('Print the labels');
    expect(press).toHaveBeenCalledOnce();
    expect(submit).toHaveReturnedWith([screen.getByRole('button', { name: 'Send message' }), { session: 's-1', message: 'Print the labels' }]);

    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(submit).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenCalledOnce();

    rerender(form(true));
    await user.type(box, '{Enter}');
    expect(submit).toHaveBeenCalledTimes(2);
  });

  // A picture is a submit button too, though `form.elements` leaves it out.
  const pictureForm = (submit: (event: FormEvent<HTMLFormElement>) => void, press?: () => void, locked = false) => <form onSubmit={submit}>
    <input type="image" alt="Send by picture" disabled={locked} onClick={press} />
    <Composer aria-label="Message" name="message" send={<IconButton type="submit" aria-label="Send message">↑</IconButton>} />
  </form>;

  it('presses an image submit control when it is the first submit button of the form', async () => {
    const press = vi.fn();
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      return (event.nativeEvent as SubmitEvent).submitter;
    });
    render(pictureForm(submit, press));
    await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), 'Print the labels{Enter}');
    expect(press).toHaveBeenCalledOnce();
    expect(submit).toHaveReturnedWith(screen.getByRole('button', { name: 'Send by picture' }));
  });

  it('holds the form when its first submit button is a disabled image control', async () => {
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(pictureForm(submit, undefined, true));
    await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), 'Print the labels{Enter}');
    expect(submit).not.toHaveBeenCalled();
  });

  it('submits a form that has no submit button, runs its validation, and reaches a form outside its ancestors', async () => {
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const user = userEvent.setup();
    render(<>
      <form id="thread" onSubmit={submit}><input aria-label="Title" name="title" required /></form>
      <Composer aria-label="Message" name="message" form="thread" />
    </>);
    const box = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });
    expect(box.form).toBe(document.getElementById('thread'));
    await user.type(box, 'Hello{Enter}');
    expect(submit).not.toHaveBeenCalled();
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Proofs');
    await user.type(box, '{Enter}');
    expect(submit).toHaveBeenCalledOnce();
    expect(Object.fromEntries(new FormData(box.form!))).toEqual({ title: 'Proofs', message: 'Hello' });
  });

  it('takes its label, description, and error from FormField', async () => {
    const { rerender } = render(<FormField label="Describe the job" description="Or paste a ticket" error="Write something first" controlId="job">
      <Composer name="job" required />
    </FormField>);
    const box = screen.getByRole('textbox', { name: 'Describe the job' });
    expect(box).toHaveAttribute('id', 'job');
    expect(box).toBeRequired();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(described(box)).toEqual(['Or paste a ticket', 'Write something first', 'Enter send Shift+Enter new line']);
    await userEvent.click(screen.getByText('Describe the job'));
    expect(box).toHaveFocus();
    rerender(<FormField label="Describe the job" controlId="job"><Composer name="job" required hints={null} /></FormField>);
    expect(box).not.toHaveAttribute('aria-invalid');
    expect(box).not.toHaveAttribute('aria-describedby');
  });

  it('puts the bar before the hints and the mic and send actions, and leaves out empty slots', async () => {
    const { rerender } = render(<Composer aria-label="Message" bar={<button type="button">Model</button>}
      mic={<IconButton size="sm" aria-label="Dictate">m</IconButton>} send={<IconButton aria-label="Send message">s</IconButton>} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    const card = box.parentElement!;
    expect(card).toHaveClass('kraft-composer-card');
    expect([...card.querySelector('.kraft-composer-foot')!.children].map(part => part.className)).toEqual(['kraft-composer-bar', 'kraft-composer-end']);
    expect([...card.querySelector('.kraft-composer-end')!.children].map(part => part.className))
      .toEqual(['kraft-composer-status', 'kraft-composer-hints', 'kraft-composer-mic', 'kraft-composer-send']);
    const user = userEvent.setup();
    await user.tab();
    expect(box).toHaveFocus();
    for (const name of ['Model', 'Dictate', 'Send message']) {
      await user.tab();
      expect(screen.getByRole('button', { name })).toHaveFocus();
    }
    expect(screen.getByRole('button', { name: 'Send message' })).toHaveAttribute('type', 'button');

    rerender(<Composer aria-label="Message" bar={false} mic={null} send="" hints={true} />);
    expect([...card.querySelectorAll('.kraft-composer-foot *')].map(part => part.className)).toEqual(['kraft-composer-end', 'kraft-composer-status']);
  });

  it('focuses the textarea when the frame or a hint is pressed, but not from the bar or an action', async () => {
    const pick = vi.fn();
    render(<Composer aria-label="Message" bar={<><span>lighthouse</span><button type="button" onClick={pick}>Model</button></>}
      send={<IconButton aria-label="Send message">s</IconButton>} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    const user = userEvent.setup();
    await user.click(box.closest('.kraft-composer')!);
    expect(box).toHaveFocus();
    box.blur();
    await user.click(screen.getByText('new line'));
    expect(box).toHaveFocus();
    box.blur();
    await user.click(screen.getByText('lighthouse'));
    expect(box).not.toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Model' }));
    expect(pick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Model' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByRole('button', { name: 'Send message' })).toHaveFocus();
  });

  it('disables the textarea and does not take focus or send', async () => {
    const send = vi.fn();
    render(<Composer aria-label="Archived" disabled defaultValue="Signed off on Tuesday." onSend={send} />);
    const box = screen.getByRole('textbox', { name: 'Archived' });
    expect(box).toBeDisabled();
    fireEvent.mouseDown(box.closest('.kraft-composer')!);
    expect(box).not.toHaveFocus();
    await userEvent.type(box, '{Enter}');
    expect(send).not.toHaveBeenCalled();
    expect(box).toHaveValue('Signed off on Tuesday.');
  });

  it('passes rows and maxRows to the textarea', () => {
    const { rerender } = render(<Composer aria-label="Message" />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    expect(box.style.getPropertyValue('--kraft-composer-max-rows')).toBe('');
    rerender(<Composer aria-label="Message" rows={1} maxRows={12} inputStyle={{ letterSpacing: '1px' }} />);
    expect(box).toHaveAttribute('rows', '1');
    expect(box.style.getPropertyValue('--kraft-composer-max-rows')).toBe('12');
    expect(box.style.letterSpacing).toBe('1px');
  });

  it('renders the frame, card, hints, slots, and busy status on the server', () => {
    const doc = new DOMParser().parseFromString(renderToString(<>
      <Composer aria-label="Message" name="message" className="dock" defaultValue="Hello" maxRows={5}
        bar={<span>lighthouse</span>} mic={<IconButton size="sm" aria-label="Dictate">m</IconButton>}
        send={<IconButton type="submit" aria-label="Send message">s</IconButton>} />
      <Composer aria-label="Working" busy sendKey="mod-enter" />
    </>), 'text/html');
    const [idle, working] = doc.querySelectorAll<HTMLElement>('.kraft-composer');
    expect(idle.className).toBe('kraft-composer dock');
    expect(idle.hasAttribute('data-busy')).toBe(false);
    const box = idle.querySelector('textarea')!;
    expect(box.value).toBe('Hello');
    expect(box.getAttribute('rows')).toBe('2');
    expect(box.style.getPropertyValue('--kraft-composer-max-rows')).toBe('5');
    expect(doc.getElementById(box.getAttribute('aria-describedby')!)?.textContent).toBe('Enter send Shift+Enter new line');
    expect(idle.querySelector('.kraft-composer-bar')?.textContent).toBe('lighthouse');
    expect(idle.querySelector('.kraft-composer-mic button')?.getAttribute('aria-label')).toBe('Dictate');
    expect(idle.querySelector('.kraft-composer-send button')?.getAttribute('type')).toBe('submit');
    expect(idle.querySelector('[role="status"]')?.childNodes).toHaveLength(0);

    expect(working.dataset.busy).toBe('true');
    expect(working.querySelector('textarea')?.getAttribute('aria-busy')).toBe('true');
    expect(working.querySelector('textarea')?.hasAttribute('aria-describedby')).toBe(false);
    expect(working.querySelector('[role="status"]')?.textContent).toBe('Working…');
    expect(working.querySelector('.kraft-composer-hints')).toBeNull();
  });
});
