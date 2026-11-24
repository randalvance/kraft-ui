import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Kbd } from '../src';

describe('Kbd', () => {
  it('renders one native keycap and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLElement>();
    render(<p>Press <Kbd ref={ref} id="close-key" className="hint" data-app="notes" title="Escape">Esc</Kbd> to close.</p>);
    expect(ref.current?.tagName).toBe('KBD');
    expect(ref.current).toHaveClass('kraft-kbd', 'hint');
    expect(ref.current).toHaveAttribute('id', 'close-key');
    expect(ref.current).toHaveAttribute('data-app', 'notes');
    expect(ref.current).toHaveAttribute('data-size', 'md');
    expect(ref.current).toHaveTextContent('Esc');
    expect(ref.current?.querySelector('kbd')).toBeNull();
    expect(screen.getByText(/Press/)).toHaveTextContent('Press Esc to close.');
  });

  it('nests one keycap per key inside an outer kbd for a chord', () => {
    const ref = createRef<HTMLElement>();
    render(<Kbd ref={ref} keys={['Ctrl', 'Shift', 'K']} size="sm" />);
    expect(ref.current?.tagName).toBe('KBD');
    expect(ref.current).toHaveClass('kraft-kbd-chord');
    expect(ref.current).not.toHaveClass('kraft-kbd');
    expect(ref.current).toHaveAttribute('data-size', 'sm');
    expect([...ref.current!.querySelectorAll('kbd.kraft-kbd')].map(key => key.textContent)).toEqual(['Ctrl', 'Shift', 'K']);
    expect(ref.current).toHaveTextContent('Ctrl+Shift+K');
  });

  it('draws a single key from a one-item keys list', () => {
    const { container } = render(<Kbd keys={['/']} />);
    expect(container.querySelectorAll('kbd')).toHaveLength(1);
    expect(container.querySelector('kbd')).toHaveClass('kraft-kbd');
    expect(container.querySelector('kbd')).toHaveTextContent('/');
  });

  it('renders keycaps and chords on the server', () => {
    const doc = new DOMParser().parseFromString(renderToString(<>
      <Kbd>K</Kbd><Kbd keys={['⌘', 'K']} aria-hidden="true" />
    </>), 'text/html');
    const [single, chord] = doc.body.children;
    expect(single.outerHTML).toBe('<kbd data-size="md" class="kraft-kbd">K</kbd>');
    expect(chord.getAttribute('aria-hidden')).toBe('true');
    expect(chord.querySelectorAll(':scope > kbd')).toHaveLength(2);
    expect(chord.querySelector('.kraft-kbd-join')?.textContent).toBe('+');
  });
});
