import { createContext, useContext, type ReactElement, type ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

const TooltipGroupContext = createContext(false);

export type TooltipProviderProps = {
  children: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
};

/** Shares the hover delay across a group of tooltips, such as an icon rail. */
export function TooltipProvider({ children, delayDuration = 400, skipDelayDuration = 300 }: TooltipProviderProps) {
  return <TooltipGroupContext.Provider value={true}>
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      {children}
    </TooltipPrimitive.Provider>
  </TooltipGroupContext.Provider>;
}

export type TooltipProps = {
  trigger: ReactElement;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** Portal into a theme scope outside a clipping ancestor when needed. */
  portalContainer?: HTMLElement;
};

/** A short paper label for a named control; content is noninteractive text. */
export function Tooltip({ trigger, content, side = 'top', align = 'center', delayDuration,
  open, defaultOpen, onOpenChange, className, portalContainer }: TooltipProps) {
  const grouped = useContext(TooltipGroupContext);
  const popup = <TooltipPrimitive.Content side={side} align={align} sideOffset={7} collisionPadding={10}
    className={className ? `kraft-tooltip ${className}` : 'kraft-tooltip'}>{content}</TooltipPrimitive.Content>;
  const tooltip = <TooltipPrimitive.Root delayDuration={delayDuration} open={open} defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}>
    <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
    {portalContainer ? <TooltipPrimitive.Portal container={portalContainer}>{popup}</TooltipPrimitive.Portal> : popup}
  </TooltipPrimitive.Root>;
  return grouped ? tooltip : <TooltipPrimitive.Provider delayDuration={400}>{tooltip}</TooltipPrimitive.Provider>;
}
