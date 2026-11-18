import { forwardRef, type AriaAttributes, type ComponentPropsWithoutRef } from 'react';
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
