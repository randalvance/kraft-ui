import { forwardRef, useId, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as MenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as SelectPrimitive from '@radix-ui/react-select';
import type { Tone } from './primitives.js';

type Placement = { side?: 'top' | 'right' | 'bottom' | 'left'; align?: 'start' | 'center' | 'end' };

export type PopoverProps = Placement & {
  trigger: ReactElement;
  title: string;
  children: ReactNode;
  description?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  closeLabel?: string;
  /** Portal into a theme scope outside a clipping ancestor when needed. */
  portalContainer?: HTMLElement;
};

/** A nonmodal paper popup for small, structured content. */
export function Popover({ trigger, title, description, children, open, defaultOpen, onOpenChange,
  side = 'bottom', align = 'start', className, closeLabel = 'Close popover', portalContainer }: PopoverProps) {
  const content = <PopoverPrimitive.Content side={side} align={align} sideOffset={8} collisionPadding={12}
    className={className ? `kraft-popover ${className}` : 'kraft-popover'}>
    <div className="kraft-popover-header">
      <div><PopoverPrimitive.Title className="kraft-popover-title">{title}</PopoverPrimitive.Title>
        {description && <PopoverPrimitive.Description className="kraft-popover-description">{description}</PopoverPrimitive.Description>}</div>
      <PopoverPrimitive.Close className="kraft-overlay-close" aria-label={closeLabel}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </PopoverPrimitive.Close>
    </div>
    <div className="kraft-popover-body">{children}</div>
  </PopoverPrimitive.Content>;
  return <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={false}>
    <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
    {portalContainer ? <PopoverPrimitive.Portal container={portalContainer}>{content}</PopoverPrimitive.Portal> : content}
  </PopoverPrimitive.Root>;
}

export type MenuAction = {
  id: string;
  label: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
};
export type MenuEntry = MenuAction | { separator: true; id: string };

export type MenuProps = Placement & {
  trigger: ReactElement;
  label: string;
  items: readonly MenuEntry[];
  onAction: (id: string, item: MenuAction) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  portalContainer?: HTMLElement;
};

/** A keyboard navigable menu of actions, separate from value selection. */
export function Menu({ trigger, label, items, onAction, open, defaultOpen, onOpenChange,
  side = 'bottom', align = 'end', className, portalContainer }: MenuProps) {
  const content = <MenuPrimitive.Content side={side} align={align} sideOffset={6} collisionPadding={12} aria-label={label}
    className={className ? `kraft-menu ${className}` : 'kraft-menu'}>
    {items.map(item => 'separator' in item
      ? <MenuPrimitive.Separator key={item.id} className="kraft-menu-separator" />
      : <MenuPrimitive.Item key={item.id} className="kraft-menu-item" disabled={item.disabled}
          data-destructive={item.destructive || undefined} onSelect={() => onAction(item.id, item)}>
          {item.leading != null && <span className="kraft-menu-leading" aria-hidden="true">{item.leading}</span>}
          <span className="kraft-menu-label">{item.label}</span>
          {item.trailing != null && <span className="kraft-menu-trailing">{item.trailing}</span>}
        </MenuPrimitive.Item>)}
  </MenuPrimitive.Content>;
  return <MenuPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={false}>
    <MenuPrimitive.Trigger asChild>{trigger}</MenuPrimitive.Trigger>
    {portalContainer ? <MenuPrimitive.Portal container={portalContainer}>{content}</MenuPrimitive.Portal> : content}
  </MenuPrimitive.Root>;
}

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  leading?: ReactNode;
  /** Decorative color marker. Include any status meaning in the option's label. */
  statusDot?: Tone;
};

export type SelectProps = {
  label: string;
  options: readonly SelectOption[];
  variant?: 'default' | 'compact';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: SelectOption | undefined) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  hideLabel?: boolean;
  description?: string;
  className?: string;
  style?: CSSProperties;
  dir?: 'ltr' | 'rtl';
  portalContainer?: HTMLElement;
};

function SelectOptionMarks({ option }: { option: SelectOption }) {
  return <>
    {option.leading != null && <span className="kraft-select-leading" aria-hidden="true">{option.leading}</span>}
    {option.statusDot && <span className="kraft-select-status-dot" data-tone={option.statusDot} aria-hidden="true" />}
  </>;
}

/** A single choice button and listbox with native form submission. */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select({
  label, options, variant = 'default', value, defaultValue, onValueChange, name, required, disabled,
  placeholder = 'Choose an option', hideLabel = false, description, className, style, dir, portalContainer,
}, ref) {
  const id = useId();
  const [localValue, setLocalValue] = useState(defaultValue);
  const compact = variant === 'compact';
  const selected = compact ? options.find(option => option.value === (value ?? localValue)) : undefined;
  const descriptionIds = [description && `${id}-description`, compact && `${id}-value`].filter(Boolean).join(' ');
  const content = <SelectPrimitive.Content className="kraft-select-content" position="popper" sideOffset={6} collisionPadding={12}>
    <SelectPrimitive.Viewport className="kraft-select-viewport">
      {options.map(option => <SelectPrimitive.Item key={option.value} value={option.value} disabled={option.disabled}
        className="kraft-select-item">
        <span className="kraft-select-indicator"><SelectPrimitive.ItemIndicator aria-hidden="true">✓</SelectPrimitive.ItemIndicator></span>
        <SelectOptionMarks option={option} />
        <span className="kraft-select-copy"><SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
          {option.description && <span className="kraft-select-option-description">{option.description}</span>}
        </span>
      </SelectPrimitive.Item>)}
    </SelectPrimitive.Viewport>
  </SelectPrimitive.Content>;
  return <div className={className ? `kraft-select ${className}` : 'kraft-select'} style={style} dir={dir}>
    <SelectPrimitive.Root value={value} defaultValue={defaultValue} name={name} required={required} disabled={disabled} dir={dir}
      onValueChange={next => {
        if (value === undefined) setLocalValue(next);
        onValueChange?.(next, options.find(option => option.value === next));
      }}>
      <label htmlFor={`${id}-trigger`} className={hideLabel ? 'kraft-visually-hidden' : 'kraft-select-label'}>{label}</label>
      {description && <span className="kraft-select-description" id={`${id}-description`}>{description}</span>}
      <SelectPrimitive.Trigger ref={ref} id={`${id}-trigger`} className="kraft-select-trigger" data-variant={variant}
        aria-describedby={descriptionIds || undefined}>
        {compact ? <span className="kraft-select-trigger-copy">
          {selected && <SelectOptionMarks option={selected} />}
          <span className="kraft-select-trigger-value">
            <SelectPrimitive.Value id={`${id}-value`} placeholder={placeholder}>{selected?.label}</SelectPrimitive.Value>
          </span>
        </span> : <SelectPrimitive.Value placeholder={placeholder} />}
        <SelectPrimitive.Icon className="kraft-select-chevron" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m3 6 5 5 5-5" /></svg></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      {portalContainer ? <SelectPrimitive.Portal container={portalContainer}>{content}</SelectPrimitive.Portal> : content}
    </SelectPrimitive.Root>
  </div>;
});
