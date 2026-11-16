import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps = Omit<ComponentPropsWithoutRef<'fieldset'>, 'children' | 'onChange'> & {
  label: string;
  name: string;
  options: readonly RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: RadioOption) => void;
  description?: string;
  orientation?: 'vertical' | 'horizontal';
  hideLabel?: boolean;
  required?: boolean;
};

/** Native radio inputs on selectable paper rows. */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup({
  label, name, options, value, defaultValue, onValueChange, description,
  orientation = 'vertical', hideLabel = false, className, disabled, required, 'aria-describedby': describedBy, ...props
}, ref) {
  const id = useId();
  const controlled = value !== undefined;
  return <fieldset {...props} ref={ref} disabled={disabled} data-orientation={orientation}
    className={className ? `kraft-radio-group ${className}` : 'kraft-radio-group'}
    aria-describedby={[describedBy, description ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined}>
    <legend className={hideLabel ? 'kraft-visually-hidden' : 'kraft-radio-group-label'}>{label}</legend>
    {description && <p id={`${id}-description`} className="kraft-radio-group-description">{description}</p>}
    <div className="kraft-radio-options">
      {options.map((option, index) => <label className="kraft-radio-option" key={option.value}>
        <input type="radio" name={name} value={option.value} checked={controlled ? value === option.value : undefined}
          defaultChecked={!controlled ? defaultValue === option.value : undefined} disabled={option.disabled}
          required={required} aria-labelledby={`${id}-option-${index}-label`}
          aria-describedby={option.description ? `${id}-option-${index}-description` : undefined}
          onChange={() => onValueChange?.(option.value, option)} />
        <span className="kraft-radio-mark" aria-hidden="true" />
        {option.leading != null && <span className="kraft-radio-leading" aria-hidden="true">{option.leading}</span>}
        <span className="kraft-radio-copy"><span className="kraft-radio-label" id={`${id}-option-${index}-label`}>{option.label}</span>
          {option.description && <span className="kraft-radio-description" id={`${id}-option-${index}-description`}>{option.description}</span>}
        </span>
        {option.trailing != null && <span className="kraft-radio-trailing">{option.trailing}</span>}
      </label>)}
    </div>
  </fieldset>;
});
