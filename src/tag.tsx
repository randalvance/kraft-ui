import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ForwardedRef, type ForwardRefExoticComponent, type MouseEventHandler, type ReactNode, type RefAttributes } from 'react';
import { createIcon } from './create-icon.js';
import { closeIcon } from './icon-glyphs.js';

export type TagVariant = 'kraft' | 'paper';

type TagMarkProps = {
  children: string;
  variant?: TagVariant;
  /** Rotation in degrees when theme tilt is enabled. */
  tilt?: number;
} & ({ leading?: ReactNode; swatch?: never } | { leading?: never; swatch: string })
  & ({ onRemove?: never; removeLabel?: never } | {
    onRemove: MouseEventHandler<HTMLButtonElement>;
    /** Accessible name for the close control, for example "Remove Print Studio". */
    removeLabel: string;
  });

type TagNativeProps<Element extends 'span' | 'a' | 'button'> = Omit<ComponentPropsWithoutRef<Element>, 'children' | 'dangerouslySetInnerHTML'>;
type StaticTagProps = TagMarkProps & TagNativeProps<'span'> & { as?: 'span' };
type LinkTagProps = TagMarkProps & TagNativeProps<'a'> & { as: 'a'; href: string };
type ButtonTagProps = TagMarkProps & TagNativeProps<'button'> & { as: 'button' };

export type TagProps = StaticTagProps | LinkTagProps | ButtonTagProps;

const TagIcon = /* @__PURE__ */ createIcon({ close: closeIcon });

/** A compact paper label with optional native activation and a separate removal control. */
export const Tag = forwardRef<HTMLElement, TagProps>(function Tag({
  children, variant = 'kraft', leading, swatch, tilt = 0, onRemove, removeLabel, className, style, ...nativeProps
}, ref) {
  const content = <>
    {leading != null && <span className="kraft-tag-leading" aria-hidden="true">{leading}</span>}
    {swatch != null && <span className="kraft-tag-swatch" aria-hidden="true" style={{ backgroundColor: swatch }} />}
    <span className="kraft-tag-label">{children}</span>
  </>;

  let target;
  if (nativeProps.as === 'button') {
    const { as, type = 'button', ...buttonProps } = nativeProps;
    target = <button {...buttonProps} className="kraft-tag-target" ref={ref as ForwardedRef<HTMLButtonElement>}
      type={type}>{content}</button>;
  } else if (nativeProps.as === 'a') {
    const { as, ...linkProps } = nativeProps;
    target = <a {...linkProps} className="kraft-tag-target" ref={ref as ForwardedRef<HTMLAnchorElement>}>{content}</a>;
  } else {
    const { as, ...spanProps } = nativeProps;
    target = <span {...spanProps} className="kraft-tag-target" ref={ref as ForwardedRef<HTMLSpanElement>}>{content}</span>;
  }

  return <span className={className ? `kraft-tag ${className}` : 'kraft-tag'} data-variant={variant}
    dir={nativeProps.dir} style={{ ...style, '--kraft-tag-tilt': `${tilt}deg` } as CSSProperties}>
    {target}
    {onRemove && <button className="kraft-tag-remove" type="button" aria-label={removeLabel} onClick={onRemove}>
      <TagIcon name="close" size={14} />
    </button>}
  </span>;
}) as ForwardRefExoticComponent<
  (StaticTagProps & RefAttributes<HTMLSpanElement>) |
  (LinkTagProps & RefAttributes<HTMLAnchorElement>) |
  (ButtonTagProps & RefAttributes<HTMLButtonElement>)
>;
