/**
 * Tag Component Library Index
 * 
 * This file exports all tag components for easy importing throughout the application.
 * Import tags using: import { BaseTag, StrainTag, etc } from '../components/ui/tags';
 */

// Core Tag Components
import BaseTag from './core/BaseTag';
import IconTag from './core/IconTag';
import RemovableTag from './core/RemovableTag';

// Cannabis-specific Tag Components
import StrainTag from './cannabis/StrainTag';
import ChemicalTag from './cannabis/ChemicalTag';
import EffectTag from './cannabis/EffectTag';
import ProductTag from './cannabis/ProductTag';
import TerpeneTag from './cannabis/TerpeneTag';

// Export all tag components
export {
  // Core Tag Components
  BaseTag,
  IconTag,
  RemovableTag,
  
  // Cannabis-specific Tag Components
  StrainTag,
  ChemicalTag,
  EffectTag,
  ProductTag,
  TerpeneTag
};

// Export types
export type { BaseTagProps } from './core/BaseTag';
export type { IconTagProps } from './core/IconTag';
export type { RemovableTagProps } from './core/RemovableTag';

export type { StrainType, StrainDominance, StrainTagProps } from './cannabis/StrainTag';
export type { ChemicalCompound, ChemicalTagProps } from './cannabis/ChemicalTag';
export type { EffectCategory, EffectTagProps } from './cannabis/EffectTag';
export type { ProductType, ProductSubtype, ProductTagProps } from './cannabis/ProductTag';
export type { TerpeneType, TerpeneTagProps } from './cannabis/TerpeneTag'; 