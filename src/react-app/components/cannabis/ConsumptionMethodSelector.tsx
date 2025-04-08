import React, { useState } from 'react';
import '../../styles/cannabis/ConsumptionMethodSelector.css';

export type ConsumptionMethod = 
  | 'smoking'     // Traditional smoking (joint, pipe, bong)
  | 'vaping'      // Vaporizing flower or concentrates
  | 'edible'      // Edible consumption
  | 'tincture'    // Sublingual tinctures
  | 'topical'     // Applied to skin
  | 'concentrate' // Dabs, wax, shatter
  | 'other';      // Other methods

export type DosageUnit =
  | 'g'      // Grams
  | 'mg'     // Milligrams
  | 'ml'     // Milliliters
  | 'puffs'  // Inhalations
  | 'drops'  // Tincture drops
  | 'pieces' // Number of pieces (edibles)
  | 'custom'; // Custom unit

export interface ConsumptionMethodSelectorProps {
  selectedMethod?: ConsumptionMethod;
  dosage?: number;
  dosageUnit?: DosageUnit;
  customUnit?: string;
  duration?: number; // Duration in minutes
  onChange: (data: {
    method: ConsumptionMethod;
    dosage?: number;
    dosageUnit?: DosageUnit;
    customUnit?: string;
    duration?: number;
  }) => void;
  showDosage?: boolean;
  showDuration?: boolean;
  disabled?: boolean;
  className?: string;
}

