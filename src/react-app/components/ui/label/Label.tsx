import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import '../../../styles/Label.css';

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  children: React.ReactNode;
  required?: boolean;
}

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ children, required = false, className = '', ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={`ui-label ${required ? 'required' : ''} ${className}`}
    {...props}
  >
    {children}
    {required && <span className="required-indicator">*</span>}
  </LabelPrimitive.Root>
));

Label.displayName = 'Label';

export default Label; 