import { forwardRef, type ComponentPropsWithoutRef, type ComponentPropsWithRef, type CSSProperties, type ElementType, type ForwardedRef, type ReactElement, type ReactNode } from 'react';
import { Pinwheel } from './material-marks.js';

export type Space = 0 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 24;
export type Theme = 'paper' | 'night';
export type Tone = 'neutral' | 'blue' | 'sage' | 'danger' | 'attention';
/** The five shared tones and the wider palette, for pieces that carry an identity colour such as a workspace or a model. */
export type ExtendedTone = Tone | 'ochre' | 'teal' | 'violet' | 'plum' | 'blush' | 'navy';
type LayoutProps = { padding?: Space; gap?: Space; align?: 'start' | 'center' | 'end' | 'stretch'; justify?: 'start' | 'center' | 'end' | 'between'; wrap?: boolean };
export type PolymorphicProps<E extends ElementType, P> = P & { as?: E } & Omit<ComponentPropsWithoutRef<E>, keyof P | 'as'>;
export type PolymorphicComponent<P, D extends ElementType = 'div'> = <E extends ElementType = D>(props: PolymorphicProps<E, P> & { ref?: ComponentPropsWithRef<E>['ref'] }) => ReactElement | null;
const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');
const space = (value?: Space) => value === undefined ? undefined : value === 0 ? '0px' : `var(--kraft-space-${value})`;
const layoutStyle = ({ padding, gap }: LayoutProps, style?: CSSProperties) => ({ '--kraft-padding': space(padding), '--kraft-gap': space(gap), ...style }) as CSSProperties;

function layout(name: string) {
  return forwardRef(function Layout({ as: Tag = 'div', padding, gap, align, justify, wrap, className, style, ...props }: PolymorphicProps<ElementType, LayoutProps>, ref: ForwardedRef<HTMLElement>) {
    return <Tag {...props} ref={ref} className={cx('kraft-box', `kraft-${name}`, className)} data-align={align} data-justify={justify} data-wrap={wrap || undefined} style={layoutStyle({ padding, gap }, style)} />;
  }) as PolymorphicComponent<LayoutProps>;
}
export const Box = layout('box');
export const Stack = layout('stack');
export const Inline = layout('inline');

export type ThemeProviderProps = ComponentPropsWithoutRef<'div'> & {
  theme?: Theme; texture?: boolean; motion?: boolean; tilt?: boolean;
};
/** Scoped theme boundary. No document mutation or browser APIs; safe for SSR. */
export const ThemeProvider = forwardRef<HTMLDivElement, ThemeProviderProps>(function ThemeProvider({ theme = 'paper', texture = true, motion = true, tilt = true, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('kraft-root', className)} data-kraft-theme={theme} data-kraft-texture={texture ? 'on' : 'off'} data-kraft-motion={motion ? 'on' : 'off'} data-kraft-tilt={tilt ? 'on' : 'off'} />;
});

export type TextVariant = 'body' | 'label' | 'label-sm' | 'hand' | 'serif' | 'lead' | 'code';
export type TextTone = 'default' | 'muted' | 'faint' | 'danger' | 'attention';
/** Handwriting sizes: 17, 22, 26, 38, and 52px. */
export type HandSize = 'sm' | 'md' | 'lg' | 'xl' | 'display';
export type TextProps = {
  variant?: TextVariant;
  tone?: TextTone;
  /** Size of the `hand` variant. Other variants keep their own size. */
  size?: HandSize;
  /** Caps the line length at 72ch. Code text in a `pre` is never capped. */
  measure?: boolean;
  children?: ReactNode;
};
export const Text = forwardRef(function Text({ as: Tag = 'p', variant = 'body', tone = 'default', size = 'sm', measure = true, className, ...props }: PolymorphicProps<ElementType, TextProps>, ref: ForwardedRef<HTMLElement>) {
  return <Tag {...props} ref={ref} className={cx('kraft-text', `kraft-type-${variant}`, className)} data-tone={tone}
    data-size={variant === 'hand' ? size : undefined} data-measure={measure ? undefined : 'off'} />;
}) as PolymorphicComponent<TextProps, 'p'>;
export type HeadingSize = 'sm' | 'md' | 'lg' | 'title-sm' | 'title' | 'display';
export type HeadingProps = {
  /** `sm`, `md`, and `lg` print in serif. `title-sm`, `title`, and `display` are handwritten at 26, 38, and 52px. */
  size?: HeadingSize;
  /** Balances line lengths when the heading wraps. */
  balance?: boolean;
  children?: ReactNode;
};
export const Heading = forwardRef(function Heading({ as: Tag = 'h2', size = 'md', balance = true, className, ...props }: PolymorphicProps<ElementType, HeadingProps>, ref: ForwardedRef<HTMLElement>) {
  return <Tag {...props} ref={ref} className={cx('kraft-heading', className)} data-size={size} data-balance={balance ? undefined : 'off'} />;
}) as PolymorphicComponent<HeadingProps, 'h2'>;

