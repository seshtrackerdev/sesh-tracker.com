import React, { forwardRef, InputHTMLAttributes } from 'react';
import '../../../styles/Input.css';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'outlined';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    // Generate unique id for input if none is provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    // Generate CSS class names
    const containerClasses = [
      'input-container',
      `input-size-${size}`,
      `input-variant-${variant}`,
      fullWidth ? 'input-full-width' : '',
      error ? 'input-error' : '',
      disabled ? 'input-disabled' : '',
      className
    ].filter(Boolean).join(' ');

    const inputClasses = [
      'input',
      leftIcon ? 'input-has-left-icon' : '',
      rightIcon ? 'input-has-right-icon' : ''
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}
        
        <div className="input-wrapper">
          {leftIcon && <div className="input-icon input-icon-left">{leftIcon}</div>}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-describedby={helperText ? `${inputId}-helper` : undefined}
            aria-invalid={!!error}
            {...props}
          />
          
          {rightIcon && <div className="input-icon input-icon-right">{rightIcon}</div>}
        </div>
        
        {(helperText || error) && (
          <div 
            className={`input-message ${error ? 'input-error-message' : 'input-helper-text'}`}
            id={`${inputId}-helper`}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 

