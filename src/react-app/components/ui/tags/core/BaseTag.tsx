import React from 'react';
import '../tags.css';

export interface BaseTagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  interactive?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const BaseTag = React.forwardRef<HTMLDivElement, BaseTagProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      color,
      className = '',
      interactive = false,
      disabled = false,
      selected = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const tagClasses = [
      'tag',
      `tag-${variant}`,
      `tag-${size}`,
      color ? `tag-${color}` : '',
      interactive ? 'tag-interactive' : '',
      disabled ? 'tag-disabled' : '',
      selected ? 'tag-selected' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled && interactive && onClick) {
        onClick(e);
      }
    };

    return (
      <div
        ref={ref}
        className={tagClasses}
        onClick={handleClick}
        data-disabled={disabled ? true : undefined}
        data-selected={selected ? true : undefined}
        data-interactive={interactive ? true : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive && !disabled ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BaseTag.displayName = 'BaseTag';

export default BaseTag; 