import React, { forwardRef, InputHTMLAttributes } from 'react';
import '../../../styles/Checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  checked?: boolean;
  indeterminate?: boolean;
  error?: boolean;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      checked,
      onChange,
      indeterminate = false,
      error = false,
      helperText,
      disabled = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique id for checkbox if none is provided
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    // Set indeterminate property on the checkbox element
    React.useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    // Generate CSS class names
    const containerClasses = [
      'checkbox-container',
      disabled ? 'checkbox-disabled' : '',
      error ? 'checkbox-error' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        <div className="checkbox-wrapper">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="checkbox-input"
            aria-describedby={helperText ? `${checkboxId}-helper` : undefined}
            {...props}
          />
          <label htmlFor={checkboxId} className="checkbox-label">
            <span className="checkbox-box"></span>
            {label && <span className="checkbox-text">{label}</span>}
          </label>
        </div>
        
        {helperText && (
          <div 
            id={`${checkboxId}-helper`} 
            className={`checkbox-helper-text ${error ? 'checkbox-error-text' : ''}`}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 

