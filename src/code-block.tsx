import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { createIcon } from './create-icon.js';
import { checkIcon, copyIcon } from './icon-glyphs.js';
import { IconButton } from './primitives.js';

const CopyGlyph = /* @__PURE__ */ createIcon({ copy: copyIcon, check: checkIcon });

export type CodeBlockProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  /** The source text. Lines split on newlines; one trailing newline is ignored. */
  code: string;
  /** A short label such as `tsx` or `shell`, shown above the code. */
  language?: string;
  /** Shows a button that copies `code` to the clipboard. */
  copyable?: boolean;
  /** Shows line numbers in a gutter. They are not selected or copied with the code. */
  lineNumbers?: boolean;
  /** 1-based line numbers drawn and exposed as inserted lines. */
  added?: readonly number[];
  /** 1-based line numbers drawn and exposed as deleted lines. */
  removed?: readonly number[];
  /** The copy button's accessible name. */
  copyLabel?: string;
  /** Accessible name for the code when it scrolls and takes keyboard focus. Defaults to the language and “code”. */
  scrollLabel?: string;
};

type CopyState = 'idle' | 'copied' | 'failed';

/** A recessed monospaced block for source code. Native props and the ref reach the outer element. */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock({
  code, language, copyable = false, lineNumbers = false, added, removed,
  copyLabel = 'Copy code', scrollLabel, className, ...props
}, ref) {
  const scrollRef = useRef<HTMLPreElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [copy, setCopy] = useState<CopyState>('idle');

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const update = () => setScrollable(scroll.scrollWidth > scroll.clientWidth || scroll.scrollHeight > scroll.clientHeight);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    if (scroll.firstElementChild) observer.observe(scroll.firstElementChild);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (copy === 'idle') return;
    const timer = setTimeout(() => setCopy('idle'), 2000);
    return () => clearTimeout(timer);
  }, [copy]);

  const lines = code.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n');
  const addedLines = new Set(added);
  const removedLines = new Set(removed);
  const width = String(lines.length).length;
  const label = language?.trim() || undefined;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopy('copied');
    } catch {
      setCopy('failed');
    }
  };

  return <div {...props} ref={ref} className={className ? `kraft-code-block ${className}` : 'kraft-code-block'}
    data-line-numbers={lineNumbers || undefined}>
    {(label || copyable) && <div className="kraft-code-block-header">
      {label && <span className="kraft-code-block-language">{label}</span>}
      {copyable && <>
        <IconButton size="sm" className="kraft-code-block-copy" aria-label={copyLabel} onClick={copyCode}>
          <CopyGlyph name={copy === 'copied' ? 'check' : 'copy'} />
        </IconButton>
        <span className="kraft-visually-hidden" role="status">
          {copy === 'copied' ? 'Copied' : copy === 'failed' ? 'Copy failed' : ''}
        </span>
      </>}
    </div>}
    <pre ref={scrollRef} className="kraft-code-block-scroll" style={{ '--kraft-code-gutter': `${width}ch` } as CSSProperties}
      tabIndex={scrollable ? 0 : undefined} role={scrollable ? 'region' : undefined}
      aria-label={scrollable ? scrollLabel ?? (label ? `${label} code` : 'Code') : undefined}>
      <code className="kraft-code-block-code">{lines.map((line, index) => {
        const number = index + 1;
        const Line = addedLines.has(number) ? 'ins' : removedLines.has(number) ? 'del' : 'span';
        return <Line key={index} className="kraft-code-line">
          {lineNumbers && <span className="kraft-code-line-number" data-line={number} aria-hidden="true" />}
          <span className="kraft-code-line-text">{line}</span>
        </Line>;
      })}</code>
    </pre>
  </div>;
});
