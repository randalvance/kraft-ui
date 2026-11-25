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

/** Label the input from its main text and announce supporting content separately. */
function relations(id: string, { children, description, trailing, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy }: Pick<ChoiceProps, 'children' | 'description' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'> & { trailing?: ReactNode }) {
  return {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy ?? (ariaLabel == null && children != null && (description != null || trailing != null) ? `${id}-label` : undefined),
    'aria-describedby': [
      ariaDescribedBy,
      description != null ? `${id}-description` : undefined,
      trailing != null ? `${id}-trailing` : undefined,
    ].filter(Boolean).join(' ') || undefined,
  };
}

export type CheckboxVariant = 'ink' | 'pen';

export type CheckboxProps = ChoiceProps & {
  /** Shows a mixed state. Update this prop when the selection changes. */
  indeterminate?: boolean;
  /** Decorative, noninteractive media such as a portrait or swatch. */
  leading?: ReactNode;
  /** Noninteractive row detail, announced as part of the description. */
  trailing?: ReactNode;
  /** Strikes the main label while the checkbox is checked and not mixed. */
  strikeWhenChecked?: boolean;
  variant?: CheckboxVariant;
};

function CheckboxGlyphs({ variant }: { variant: CheckboxVariant }) {
  return <>
    <svg className="kraft-checkbox-check" viewBox="0 0 20 20" focusable="false">
      <path d={variant === 'pen' ? 'M3.5 10.1Q5.6 11.3 8.1 15.3Q11.8 8.7 17.5 4.3' : 'M4.5 10.5 8.2 14 15.5 5.8'} />
    </svg>
    <svg className="kraft-checkbox-mixed" viewBox="0 0 20 20" focusable="false"><path d="M5.5 10h9" /></svg>
  </>;
}

/** A native checkbox printed as a small paper box. `className` and `style` apply to the label; other props and the ref reach the input. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
  children, description, leading, trailing, indeterminate = false, strikeWhenChecked,
  variant = 'ink', className, style,
  'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, ...props
}, forwarded) {
  const id = useId();
  const aria = relations(id, { children, description, trailing, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy });
  const [local, ref] = useInputRef(forwarded);
  useEffect(() => { if (local.current) local.current.indeterminate = indeterminate; });
  return <label
    className={className ? `kraft-choice kraft-checkbox ${className}` : 'kraft-choice kraft-checkbox'}
    style={style} dir={props.dir} lang={props.lang}
    data-variant={variant} data-strike={strikeWhenChecked || undefined}
  >
    <span className="kraft-choice-control">
      <input {...props} ref={ref} type="checkbox" className="kraft-choice-input" {...aria} />
      <span className="kraft-checkbox-box" aria-hidden="true">
        <CheckboxGlyphs variant={variant} />
      </span>
    </span>
    {leading != null && <span className="kraft-checkbox-leading" aria-hidden="true">{leading}</span>}
    <ChoiceText description={description} id={id}>{children}</ChoiceText>
    {trailing != null && <span className="kraft-checkbox-trailing" id={`${id}-trailing`}>{trailing}</span>}
  </label>;
});

export type CheckboxStatusProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  /** Accessible text describing the item and its current state. */
  label: string;
  checked?: boolean;
  indeterminate?: boolean;
  variant?: CheckboxVariant;
};

/** A large, static checkbox mark exposed as a named image. */
export const CheckboxStatus = forwardRef<HTMLSpanElement, CheckboxStatusProps>(function CheckboxStatus({
  label, checked, indeterminate, variant = 'ink', className, ...props
}, ref) {
  return <span
    {...props}
    ref={ref}
    role="img"
    aria-label={label}
    className={className ? `kraft-checkbox-box kraft-checkbox-status ${className}` : 'kraft-checkbox-box kraft-checkbox-status'}
    data-variant={variant}
    data-state={indeterminate ? 'mixed' : checked ? 'checked' : 'unchecked'}
  >
    <CheckboxGlyphs variant={variant} />
  </span>;
});

export type ToggleLabelSide = 'start' | 'end';

export type ToggleProps = ChoiceProps & {
  /** Where the label sits. `"start"` puts it before the switch and stretches the row, so the name reads at one edge and the switch at the other. */
  labelSide?: ToggleLabelSide;
};

/** An on/off switch: a native checkbox with `role="switch"`, drawn as a card pull-tab in a slot with the state written beside it. Changes apply immediately. `className` and `style` apply to the label; other props and the ref reach the input. */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle({ children, description, labelSide = 'end', className, style, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, ...props }, forwarded) {
  const id = useId();
  const aria = relations(id, { children, description, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy });
  const text = <ChoiceText description={description} id={id}>{children}</ChoiceText>;
  return <label className={className ? `kraft-choice kraft-toggle ${className}` : 'kraft-choice kraft-toggle'} style={style} data-label-side={labelSide}>
    {labelSide === 'start' && text}
    <span className="kraft-choice-control">
      <input {...props} ref={forwarded} type="checkbox" role="switch" className="kraft-choice-input" {...aria} />
      {/* Both words are printed and CSS shows the one matching `:checked`, so an uncontrolled or server-rendered switch needs no state. The input already announces on/off. */}
      <span className="kraft-toggle-track" aria-hidden="true">
        <span className="kraft-toggle-slot">
          <span className="kraft-toggle-word" data-state="on">on</span>
          <span className="kraft-toggle-word" data-state="off">off</span>
        </span>
        <span className="kraft-toggle-tab" />
      </span>
    </span>
    {labelSide === 'end' && text}
  </label>;
});
