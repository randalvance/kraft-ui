import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';
import { Textarea } from './form-fields.js';
import { Kbd } from './kbd.js';
import { IconButton } from './primitives.js';

/** `enter` sends on Enter, `mod-enter` on Ctrl+Enter or Command+Enter, and `none` only from the send action. */
export type ComposerSubmitKey = 'enter' | 'mod-enter' | 'none';

export type ComposerProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'children'> & {
  /** Called with the text when it is sent from the keyboard or the send disc. A surrounding form is then submitted. */
  onSend?: (value: string) => void;
  /** Which key sends. The other of Enter and Shift+Enter starts a new line. */
  submitKey?: ComposerSubmitKey;
  /** Replaces the key hints. `null` removes them. They describe the textarea to assistive technology. */
  hints?: ReactNode;
  /** The application's own controls, such as a model picker, a gauge, a stamp, a folder, and a branch. */
  bar?: ReactNode;
  /** Names the bar as a group. */
  barLabel?: string;
  /** An action before the send disc, such as a microphone `IconButton`. */
  mic?: ReactNode;
  /** Replaces the send disc, for example with a stop button. `null` removes it. */
  send?: ReactNode;
  /** Names the built-in send disc. */
  sendLabel?: string;
  /** A message is on its way: the text stays editable, sending waits, and the send disc shows the busy mark. */
  busy?: boolean;
  /** Applies to the native textarea. `className` and `style` size and place the whole composer. */
  textareaClassName?: string;
  textareaStyle?: CSSProperties;
};

const sendMark = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>;
const interactive = 'a[href], button, input, select, textarea, [tabindex], [contenteditable]';
const hasText = (value: unknown) => value != null && String(value).trim() !== '';

/**
 * The prompt box: a red cardboard frame around ruled paper. The native textarea grows with its text.
 * Key hints and the mic and send discs sit under the text, and a bar holds the application's controls.
 * `className` and `style` apply to the frame; other props and the ref reach the textarea.
 */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer({
  onSend, submitKey = 'enter', hints, bar, barLabel, mic, send, sendLabel = 'Send', busy = false,
  className, style, textareaClassName, textareaStyle, rows = 2, disabled, onChange, onKeyDown,
  'aria-describedby': describedBy, ...props
}, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current!, []);
  const hintsId = `${useId()}-hints`;
  const [typed, setTyped] = useState(() => hasText(props.defaultValue));
  const filled = props.value !== undefined ? hasText(props.value) : typed;

  useEffect(() => {
    const node = textareaRef.current!;
    // Text restored by the browser, or set before hydration, never fires a change event.
    setTyped(hasText(node.value));
    const form = node.form;
    if (!form) return;
    let frame = 0;
    const onReset = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTyped(hasText(node.value)));
    };
    form.addEventListener('reset', onReset);
    return () => {
      form.removeEventListener('reset', onReset);
      cancelAnimationFrame(frame);
    };
  }, [props.form]);

  const submit = () => {
    const node = textareaRef.current;
    if (!node || node.disabled || busy || !hasText(node.value)) return;
    onSend?.(node.value);
    node.form?.requestSubmit();
  };

  const defaultHints = submitKey === 'none' ? null : <>
    <span className="kraft-composer-hint"><Kbd size="sm" keys={submitKey === 'enter' ? ['Enter'] : ['Ctrl', 'Enter']} /> to send</span>{' '}
    <span className="kraft-composer-hint"><Kbd size="sm" keys={submitKey === 'enter' ? ['Shift', 'Enter'] : ['Enter']} /> for a new line</span>
  </>;
  const shownHints = hints === undefined ? defaultHints : hints;
  const hasHints = shownHints != null && shownHints !== false && shownHints !== '';
  const sendAction = send === undefined
    ? <IconButton type="button" variant="blue" aria-label={sendLabel} loading={busy} disabled={disabled || !filled}
      onClick={() => {
        submit();
        // The disc is disabled once the text is cleared, so focus goes back to the text.
        textareaRef.current?.focus();
      }}>{sendMark}</IconButton>
    : send;
  const hasMic = mic != null && mic !== false;
  const hasSend = sendAction != null && sendAction !== false;
  const hasBar = bar != null && bar !== false;

  return <div className={className ? `kraft-composer ${className}` : 'kraft-composer'} style={style}
    data-disabled={disabled || undefined} data-busy={busy || undefined}>
    <div className="kraft-composer-sheet"
      onMouseDown={event => {
        // Pressing the paper or a hint behaves like pressing the text.
        const node = textareaRef.current;
        if (!node || node.disabled || (event.target as Element).closest(interactive)) return;
        event.preventDefault();
        node.focus();
      }}>
      <Textarea {...props} ref={textareaRef} variant="ruled" autoGrow rows={rows} disabled={disabled} style={textareaStyle}
        className={textareaClassName ? `kraft-composer-input ${textareaClassName}` : 'kraft-composer-input'}
        aria-describedby={[describedBy, hasHints && hintsId].filter(Boolean).join(' ') || undefined}
        onChange={event => {
          setTyped(hasText(event.currentTarget.value));
          onChange?.(event);
        }}
        onKeyDown={event => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.key !== 'Enter' || submitKey === 'none') return;
          // Enter that confirms an input-method composition belongs to the composition.
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          const modifier = event.ctrlKey || event.metaKey;
          if (submitKey === 'enter' ? event.shiftKey || event.altKey : !modifier) return;
          event.preventDefault();
          submit();
        }} />
      {(hasHints || hasMic || hasSend) && <div className="kraft-composer-footer">
        {hasHints && <span id={hintsId} className="kraft-composer-hints">{shownHints}</span>}
        {(hasMic || hasSend) && <span className="kraft-composer-actions">
          {hasMic && mic}
          {hasSend && sendAction}
        </span>}
      </div>}
    </div>
    {hasBar && <div className="kraft-composer-bar" role={barLabel ? 'group' : undefined} aria-label={barLabel}>{bar}</div>}
  </div>;
});
