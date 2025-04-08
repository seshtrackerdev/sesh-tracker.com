import React from 'react';
import BaseTag, { BaseTagProps } from '../core/BaseTag';
import '../cannabis-tags.css';

export type TerpeneType = 
  | 'Myrcene' 
  | 'Limonene' 
  | 'Pinene' 
  | 'Caryophyllene'
  | 'Terpinolene'
  | 'Humulene'
  | 'Linalool'
  | 'Ocimene'
  | string;

export interface TerpeneTagProps extends Omit<BaseTagProps, 'children' | 'color'> {
  name: TerpeneType;
  percentage?: number;
  visualMeter?: boolean;
  flavor?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const TerpeneTag = React.forwardRef<HTMLDivElement, TerpeneTagProps>(
  (
    {
      name,
      percentage = 0,
      visualMeter = true,
      flavor,
      onClick,
      ...props
    },
    ref
  ) => {
    // Map terpenes to colors and aromas
    const terpeneInfo: Record<TerpeneType, { color: string, defaultFlavor: string }> = {
      'Myrcene': { color: 'green', defaultFlavor: 'Earthy, Musky' },
      'Limonene': { color: 'yellow', defaultFlavor: 'Citrus' },
      'Pinene': { color: 'teal', defaultFlavor: 'Pine' },
      'Caryophyllene': { color: 'orange', defaultFlavor: 'Peppery, Spicy' },
      'Terpinolene': { color: 'purple', defaultFlavor: 'Floral, Herbal' },
      'Humulene': { color: 'brown', defaultFlavor: 'Hoppy, Earthy' },
      'Linalool': { color: 'purple', defaultFlavor: 'Floral, Lavender' },
      'Ocimene': { color: 'green', defaultFlavor: 'Sweet, Herbal' }
    };

    // Get color and flavor or use defaults for unknown terpenes
    const info = terpeneInfo[name] || { color: 'blue', defaultFlavor: 'Unknown' };
    const color = info.color;
    const displayFlavor = flavor || info.defaultFlavor;
    
    // Format percentage if provided
    const hasPercentage = percentage > 0;
    const formattedPercentage = hasPercentage ? percentage.toFixed(1) + '%' : '';
    
    // Normalize percentage for visual representation (terpenes rarely exceed 5%)
    const normalizedPercentage = Math.min(100, (percentage / 5) * 100);

    return (
      <BaseTag 
        ref={ref} 
        color={color} 
        onClick={onClick}
        className="terpene-tag"
        interactive={!!onClick}
        {...props}
      >
        <div className="terpene-tag-content">
          <span className="terpene-name">{name}</span>
          
          {hasPercentage && (
            <span className="terpene-percentage">{formattedPercentage}</span>
          )}
          
          {flavor && (
            <span className="terpene-flavor">{displayFlavor}</span>
          )}
          
          {visualMeter && hasPercentage && (
            <span className="terpene-meter-container">
              <span 
                className="terpene-meter" 
                style={{ width: `${normalizedPercentage}%` }} 
              />
            </span>
          )}
        </div>
      </BaseTag>
    );
  }
);

TerpeneTag.displayName = 'TerpeneTag';

export default TerpeneTag; 