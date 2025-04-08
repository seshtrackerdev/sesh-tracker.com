import React from 'react';
import BaseTag, { BaseTagProps } from '../core/BaseTag';
import '../cannabis-tags.css';

export type StrainType = 'indica' | 'sativa' | 'hybrid';
export type StrainDominance = 'indica' | 'sativa' | 'balanced';

export interface StrainTagProps extends Omit<BaseTagProps, 'children' | 'color'> {
  type: StrainType;
  dominance?: StrainDominance;
  intensity?: number; // 1-10 scale
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const StrainTag = React.forwardRef<HTMLDivElement, StrainTagProps>(
  (
    {
      type,
      dominance,
      intensity = 5,
      onClick,
      ...props
    },
    ref
  ) => {
    const strainColors: Record<StrainType, string> = {
      indica: 'purple',
      sativa: 'green',
      hybrid: 'blue'
    };

    // Get corresponding color
    const color = strainColors[type];
    
    // For hybrid strains with dominance, show indicator
    const showDominanceIndicator = type === 'hybrid' && dominance && dominance !== 'balanced';
    
    // Clamp intensity between 1 and 10
    const clampedIntensity = Math.max(1, Math.min(10, intensity));
    
    // Build the label with optional dominance indicator
    let label = type.charAt(0).toUpperCase() + type.slice(1);
    
    // If it's a hybrid with dominance, add indicator
    if (showDominanceIndicator) {
      label = `${dominance.charAt(0).toUpperCase() + dominance.slice(1)}-dominant ${label}`;
    }

    return (
      <BaseTag 
        ref={ref} 
        color={color} 
        onClick={onClick}
        className={`strain-tag strain-tag-${type} intensity-${clampedIntensity}`}
        interactive={!!onClick}
        {...props}
      >
        <span className="strain-tag-label">{label}</span>
        {intensity > 0 && (
          <span className="strain-intensity-indicator">
            <span 
              className="strain-intensity-bar" 
              style={{ 
                width: `${(clampedIntensity / 10) * 100}%`
              }} 
            />
          </span>
        )}
      </BaseTag>
    );
  }
);

StrainTag.displayName = 'StrainTag';

export default StrainTag; 