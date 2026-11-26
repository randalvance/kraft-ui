import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { createIcon } from './create-icon.js';
import { closeIcon } from './icon-glyphs.js';
import type { Tone } from './primitives.js';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');
const present = (node: ReactNode) => node != null && typeof node !== 'boolean' && node !== '';
const FeedbackIcon = /* @__PURE__ */ createIcon({ close: closeIcon });

export type BannerProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  /** The line of consequence: what the control's current state means. */
  children: ReactNode;
  /** A short bold lead before the line. */
  title?: ReactNode;
  /** The control the strip is about, such as a Toggle or a Button. */
  control?: ReactNode;
  /** Which end of the strip holds the control. Reading order follows it. */
  controlSide?: 'start' | 'end';
  tone?: Tone;
};

/** A full-width paper strip that pairs one control with a line saying what it does. */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner({
  children, title, control, controlSide = 'start', tone = 'neutral', className, ...props
}, ref) {
  const slot = present(control) && <div className="kraft-banner-control">{control}</div>;
  return <div {...props} ref={ref} className={cx('kraft-banner', className)} data-tone={tone}>
    {controlSide === 'start' && slot}
    <div className="kraft-banner-line">
      {present(title) && <><strong className="kraft-banner-title">{title}</strong>{' '}</>}
      {children}
    </div>
    {controlSide === 'end' && slot}
  </div>;
});

export type CalloutProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  children: ReactNode;
  title?: ReactNode;
  /** A decorative icon before the text. */
  leading?: ReactNode;
  /** A control at the end of the note, such as the button that carries out a dangerous action. */
  action?: ReactNode;
  tone?: Tone;
};

/** A bordered note set apart from the text around it. `tone="danger"` with an `action` warns before a destructive step. */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout({
  children, title, leading, action, tone = 'neutral', className, ...props
}, ref) {
  return <div role="note" {...props} ref={ref} className={cx('kraft-callout', className)} data-tone={tone}>
    {present(leading) && <span className="kraft-callout-leading" aria-hidden="true">{leading}</span>}
    <div className="kraft-callout-text">
      {present(title) && <div className="kraft-callout-title">{title}</div>}
      <div className="kraft-callout-body">{children}</div>
    </div>
    {present(action) && <div className="kraft-callout-action">{action}</div>}
  </div>;
});

export type EmptyStateProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  /** What is missing, in a few words. */
  title: ReactNode;
  /** A paragraph by default. Choose a heading level that fits the page outline. */
  titleAs?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** The note explaining why there is nothing here. */
  children?: ReactNode;
  /** A decorative icon or mark above the title. */
  leading?: ReactNode;
  /** The next step, usually one Button. */
  action?: ReactNode;
  size?: 'sm' | 'md';
};

/** A dashed placeholder that says why a list or page is empty and offers the next step. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState({
  title, titleAs: Title = 'p', children, leading, action, size = 'md', className, ...props
}, ref) {
  return <div {...props} ref={ref} className={cx('kraft-empty-state', className)} data-size={size}>
    {present(leading) && <span className="kraft-empty-state-leading" aria-hidden="true">{leading}</span>}
    <Title className="kraft-empty-state-title">{title}</Title>
    {present(children) && <div className="kraft-empty-state-note">{children}</div>}
    {present(action) && <div className="kraft-empty-state-action">{action}</div>}
  </div>;
});

export type ToastDismissReason = 'close' | 'timeout' | 'undo';

export type ToastProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  /** The message, such as "Card archived". */
  children: ReactNode;
  /** A decorative icon before the message. */
  leading?: ReactNode;
  /** Shows the Undo button. `onDismiss("undo")` follows the call. */
  onUndo?: () => void;
  undoLabel?: string;
  /** Shows the close button and receives why the toast is leaving. The application removes the toast. */
  onDismiss?: (reason: ToastDismissReason) => void;
  dismissLabel?: string;
  /** Milliseconds before `onDismiss("timeout")`. The count restarts after the pointer or focus leaves. Omit it to keep the toast until it is dismissed. */
  duration?: number;
};

/** A brief kraft slip confirming an action, with an optional Undo. It is a polite live status. */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast({
  children, leading, onUndo, undoLabel = 'Undo', onDismiss, dismissLabel = 'Dismiss', duration, className,
  onPointerEnter, onPointerLeave, onFocus, onBlur, onKeyDown, ...props
}, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const dismissRef = useRef(onDismiss);
  useEffect(() => { dismissRef.current = onDismiss; });
  // Whatever had focus when the toast appeared gets it back if the toast is dismissed from inside.
  const opener = useRef<Element | null>(null);
  useEffect(() => { opener.current = document.activeElement; }, []);

  const timed = duration !== undefined && duration > 0 && !hovered && !focused;
  useEffect(() => {
    if (!timed) return;
    const timer = setTimeout(() => dismissRef.current?.('timeout'), duration);
    return () => clearTimeout(timer);
  }, [timed, duration]);

  const leave = (reason: ToastDismissReason) => {
    const root = rootRef.current;
    const target = opener.current;
    if (root?.contains(document.activeElement) && target instanceof HTMLElement && target.isConnected && !root.contains(target)) target.focus();
    onDismiss?.(reason);
  };

  return <div role="status" aria-atomic="true" {...props} ref={rootRef} className={cx('kraft-toast', className)}
    onPointerEnter={event => { setHovered(true); onPointerEnter?.(event); }}
    onPointerLeave={event => { setHovered(false); onPointerLeave?.(event); }}
    onFocus={event => { setFocused(true); onFocus?.(event); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); onBlur?.(event); }}
    onKeyDown={event => {
      onKeyDown?.(event);
      if (event.key !== 'Escape' || event.defaultPrevented || !onDismiss) return;
      event.stopPropagation();
      leave('close');
    }}>
    {present(leading) && <span className="kraft-toast-leading" aria-hidden="true">{leading}</span>}
    <div className="kraft-toast-message">{children}</div>
    {onUndo && <button type="button" className="kraft-toast-undo" onClick={() => { onUndo(); leave('undo'); }}>{undoLabel}</button>}
    {onDismiss && <button type="button" className="kraft-toast-close" aria-label={dismissLabel} onClick={() => leave('close')}>
      <FeedbackIcon name="close" size={16} />
    </button>}
  </div>;
});

export type ToastPlacement = 'bottom' | 'bottom-end' | 'top' | 'top-end';

export type ToastRegionProps = ComponentPropsWithoutRef<'div'> & {
  /** Names the landmark that holds the toasts. */
  label?: string;
  placement?: ToastPlacement;
};

/** A named landmark fixed to an edge of the viewport that stacks toasts. Keep it mounted and render toasts inside it. */
export const ToastRegion = forwardRef<HTMLDivElement, ToastRegionProps>(function ToastRegion({
  label = 'Notifications', placement = 'bottom', className, ...props
}, ref) {
  return <div role="region" aria-label={label} {...props} ref={ref} className={cx('kraft-toast-region', className)} data-placement={placement} />;
});
