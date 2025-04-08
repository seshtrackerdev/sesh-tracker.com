import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import '../../../styles/Button.css';

// Define available button variants
export type ButtonVariant = 
  | 'primary'   // Main CTA, filled green
  | 'secondary' // Alternative action, dark gray
  | 'outline'   // Bordered button, transparent background
  | 'ghost'     // Minimal button, only shows on hover/focus
  | 'danger'    // For destructive actions
  | 'success'   // For confirmation actions
  | 'icon';     // Icon-only button, typically circular

// Define available button sizes
export type ButtonSize = 'sm' | 'md' | 'lg';

// Props interface extending standard button props
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Generate CSS class names based on props
    const buttonClasses = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      fullWidth ? 'btn-full-width' : '',
      isLoading ? 'btn-loading' : '',
      className
    ].filter(Boolean).join(' ');

    // Handle disabled state or loading state
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <span className="btn-spinner">
            <span className="btn-spinner-dot"></span>
          </span>
        )}

        {leftIcon && !isLoading && (
          <span className="btn-icon btn-icon-left">{leftIcon}</span>
        )}

        <span className="btn-text">{children}</span>

        {rightIcon && !isLoading && (
          <span className="btn-icon btn-icon-right">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 
