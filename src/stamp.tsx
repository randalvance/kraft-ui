import { forwardRef, type ComponentPropsWithoutRef, type ForwardedRef, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import type { Tone } from './primitives.js';

export type StampSize = 'sm' | 'md' | 'lg';

type StampMarkProps = {
  children: string;
  /** Optional name printed in a second cell. */
  signature?: string;
  tone?: Tone;
  size?: StampSize;
  /** Play the stamp-down motion when the impression appears. */
  animate?: boolean;
};

type StaticStampProps = StampMarkProps & Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'dangerouslySetInnerHTML'> & { as?: 'span' };
type ButtonStampProps = StampMarkProps & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-pressed'> & {
  as: 'button';
  /** Controlled toggle state. Handle changes with the native onClick. */
  pressed?: boolean;
};

export type StampProps = StaticStampProps | ButtonStampProps;

/** A printed ink mark or a native toggle button with a stamp impression. */
export const Stamp = forwardRef<HTMLElement, StampProps>(function Stamp({
  children, signature, tone = 'neutral', size = 'md', animate = false, className, ...nativeProps
}, ref) {
  const stampProps = {
    className: className ? `kraft-stamp ${className}` : 'kraft-stamp',
    'data-tone': tone,
    'data-size': size,
    'data-animate': animate || undefined,
  };
  const impression = <span className="kraft-stamp-impression">
    <span className="kraft-stamp-cell">{children}</span>
    {signature && <>{' '}<span className="kraft-stamp-cell">{signature}</span></>}
  </span>;

  if (nativeProps.as === 'button') {
    const { as, pressed = false, type = 'button', ...buttonProps } = nativeProps;
    return <button {...buttonProps} {...stampProps} ref={ref as ForwardedRef<HTMLButtonElement>}
      type={type} aria-pressed={pressed}>{impression}</button>;
  }

  const { as, ...spanProps } = nativeProps;
  return <span {...spanProps} {...stampProps} ref={ref as ForwardedRef<HTMLSpanElement>}>{impression}</span>;
}) as ForwardRefExoticComponent<
  (StaticStampProps & RefAttributes<HTMLSpanElement>) | (ButtonStampProps & RefAttributes<HTMLButtonElement>)
>;
