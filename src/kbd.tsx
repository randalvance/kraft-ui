import { forwardRef, Fragment, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type KbdSize = 'sm' | 'md';

export type KbdProps = Omit<ComponentPropsWithoutRef<'kbd'>, 'children'> & {
  /** One key, such as `K`, `Esc`, or `/`. Ignored when `keys` is set. */
  children?: ReactNode;
  /** A chord, such as `['Ctrl', 'K']`. Each key gets its own keycap, joined by a plus sign. */
  keys?: readonly ReactNode[];
  /** `sm` fits inside a field or a menu row. */
  size?: KbdSize;
};

/**
 * A small paper keycap for a key hint. A chord renders as nested `<kbd>`
 * elements, as HTML recommends, so it reads as one key combination.
 * Native props and the ref reach the outer `<kbd>`.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ children, keys, size = 'md', className, ...props }, ref) {
  if (keys && keys.length > 1) {
    return <kbd {...props} ref={ref} data-size={size} className={className ? `kraft-kbd-chord ${className}` : 'kraft-kbd-chord'}>
      {keys.map((key, index) => <Fragment key={index}>
        {index > 0 && <span className="kraft-kbd-join">+</span>}
        <kbd className="kraft-kbd">{key}</kbd>
      </Fragment>)}
    </kbd>;
  }
  return <kbd {...props} ref={ref} data-size={size} className={className ? `kraft-kbd ${className}` : 'kraft-kbd'}>
    {keys ? keys[0] : children}
  </kbd>;
});
