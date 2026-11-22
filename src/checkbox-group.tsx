import { Children, forwardRef, useId, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';

export type CheckboxGroupProps = ComponentPropsWithoutRef<'fieldset'> & {
  label: ReactNode;
  orientation?: 'vertical' | 'horizontal';
  /** Maximum number of equal-width columns. Overrides orientation. */
  columns?: number;
  /** Optional progress text supplied by the application, for example "4 of 8". */
  tally?: ReactNode;
};

/** A named fieldset of independently selectable native checkboxes. */
export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(function CheckboxGroup({
  label, orientation = 'vertical', columns, tally, children, className,
  'aria-describedby': describedBy, 'aria-labelledby': labelledBy, 'aria-label': ariaLabel, ...props
}, ref) {
  const id = useId();
  const hasTally = tally != null && typeof tally !== 'boolean';
  const columnCount = columns != null && Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : undefined;
  const gridStyle = columnCount === undefined ? undefined : { '--kraft-checkbox-columns': columnCount } as CSSProperties;

  return <fieldset
    {...props}
    ref={ref}
    className={className ? `kraft-checkbox-group ${className}` : 'kraft-checkbox-group'}
    aria-label={ariaLabel}
    aria-labelledby={labelledBy ?? (ariaLabel == null && hasTally ? `${id}-label` : undefined)}
    aria-describedby={[describedBy, hasTally ? `${id}-tally` : undefined].filter(Boolean).join(' ') || undefined}
  >
    <legend className="kraft-checkbox-group-legend">
      <span className="kraft-checkbox-group-heading">
        <span id={`${id}-label`}>{label}</span>
        {hasTally && <span className="kraft-checkbox-group-tally" id={`${id}-tally`}>{tally}</span>}
      </span>
    </legend>
    <div className="kraft-checkbox-group-grid" data-orientation={orientation} data-columns={columnCount} style={gridStyle}>
      {Children.map(children, child => child == null ? null : <div className="kraft-checkbox-group-item">{child}</div>)}
    </div>
  </fieldset>;
});
