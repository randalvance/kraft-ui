import { forwardRef, type ComponentPropsWithoutRef, type ForwardedRef } from 'react';

const cx = (base: string, className?: string) => className ? `${base} ${className}` : base;

export type ProseProps = ComponentPropsWithoutRef<'div'> & {
  /** The container element. Use `article` or `section` when the content stands alone. */
  as?: 'div' | 'article' | 'section';
};

/**
 * Sets reading rhythm for headings, paragraphs, lists, links, rules, tables,
 * inline code, code blocks, quotes, and todo items placed inside it, such as
 * rendered markdown. Native props and the ref reach the container.
 */
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose({
  as: Tag = 'div', className, ...props
}, ref) {
  return <Tag {...props} ref={ref as ForwardedRef<HTMLDivElement>} className={cx('kraft-prose', className)} />;
});

export type CodeProps = ComponentPropsWithoutRef<'code'>;

/** Inline code drawn as a chip on a faint strip. Native props and the ref reach the `<code>`. */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code({ className, ...props }, ref) {
  return <code {...props} ref={ref} className={cx('kraft-code', className)} />;
});

export type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>;

/** A quotation beside a thick highlighter rule. Native props, including `cite`, and the ref reach the `<blockquote>`. */
export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(function Blockquote({ className, ...props }, ref) {
  return <blockquote {...props} ref={ref} className={cx('kraft-blockquote', className)} />;
});
