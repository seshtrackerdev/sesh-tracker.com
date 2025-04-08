import React from 'react';
import { X } from 'lucide-react';
import BaseTag, { BaseTagProps } from './BaseTag';

export interface RemovableTagProps extends Omit<BaseTagProps, 'onClick'> {
  onRemove?: () => void;
  onTagClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const RemovableTag = React.forwardRef<HTMLDivElement, RemovableTagProps>(
  (
    {
      children,
      onRemove,
      onTagClick,
      ...props
    },
    ref
  ) => {
    const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (onRemove) {
        onRemove();
      }
    };

    return (
      <BaseTag 
        ref={ref} 
        onClick={onTagClick}
        className="tag-removable" 
        {...props}
      >
        <span className="tag-content">{children}</span>
        <button 
          type="button" 
          className="tag-remove-button" 
          onClick={handleRemoveClick}
          aria-label="Remove"
        >
          <X size={14} />
        </button>
      </BaseTag>
    );
  }
);

RemovableTag.displayName = 'RemovableTag';

export default RemovableTag; 