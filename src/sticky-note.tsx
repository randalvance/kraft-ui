import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ForwardedRef, type ForwardRefExoticComponent, type ReactNode, type RefAttributes } from 'react';

export type StickyNoteTone = 'attention' | 'blush' | 'blue' | 'sage' | 'ochre';
export type StickyNoteStatus = 'waiting' | 'done';

type NoteSlots = {
  tone?: StickyNoteTone;
  /** Rotation in degrees when theme tilt is enabled. */
  tilt?: number;
  /** Shown above the body. The note adds no heading: give one placed here the level that follows the page outline. */
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  status?: StickyNoteStatus;
  /** Overrides the visible Waiting or Done label. */
  statusLabel?: string;
};

type ArticleNoteProps = NoteSlots & ComponentPropsWithoutRef<'article'> & { as?: 'article' };
type ButtonNoteProps = NoteSlots & ComponentPropsWithoutRef<'button'> & {
  as: 'button';
  /** Controlled pressed state for a selectable note. */
  selected?: boolean;
};

export type StickyNoteProps = ArticleNoteProps | ButtonNoteProps;

const statusLabels: Record<StickyNoteStatus, string> = { waiting: 'Waiting', done: 'Done' };

/** A curled sheet of note paper. Use the button variant to activate the entire note. */
export const StickyNote = forwardRef<HTMLElement, StickyNoteProps>(function StickyNote({
  tone = 'attention', tilt = -2, header, children, footer, status, statusLabel, className, style, ...nativeProps
}, ref) {
  const Slot = nativeProps.as === 'button' ? 'span' : 'div';
  const content = <>
    {header != null && <><Slot className="kraft-sticky-note-header">{header}</Slot>{' '}</>}
    <Slot className="kraft-sticky-note-body">{children}</Slot>
    {(footer != null || status) && <>{' '}<Slot className="kraft-sticky-note-footer">
      {footer}
      {status && <>{' '}<span className="kraft-sticky-note-status">{statusLabel ?? statusLabels[status]}</span></>}
    </Slot></>}
  </>;
  const noteProps = {
    className: className ? `kraft-sticky-note ${className}` : 'kraft-sticky-note',
    style: { ...style, '--kraft-sticky-note-tilt': `${tilt}deg` } as CSSProperties,
    'data-tone': tone,
    'data-status': status,
  };

  if (nativeProps.as === 'button') {
    const { as, type = 'button', selected, ...buttonProps } = nativeProps;
    return <button {...buttonProps} {...noteProps} ref={ref as ForwardedRef<HTMLButtonElement>}
      type={type} aria-pressed={selected ?? buttonProps['aria-pressed']}>{content}</button>;
  }

  const { as, ...articleProps } = nativeProps;
  return <article {...articleProps} {...noteProps} ref={ref}>{content}</article>;
}) as ForwardRefExoticComponent<
  (ArticleNoteProps & RefAttributes<HTMLElement>) | (ButtonNoteProps & RefAttributes<HTMLButtonElement>)
>;