const ConsumptionMethodSelector: React.FC<ConsumptionMethodSelectorProps> = ({
  selectedMethod = 'smoking',
  dosage,
  dosageUnit,
  customUnit = '',
  duration,
  onChange,
  showDosage = true,
  showDuration = true,
  disabled = false,
  className = '',
}) => {
  // Initial values for dosage units based on method
  const getDefaultDosageUnit = (method: ConsumptionMethod): DosageUnit => {
    switch (method) {
      case 'smoking': return 'g';
      case 'vaping': return 'puffs';
      case 'edible': return 'mg';
      case 'tincture': return 'drops';
      case 'topical': return 'mg';
      case 'concentrate': return 'g';
      default: return 'g';
    }
  };

  // Set default dosage unit if not provided
  const [currentDosageUnit, setCurrentDosageUnit] = useState<DosageUnit>(
    dosageUnit || getDefaultDosageUnit(selectedMethod)
  );

  // Handle method change
  const handleMethodChange = (method: ConsumptionMethod) => {
    const newDosageUnit = getDefaultDosageUnit(method);
    setCurrentDosageUnit(newDosageUnit);
    
    onChange({
      method,
      dosage,
      dosageUnit: newDosageUnit,
      customUnit,
      duration,
    });
  };

  // Handle dosage change
  const handleDosageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onChange({
      method: selectedMethod,
      dosage: isNaN(value) ? undefined : value,
      dosageUnit: currentDosageUnit,
      customUnit,
      duration,
    });
  };

  // Handle dosage unit change
  const handleDosageUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DosageUnit;
    setCurrentDosageUnit(value);
    onChange({
      method: selectedMethod,
      dosage,
      dosageUnit: value,
      customUnit: value === 'custom' ? customUnit : undefined,
      duration,
    });
  };

  // Handle custom unit change
  const handleCustomUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({
      method: selectedMethod,
      dosage,
      dosageUnit: currentDosageUnit,
      customUnit: value,
      duration,
    });
  };

  // Handle duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onChange({
      method: selectedMethod,
      dosage,
      dosageUnit: currentDosageUnit,
      customUnit,
      duration: isNaN(value) ? undefined : value,
    });
  };

  // Method definitions with icons and labels
  const consumptionMethods: {
    id: ConsumptionMethod;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'smoking',
      label: 'Smoking',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="consumption-method-icon">
          <path d="M18 12H6M15 16.5c0 1.5 1.5 2 2 2s2-.5 2-2c0-1-1-1.5-2.5-2s-2-1.5-2-2c0-1.5 1.5-2 2-2s2 .5 2 2M4 19h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'vaping',
      label: 'Vaping',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="consumption-method-icon">
          <path d="M9 19h6M10 22h4M12 16V4M5 8h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="7" y="8" width="10" height="8" rx="2" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'edible',
      label: 'Edible',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="consumption-method-icon">
          <path d="M6 7c0-5 12-5 12 0s-6 10-6 10M7 12c-5 0-5-11 0-11s8 5 8 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 19c0-4 4-4 4 0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'tincture',
      label: 'Tincture',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="consumption-method-icon">
          <path d="M10 3h4m-2 0v5M8 8h8l-2 13H10L8 8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 14h6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'topical',
      label: 'Topical',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="consumption-method-icon">
          <path d="M7 21h10M8 17h8a1 1 0 001-1V6a1 1 0 00-1-1H8a1 1 0 00-1 1v10a1 1 0 001 1zM10 3h4m-2 9a2 2 0 100-4 2 2 0 000 4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'concentrate',
      label: 'Concentrate',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="consumption-method-icon">
          <path d="M17.5 10c-1-7-9-7-10 0-4.1.5-7 4.3-5 8.5 2.9 5 9.1 5 12 0 2-4.2-.9-8-5-8.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'other',
      label: 'Other',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="consumption-method-icon">
          <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
          <path d="M12 12v.01M12 8v.01M12 16v.01" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    }
  ];

  return (
    <div className={`consumption-method-selector ${disabled ? 'consumption-method-disabled' : ''} ${className}`}>
      {/* Method selection */}
      <div className="consumption-method-options">
        {consumptionMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            className={`consumption-method-option ${selectedMethod === method.id ? 'consumption-method-selected' : ''}`}
            onClick={() => handleMethodChange(method.id)}
            disabled={disabled}
            aria-label={`Select ${method.label} consumption method`}
          >
            <div className="consumption-method-icon-container">
              {method.icon}
            </div>
            <span className="consumption-method-label">{method.label}</span>
          </button>
        ))}
      </div>

      {/* Dosage input */}
      {showDosage && (
        <div className="consumption-method-dosage">
          <label className="consumption-method-label">
            Dosage:
            <div className="consumption-method-dosage-inputs">
              <input
                type="number"
                value={dosage !== undefined ? dosage : ''}
                onChange={handleDosageChange}
                className="consumption-method-dosage-input"
                placeholder="Amount"
                min="0"
                step="any"
                disabled={disabled}
              />
              
              <select
                value={currentDosageUnit}
                onChange={handleDosageUnitChange}
                className="consumption-method-unit-select"
                disabled={disabled}
              >
                <option value="g">grams</option>
                <option value="mg">milligrams</option>
                <option value="ml">milliliters</option>
                <option value="puffs">puffs</option>
                <option value="drops">drops</option>
                <option value="pieces">pieces</option>
                <option value="custom">custom</option>
              </select>
            </div>
          </label>
          
          {/* Custom unit input */}
          {currentDosageUnit === 'custom' && (
            <div className="consumption-method-custom-unit">
              <label className="consumption-method-label">
                Custom Unit:
                <input
                  type="text"
                  value={customUnit}
                  onChange={handleCustomUnitChange}
                  className="consumption-method-custom-input"
                  placeholder="e.g., hits, bowls"
                  disabled={disabled}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Duration input */}
      {showDuration && (
        <div className="consumption-method-duration">
          <label className="consumption-method-label">
            Duration:
            <div className="consumption-method-duration-input">
              <input
                type="number"
                value={duration !== undefined ? duration : ''}
                onChange={handleDurationChange}
                className="consumption-method-duration-input"
                placeholder="Duration"
                min="0"
                disabled={disabled}
              />
              <span className="consumption-method-duration-unit">minutes</span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default ConsumptionMethodSelector; 