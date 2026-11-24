import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Pinwheel } from './material-marks.js';

export type StatusTone = 'working' | 'waiting' | 'blocked' | 'done' | 'idle';
export type StatusDotVariant = 'solid' | 'hollow' | 'dashed';
export type StatusDotShape = 'round' | 'square';
export type StatusDotSize = 8 | 10 | 12;

/**
 * Each tone has a default form, so the five states differ in shape or stroke
 * as well as colour: working is a solid disc, waiting a dashed ring, blocked a
 * solid square, done a disc with a tick, and idle a hollow ring.
 */
const toneForm: Record<StatusTone, { variant: StatusDotVariant; shape: StatusDotShape }> = {
  working: { variant: 'solid', shape: 'round' },
  waiting: { variant: 'dashed', shape: 'round' },
  blocked: { variant: 'solid', shape: 'square' },
  done: { variant: 'solid', shape: 'round' },
  idle: { variant: 'hollow', shape: 'round' },
};

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

/*
 * Drawn in a 12-unit box so the cut ring, stroke, dashes, and tick keep their
 * proportions at every size. `pathLength` fixes the number of dashes, so a
 * dashed ring reads the same at 8px as at 12px.
 */
function DotMark({ tone, variant, shape }: { tone: StatusTone; variant: StatusDotVariant; shape: StatusDotShape }) {
  const dashed = variant === 'dashed';
  const mark = {
    className: 'kraft-status-dot-stroke',
    strokeWidth: 1.5,
    pathLength: dashed ? (shape === 'round' ? 12 : 16) : undefined,
    strokeDasharray: dashed ? '1.25 .75' : undefined,
  };
  return <svg className="kraft-status-dot-mark" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
    data-variant={variant}>
    {shape === 'round'
      ? <><circle className="kraft-status-dot-cut" cx="6" cy="6" r="6" /><circle {...mark} cx="6" cy="6" r="4" /></>
      : <><rect className="kraft-status-dot-cut" width="12" height="12" rx="2.5" /><rect {...mark} x="2" y="2" width="8" height="8" rx="1" /></>}
    {tone === 'done' && variant === 'solid' && <path className="kraft-status-dot-tick" d="M4.1 6.2 5.4 7.5 7.9 4.7" />}
  </svg>;
}

type StatusDotBaseProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-hidden'> & {
  tone: StatusTone;
  /** Overrides the tone's default form. */
  variant?: StatusDotVariant;
  /** Overrides the tone's default shape. */
  shape?: StatusDotShape;
  /** Diameter in pixels. Defaults to 10. */
  size?: StatusDotSize;
};

export type StatusDotProps = StatusDotBaseProps & (
  /** A visible label printed beside the dot, as in a legend. */
  | { children: ReactNode; label?: never }
  /** An accessible name for a dot shown without text, such as on the corner of a portrait. */
  | { label: string; children?: never }
);

/**
 * A small coloured mark for the state of something. It never relies on colour
 * alone: pass visible `children` or an accessible `label`.
 */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot({
  tone, variant, shape, size = 10, label, children, className, style, ...props
}, ref) {
  const form = { variant: variant ?? toneForm[tone].variant, shape: shape ?? toneForm[tone].shape };
  const visible = children != null && typeof children !== 'boolean';
  return <span {...props} ref={ref} className={cx('kraft-status-dot', className)}
    role={visible ? undefined : 'img'} aria-label={visible ? undefined : label}
    data-tone={tone} data-variant={form.variant} data-shape={form.shape} data-size={size} style={style}>
    <DotMark tone={tone} {...form} />
    {visible && <span className="kraft-status-dot-label">{children}</span>}
  </span>;
});

export type StatusStickerVariant = 'solid' | 'paper' | 'ghost';
export type StatusStickerIndicator = 'dot' | 'spinner';
export type StatusStickerSize = 'sm' | 'md';

export type StatusStickerProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  /** The state in words, such as `Running`. It prints in small capitals and is read as written. */
  children: ReactNode;
  tone: StatusTone;
  /** `solid` fills the sticker with the tone, `paper` prints it on plain paper, and `ghost` draws a dashed outline. */
  variant?: StatusStickerVariant;
  /** A decorative dot in the tone's form, or the shared spinner for work in progress. */
  indicator?: StatusStickerIndicator;
  size?: StatusStickerSize;
};

/** A small uppercase sticker for a state such as RUNNING, IDLE, or BLOCKED. Its text supplies the meaning. */
export const StatusSticker = forwardRef<HTMLSpanElement, StatusStickerProps>(function StatusSticker({
  children, tone, variant = 'solid', indicator, size = 'md', className, ...props
}, ref) {
  return <span {...props} ref={ref} className={cx('kraft-status-sticker', className)}
    data-tone={tone} data-variant={variant} data-size={size}>
    {indicator === 'dot' && <span className="kraft-status-sticker-indicator" aria-hidden="true">
      <DotMark tone={tone} {...toneForm[tone]} />
    </span>}
    {indicator === 'spinner' && <Pinwheel className="kraft-status-sticker-indicator" size="button" />}
    <span className="kraft-status-sticker-label">{children}</span>
  </span>;
});
