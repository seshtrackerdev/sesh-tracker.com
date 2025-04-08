import React from 'react';
import '../../styles/cannabis/TerpeneProfile.css';

export interface Terpene {
  name: string;
  percentage: number;
  color: string;
  flavor: string;
  effects: string[];
}

export interface TerpeneProfileProps {
  terpenes: Terpene[];
  showLabels?: boolean;
  showPercentages?: boolean;
  showFlavors?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  maxDisplay?: number;
  onTerpeneClick?: (terpene: Terpene) => void;
}

const TerpeneProfile: React.FC<TerpeneProfileProps> = ({
  terpenes,
  showLabels = true,
  showPercentages = true,
  showFlavors = false,
  size = 'md',
  className = '',
  maxDisplay = 6,
  onTerpeneClick,
}) => {
  // Sort terpenes by percentage (highest first)
  const sortedTerpenes = [...terpenes].sort((a, b) => b.percentage - a.percentage);
  
  // Limit number of terpenes displayed
  const displayTerpenes = sortedTerpenes.slice(0, maxDisplay);
  
  // Calculate total percentage of displayed terpenes for proportions
  const totalPercentage = displayTerpenes.reduce((sum, terpene) => sum + terpene.percentage, 0);
  
  // Calculate angle for each terpene in the circular display
  const calculateSegments = () => {
    let startAngle = 0;
    
    return displayTerpenes.map((terpene) => {
      // Calculate angle based on percentage proportion
      const angle = (terpene.percentage / totalPercentage) * 360;
      const endAngle = startAngle + angle;
      
      // Calculate SVG arc path
      const x1 = 50 + 45 * Math.cos((startAngle - 90) * (Math.PI / 180));
      const y1 = 50 + 45 * Math.sin((startAngle - 90) * (Math.PI / 180));
      const x2 = 50 + 45 * Math.cos((endAngle - 90) * (Math.PI / 180));
      const y2 = 50 + 45 * Math.sin((endAngle - 90) * (Math.PI / 180));
      
      // Determine if angle is large arc (> 180 degrees)
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      // Create path
      const path = `
        M 50 50
        L ${x1} ${y1}
        A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
      
      // Save segment data
      const segment = {
        terpene,
        path,
        startAngle,
        endAngle,
        midAngle: startAngle + angle / 2,
      };
      
      // Update start angle for next segment
      startAngle = endAngle;
      
      return segment;
    });
  };
  
  const segments = calculateSegments();
  
  // Format percentage for display
  const formatPercentage = (value: number) => {
    return value < 1 ? value.toFixed(2) : value.toFixed(1);
  };
  
  // Handle terpene segment click
  const handleTerpeneClick = (terpene: Terpene) => {
    if (onTerpeneClick) {
      onTerpeneClick(terpene);
    }
  };
  
  return (
    <div className={`terpene-profile terpene-profile-${size} ${className}`}>
      <div className="terpene-profile-chart">
        <svg viewBox="0 0 100 100" className="terpene-profile-svg">
          {segments.map((segment, index) => (
            <path
              key={`terpene-segment-${index}`}
              d={segment.path}
              fill={segment.terpene.color}
              className="terpene-segment"
              onClick={() => handleTerpeneClick(segment.terpene)}
              data-terpene={segment.terpene.name}
            />
          ))}
          <circle cx="50" cy="50" r="25" className="terpene-profile-inner-circle" />
        </svg>
        
        {/* If chart is empty, show placeholder */}
        {displayTerpenes.length === 0 && (
          <div className="terpene-profile-empty">
            No terpene data available
          </div>
        )}
      </div>
      
      {showLabels && (
        <div className="terpene-profile-legend">
          {displayTerpenes.map((terpene, index) => (
            <div 
              key={`terpene-legend-${index}`} 
              className="terpene-legend-item"
              onClick={() => handleTerpeneClick(terpene)}
            >
              <div 
                className="terpene-legend-color" 
                style={{ backgroundColor: terpene.color }}
              />
              <div className="terpene-legend-info">
                <div className="terpene-legend-name">
                  {terpene.name}
                  {showPercentages && (
                    <span className="terpene-legend-percentage">
                      {formatPercentage(terpene.percentage)}%
                    </span>
                  )}
                </div>
                
                {showFlavors && terpene.flavor && (
                  <div className="terpene-legend-flavor">
                    {terpene.flavor}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TerpeneProfile; 