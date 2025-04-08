/**
 * Cannabis-Specific Component Library Index
 * 
 * This file exports cannabis-specific components for easy importing throughout the application.
 * Import components using: import { StrainCard, EffectTag, etc } from '../components/cannabis';
 */

// Export all cannabis components for easy imports

// Strain related components
export { default as StrainCard } from './StrainCard';
export { default as EffectTag } from './EffectTag';
export { default as TerpeneProfile } from './TerpeneProfile';

// Session tracking components
export { default as QuickSessionButton } from './QuickSessionButton';
export { default as MinimalSessionForm } from './MinimalSessionForm';
export { default as InsightfulSessionForm } from './InsightfulSessionForm';
export { default as SessionLoggingOptions } from './SessionLoggingOptions';

// Types
export type { 
  // Add types here as they are defined in components
} from './types';

// Export types
export type { StrainType } from './StrainCard';
export type { EffectCategory } from './EffectTag';
export type { Terpene } from './TerpeneProfile';
export type { ConsumptionMethod, DosageUnit } from './ConsumptionMethodSelector';

// Add new exports
export * from './MedicalSymptomTracker';
export * from './ConsumptionAnalytics';

// Re-export explicitly to potentially help linter/TS server
export { MedicalSymptomTracker } from './MedicalSymptomTracker';
export { ConsumptionAnalytics } from './ConsumptionAnalytics';

export { default as ConsumptionMethodSelector } from './ConsumptionMethodSelector'; 