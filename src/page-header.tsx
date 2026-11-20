import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Heading } from './primitives.js';

export type PageHeaderProps = Omit<ComponentPropsWithoutRef<'header'>, 'title' | 'children'> & {
  title: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  back?: ReactNode;
  leading?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
};

/** A sticky edit-page header with slots for navigation, identity, status, and actions. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader({
  title, titleAs = 'h1', back, leading, status, actions, className, ...props
}, ref) {
  return <header {...props} ref={ref} className={className ? `kraft-page-header ${className}` : 'kraft-page-header'}>
    {back != null && <div className="kraft-page-header-back">{back}</div>}
    <div className="kraft-page-header-row">
      <div className="kraft-page-header-identity">
        {leading != null && <div className="kraft-page-header-leading">{leading}</div>}
        <div className="kraft-page-header-label">
          <Heading as={titleAs} className="kraft-page-header-title">{title}</Heading>
          {status != null && <div className="kraft-page-header-status">{status}</div>}
        </div>
      </div>
      {actions != null && <div className="kraft-page-header-actions">{actions}</div>}
    </div>
  </header>;
});
