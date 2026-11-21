import { forwardRef, useCallback, useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode, type RefObject } from 'react';
import { ScrollRegion } from './scroll-region.js';

export type DialogSize = 'sm' | 'md' | 'lg';

export type DialogProps = Omit<ComponentPropsWithoutRef<'dialog'>, 'open' | 'title' | 'onCancel' | 'onClose'> & {
  /** Dialogs are controlled so the caller owns dismissal and submitted state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Body text or rich content, associated with the dialog as its description. */
  description?: ReactNode;
  leading?: ReactNode;
  /** A tag or stamp displayed above the title. */
  eyebrow?: ReactNode;
  /** Controls displayed beside the close button. */
  actions?: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  /** Set false when a task must be completed using actions inside the dialog. */
  dismissible?: boolean;
  closeLabel?: string;
  /** Defaults to the title. Supply a focusable element inside the dialog when the task needs a different starting point. */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/** A modal paper sheet backed by the native dialog top layer. */
export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog({
  open, onOpenChange, title, titleAs: Title = 'h2', description, leading, eyebrow, actions, footer, size = 'md',
  dismissible = true, closeLabel = 'Close dialog', initialFocusRef,
  children, className, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy, onClick, ...props
}, forwardedRef) {
  const id = useId();
  const hasDescription = description != null && typeof description !== 'boolean' && description !== '';
  const headingId = ariaLabelledBy ?? (ariaLabel ? undefined : `${id}-title`);
  const localRef = useRef<HTMLDialogElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const propCloseEvents = useRef(0);
  const setRef = useCallback((node: HTMLDialogElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') return forwardedRef(node);
    if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  useEffect(() => {
    const dialog = localRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      (initialFocusRef?.current ?? titleRef.current)?.focus();
    } else if (!open && dialog.open) {
      propCloseEvents.current += 1;
      dialog.close();
    }
  }, [open, initialFocusRef]);

  return <dialog {...props} ref={setRef} className={className ? `kraft-dialog ${className}` : 'kraft-dialog'}
    data-size={size}
    aria-label={ariaLabel} aria-labelledby={headingId}
    aria-describedby={[ariaDescribedBy, hasDescription ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined}
    onCancel={event => { event.preventDefault(); if (dismissible) onOpenChange(false); }}
    onClose={() => {
      if (propCloseEvents.current > 0) { propCloseEvents.current -= 1; return; }
      if (open) onOpenChange(false);
    }}
    onClick={event => {
      onClick?.(event);
      if (!dismissible || event.defaultPrevented || event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onOpenChange(false);
    }}>
    <div className="kraft-dialog-header">
      <div className="kraft-dialog-header-row">
        {leading != null && <span className="kraft-dialog-leading" aria-hidden="true">{leading}</span>}
        <div className="kraft-dialog-heading">
          {eyebrow != null && <div className="kraft-dialog-eyebrow">{eyebrow}</div>}
          <Title id={`${id}-title`} ref={titleRef} tabIndex={-1} className="kraft-dialog-title">{title}</Title>
        </div>
        {(actions != null || dismissible) && <div className="kraft-dialog-actions">
          {actions}
          {dismissible && <button type="button" className="kraft-dialog-close" aria-label={closeLabel} onClick={() => onOpenChange(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>}
        </div>}
      </div>
      {hasDescription && <div id={`${id}-description`} className="kraft-dialog-description">{description}</div>}
    </div>
    <ScrollRegion className="kraft-dialog-body" label={ariaLabel} labelledBy={headingId}>{children}</ScrollRegion>
    {footer != null && <div className="kraft-dialog-footer">{footer}</div>}
  </dialog>;
});
