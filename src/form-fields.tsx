import { createContext, forwardRef, useContext, useEffect, useId, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';
import { Tag, type TagVariant } from './tag.js';

type FieldContextValue = {
  id: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export type FormFieldProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  /** One TextField, Textarea, SearchField, or TagInput belongs inside each FormField. */
  children: ReactNode;
  label: ReactNode;
  labelStyle?: 'default' | 'uppercase';
  description?: ReactNode;
  error?: ReactNode;
  /** Sets the native control's ID when an external element needs to refer to it. */
  controlId?: string;
};

/** A visible field label and its supporting or validation text. */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField({
  children, label, labelStyle = 'default', description, error, controlId, className, ...props
}, ref) {
  const generatedId = useId();
  const id = controlId ?? `${generatedId}-control`;
  const hasDescription = description != null && description !== false && description !== '';
  const invalid = error != null && error !== false && error !== '';
  const context: FieldContextValue = {
    id,
    descriptionId: hasDescription ? `${generatedId}-description` : undefined,
    errorId: invalid ? `${generatedId}-error` : undefined,
    invalid,
  };

  return <FieldContext.Provider value={context}>
    <div {...props} ref={ref} className={className ? `kraft-form-field ${className}` : 'kraft-form-field'} data-invalid={invalid || undefined}>
      <div className="kraft-form-field-heading">
        <label className="kraft-form-field-label" data-label-style={labelStyle} htmlFor={id}>{label}</label>
        {hasDescription && <span id={context.descriptionId} className="kraft-form-field-description">{description}</span>}
      </div>
      {children}
      {invalid && <span id={context.errorId} className="kraft-form-field-error">{error}</span>}
    </div>
  </FieldContext.Provider>;
});

function useFieldRelations(id: string | undefined, describedBy: string | undefined, invalid: ComponentPropsWithoutRef<'input'>['aria-invalid']) {
  const field = useContext(FieldContext);
  return {
    id: field?.id ?? id,
    'aria-describedby': [describedBy, field?.descriptionId, field?.errorId].filter(Boolean).join(' ') || undefined,
    'aria-invalid': field?.invalid ? true : invalid,
  };
}

type FieldInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'children' | 'type'>;

export type TextFieldProps = Omit<FieldInputProps, 'size'> & {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  variant?: 'boxed' | 'underline';
  /** String sizes style the field. A numeric size is forwarded to the input. */
  size?: 'sm' | 'md' | 'lg' | 'title' | number;
};

/** A paper input with native text, email, password, telephone, URL, or number behavior. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({
  type = 'text', variant = 'boxed', size, className, id, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, ref) {
  const relations = useFieldRelations(id, describedBy, invalid);
  return <input {...props} {...relations} ref={ref} type={type} data-variant={variant}
    data-size={typeof size === 'string' ? size : undefined} size={typeof size === 'number' ? size : undefined}
    className={className ? `kraft-field-input ${className}` : 'kraft-field-input'} />;
});

export type TextareaProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'children'> & {
  variant?: 'boxed' | 'ruled';
  mono?: boolean;
  /** Grows and shrinks to fit the content, starting at the native rows height. */
  autoGrow?: boolean;
  footer?: ReactNode;
};

function fitTextarea(node: HTMLTextAreaElement) {
  node.style.removeProperty('--kraft-textarea-height');
  // Measure at the native rows height to let the textarea shrink after deletions.
  if (node.scrollHeight > node.clientHeight) {
    node.style.setProperty('--kraft-textarea-height', `${node.scrollHeight + node.offsetHeight - node.clientHeight}px`);
  }
}

