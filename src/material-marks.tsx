import { forwardRef, type AriaAttributes, type ComponentPropsWithoutRef, type ForwardedRef, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { createIcon } from './create-icon.js';
import { pinwheelIcon } from './icon-glyphs.js';

type MarkProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'role' | 'tabIndex'> & {
  label?: string;
};

function markAccessibility(role: 'img' | 'status', label?: string, labelledBy?: string, hidden?: AriaAttributes['aria-hidden']) {
  const name = label?.trim() || undefined;
  const labelId = labelledBy?.trim() || undefined;
  if (hidden === true || hidden === 'true' || !(name || labelId)) return { 'aria-hidden': true };
  return { role, 'aria-label': name, 'aria-labelledby': labelId };
}

export type TapeProps = MarkProps & {
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

/** A noninteractive strip positioned relative to its nearest positioned ancestor. */
export const Tape = forwardRef<HTMLSpanElement, TapeProps>(function Tape({
  placement = 'top', className, label, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy,
  'aria-hidden': hidden, ...props
}, ref) {
  return <span {...props} {...markAccessibility('img', label?.trim() || ariaLabel, labelledBy, hidden)}
    ref={ref} className={className ? `kraft-tape ${className}` : 'kraft-tape'} data-placement={placement} />;
});

const PinwheelGlyph = /* @__PURE__ */ createIcon({ pinwheel: pinwheelIcon });

export type PinwheelProps = MarkProps & { size?: 'row' | 'button' };

/** The shared busy indicator. A label exposes it as a status. */
export const Pinwheel = forwardRef<HTMLSpanElement, PinwheelProps>(function Pinwheel({
  size = 'row', className, label, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy,
  'aria-hidden': hidden, ...props
}, ref) {
  return <span {...props} {...markAccessibility('status', label?.trim() || ariaLabel, labelledBy, hidden)}
    ref={ref} className={className ? `kraft-pinwheel ${className}` : 'kraft-pinwheel'} data-size={size}>
    <PinwheelGlyph name="pinwheel" size={size === 'button' ? 16 : 24} />
  </span>;
});

export type PinTone = 'red' | 'blue' | 'green' | 'amber';

type DecorativePinProps = MarkProps & { as?: 'span'; tone?: PinTone };
type ButtonPinProps = Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-label'> & {
  as: 'button';
  tone?: PinTone;
  /** The button's accessible name, for example "Unpin the poster proof". */
  label: string;
};

export type PinProps = DecorativePinProps | ButtonPinProps;

/** A tack. Decorative by default; the button variant is pulled to unpin. */
export const Pin = forwardRef<HTMLElement, PinProps>(function Pin({ tone = 'red', className, label, ...nativeProps }, ref) {
  const pinProps = { className: className ? `kraft-pin ${className}` : 'kraft-pin', 'data-tone': tone };
  const head = <span className="kraft-pin-head" aria-hidden="true" />;

  if (nativeProps.as === 'button') {
    const { as, type = 'button', ...buttonProps } = nativeProps;
    return <button {...buttonProps} type={type} aria-label={label} ref={ref as ForwardedRef<HTMLButtonElement>} {...pinProps}>{head}</button>;
  }

  const { as, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-hidden': hidden, ...spanProps } = nativeProps;
  return <span {...spanProps} {...markAccessibility('img', label?.trim() || ariaLabel, labelledBy, hidden)}
    ref={ref as ForwardedRef<HTMLSpanElement>} {...pinProps}>{head}</span>;
}) as ForwardRefExoticComponent<
  (DecorativePinProps & RefAttributes<HTMLSpanElement>) | (ButtonPinProps & RefAttributes<HTMLButtonElement>)
>;
