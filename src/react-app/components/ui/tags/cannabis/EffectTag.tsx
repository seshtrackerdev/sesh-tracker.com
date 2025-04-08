import React from 'react';
import RemovableTag from '../core/RemovableTag';
import { BaseTagProps } from '../core/BaseTag';
import '../cannabis-tags.css';

export type EffectCategory = 'physical' | 'mental' | 'medicinal' | 'negative' | 'flavor';

export interface EffectTagProps extends Omit<BaseTagProps, 'children' | 'color'> {
  effect: string;
  category: EffectCategory;
  intensity?: number; // 1-5 scale
  removable?: boolean;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const EffectTag = React.forwardRef<HTMLDivElement, EffectTagProps>(
  (
    {
      effect,
      category,
      intensity = 0,
      removable = false,
      onRemove,
      size = 'md',
      ...props
    },
    ref
  ) => {
    // Determine color based on category
    const categoryColors: Record<EffectCategory, string> = {
      physical: 'purple',
      mental: 'blue',
      medicinal: 'green',
      negative: 'red',
      flavor: 'orange'
    };

    const color = categoryColors[category];
    
    // Create stars for intensity (1-5)
    const clampedIntensity = Math.max(0, Math.min(5, intensity));
    
    // Common props for both removable and non-removable tags
    const commonProps = {
      ref,
      color,
      size,
      className: `effect-tag effect-tag-${category}`,
      ...props
    };

    // The content of the tag, with or without intensity
    const content = (
      <>
        <span className="effect-name">{effect}</span>
        {clampedIntensity > 0 && (
          <span className="effect-intensity">
            {Array.from({ length: 5 }).map((_, i) => (
              <span 
                key={i} 
                className={`effect-intensity-dot ${i < clampedIntensity ? 'active' : ''}`}
              />
            ))}
          </span>
        )}
      </>
    );

    // Either use a RemovableTag or return the content directly
    return removable ? (
      <RemovableTag {...commonProps} onRemove={onRemove}>
        {content}
      </RemovableTag>
    ) : (
      <RemovableTag {...commonProps}>
        {content}
      </RemovableTag>
    );
  }
);

EffectTag.displayName = 'EffectTag';

export default EffectTag; 