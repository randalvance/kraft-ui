import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Icon, Tag } from '../src';

describe('Tag', () => {
  it('renders a static span and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<p>Ticket <Tag ref={ref} id="ticket" className="ticket-tag" data-app="tracker" tilt={-3}>KW-19</Tag></p>);
    expect(ref.current?.tagName).toBe('SPAN');
    expect(ref.current).toHaveAttribute('id', 'ticket');
    expect(ref.current).toHaveAttribute('data-app', 'tracker');
    expect(ref.current).toHaveTextContent('KW-19');
    expect(ref.current).not.toHaveAttribute('tabindex');
    expect(ref.current?.parentElement).toHaveClass('kraft-tag', 'ticket-tag');
    expect(ref.current?.parentElement).toHaveAttribute('data-variant', 'kraft');
    expect(ref.current?.parentElement?.style.getPropertyValue('--kraft-tag-tilt')).toBe('-3deg');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('keeps the full text as the link name and the removal button as a sibling', () => {
    const ref = createRef<HTMLAnchorElement>();
    const label = 'feature/bring-production-proofing-to-the-studio';
    const follow = vi.fn(event => event.preventDefault());
    const remove = vi.fn();
    render(<Tag as="a" ref={ref} href="/branches/production" target="_blank" onClick={follow}
      leading={<Icon name="branch" label="Branch" />} onRemove={remove} removeLabel={`Remove ${label}`}>{label}</Tag>);
    const link = screen.getByRole('link', { name: label });
    const close = screen.getByRole('button', { name: `Remove ${label}` });
    expect(link).toBe(ref.current);
    expect(link).toHaveAttribute('href', '/branches/production');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('img')).toBeNull();
    expect(link.nextElementSibling).toBe(close);
    fireEvent.click(close);
    expect(remove).toHaveBeenCalledOnce();
    expect(follow).not.toHaveBeenCalled();
    fireEvent.click(link);
    expect(follow).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
  });

  it('preserves native button props and submission while removal stays independent', () => {
    const ref = createRef<HTMLButtonElement>();
    const submit = vi.fn(event => event.preventDefault());
    const activate = vi.fn();
    const remove = vi.fn();
    const tag = (options: { type?: 'submit'; disabled?: boolean } = {}) => <form onSubmit={submit}>
      <Tag as="button" ref={ref} variant="paper" name="workspace" value="print" swatch="#4a8f99"
        onClick={activate} onRemove={remove} removeLabel="Remove Print Studio" {...options}>Print Studio</Tag>
    </form>;
    const { rerender } = render(tag());
    const button = screen.getByRole('button', { name: 'Print Studio' });
    const close = screen.getByRole('button', { name: 'Remove Print Studio' });
    expect(button).toBe(ref.current);
    expect(button).toHaveAttribute('name', 'workspace');
    expect(button).toHaveValue('print');
    expect(button).toHaveAttribute('type', 'button');
    expect(close).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    fireEvent.click(close);
    expect(activate).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();

    rerender(tag({ type: 'submit' }));
    fireEvent.click(button);
    expect(submit).toHaveBeenCalledOnce();

    rerender(tag({ disabled: true }));
    expect(button).toBeDisabled();
    expect(close).toBeEnabled();
    fireEvent.click(button);
    expect(activate).toHaveBeenCalledTimes(2);
  });

  it('server-renders both forms and native actions', () => {
    const html = renderToString(<>
      <Tag>main</Tag>
      <Tag as="a" href="/pull/42" leading={<Icon name="branch" />}>PR #42</Tag>
      <Tag variant="paper" as="button" swatch="#4a8f99" onRemove={() => {}} removeLabel="Remove Print Studio">Print Studio</Tag>
    </>);
    const container = document.createElement('div');
    container.innerHTML = html;
    expect(container.querySelector('[data-variant="kraft"] > span')).toHaveTextContent('main');
    expect(container.querySelector('a[href="/pull/42"]')).toHaveTextContent('PR #42');
    expect(container.querySelector('a svg')).toHaveAttribute('aria-hidden', 'true');
    const paper = container.querySelector('[data-variant="paper"]');
    expect(paper?.querySelector<HTMLElement>('.kraft-tag-swatch')?.style.backgroundColor).toBe('rgb(74, 143, 153)');
    expect(paper?.querySelector('button + button[type="button"]')).toHaveAccessibleName('Remove Print Studio');
  });
});
