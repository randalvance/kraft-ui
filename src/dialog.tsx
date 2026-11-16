import { forwardRef, useCallback, useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode, type RefObject } from 'react';

export type DialogProps = Omit<ComponentPropsWithoutRef<'dialog'>, 'open' | 'title' | 'onCancel' | 'onClose'> & {
  /** Dialogs are controlled so the caller owns dismissal and submitted state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** A short description, announced with the title when the dialog opens. */
  description?: string;
  leading?: ReactNode;
  footer?: ReactNode;
  /** Set false when a task must be completed using actions inside the dialog. */
  dismissible?: boolean;
  closeLabel?: string;
  /** Defaults to the title. Supply a focusable element inside the dialog when the task needs a different starting point. */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/** A modal paper sheet backed by the native dialog top layer. */
export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog({
  open, onOpenChange, title, titleAs: Title = 'h2', description, leading, footer,
  dismissible = true, closeLabel = 'Close dialog', initialFocusRef,
  children, className, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy, onClick, ...props
}, forwardedRef) {
  const id = useId();
  const localRef = useRef<HTMLDialogElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const propCloseEvents = useRef(0);
  const setRef = useCallback((node: HTMLDialogElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
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
    aria-label={ariaLabel} aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : `${id}-title`)}
    aria-describedby={[ariaDescribedBy, description ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined}
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
      {leading != null && <span className="kraft-dialog-leading" aria-hidden="true">{leading}</span>}
      <div className="kraft-dialog-heading">
        <Title id={`${id}-title`} ref={titleRef} tabIndex={-1} className="kraft-dialog-title">{title}</Title>
        {description && <p id={`${id}-description`} className="kraft-dialog-description">{description}</p>}
      </div>
      {dismissible && <button type="button" className="kraft-dialog-close" aria-label={closeLabel} onClick={() => onOpenChange(false)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>}
    </div>
    <div className="kraft-dialog-body">{children}</div>
    {footer != null && <div className="kraft-dialog-footer">{footer}</div>}
  </dialog>;
});
