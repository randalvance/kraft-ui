import { createContext, forwardRef, useContext, useEffect, useId, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { Kbd } from './kbd.js';
import { Pinwheel } from './material-marks.js';
import { Tag, type TagVariant } from './tag.js';

type FieldContextValue = {
  id: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export type FormFieldProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  /** One TextField, Textarea, SearchField, TagInput, or Composer belongs inside each FormField. */
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

/**
 * Keeps a growing textarea fitted to its content. `sizing` lists what changes the content's height;
 * the width, late fonts, and a form reset are watched here.
 */
function useFittedTextarea(textareaRef: RefObject<HTMLTextAreaElement | null>, active: boolean, form: string | undefined, sizing: readonly unknown[]) {
  useEffect(() => {
    const node = textareaRef.current!;
    if (active) fitTextarea(node);
    else node.style.removeProperty('--kraft-textarea-height');
  }, [active, ...sizing]);

  useEffect(() => {
    if (!active) return;
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
    const owner = node.form;
    let resetFrame = 0;
    const onReset = () => {
      cancelAnimationFrame(resetFrame);
      resetFrame = requestAnimationFrame(update);
    };
    owner?.addEventListener('reset', onReset);
    return () => {
      observer?.disconnect();
      fonts?.removeEventListener('loadingdone', update);
      owner?.removeEventListener('reset', onReset);
      cancelAnimationFrame(resetFrame);
    };
  }, [active, form]);
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
  useFittedTextarea(textareaRef, autoGrow, props.form, [variant, mono, className, props.style, props.value, props.defaultValue,
    props.rows, props.wrap, props.placeholder, relations['aria-invalid']]);

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

export type ComposerSendKey = 'enter' | 'mod-enter';

export type ComposerProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'children'> & {
  /**
   * `enter` (default) sends on Enter and adds a line on Shift+Enter. `mod-enter` sends on Ctrl+Enter or ⌘+Enter and
   * leaves Enter to add a line.
   */
  sendKey?: ComposerSendKey;
  /** Called with the text when the send key is pressed. Blank text is not sent, and nothing is sent while `busy`. */
  onSend?: (value: string) => void;
  /** The application's own controls, such as a model picker, a gauge, a stamp, and folder and branch tags. */
  bar?: ReactNode;
  /** A voice action, usually a small `IconButton`. It is drawn as a disc. */
  mic?: ReactNode;
  /** The send action, usually an `IconButton`. It is drawn as a disc; `type="submit"` submits the enclosing form. */
  send?: ReactNode;
  /** Replaces the key hints, which describe the textarea. `null` removes them. */
  hints?: ReactNode;
  /** The application is working on the last message: the send key is held, and a pinwheel shows with `busyLabel`. */
  busy?: boolean;
  /** The status shown and announced while busy. Defaults to “Working…”. */
  busyLabel?: ReactNode;
  /** The most lines the paper grows to before it scrolls. Defaults to 7. */
  maxRows?: number;
  /** Applies to the native textarea. `className` and `style` size and place the whole frame. */
  inputClassName?: string;
  inputStyle?: CSSProperties;
};

const filled = (slot: ReactNode) => slot != null && typeof slot !== 'boolean' && slot !== '';
const sendKeyHints: Record<ComposerSendKey, { send: readonly string[]; line: readonly string[] }> = {
  enter: { send: ['Enter'], line: ['Shift', 'Enter'] },
  'mod-enter': { send: ['Ctrl', 'Enter'], line: ['Enter'] },
};

/**
 * Follows native implicit submission: the form's first submit button is pressed, and a disabled one holds the form.
 * An image button is a submit button too, but `form.elements` leaves it out, so the form's tree is searched instead.
 */
function submitFrom(form: HTMLFormElement) {
  const button = [...(form.getRootNode() as ParentNode).querySelectorAll<HTMLButtonElement | HTMLInputElement>('button, input')]
    .find(control => control.form === form && (control.type === 'submit' || control.type === 'image'));
  if (!button) form.requestSubmit();
  else if (!button.matches(':disabled')) button.click();
}

/**
 * The prompt box: a red cardboard frame around ruled paper that grows with the text, with a bar for the
 * application's controls, key hints, and mic and send actions inside the frame. The send key calls `onSend` and
 * submits an enclosing form. Native textarea props and the ref reach the textarea.
 */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer({
  sendKey = 'enter', onSend, bar, mic, send, hints, busy = false, busyLabel = 'Working…', maxRows,
  className, style, inputClassName, inputStyle, id, rows = 2, onChange, onKeyDown,
  'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, ref) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  const hintsId = `${useId()}-hints`;
  const relations = useFieldRelations(id, describedBy, invalid);
  useFittedTextarea(inputRef, true, props.form, [inputClassName, inputStyle, props.value, props.defaultValue, rows, maxRows,
    props.wrap, props.placeholder]);

  const keys = sendKeyHints[sendKey];
  // The send key is held while busy, so its hint would mislead. An application's own hints always show.
  const hint = hints !== undefined ? hints : busy ? null : <>
    <span className="kraft-composer-hint"><Kbd size="sm" keys={keys.send} /> send</span>{' '}
    <span className="kraft-composer-hint"><Kbd size="sm" keys={keys.line} /> new line</span>
  </>;
  const hasHint = filled(hint);

  return <div className={className ? `kraft-composer ${className}` : 'kraft-composer'} style={style} data-busy={busy || undefined}
    onMouseDown={event => {
      // Pressing the frame, the paper's margin, or a passive hint behaves like pressing the textarea.
      // The bar and the actions belong to the application.
      const input = inputRef.current;
      if (!input || input.disabled || (event.target as Element).closest(`.kraft-composer-bar, .kraft-composer-mic, .kraft-composer-send, ${interactive}`)) return;
      event.preventDefault();
      input.focus();
    }}>
    <div className="kraft-composer-card">
      <textarea {...props} {...relations} ref={inputRef} rows={rows} aria-busy={busy || props['aria-busy']}
        aria-describedby={[relations['aria-describedby'], hasHint && hintsId].filter(Boolean).join(' ') || undefined}
        className={inputClassName ? `kraft-composer-input ${inputClassName}` : 'kraft-composer-input'}
        style={maxRows === undefined ? inputStyle : { '--kraft-composer-max-rows': maxRows, ...inputStyle } as CSSProperties}
        onChange={props.value == null ? event => {
          fitTextarea(event.currentTarget);
          onChange?.(event);
        } : onChange}
        onKeyDown={event => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.key !== 'Enter' || event.shiftKey || event.altKey) return;
          // An Enter that confirms an input-method composition is not a send. Safari reports it after the
          // composition has ended, with key code 229.
          if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
          if (sendKey === 'mod-enter' && !event.ctrlKey && !event.metaKey) return;
          // The send key never adds a line, even when there is nothing to send yet.
          event.preventDefault();
          const input = event.currentTarget;
          if (event.repeat || busy || !input.value.trim()) return;
          onSend?.(input.value);
          if (input.form) submitFrom(input.form);
          // An uncontrolled textarea cleared by either handler shrinks back at once.
          if (props.value == null) fitTextarea(input);
        }} />
      <div className="kraft-composer-foot">
        {filled(bar) && <div className="kraft-composer-bar">{bar}</div>}
        <div className="kraft-composer-end">
          {/* The region is always present, so the status is announced when it appears. */}
          <span className="kraft-composer-status" role="status">
            {busy && <><Pinwheel size="button" />{filled(busyLabel) && <span>{busyLabel}</span>}</>}
          </span>
          {hasHint && <span id={hintsId} className="kraft-composer-hints">{hint}</span>}
          {filled(mic) && <span className="kraft-composer-mic">{mic}</span>}
          {filled(send) && <span className="kraft-composer-send">{send}</span>}
        </div>
      </div>
    </div>
  </div>;
});
