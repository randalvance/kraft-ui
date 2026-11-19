import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { StickyNote } from '../src';

describe('StickyNote', () => {
  it('renders an article with rich slots, native props and a forwarded ref', () => {
    const ref = createRef<HTMLElement>();
    render(<StickyNote ref={ref} id="release" className="release-note" aria-labelledby="release-title"
      tone="blush" tilt={1.5} header={<h2 id="release-title">Release</h2>}
      footer={<a href="#changelog">Changelog</a>}>
      <p>Review the release notes.</p>
    </StickyNote>);
    const note = screen.getByRole('article', { name: 'Release' });
    expect(note).toBe(ref.current);
    expect(note).toHaveAttribute('id', 'release');
    expect(note).toHaveClass('release-note');
    expect(note).toHaveAttribute('data-tone', 'blush');
    expect(note).toHaveStyle('--kraft-sticky-note-tilt: 1.5deg');
    expect(note).toContainElement(screen.getByRole('heading', { name: 'Release' }));
    expect(note).toContainElement(screen.getByText('Review the release notes.'));
    expect(note).toContainElement(screen.getByRole('link', { name: 'Changelog' }));
  });

  it('uses native button activation, disabled behavior and controlled selection', () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const formSubmit = vi.fn(event => event.preventDefault());
    const press = vi.fn();
    const { rerender } = render(<form onSubmit={formSubmit}>
      <StickyNote as="button" ref={buttonRef} selected={false} onClick={press}>Keep this note</StickyNote>
    </form>);
    const button = screen.getByRole('button', { name: 'Keep this note', pressed: false });
    expect(button).toBe(buttonRef.current);
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(press).toHaveBeenCalledTimes(1);
    expect(formSubmit).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-pressed', 'false');

    rerender(<form onSubmit={formSubmit}>
      <StickyNote as="button" ref={buttonRef} selected disabled onClick={press}>Keep this note</StickyNote>
    </form>);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);
    expect(press).toHaveBeenCalledTimes(1);
  });

  it('includes the visible status in the native name and supports native ARIA props', () => {
    render(<>
      <StickyNote as="button" aria-describedby="hint" status="waiting" statusLabel="Awaiting sign-off"
        header="Print studio" footer={<span>Tuesday</span>}>Ship the proof</StickyNote>
      <span id="hint">Opens details.</span>
      <StickyNote as="button" status="done">Print proofs</StickyNote>
      <StickyNote as="button" aria-label="Current note" aria-pressed="true" />
    </>);
    expect(screen.getByRole('button', { name: 'Print studio Ship the proof Tuesday Awaiting sign-off' }))
      .toHaveAccessibleDescription('Opens details.');
    expect(screen.getByRole('button', { name: 'Print proofs Done' })).not.toHaveAttribute('aria-pressed');
    expect(screen.getByRole('button', { name: 'Current note', pressed: true })).toBeInTheDocument();
  });

  it('server-renders both elements with slots, tilt and the button status', () => {
    const html = renderToString(<>
      <StickyNote tone="ochre" tilt={0} header="Printing" footer="Studio">Order proofs</StickyNote>
      <StickyNote as="button" aria-label="Mail the proofs" selected status="done">Mail to the studio</StickyNote>
    </>);
    expect(html).toContain('<article class="kraft-sticky-note"');
    expect(html).toContain('--kraft-sticky-note-tilt:0deg');
    expect(html).toContain('data-tone="ochre"');
    expect(html).toContain('>Printing</div>');
    expect(html).toContain('>Order proofs</div>');
    expect(html).toContain('>Studio</div>');
    expect(html).toContain('<button aria-label="Mail the proofs"');
    expect(html).toContain('type="button" aria-pressed="true"');
    expect(html).toContain('class="kraft-sticky-note-status">Done</span>');
  });
});
