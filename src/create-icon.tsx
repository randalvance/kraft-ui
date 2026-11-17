import { createElement, forwardRef, type ComponentPropsWithoutRef, type SVGProps } from 'react';

/** Single-ink geometry in the design system's 24 × 24 coordinate space. */
export type IconDefinition = readonly (readonly [
  tag: 'path' | 'circle' | 'rect' | 'line' | 'polyline' | 'polygon' | 'ellipse',
  attributes: SVGProps<SVGElement>,
])[];

export type NamedIconProps<Name extends string> = Omit<ComponentPropsWithoutRef<'svg'>,
  'children' | 'dangerouslySetInnerHTML' | 'width' | 'height' | 'viewBox' | 'role' | 'tabIndex' | 'focusable'> & {
  name: Name;
  /** CSS length or pixels. Omit to use the surrounding control's icon size, or 1em in text. */
  size?: number | string;
  /** Omit for decoration; name the enclosing button when the icon is an action. */
  label?: string;
};

/** Create a typed name-based Icon from only the glyphs an application uses. Define it outside render. */
export function createIcon<const Icons extends Record<string, IconDefinition>>(icons: Icons) {
  return forwardRef<SVGSVGElement, NamedIconProps<Extract<keyof Icons, string>>>(function Icon({
    name, size, label, className, style, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy,
    'aria-hidden': ariaHidden, ...props
  }, ref) {
    const accessibleLabel = label?.trim() || ariaLabel?.trim() || undefined;
    const accessibleLabelledBy = labelledBy?.trim() || undefined;
    const hidden = ariaHidden === true || ariaHidden === 'true' || !(accessibleLabel || accessibleLabelledBy);
    return <svg fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      {...props} ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      width={size ?? '1em'} height={size ?? '1em'} focusable="false"
      role={hidden ? undefined : 'img'} aria-hidden={hidden ? true : undefined}
      aria-label={accessibleLabel} aria-labelledby={accessibleLabelledBy}
      className={className ? `kraft-icon ${className}` : 'kraft-icon'}
      style={size === undefined ? style : { width: size, height: size, ...style }}>
      {icons[name].map(([tag, attributes], index) => createElement(tag, { ...attributes, key: index }))}
    </svg>;
  });
}
