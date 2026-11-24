import { forwardRef, useId, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';

export type RadioGroupVariant = 'rows' | 'flat' | 'swatch' | 'picture';

export type RadioOption = {
  value: string;
  /** Visible name in `rows` and `flat`; the accessible name only in `swatch` and `picture`. */
  label: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** A CSS colour painted by `variant="swatch"`. */
  swatch?: string;
  /** Decorative picture content shown by `variant="picture"`, such as an Avatar. */
  picture?: ReactNode;
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
  /** Paper rows (default), flat rows, colour swatches, or picture-only options. */
  variant?: RadioGroupVariant;
  /** Maximum number of equal-width columns. Overrides orientation. */
  columns?: number;
  hideLabel?: boolean;
  required?: boolean;
};

/** Native radio inputs on selectable paper rows, flat rows, swatches, or pictures. */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup({
  label, name, options, value, defaultValue, onValueChange, description,
  orientation = 'vertical', variant = 'rows', columns, hideLabel = false, className, disabled, required,
  'aria-describedby': describedBy, ...props
}, ref) {
  const id = useId();
  const controlled = value !== undefined;
  const visual = variant === 'swatch' || variant === 'picture';
  const columnCount = columns != null && Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : undefined;
  const gridStyle = columnCount === undefined ? undefined : { '--kraft-radio-columns': columnCount } as CSSProperties;
  return <fieldset {...props} ref={ref} disabled={disabled} data-orientation={orientation} data-variant={variant}
    className={className ? `kraft-radio-group ${className}` : 'kraft-radio-group'}
    aria-describedby={[describedBy, description ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined}>
    <legend className={hideLabel ? 'kraft-visually-hidden' : 'kraft-radio-group-label'}>{label}</legend>
    {description && <p id={`${id}-description`} className="kraft-radio-group-description">{description}</p>}
    <div className="kraft-radio-options" data-columns={columnCount} style={gridStyle}>
      {options.map((option, index) => {
        const descriptionId = option.description ? `${id}-option-${index}-description` : undefined;
        const input = <input type="radio" name={name} form={props.form} value={option.value}
          checked={controlled ? value === option.value : undefined}
          defaultChecked={!controlled ? defaultValue === option.value : undefined} disabled={option.disabled}
          required={required} aria-label={visual ? option.label : undefined}
          aria-labelledby={visual ? undefined : `${id}-option-${index}-label`} aria-describedby={descriptionId}
          onChange={() => onValueChange?.(option.value, option)} />;
        if (visual) return <label className="kraft-radio-option" key={option.value}>
          {input}
          {variant === 'swatch'
            ? <span className="kraft-radio-swatch" aria-hidden="true"
              style={option.swatch ? { '--kraft-radio-swatch': option.swatch } as CSSProperties : undefined} />
            : <span className="kraft-radio-picture" aria-hidden="true">{option.picture}</span>}
          {descriptionId && <span id={descriptionId} hidden>{option.description}</span>}
        </label>;
        return <label className="kraft-radio-option" key={option.value}>
          {input}
          <span className="kraft-radio-mark" aria-hidden="true" />
          {option.leading != null && <span className="kraft-radio-leading" aria-hidden="true">{option.leading}</span>}
          <span className="kraft-radio-copy"><span className="kraft-radio-label" id={`${id}-option-${index}-label`}>{option.label}</span>
            {descriptionId && <span className="kraft-radio-description" id={descriptionId}>{option.description}</span>}
          </span>
          {option.trailing != null && <span className="kraft-radio-trailing">{option.trailing}</span>}
        </label>;
      })}
    </div>
  </fieldset>;
});