export type SurfaceProps = Pick<LayoutProps, 'padding'> & { material?: 'paper' | 'cardboard' | 'kraft'; elevation?: 0 | 1 | 2 | 3; children?: ReactNode };
export const Surface = forwardRef(function Surface({ as: Tag = 'div', material = 'paper', elevation = 1, padding = 24, className, style, ...props }: PolymorphicProps<ElementType, SurfaceProps>, ref: ForwardedRef<HTMLElement>) {
  return <Tag {...props} ref={ref} className={cx('kraft-box', 'kraft-surface', className)} data-material={material} data-elevation={elevation} style={layoutStyle({ padding }, style)} />;
}) as PolymorphicComponent<SurfaceProps>;

export type MatProps = Pick<SurfaceProps, 'padding' | 'children'> & { tone?: 'kraft' | 'amber' | 'sage' | 'red' };
export const Mat = forwardRef(function Mat({
  as: Tag = 'div', tone = 'kraft', padding = 16, className, children, ...props
}: PolymorphicProps<ElementType, MatProps>, ref: ForwardedRef<HTMLElement>) {
  return <Tag {...props} ref={ref} className={cx('kraft-mat', className)} data-tone={tone}>
    <Surface padding={padding}>{children}</Surface>
  </Tag>;
}) as PolymorphicComponent<MatProps>;

export type ButtonVariant = ExtendedTone | 'ghost' | 'text' | 'dashed';
export type IconButtonVariant = ExtendedTone | 'bare';

type NativeButtonProps = ComponentPropsWithoutRef<'button'> & { size?: 'sm' | 'md' | 'lg'; loading?: boolean };
type ButtonBaseProps = NativeButtonProps & { variant?: ButtonVariant | IconButtonVariant };
const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(function ButtonBase({
  variant = 'neutral', size = 'md', loading = false, disabled, type = 'button', className, children, ...props
}, ref) {
  return <button {...props} ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || props['aria-busy']}
    className={cx('kraft-button', className)} data-variant={variant} data-size={size}>
    {loading && <Pinwheel size="button" />}
    {children}
  </button>;
});

export type ButtonProps = NativeButtonProps & {
  variant?: ButtonVariant;
  /** Ink tone for the text variant. */
  tone?: 'neutral' | 'danger';
  leading?: ReactNode;
  wrap?: boolean;
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ leading, wrap, tone, loading, children, ...props }, ref) {
  return <ButtonBase {...props} ref={ref} loading={loading} data-button-tone={tone} data-button-wrap={wrap || undefined}>
    {!loading && leading != null && typeof leading !== 'boolean' && <span className="kraft-button-leading" aria-hidden="true">{leading}</span>}
    {children}
  </ButtonBase>;
});

export type IconButtonProps = Omit<NativeButtonProps, 'children' | 'aria-label'> & {
  variant?: IconButtonVariant;
  'aria-label': string;
  children: ReactNode;
  badge?: ReactNode;
};
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ className, loading, children, badge, ...props }, ref) {
  return <ButtonBase {...props} ref={ref} loading={loading} className={cx('kraft-icon-button', className)}>
    {!loading && children}
    {badge != null && typeof badge !== 'boolean' && <span className="kraft-icon-button-badge" aria-hidden="true">{badge}</span>}
  </ButtonBase>;
});
export type LinkProps = ComponentPropsWithoutRef<'a'> & {
  /** `inherit` takes the surrounding ink, for a link that fills a heading. */
  tone?: 'link' | 'inherit';
  /** `hover` draws the underline only on hover and keyboard focus. */
  underline?: 'always' | 'hover';
};
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ tone = 'link', underline = 'always', className, ...props }, ref) {
  return <a {...props} ref={ref} className={cx('kraft-link', className)} data-tone={tone === 'inherit' ? tone : undefined} data-underline={underline === 'hover' ? underline : undefined} />;
});
export type SeparatorProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean };
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator({ orientation = 'horizontal', decorative = false, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('kraft-separator', className)} role={decorative ? 'none' : 'separator'} aria-orientation={decorative ? undefined : orientation} data-orientation={orientation} />;
});
export type MarkSize = 'default' | 'sm' | 'count';
export type BadgeProps = ComponentPropsWithoutRef<'span'> & { tone?: ExtendedTone; size?: MarkSize };
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ tone = 'neutral', size = 'default', className, ...props }, ref) {
  return <span {...props} ref={ref} className={cx('kraft-badge', className)} data-tone={tone} data-size={size} />;
});
export type StickerProps = ComponentPropsWithoutRef<'span'> & { tone?: ExtendedTone; size?: MarkSize; shape?: 'round' | 'pill' | 'square'; decorative?: boolean };
export const Sticker = forwardRef<HTMLSpanElement, StickerProps>(function Sticker({ tone = 'blue', shape = 'round', size = 'default', decorative = false, className, ...props }, ref) {
  return <span {...props} ref={ref} className={cx('kraft-sticker', className)} data-tone={tone} data-shape={shape} data-size={size} aria-hidden={decorative || props['aria-hidden'] || undefined} />;
});
