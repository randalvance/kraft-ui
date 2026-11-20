import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Stamp } from '../src';

describe('Stamp', () => {
  it('renders a static span with a forwarded ref, native props and two text cells', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<p>Approved <Stamp ref={ref} id="impression" className="approval"
      size="sm" tone="sage" signature="Mara">Done</Stamp></p>);
    expect(ref.current?.tagName).toBe('SPAN');
    expect(ref.current).toHaveAttribute('id', 'impression');
    expect(ref.current).toHaveClass('kraft-stamp', 'approval');
    expect(ref.current).toHaveTextContent('Done Mara');
    expect(ref.current).toHaveAttribute('data-tone', 'sage');
    expect(ref.current).toHaveAttribute('data-size', 'sm');
    expect(ref.current).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('keeps the native button name, ref and form behavior with a controlled toggle state', () => {
    const ref = createRef<HTMLButtonElement>();
    const submit = vi.fn(event => event.preventDefault());
    const click = vi.fn();
    const { rerender } = render(<form onSubmit={submit}>
      <Stamp as="button" ref={ref} name="approval" onClick={click} signature="Mara">Done</Stamp>
    </form>);
    const button = screen.getByRole('button', { name: 'Done Mara', pressed: false });
    expect(button).toBe(ref.current);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('name', 'approval');
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-pressed', 'false');

    rerender(<form onSubmit={submit}>
      <Stamp as="button" ref={ref} type="submit" pressed name="approval" onClick={click} signature="Mara">Done</Stamp>
    </form>);
    expect(screen.getByRole('button', { name: 'Done Mara', pressed: true })).toBe(button);
    fireEvent.click(button);
    expect(submit).toHaveBeenCalledOnce();

    rerender(<form onSubmit={submit}>
      <Stamp as="button" ref={ref} disabled pressed name="approval" onClick={click} signature="Mara">Done</Stamp>
    </form>);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('server-renders static and toggle impressions with their initial state', () => {
    const html = renderToString(<>
      <Stamp size="lg" animate>Welcome</Stamp>
      <Stamp as="button" pressed aria-label="Jira · track issues" tone="blue" signature="Mara">Jira</Stamp>
    </>);
    expect(html).toContain('<span class="kraft-stamp" data-tone="neutral" data-size="lg" data-animate="true"');
    expect(html).toContain('>Welcome</span>');
    expect(html).toContain('<button aria-label="Jira · track issues"');
    expect(html).toContain('type="button" aria-pressed="true"');
    expect(html).toContain('>Mara</span>');
  });
});
