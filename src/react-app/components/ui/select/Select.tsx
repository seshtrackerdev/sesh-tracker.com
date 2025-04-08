import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import '../../../styles/Select.css';

// Select Root
export type SelectProps = SelectPrimitive.SelectProps;

export const Select = SelectPrimitive.Root;
Select.displayName = 'Select';

// Select Trigger
export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  className?: string;
}

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Trigger 
    ref={ref} 
    className={`select-trigger ${className}`} 
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="select-chevron" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

// Select Value
export interface SelectValueProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> {
  placeholder?: string;
}

export const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  SelectValueProps
>(({ placeholder, ...props }, ref) => (
  <SelectPrimitive.Value 
    ref={ref} 
    placeholder={placeholder} 
    className="select-value" 
    {...props} 
  />
));
SelectValue.displayName = 'SelectValue';

// Select Content
export interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  className?: string;
}

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`select-content ${className}`}
      position="popper"
      {...props}
    >
      <SelectPrimitive.Viewport className="select-viewport">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

// Select Item
export interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  className?: string;
}

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`select-item ${className}`}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="select-item-indicator">
      <Check className="select-check" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

export default Select; 