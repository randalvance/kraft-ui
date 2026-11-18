import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Blockquote, Code, CodeBlock, Prose } from '../src';

describe('Prose', () => {
  it('renders the chosen container with native props and forwards the ref', () => {
    const ref = createRef<HTMLElement>();
    render(<Prose as="article" ref={ref} aria-label="Notes" className="notes"><p>Paper carries words.</p></Prose>);
    const article = screen.getByRole('article', { name: 'Notes' });
    expect(ref.current).toBe(article);
    expect(article).toHaveClass('kraft-prose', 'notes');
  });

  it('renders a div on the server by default', () => {
    expect(renderToString(<Prose><p>Hi</p></Prose>)).toBe('<div class="kraft-prose"><p>Hi</p></div>');
  });
});

describe('Code and Blockquote', () => {
  it('render native code and blockquote elements and forward refs', () => {
    const codeRef = createRef<HTMLElement>();
    const quoteRef = createRef<HTMLQuoteElement>();
    render(<>
      <Code ref={codeRef} className="token">npm test</Code>
      <Blockquote ref={quoteRef} cite="https://example.com/quote"><p>Paper carries words.</p></Blockquote>
    </>);
    expect(codeRef.current?.tagName).toBe('CODE');
    expect(codeRef.current).toHaveClass('kraft-code', 'token');
    expect(screen.getByRole('blockquote')).toBe(quoteRef.current);
    expect(quoteRef.current).toHaveAttribute('cite', 'https://example.com/quote');
    expect(quoteRef.current).toHaveClass('kraft-blockquote');
  });

  it('render on the server', () => {
    expect(renderToString(<Code>x</Code>)).toBe('<code class="kraft-code">x</code>');
    expect(renderToString(<Blockquote>Quote</Blockquote>)).toBe('<blockquote class="kraft-blockquote">Quote</blockquote>');
  });
});

describe('CodeBlock', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders native pre and code with one element per line, marks, and hidden line numbers', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<CodeBlock ref={ref} data-testid="block" className="sample" language="tsx" lineNumbers
      added={[2]} removed={[3]} code={'const a = 1;\nconst b = 2;\nconst c = 3;\n'} />);
    expect(ref.current).toBe(screen.getByTestId('block'));
    expect(ref.current).toHaveClass('kraft-code-block', 'sample');
    expect(screen.getByText('tsx')).toHaveClass('kraft-code-block-language');
    const code = container.querySelector('pre > code')!;
    expect(code.children).toHaveLength(3);
    expect(code.children[0].tagName).toBe('SPAN');
    expect(code.children[1].tagName).toBe('INS');
    expect(code.children[2].tagName).toBe('DEL');
    expect(code.textContent).toBe('const a = 1;const b = 2;const c = 3;');
    const numbers = container.querySelectorAll('.kraft-code-line-number');
    expect(numbers).toHaveLength(3);
    expect(numbers[2]).toHaveAttribute('data-line', '3');
    expect(numbers[2]).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('copies the source text and announces the result', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<CodeBlock copyable code={'npm test\n'} copyLabel="Copy command" />);
    await user.click(screen.getByRole('button', { name: 'Copy command' }));
    expect(writeText).toHaveBeenCalledWith('npm test\n');
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
    writeText.mockRejectedValueOnce(new Error('Denied'));
    await user.click(screen.getByRole('button', { name: 'Copy command' }));
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed');
  });

  it('clears the copy announcement after a moment', async () => {
    vi.useFakeTimers();
    try {
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true });
      render(<CodeBlock copyable code="x" />);
      await act(async () => screen.getByRole('button', { name: 'Copy code' }).click());
      expect(screen.getByRole('status')).toHaveTextContent('Copied');
      act(() => vi.advanceTimersByTime(2000));
      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders the block on the server without scroll focus', () => {
    const html = renderToString(<CodeBlock language="shell" copyable code="npm test" added={[1]} />);
    expect(html).toContain('<span class="kraft-code-block-language">shell</span>');
    expect(html).toContain('<button aria-label="Copy code" type="button"');
    expect(html).toContain('<ins class="kraft-code-line"><span class="kraft-code-line-text">npm test</span></ins>');
    expect(html).not.toContain('tabindex');
  });
});
