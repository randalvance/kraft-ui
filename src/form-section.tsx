import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Heading, Surface, Text } from './primitives.js';

export type FormSectionProps = Omit<ComponentPropsWithoutRef<'section'>, 'title'> & {
  title: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  hint?: ReactNode;
};

/** A named paper sheet for a group of form controls. */
export const FormSection = forwardRef<HTMLElement, FormSectionProps>(function FormSection({
  title, titleAs = 'h2', hint, children, className,
  'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...props
}, ref) {
  const titleId = useId();
  return <Surface as="section" {...props} ref={ref}
    className={className ? `kraft-form-section ${className}` : 'kraft-form-section'}
    aria-label={ariaLabel} aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : titleId)}>
    <header className="kraft-form-section-header">
      <Heading as={titleAs} id={titleId} size="lg">{title}</Heading>
      {hint != null && <Text as="div" className="kraft-form-section-hint" variant="hand" tone="muted">{hint}</Text>}
    </header>
    <div className="kraft-form-section-body">{children}</div>
  </Surface>;
});