/** A paper multiline field with native resizing and form behavior. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  variant = 'boxed', mono = false, autoGrow = false, footer, className, id,
  'aria-describedby': describedBy, 'aria-invalid': invalid, onChange, ...props
}, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current!, []);
  const generatedId = useId();
  const hasFooter = footer != null && footer !== false && footer !== '';
  const footerId = `${generatedId}-footer`;
  const relations = useFieldRelations(id, describedBy, invalid);

  useEffect(() => {
    const node = textareaRef.current!;
    if (autoGrow) fitTextarea(node);
    else node.style.removeProperty('--kraft-textarea-height');
  }, [autoGrow, variant, mono, className, props.style, props.value, props.defaultValue, props.rows, props.wrap,
    props.placeholder, relations['aria-invalid']]);

  useEffect(() => {
    if (!autoGrow) return;
    const node = textareaRef.current!;
    const update = () => fitTextarea(node);
    let width: number | undefined;
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(([entry]) => {
      const nextWidth = entry.borderBoxSize[0].inlineSize;
      if (nextWidth === width) return;
      width = nextWidth;
      update();
    });
    observer?.observe(node, { box: 'border-box' });
    const fonts = node.ownerDocument.fonts;
    fonts?.addEventListener('loadingdone', update);
    const form = node.form;
    let resetFrame = 0;
    const onReset = () => {
      cancelAnimationFrame(resetFrame);
      resetFrame = requestAnimationFrame(update);
    };
    form?.addEventListener('reset', onReset);
    return () => {
      observer?.disconnect();
      fonts?.removeEventListener('loadingdone', update);
      form?.removeEventListener('reset', onReset);
      cancelAnimationFrame(resetFrame);
    };
  }, [autoGrow, props.form]);

  return <>
    <textarea {...props} {...relations} ref={textareaRef} data-variant={variant} data-mono={mono || undefined}
      data-auto-grow={autoGrow || undefined}
      aria-describedby={[relations['aria-describedby'], hasFooter && footerId].filter(Boolean).join(' ') || undefined}
      className={className ? `kraft-field-input kraft-textarea ${className}` : 'kraft-field-input kraft-textarea'}
      onChange={autoGrow && props.value == null ? event => {
        fitTextarea(event.currentTarget);
        onChange?.(event);
      } : onChange} />
    {hasFooter && <div id={footerId} className="kraft-textarea-footer">{footer}</div>}
  </>;
});

export type SearchFieldProps = FieldInputProps & {
  /** Replaces the leading search mark, for example with a funnel. It is decorative. `null` removes it. */
  icon?: ReactNode;
  /** Content after the text, such as a `Kbd` hint or a result count. It stays clear of the browser's clear button. */
  trailing?: ReactNode;
  /** Applies to the native input. `className` and `style` size and place the whole field. */
  inputClassName?: string;
  inputStyle?: CSSProperties;
};

const searchMark = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>;
const interactive = 'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

/** A native search field with a replaceable leading mark, an optional trailing slot, and the browser's clear behavior. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField({
  icon, trailing, className, style, inputClassName, inputStyle, id, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, ref) {
  const relations = useFieldRelations(id, describedBy, invalid);
  const leading = icon === undefined ? searchMark : icon;
  const hasLeading = leading != null && leading !== false;
  const hasTrailing = trailing != null && trailing !== false && trailing !== '';
  return <span className={className ? `kraft-search-field ${className}` : 'kraft-search-field'} style={style}
    data-icon={hasLeading ? undefined : 'none'} data-trailing={hasTrailing || undefined}
    onMouseDown={event => {
      // Pressing the frame, mark, or a passive hint behaves like pressing the input.
      const target = event.target as Element;
      const input = event.currentTarget.querySelector('input');
      if (!input || target === input || target.closest(interactive) || input.disabled) return;
      event.preventDefault();
      input.focus();
    }}>
    {hasLeading && <span className="kraft-search-mark" aria-hidden="true">{leading}</span>}
    <input {...props} {...relations} ref={ref} type="search" style={inputStyle}
      className={inputClassName ? `kraft-search-input ${inputClassName}` : 'kraft-search-input'} />
    {hasTrailing && <span className="kraft-search-trailing">{trailing}</span>}
  </span>;
});

export type TagInputProps = Omit<FieldInputProps, 'value' | 'defaultValue' | 'name'> & {
  /** The slips, in order. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Submits each slip under this form name. */
  name?: string;
  variant?: TagVariant;
  /** Names each slip's remove button. Defaults to "Remove {tag}". */
  removeLabel?: (tag: string) => string;
  /** Names the list of slips. */
  tagsLabel?: string;
  /** Applies to the native input. `className` and `style` size and place the whole field. */
  inputClassName?: string;
  inputStyle?: CSSProperties;
};

