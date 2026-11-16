import { createContext, forwardRef, useContext, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

type FieldContextValue = {
  id: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export type FormFieldProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  /** One TextField, Textarea, or SearchField belongs inside each FormField. */
  children: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  /** Sets the native control's ID when an external element needs to refer to it. */
  controlId?: string;
};

/** A visible field label and its supporting or validation text. */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField({
  children, label, description, error, controlId, className, ...props
}, ref) {
  const generatedId = useId();
  const id = controlId ?? `${generatedId}-control`;
  const hasDescription = description != null && description !== false && description !== '';
  const invalid = error != null && error !== false && error !== '';
  const context: FieldContextValue = {
    id,
    descriptionId: hasDescription ? `${generatedId}-description` : undefined,
    errorId: invalid ? `${generatedId}-error` : undefined,
    invalid,
  };

  return <FieldContext.Provider value={context}>
    <div {...props} ref={ref} className={className ? `kraft-form-field ${className}` : 'kraft-form-field'} data-invalid={invalid || undefined}>
      <div className="kraft-form-field-heading">
        <label className="kraft-form-field-label" htmlFor={id}>{label}</label>
        {hasDescription && <span id={context.descriptionId} className="kraft-form-field-description">{description}</span>}
      </div>
      {children}
      {invalid && <span id={context.errorId} className="kraft-form-field-error">{error}</span>}
    </div>
  </FieldContext.Provider>;
});

function useFieldRelations(id: string | undefined, describedBy: string | undefined, invalid: ComponentPropsWithoutRef<'input'>['aria-invalid']) {
  const field = useContext(FieldContext);
  return {
    id: field?.id ?? id,
    'aria-describedby': [describedBy, field?.descriptionId, field?.errorId].filter(Boolean).join(' ') || undefined,
    'aria-invalid': field?.invalid ? true : invalid,
  };
}

type FieldInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'children' | 'type'>;

export type TextFieldProps = FieldInputProps & {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
};

/** A paper input with native text, email, password, telephone, URL, or number behavior. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({
  type = 'text', className, id, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, ref) {
  const relations = useFieldRelations(id, describedBy, invalid);
  return <input {...props} {...relations} ref={ref} type={type} className={className ? `kraft-field-input ${className}` : 'kraft-field-input'} />;
});

export type TextareaProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'children'>;

/** A paper multiline field with native resizing and form behavior. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  className, id, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, ref) {
  const relations = useFieldRelations(id, describedBy, invalid);
  return <textarea {...props} {...relations} ref={ref} className={className ? `kraft-field-input kraft-textarea ${className}` : 'kraft-field-input kraft-textarea'} />;
});

export type SearchFieldProps = FieldInputProps;

/** A native search field with a decorative search mark and the browser's clear behavior. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField({
  className, id, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, ref) {
  const relations = useFieldRelations(id, describedBy, invalid);
  return <span className="kraft-search-field">
    <svg className="kraft-search-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
    <input {...props} {...relations} ref={ref} type="search" className={className ? `kraft-field-input kraft-search-input ${className}` : 'kraft-field-input kraft-search-input'} />
  </span>;
});
