import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type ActionableListProps = Omit<ComponentPropsWithoutRef<'ul'>, 'children'> & {
  'aria-label': string;
  children: ReactNode;
};

/** A named list of independent actions or links. */
export const ActionableList = forwardRef<HTMLUListElement, ActionableListProps>(function ActionableList({
  children, className, ...props
}, ref) {
  return <ul {...props} ref={ref} className={className ? `kraft-actionable-list ${className}` : 'kraft-actionable-list'}>{children}</ul>;
});

export type ActionableListItemProps = Omit<ComponentPropsWithoutRef<'li'>, 'children'> & {
  label: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Interactive controls stay outside the primary row target. */
  actions?: ReactNode;
  href?: string;
  current?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
};

/** A paper row with one primary target and optional separate actions. */
export const ActionableListItem = forwardRef<HTMLLIElement, ActionableListItemProps>(function ActionableListItem({
  label, description, leading, trailing, actions, href, current = false, disabled = false,
  onActivate, className, ...props
}, ref) {
  const content = <>
    {leading != null && <span className="kraft-list-leading" aria-hidden="true">{leading}</span>}
    <span className="kraft-list-copy"><span className="kraft-list-label">{label}</span>
      {description && <span className="kraft-list-description">{description}</span>}
    </span>
    {trailing != null && <span className="kraft-list-trailing">{trailing}</span>}
  </>;
  return <li {...props} ref={ref} className={className ? `kraft-list-item ${className}` : 'kraft-list-item'} data-current={current || undefined}>
    {href && !disabled
      ? <a className="kraft-list-target" href={href} aria-current={current ? 'page' : undefined}
          onClick={onActivate}>{content}</a>
      : <button className="kraft-list-target" type="button" disabled={disabled} aria-current={current ? 'page' : undefined}
          onClick={onActivate}>{content}</button>}
    {actions != null && <span className="kraft-list-actions">{actions}</span>}
  </li>;
});
