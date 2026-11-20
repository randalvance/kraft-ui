import { forwardRef, useId, useRef, type ComponentPropsWithoutRef, type ForwardedRef } from 'react';
import { Badge } from './primitives.js';

export type SegmentOption = {
  value: string;
  label: string;
  description?: string;
  count?: number;
  disabled?: boolean;
};

type SegmentGroupProps = Omit<ComponentPropsWithoutRef<'fieldset'>, 'children' | 'onChange' | 'defaultValue'> & {
  label: string;
  name: string;
  /** Option values must be unique within a group. */
  options: readonly SegmentOption[];
  hideLabel?: boolean;
  variant?: 'joined' | 'chips';
  tone?: 'highlighter' | 'ink';
};

export type SegmentedControlProps = SegmentGroupProps & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: SegmentOption) => void;
  required?: boolean;
};

export type ToggleChipsProps = SegmentGroupProps & {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[], option: SegmentOption) => void;
};

type ChoiceGroupProps = (SegmentedControlProps & { type: 'radio' } | ToggleChipsProps & { type: 'checkbox'; required?: never }) & {
  fieldsetRef: ForwardedRef<HTMLFieldSetElement>;
};

function ChoiceGroup(props: ChoiceGroupProps) {
  const {
    fieldsetRef, type, label, name, options, value, defaultValue, onValueChange: _onValueChange, hideLabel = false,
    variant = type === 'radio' ? 'joined' : 'chips', tone = 'highlighter', className, form, required, ...fieldsetProps
  } = props;
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);

  function change(option: SegmentOption) {
    if (props.type === 'radio') {
      props.onValueChange?.(option.value, option);
    } else if (props.onValueChange && listRef.current) {
      const checked = listRef.current.querySelectorAll<HTMLInputElement>('input:checked');
      props.onValueChange(Array.from(checked, input => input.value), option);
    }
  }

  return <fieldset {...fieldsetProps} form={form} ref={fieldsetRef}
    className={className ? `kraft-segment-group ${className}` : 'kraft-segment-group'}
    data-variant={variant} data-tone={tone} data-type={type}>
    <legend className={hideLabel ? 'kraft-visually-hidden' : 'kraft-segment-legend'}>{label}</legend>
    <div ref={listRef} className="kraft-segment-options">
      {options.map((option, index) => {
        const labelId = `${id}-label-${index}`;
        const descriptionId = option.description ? `${id}-description-${index}` : undefined;
        const countId = option.count != null ? `${id}-count-${index}` : undefined;
        const selected = (selection: string | readonly string[] | undefined) =>
          typeof selection === 'string' ? selection === option.value : selection?.includes(option.value);

        return <label key={option.value} className="kraft-segment">
          <input className="kraft-segment-input" type={type} name={name} form={form} value={option.value}
            disabled={option.disabled} required={required}
            checked={value !== undefined ? selected(value) : undefined}
            defaultChecked={value === undefined ? selected(defaultValue) : undefined}
            aria-labelledby={labelId} aria-describedby={[descriptionId, countId].filter(Boolean).join(' ') || undefined}
            onChange={() => change(option)} />
          <span className="kraft-segment-mark" aria-hidden="true" />
          <span className="kraft-segment-copy">
            <span className="kraft-segment-label" id={labelId}>{option.label}</span>
            {descriptionId && <span className="kraft-segment-description" id={descriptionId}>{option.description}</span>}
          </span>
          {countId && <>
            <Badge size="count" aria-hidden="true">{option.count}</Badge>
            <span className="kraft-visually-hidden" id={countId}>Count {option.count}</span>
          </>}
        </label>;
      })}
    </div>
  </fieldset>;
}

/** A named fieldset of native radios styled as a joined strip or separate chips. */
export const SegmentedControl = forwardRef<HTMLFieldSetElement, SegmentedControlProps>(
  function SegmentedControl(props, ref) {
    return <ChoiceGroup {...props} type="radio" fieldsetRef={ref} />;
  },
);

/** A named fieldset of independently selectable native checkbox chips. */
export const ToggleChips = forwardRef<HTMLFieldSetElement, ToggleChipsProps>(
  function ToggleChips(props, ref) {
    return <ChoiceGroup {...props} type="checkbox" fieldsetRef={ref} />;
  },
);
