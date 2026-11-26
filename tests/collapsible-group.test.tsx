import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CollapsibleGroup } from '../src';

// jsdom does not run the summary's activation behaviour, so the tests toggle the element as the browser would.
function toggle(details: HTMLDetailsElement, open = !details.open) {
  details.open = open;
  fireEvent(details, new Event('toggle'));
}

describe('CollapsibleGroup', () => {
  it('is a native disclosure and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLDetailsElement>();
    render(<CollapsibleGroup ref={ref} title="Waiting on review" count={3} tone="attention" id="waiting" className="mine" data-app="desk">Three cards</CollapsibleGroup>);
    const group = ref.current!;
    expect(group.tagName).toBe('DETAILS');
    expect(group).toHaveClass('kraft-collapsible', 'mine');
    expect(group).toHaveAttribute('id', 'waiting');
    expect(group).toHaveAttribute('data-app', 'desk');
    expect(group).toHaveAttribute('data-tone', 'attention');
    expect(group.open).toBe(false);
    const summary = group.querySelector('summary')!;
    expect(summary.parentElement).toBe(group);
    expect(group.firstElementChild).toBe(summary);
    expect(summary).toHaveTextContent('Waiting on review3');
    expect(summary.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(summary.querySelector('button, a, [tabindex]')).toBeNull();
    expect(group.querySelector('.kraft-collapsible-body')).toHaveTextContent('Three cards');
  });

  it('reads the count in words when given a count label, and omits the sticker without a count', () => {
    const { rerender } = render(<CollapsibleGroup title="Blocked" count={0} countLabel={count => `${count} cards`} />);
    const summary = document.querySelector('summary')!;
    expect(summary).toHaveTextContent('Blocked, 0 cards0');
    expect(summary.querySelector('.kraft-badge')).toHaveAttribute('aria-hidden', 'true');
    rerender(<CollapsibleGroup title="Blocked" count={2} />);
    expect(summary.querySelector('.kraft-badge')).not.toHaveAttribute('aria-hidden');
    expect(summary.querySelector('.kraft-visually-hidden')).toBeNull();
    rerender(<CollapsibleGroup title="Blocked" />);
    expect(summary.querySelector('.kraft-badge')).toBeNull();
  });

  it('keeps its own state when uncontrolled and reports each change', () => {
    const onOpenChange = vi.fn();
    const onToggle = vi.fn();
    render(<CollapsibleGroup title="Doing" defaultOpen onOpenChange={onOpenChange} onToggle={onToggle} />);
    const group = document.querySelector('details')!;
    expect(group.open).toBe(true);
    toggle(group);
    expect(group.open).toBe(false);
    toggle(group);
    expect(group.open).toBe(true);
    expect(onOpenChange.mock.calls).toEqual([[false], [true]]);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('shows the application state when controlled, even if the change is declined', () => {
    function Demo({ accept }: { accept: boolean }) {
      const [open, setOpen] = useState(false);
      return <CollapsibleGroup title="Controlled" open={open} onOpenChange={next => { if (accept) setOpen(next); }} />;
    }
    const { rerender } = render(<Demo accept={false} />);
    const group = document.querySelector('details')!;
    toggle(group, true);
    expect(group.open).toBe(false);
    rerender(<Demo accept />);
    toggle(group, true);
    expect(group.open).toBe(true);
  });

  it('passes a shared name through for one-open-at-a-time groups', () => {
    render(<><CollapsibleGroup title="One" name="columns" defaultOpen /><CollapsibleGroup title="Two" name="columns" /></>);
    for (const group of document.querySelectorAll('details')) expect(group).toHaveAttribute('name', 'columns');
    expect(screen.getByText('One').closest('details')).toHaveAttribute('open');
  });

  it('renders open and closed on the server', () => {
    expect(renderToString(<CollapsibleGroup title="Open" defaultOpen>Body</CollapsibleGroup>)).toMatch(/<details[^>]* open=""/);
    expect(renderToString(<CollapsibleGroup title="Closed">Body</CollapsibleGroup>)).not.toMatch(/<details[^>]* open=""/);
  });
});
