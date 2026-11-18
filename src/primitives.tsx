import { forwardRef, type ComponentPropsWithoutRef, type ComponentPropsWithRef, type CSSProperties, type ElementType, type ForwardedRef, type ReactElement, type ReactNode } from 'react';
import { Pinwheel } from './material-marks.js';

export type Space = 0 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 24;
export type Theme = 'paper' | 'night';
export type Tone = 'neutral' | 'blue' | 'sage' | 'danger' | 'attention';
type LayoutProps = { padding?: Space; gap?: Space; align?: 'start' | 'center' | 'end' | 'stretch'; justify?: 'start' | 'center' | 'end' | 'between'; wrap?: boolean };
type PolymorphicProps<E extends ElementType, P> = P & { as?: E } & Omit<ComponentPropsWithoutRef<E>, keyof P | 'as'>;
type PolymorphicComponent<P, D extends ElementType = 'div'> = <E extends ElementType = D>(props: PolymorphicProps<E, P> & { ref?: ComponentPropsWithRef<E>['ref'] }) => ReactElement | null;
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

export type TextProps = { variant?: 'body' | 'label' | 'label-sm' | 'hand' | 'code'; tone?: 'default' | 'muted'; children?: ReactNode };
export const Text = forwardRef(function Text({ as: Tag = 'p', variant = 'body', tone = 'default', className, ...props }: PolymorphicProps<ElementType, TextProps>, ref: ForwardedRef<HTMLElement>) {
  return <Tag {...props} ref={ref} className={cx('kraft-text', `kraft-type-${variant}`, className)} data-tone={tone} />;
}) as PolymorphicComponent<TextProps, 'p'>;
export type HeadingProps = { size?: 'sm' | 'md' | 'lg' | 'title'; children?: ReactNode };
export const Heading = forwardRef(function Heading({ as: Tag = 'h2', size = 'md', className, ...props }: PolymorphicProps<ElementType, HeadingProps>, ref: ForwardedRef<HTMLElement>) {
  return <Tag {...props} ref={ref} className={cx('kraft-heading', className)} data-size={size} />;
}) as PolymorphicComponent<HeadingProps, 'h2'>;

export type SurfaceProps = Pick<LayoutProps, 'padding'> & { material?: 'paper' | 'cardboard' | 'kraft'; elevation?: 0 | 1 | 2 | 3; children?: ReactNode };
export const Surface = forwardRef(function Surface({ as: Tag = 'div', material = 'paper', elevation = 1, padding = 24, className, style, ...props }: PolymorphicProps<ElementType, SurfaceProps>, ref: ForwardedRef<HTMLElement>) {
  return <Tag {...props} ref={ref} className={cx('kraft-box', 'kraft-surface', className)} data-material={material} data-elevation={elevation} style={layoutStyle({ padding }, style)} />;
}) as PolymorphicComponent<SurfaceProps>;

export type MatProps = Pick<SurfaceProps, 'padding' | 'children'> & { tone?: 'kraft' | 'amber' | 'sage' };
export const Mat = forwardRef(function Mat({
  as: Tag = 'div', tone = 'kraft', padding = 16, className, children, ...props
}: PolymorphicProps<ElementType, MatProps>, ref: ForwardedRef<HTMLElement>) {
  return <Tag {...props} ref={ref} className={cx('kraft-mat', className)} data-tone={tone}>
    <Surface padding={padding}>{children}</Surface>
  </Tag>;
}) as PolymorphicComponent<MatProps>;

export type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant?: Tone; size?: 'sm' | 'md' | 'lg'; loading?: boolean };
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'neutral', size = 'md', loading = false, disabled, type = 'button', className, children, ...props }, ref) {
  return <button {...props} ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || props['aria-busy'] || undefined} className={cx('kraft-button', className)} data-variant={variant} data-size={size}>
    {loading && <Pinwheel size="button" />}{children}
  </button>;
});
export type IconButtonProps = Omit<ButtonProps, 'children' | 'aria-label'> & { 'aria-label': string; children: ReactNode };
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ className, loading = false, children, ...props }, ref) {
  return <Button {...props} ref={ref} loading={loading} className={cx('kraft-icon-button', className)}>{loading ? null : children}</Button>;
});
export const Link = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(function Link({ className, ...props }, ref) {
  return <a {...props} ref={ref} className={cx('kraft-link', className)} />;
});
export type SeparatorProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean };
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator({ orientation = 'horizontal', decorative = false, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('kraft-separator', className)} role={decorative ? 'none' : 'separator'} aria-orientation={decorative ? undefined : orientation} data-orientation={orientation} />;
});
export type BadgeProps = ComponentPropsWithoutRef<'span'> & { tone?: Tone };
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ tone = 'neutral', className, ...props }, ref) {
  return <span {...props} ref={ref} className={cx('kraft-badge', className)} data-tone={tone} />;
});
export type StickerProps = ComponentPropsWithoutRef<'span'> & { tone?: Tone; shape?: 'round' | 'pill' | 'square'; decorative?: boolean };
export const Sticker = forwardRef<HTMLSpanElement, StickerProps>(function Sticker({ tone = 'blue', shape = 'round', decorative = false, className, ...props }, ref) {
  return <span {...props} ref={ref} className={cx('kraft-sticker', className)} data-tone={tone} data-shape={shape} aria-hidden={decorative || props['aria-hidden'] || undefined} />;
});
