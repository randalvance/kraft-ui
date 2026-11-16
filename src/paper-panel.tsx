import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type PaperPanelProps = Omit<ComponentPropsWithoutRef<'section'>, 'title'> & {
  title: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  leading?: ReactNode;
  controls?: ReactNode;
  navigation?: ReactNode;
  footer?: ReactNode;
};

/** A titled sheet with an open paper body. Controls and content stay application-owned. */
export const PaperPanel = forwardRef<HTMLElement, PaperPanelProps>(function PaperPanel({ title, titleAs: Title = 'h2', leading, controls, navigation, footer, children, className, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...props }, ref) {
  const titleId = useId();
  return <section {...props} ref={ref} className={className ? `kraft-paper-panel ${className}` : 'kraft-paper-panel'} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : titleId)}>
    <header className="kraft-paper-panel-header">
      <div className="kraft-paper-panel-heading">
        {leading && <span className="kraft-paper-panel-leading">{leading}</span>}
        <Title id={titleId} className="kraft-paper-panel-title">{title}</Title>
      </div>
      {controls && <div className="kraft-paper-panel-controls">{controls}</div>}
    </header>
    {navigation && <div className="kraft-paper-panel-navigation">{navigation}</div>}
    <div className="kraft-paper-panel-body">{children}</div>
    {footer && <footer className="kraft-paper-panel-footer">{footer}</footer>}
  </section>;
});
