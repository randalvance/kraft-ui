import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ForwardedRef, type ForwardRefExoticComponent, type ReactElement, type ReactNode, type RefAttributes } from 'react';
import { createIcon } from './create-icon.js';
import { checkIcon, plusIcon } from './icon-glyphs.js';
import type { Tone } from './primitives.js';

const CardGlyph = /* @__PURE__ */ createIcon({ check: checkIcon, plus: plusIcon });

export type CardTone = Tone | 'ochre' | 'teal' | 'violet' | 'plum' | 'blush' | 'navy';

type CardSlots = {
  header?: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  corner?: ReactNode;
  /** Adds a colour spine. Omit for a plain edge. */
  tone?: CardTone;
  /** Dims the paper while leaving its controls enabled. */
  off?: boolean;
  selected?: boolean;
  /** Rotation in degrees when theme tilt is enabled. */
  tilt?: number;
};

type ActionName = { 'aria-label': string } | { 'aria-labelledby': string };
/** Native props without the slot names, so a slot never takes on an attribute's type (an anchor's `media` is a string). */
type NativeProps<T extends 'article' | 'a' | 'button'> =
  Omit<ComponentPropsWithoutRef<T>, 'dangerouslySetInnerHTML' | keyof CardSlots>;
type ArticleCardProps = CardSlots & NativeProps<'article'> & { as?: 'article' };
type LinkCardProps = CardSlots & NativeProps<'a'> & ActionName & {
  as: 'a';
  href: string;
};
type ButtonCardProps = CardSlots & NativeProps<'button'> & ActionName & {
  as: 'button';
};

export type CardProps = ArticleCardProps | LinkCardProps | ButtonCardProps;

/** A paper card with optional whole-card activation and independent slot controls. */
export const Card = forwardRef<HTMLElement, CardProps>(function Card({
  header, media, children, footer, corner, tone, off, selected, tilt = 0, className, style, ...nativeProps
}, ref) {
  const frameProps = {
    className: className ? `kraft-card ${className}` : 'kraft-card',
    style: { ...style, '--kraft-card-tilt': `${tilt}deg` } as CSSProperties,
    'data-tone': tone,
    'data-off': off || undefined,
    'data-selected': selected || undefined,
  };
  const slots = <div className="kraft-card-slots">
    {(header != null || corner != null || selected) && <div className="kraft-card-top">
      {header != null && <header className="kraft-card-header">{header}</header>}
      {(corner != null || selected) && <div className="kraft-card-corner">
        {selected && <CardGlyph name="check" size={18} />}
        {corner}
      </div>}
    </div>}
    {media != null && <div className="kraft-card-media">{media}</div>}
    {children != null && <div className="kraft-card-body">{children}</div>}
    {footer != null && <footer className="kraft-card-footer">{footer}</footer>}
  </div>;

  let target: ReactElement;
  if (nativeProps.as === 'a') {
    const { as, ...linkProps } = nativeProps;
    target = <a {...linkProps} className="kraft-card-target" ref={ref as ForwardedRef<HTMLAnchorElement>}
      aria-current={linkProps['aria-current'] ?? (selected || undefined)} />;
  } else if (nativeProps.as === 'button') {
    const { as, type = 'button', ...buttonProps } = nativeProps;
    target = <button {...buttonProps} className="kraft-card-target" ref={ref as ForwardedRef<HTMLButtonElement>}
      type={type} aria-pressed={selected ?? buttonProps['aria-pressed']} />;
  } else {
    const { as, ...articleProps } = nativeProps;
    return <article {...articleProps} {...frameProps} ref={ref}>{slots}</article>;
  }

  return <article {...frameProps}>{target}{slots}</article>;
}) as ForwardRefExoticComponent<
  (ArticleCardProps & RefAttributes<HTMLElement>) |
  (LinkCardProps & RefAttributes<HTMLAnchorElement>) |
  (ButtonCardProps & RefAttributes<HTMLButtonElement>)
>;

export type CardAddTileProps = Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'dangerouslySetInnerHTML'> & {
  label: string;
};

/** A dashed paper tile for the add action at the end of a card grid. */
export const CardAddTile = forwardRef<HTMLButtonElement, CardAddTileProps>(function CardAddTile({
  label, type = 'button', className, ...props
}, ref) {
  return <button {...props} type={type} ref={ref}
    className={className ? `kraft-card-add-tile ${className}` : 'kraft-card-add-tile'}>
    <CardGlyph name="plus" size={24} />
    <span>{label}</span>
  </button>;
});
