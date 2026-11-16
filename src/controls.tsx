import { forwardRef, useCallback, useEffect, useId, useRef, type ComponentPropsWithoutRef, type ForwardedRef, type ReactNode } from 'react';

type ChoiceProps = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'children' | 'size'> & {
  /** Visible label. Without it, supply `aria-label` or `aria-labelledby`. */
  children?: ReactNode;
  /** Supporting text below the label, announced as the control's description. */
  description?: ReactNode;
};

function useInputRef(forwarded: ForwardedRef<HTMLInputElement>) {
  const local = useRef<HTMLInputElement | null>(null);
  const ref = useCallback((node: HTMLInputElement | null) => {
    local.current = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
  }, [forwarded]);
  return [local, ref] as const;
}

function ChoiceText({ children, description, id }: { children?: ReactNode; description?: ReactNode; id: string }) {
  if (children == null && description == null) return null;
  return <span className="kraft-choice-text">
    {children != null && <span id={`${id}-label`} className="kraft-choice-label">{children}</span>}
    {description != null && <span id={`${id}-description`} className="kraft-choice-description">{description}</span>}
  </span>;
}

/** The label element wraps the description too, so name the input from its label text alone. */
function relations(id: string, { children, description, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy }: Pick<ChoiceProps, 'children' | 'description' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'>) {
  return {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy ?? (ariaLabel == null && children != null && description != null ? `${id}-label` : undefined),
    'aria-describedby': [ariaDescribedBy, description != null ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined,
  };
}

export type CheckboxProps = ChoiceProps & {
  /** Shows a mixed state. Update this prop when the selection changes. */
  indeterminate?: boolean;
};

/** A native checkbox printed as a small paper box. `className` and `style` apply to the label; other props and the ref reach the input. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ children, description, indeterminate = false, className, style, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, ...props }, forwarded) {
  const id = useId();
  const aria = relations(id, { children, description, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy });
  const [local, ref] = useInputRef(forwarded);
  useEffect(() => { if (local.current) local.current.indeterminate = indeterminate; });
  return <label className={className ? `kraft-choice kraft-checkbox ${className}` : 'kraft-choice kraft-checkbox'} style={style}>
    <span className="kraft-choice-control">
      <input {...props} ref={ref} type="checkbox" className="kraft-choice-input" {...aria} />
      <span className="kraft-checkbox-box" aria-hidden="true">
        <svg className="kraft-checkbox-check" viewBox="0 0 20 20" focusable="false"><path d="M4.5 10.5 8.2 14 15.5 5.8" /></svg>
        <svg className="kraft-checkbox-mixed" viewBox="0 0 20 20" focusable="false"><path d="M5.5 10h9" /></svg>
      </span>
    </span>
    <ChoiceText description={description} id={id}>{children}</ChoiceText>
  </label>;
});

export type ToggleProps = ChoiceProps;

/** An on/off switch: a native checkbox with `role="switch"`, drawn as a knob in a recessed rail. Changes apply immediately. `className` and `style` apply to the label; other props and the ref reach the input. */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle({ children, description, className, style, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, ...props }, forwarded) {
  const id = useId();
  const aria = relations(id, { children, description, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy });
  return <label className={className ? `kraft-choice kraft-toggle ${className}` : 'kraft-choice kraft-toggle'} style={style}>
    <span className="kraft-choice-control">
      <input {...props} ref={forwarded} type="checkbox" role="switch" className="kraft-choice-input" {...aria} />
      <span className="kraft-toggle-track" aria-hidden="true"><span className="kraft-toggle-knob" /></span>
    </span>
    <ChoiceText description={description} id={id}>{children}</ChoiceText>
  </label>;
});
