import React from 'react';
import '../../styles/cannabis/StrainCard.css';

// Define the Strain interface if it's not already defined/exported elsewhere
export interface Strain {
    id: string;
    name: string;
    type: StrainType;
    thc?: number;
    cbd?: number;
    description?: string;
    effects?: string[];
    terpenes?: { name: string; value: number }[]; // Simple terpene structure
    imageUrl?: string;
    userRating?: number;
    purchaseDate?: string;
    purchaseLocation?: string;
    price?: number;
    quantity?: string; // Or number depending on expected unit
    notes?: string;
}

export type StrainType = 'Sativa' | 'Indica' | 'Hybrid' | 'Unknown';

export interface StrainCardProps {
  strain: Strain;
  className?: string;
  // Add other props specific to StrainCard if any
  onClick?: () => void;
}

// Helper function (assuming it exists or is added)
const formatPercentage = (value: number | undefined): string => value !== undefined ? `${value.toFixed(1)}%` : 'N/A';
const getRatingClasses = (rating: number): string => rating >= 4 ? 'high' : rating >= 3 ? 'medium' : 'low';

const StrainCard: React.FC<StrainCardProps> = ({ strain, className, onClick }) => {
  // Generate type-specific classes
  const typeClass = `strain-card-${strain.type.toLowerCase()}`;
  
  return (
    <div className={`strain-card ${typeClass} ${className || ''}`} onClick={onClick}>
      <div className="strain-card-container">
        {/* Strain header with type indicator */}
        <div className="strain-card-header">
          <div className="strain-card-type-badge">{strain.type.charAt(0).toUpperCase() + strain.type.slice(1)}</div>
          {strain.userRating !== undefined && (
            <div className={`strain-card-rating ${getRatingClasses(strain.userRating)}`}>
              {strain.userRating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Strain image if available */}
        {strain.imageUrl && (
          <div className="strain-card-image-container">
            <img src={strain.imageUrl} alt={strain.name} className="strain-card-image" />
          </div>
        )}

        {/* Strain name and content */}
        <div className="strain-card-content">
          <h3 className="strain-card-name">{strain.name}</h3>
          
          {/* THC/CBD percentages - Corrected JSX */}
          <div className="strain-card-percentages">
            {strain.thc !== undefined && (
              <div className="strain-card-percentage strain-card-thc">
                <span className="strain-card-percentage-label">THC</span>
                <span className="strain-card-percentage-value">{formatPercentage(strain.thc)}</span>
                <div 
                  className="strain-card-percentage-bar"
                  style={{ width: `${Math.min(100, (strain.thc || 0) * 3)}%` }} // Ensure value exists for calculation
                ></div>
              </div>
            )}
            
            {strain.cbd !== undefined && (
              <div className="strain-card-percentage strain-card-cbd">
                <span className="strain-card-percentage-label">CBD</span>
                <span className="strain-card-percentage-value">{formatPercentage(strain.cbd)}</span>
                <div 
                  className="strain-card-percentage-bar"
                  style={{ width: `${Math.min(100, (strain.cbd || 0) * 5)}%` }} // Ensure value exists for calculation
                ></div>
              </div>
            )}
          </div>
          
          {/* Effects tags - Corrected mapping */}
          {strain.effects && strain.effects.length > 0 && (
            <div className="strain-card-effects">
              {strain.effects.slice(0, 4).map((effect, index) => (
                <span key={`${strain.id}-effect-${index}`} className="strain-card-effect-tag">
                  {effect}
                </span>
              ))}
              {strain.effects.length > 4 && (
                <span className="strain-card-effect-tag strain-card-effect-more">
                  +{strain.effects.length - 4}
                </span>
              )}
            </div>
          )}
          
          {/* Purchase info */}
          {(strain.purchaseDate || strain.purchaseLocation || strain.price || strain.quantity) && (
            <div className="strain-card-purchase-info">
              {strain.purchaseDate && (
                <div className="strain-card-purchase-date">
                  <span className="strain-card-info-label">Purchased:</span> {strain.purchaseDate}
                </div>
              )}
              
              {strain.purchaseLocation && (
                <div className="strain-card-purchase-location">
                  <span className="strain-card-info-label">Location:</span> {strain.purchaseLocation}
                </div>
              )}
              
              <div className="strain-card-purchase-details">
                {strain.price !== undefined && (
                  <span className="strain-card-price">${strain.price.toFixed(2)}</span>
                )}
                
                {strain.quantity && (
                  <span className="strain-card-quantity">{strain.quantity}</span>
                )}
              </div>
            </div>
          )}
          
          {/* Notes preview */}
          {strain.notes && (
            <div className="strain-card-notes">
              <p>{strain.notes.length > 100 ? `${strain.notes.substring(0, 100)}...` : strain.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrainCard; 