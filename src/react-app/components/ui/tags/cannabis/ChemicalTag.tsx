import React from 'react';
import BaseTag, { BaseTagProps } from '../core/BaseTag';
import '../cannabis-tags.css';

export type ChemicalCompound = 'THC' | 'CBD' | 'CBN' | 'CBG' | 'THCV' | 'CBC' | string;

export interface ChemicalTagProps extends Omit<BaseTagProps, 'children'> {
  compound: ChemicalCompound;
  percentage: number;
  visualMeter?: boolean;
  precision?: number; // Number of decimal places
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ChemicalTag = React.forwardRef<HTMLDivElement, ChemicalTagProps>(
  (
    {
      compound,
      percentage,
      visualMeter = true,
      precision = 1,
      onClick,
      ...props
    },
    ref
  ) => {
    // Determine the color based on the compound
    const getCompoundColor = (compound: ChemicalCompound) => {
      switch(compound.toUpperCase()) {
        case 'THC': return 'green';
        case 'CBD': return 'blue';
        case 'CBN': return 'purple';
        case 'CBG': return 'teal';
        case 'THCV': return 'orange';
        case 'CBC': return 'yellow';
        default: return undefined;
      }
    };

    const color = getCompoundColor(compound);
    
    // Format the percentage with the specified precision
    const formattedPercentage = percentage.toFixed(precision);
    
    // Clamp meter between 0-100% (for visualization)
    // Higher end cannabinoids like THC rarely exceed 30%, but we'll normalize to a 0-40% scale
    const normalizedPercentage = Math.min(100, (percentage / 40) * 100);

    return (
      <BaseTag 
        ref={ref} 
        color={color} 
        onClick={onClick}
        className="chemical-tag"
        interactive={!!onClick}
        {...props}
      >
        <span className="chemical-compound">{compound}</span>
        <span className="chemical-percentage">{formattedPercentage}%</span>
        
        {visualMeter && (
          <span className="chemical-meter-container">
            <span 
              className="chemical-meter" 
              style={{ width: `${normalizedPercentage}%` }} 
            />
          </span>
        )}
      </BaseTag>
    );
  }
);

ChemicalTag.displayName = 'ChemicalTag';

export default ChemicalTag; 