/**
 * A field of removable slips with an inline add field. Enter or a comma adds what was typed; a slip already
 * present is not added twice. Backspace in the empty field moves to the last slip's remove button.
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput({
  value, defaultValue, onValueChange, name, variant = 'paper', removeLabel = tag => `Remove ${tag}`, tagsLabel = 'Tags',
  className, style, inputClassName, inputStyle, id, disabled, onChange, onKeyDown,
  'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  const rootRef = useRef<HTMLSpanElement>(null);
  const relations = useFieldRelations(id, describedBy, invalid);
  const [localTags, setLocalTags] = useState(defaultValue ?? []);
  const tags = value ?? localTags;
  const [draft, setDraft] = useState('');
  // After a slip is removed, focus moves to the slip that took its place, or to the field.
  const focusAfterRemoval = useRef<number | null>(null);
  useEffect(() => {
    const index = focusAfterRemoval.current;
    if (index === null) return;
    focusAfterRemoval.current = null;
    const buttons = rootRef.current!.querySelectorAll<HTMLButtonElement>('.kraft-tag-remove');
    (buttons[Math.min(index, buttons.length - 1)] ?? inputRef.current)?.focus();
  });

  const change = (next: string[]) => {
    if (value === undefined) setLocalTags(next);
    onValueChange?.(next);
  };
  const add = (text: string) => {
    const added = text.split(/[,\n]/).map(part => part.trim()).filter(Boolean)
      .filter((part, index, parts) => !tags.includes(part) && parts.indexOf(part) === index);
    setDraft('');
    if (added.length) change([...tags, ...added]);
  };

  return <span ref={rootRef} className={className ? `kraft-tag-input ${className}` : 'kraft-tag-input'} style={style}
    data-disabled={disabled || undefined}
    onMouseDown={event => {
      const input = inputRef.current;
      if (!input || input.disabled || (event.target as Element).closest(interactive)) return;
      event.preventDefault();
      input.focus();
    }}>
    {tags.length > 0 && <ul className="kraft-tag-input-list" aria-label={tagsLabel}>
      {tags.map((tag, index) => <li key={`${index}:${tag}`} className="kraft-tag-input-item">
        {disabled
          ? <Tag variant={variant}>{tag}</Tag>
          : <Tag variant={variant} removeLabel={removeLabel(tag)} onRemove={() => {
            focusAfterRemoval.current = index;
            change(tags.filter((_, other) => other !== index));
          }}>{tag}</Tag>}
        {name !== undefined && <input type="hidden" name={name} value={tag} form={props.form} disabled={disabled} />}
      </li>)}
    </ul>}
    <input {...props} {...relations} ref={inputRef} type="text" disabled={disabled} value={draft} style={inputStyle}
      className={inputClassName ? `kraft-tag-input-field ${inputClassName}` : 'kraft-tag-input-field'}
      onChange={event => {
        onChange?.(event);
        if (/[,\n]/.test(event.target.value)) add(event.target.value);
        else setDraft(event.target.value);
      }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing) return;
        if (event.key === 'Enter' && draft.trim()) {
          // Enter adds the slip instead of submitting the form; an empty field submits as usual.
          event.preventDefault();
          add(draft);
        } else if (event.key === 'Backspace' && draft === '' && tags.length) {
          event.preventDefault();
          rootRef.current!.querySelector<HTMLButtonElement>('.kraft-tag-input-item:last-child .kraft-tag-remove')?.focus();
        }
      }} />
  </span>;
});
