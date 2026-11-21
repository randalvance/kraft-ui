import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { descriptionClamp, type RowContentOptions, type RowDensity } from './row-options.js';

export type ActionableListProps = Omit<ComponentPropsWithoutRef<'ul'>, 'children'> & {
  'aria-label': string;
  children: ReactNode;
  density?: RowDensity;
};

/** A named list of paper rows. */
export const ActionableList = forwardRef<HTMLUListElement, ActionableListProps>(function ActionableList({
  children, className, density = 'default', ...props
}, ref) {
  return <ul role="list" {...props} ref={ref} data-density={density} className={className ? `kraft-actionable-list ${className}` : 'kraft-actionable-list'}>{children}</ul>;
});

export type ActionableListItemProps = Omit<ComponentPropsWithoutRef<'li'>, 'children'> & RowContentOptions & {
  density?: RowDensity;
  leading?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  current?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
};

/** A paper row with optional primary and secondary actions. */
export const ActionableListItem = forwardRef<HTMLLIElement, ActionableListItemProps>(function ActionableListItem({
  label, description, leading, trailing, actions, href, current = false, disabled = false,
  density, truncateLabel, clampDescription, done, actionsVisibility, onActivate, className, ...props
}, ref) {
  const clamp = descriptionClamp(clampDescription);
  const ariaCurrent = current ? 'page' : undefined;
  const content = <>
    {leading != null && <span className="kraft-list-leading" aria-hidden="true">{leading}</span>}
    <span className="kraft-list-copy"><span className="kraft-list-label" data-truncate={truncateLabel || undefined}>{label}</span>
      {description != null && description !== '' && <span className="kraft-list-description" style={clamp} data-clamp={clamp ? true : undefined}>{description}</span>}
    </span>
    {trailing != null && <span className="kraft-list-trailing">{trailing}</span>}
  </>;
  return <li {...props} ref={ref} className={className ? `kraft-list-item ${className}` : 'kraft-list-item'}
    data-current={current || undefined} data-density={density} data-disabled={disabled || undefined} data-done={done || undefined}>
    {href !== undefined && !disabled
      ? <a className="kraft-list-target" href={href} aria-current={ariaCurrent} onClick={onActivate}>{content}</a>
      : href !== undefined || onActivate
        ? <button className="kraft-list-target" type="button" disabled={disabled} aria-current={ariaCurrent} onClick={onActivate}>{content}</button>
        : <span className="kraft-list-target" aria-current={ariaCurrent} aria-disabled={disabled || undefined}>{content}</span>}
    {actions != null && <span className="kraft-list-actions" data-visibility={actionsVisibility}>{actions}</span>}
  </li>;
});
