import React from 'react';
import '../../styles/cannabis/EffectTag.css';

export type EffectCategory = 
  | 'physical'   // Physical effects (relaxed, energetic, etc.)
  | 'mental'     // Mental effects (creative, focused, euphoric, etc.)
  | 'medicinal'  // Medicinal effects (pain relief, anxiety reduction, etc.)
  | 'negative'   // Negative effects (dry mouth, paranoia, etc.)
  | 'flavor'     // Flavor/taste effects (sweet, earthy, etc.)
  | 'other';     // Uncategorized effects

export interface EffectTagProps {
  effect: string;
  category?: EffectCategory;
  intensity?: number; // 1-5 scale
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EffectTag: React.FC<EffectTagProps> = ({
  effect,
  category = 'other',
  intensity,
  removable = false,
  onRemove,
  onClick,
  size = 'md',
  className = '',
}) => {
  // Handle click events
  const handleClick = (_e: React.MouseEvent) => {
    if (onClick) onClick();
  };

  // Handle remove button click
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    if (onRemove) onRemove();
  };

  // Get emoji based on category
  const getCategoryEmoji = (category: EffectCategory): string => {
    switch (category) {
      case 'physical': return '💪';
      case 'mental': return '🧠';
      case 'medicinal': return '💊';
      case 'negative': return '⚠️';
      case 'flavor': return '👅';
      default: return '✨';
    }
  };

  // Generate intensity dots
  const renderIntensityDots = () => {
    if (intensity === undefined) return null;
    
    return (
      <div className="effect-tag-intensity">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={`effect-tag-dot ${i < intensity ? 'effect-tag-dot-active' : ''}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`
        effect-tag 
        effect-tag-${category} 
        effect-tag-${size}
        ${onClick ? 'effect-tag-clickable' : ''}
        ${className}
      `}
      onClick={onClick ? handleClick : undefined}
    >
      <span className="effect-tag-emoji">{getCategoryEmoji(category)}</span>
      <span className="effect-tag-text">{effect}</span>
      
      {intensity !== undefined && renderIntensityDots()}
      
      {removable && (
        <button 
          className="effect-tag-remove" 
          onClick={handleRemove}
          aria-label={`Remove ${effect} effect`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default EffectTag; 