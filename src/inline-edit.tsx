import { forwardRef, useCallback, useEffect, useId, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { createIcon } from './create-icon.js';
import { pencilIcon } from './icon-glyphs.js';
import { TextField } from './form-fields.js';

const InlineEditIcon = createIcon({ pencil: pencilIcon });

export type InlineEditProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'defaultValue'> & {
  /** Names the editor and describes the title button's action. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  disabled?: boolean;
};

/** A handwritten heading that can be edited in place. */
export const InlineEdit = forwardRef<HTMLDivElement, InlineEditProps>(function InlineEdit({
  label, value, defaultValue = '', onValueChange, placeholder = 'Untitled', titleAs: Title = 'h1',
  disabled = false, className, ...props
}, ref) {
  const titleId = useId();
  const [localValue, setLocalValue] = useState(defaultValue);
  const [draft, setDraft] = useState<string | null>(null);
  const current = value ?? localValue;
  const title = current.trim() ? current : placeholder;
  const editing = draft !== null && !disabled;
  const initialDraft = useRef('');
  const returningFocus = useRef(false);

  if (disabled && draft !== null) setDraft(null);
  useEffect(() => {
    if (disabled) returningFocus.current = false;
  }, [disabled]);

  const focusTrigger = useCallback((button: HTMLButtonElement | null) => {
    if (!button || !returningFocus.current) return;
    button.focus({ preventScroll: true });
    returningFocus.current = false;
  }, []);

  const focusInput = useCallback((input: HTMLInputElement | null) => {
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, []);

  function beginEdit() {
    if (returningFocus.current) return;
    initialDraft.current = current;
    setDraft(current);
  }

  function finishEdit(next: string, restoreFocus: boolean, commit: boolean) {
    returningFocus.current = restoreFocus;
    setDraft(null);
    if (!commit || next === initialDraft.current || next === current) return;
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  }

  return <div {...props} ref={ref} className={className ? `kraft-inline-edit ${className}` : 'kraft-inline-edit'}>
    <Title className="kraft-inline-edit-heading" aria-labelledby={titleId}>
      {editing || disabled
        ? <span id={titleId} className={editing ? 'kraft-visually-hidden' : undefined}>{title}</span>
        : <button ref={focusTrigger} type="button" className="kraft-inline-edit-trigger"
            aria-label={`${label}: ${title}`} onFocus={beginEdit} onClick={beginEdit}>
            <span id={titleId}>{title}</span><InlineEditIcon name="pencil" size={16} />
          </button>}
    </Title>
    {editing && <TextField ref={focusInput} className="kraft-inline-edit-input" variant="underline" size="title"
      aria-label={label} value={draft} placeholder={placeholder} onChange={event => setDraft(event.currentTarget.value)}
      onBlur={event => {
        if (!returningFocus.current) finishEdit(event.currentTarget.value, false, true);
      }}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          finishEdit(current, true, false);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          finishEdit(event.currentTarget.value, true, true);
        }
      }} />}
  </div>;
});
