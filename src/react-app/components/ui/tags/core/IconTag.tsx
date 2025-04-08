import React from 'react';
import BaseTag, { BaseTagProps } from './BaseTag';

export interface IconTagProps extends Omit<BaseTagProps, 'children'> {
  icon: React.ReactNode;
  label: string;
  iconPosition?: 'left' | 'right';
}

export const IconTag = React.forwardRef<HTMLDivElement, IconTagProps>(
  (
    {
      icon,
      label,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    return (
      <BaseTag 
        ref={ref} 
        className={`tag-with-icon tag-icon-${iconPosition}`} 
        {...props}
      >
        {iconPosition === 'left' && (
          <span className="tag-icon tag-icon-left">{icon}</span>
        )}
        <span className="tag-label">{label}</span>
        {iconPosition === 'right' && (
          <span className="tag-icon tag-icon-right">{icon}</span>
        )}
      </BaseTag>
    );
  }
);

IconTag.displayName = 'IconTag';

export default IconTag; 