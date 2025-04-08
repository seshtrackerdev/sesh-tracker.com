/**
 * Central types file for cannabis tracking components
 */

// Common strain types
export interface StrainItem {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
  thcPercentage?: number;
  cbdPercentage?: number;
  rating?: number;
  imageUrl?: string;
  purchaseInfo?: PurchaseInfo;
  effects?: EffectTag[];
  terpenes?: Terpene[];
  notes?: string;
}

export interface PurchaseInfo {
  location?: string;
  date?: Date | string;
  price?: number;
  quantity?: number;
  unit?: 'g' | 'oz' | 'eighth' | 'quarter' | 'half' | 'preroll' | 'cartridge' | 'edible';
}

// Effect tags
export interface EffectTag {
  id: string;
  name: string;
  category: EffectCategory;
  intensity?: number; // 1-5 scale
}

export type EffectCategory = 
  | 'creative'
  | 'energetic'
  | 'focused'
  | 'happy'
  | 'relaxed'
  | 'sleepy'
  | 'talkative'
  | 'euphoric'
  | 'uplifted'
  | 'hungry'
  | 'tingly'
  | 'giggly'
  | 'aroused'
  | 'pain-relief'
  | 'anti-anxiety'
  | 'anti-depression'
  | 'dry-mouth'
  | 'dry-eyes'
  | 'paranoia'
  | 'dizziness'
  | 'anxious'
  | 'headache'
  | 'other';

// Terpene profiles
export interface Terpene {
  name: string;
  percentage: number;
  effects: string[];
  flavor: string;
  color: string; // CSS color for visualization
}

// Session logging types
export interface SessionData {
  id?: string;
  duration: number;
  timestamp: Date;
  strain?: StrainItem;
  effects?: EffectTag[];
  notes?: string;
  mood?: string;
  loggingMode?: SessionLogMode;
}

export type SessionLogMode = 'quick' | 'minimal' | 'insightful';

export interface SessionInsightData extends SessionData {
  purpose?: SessionPurpose;
  setting?: SessionSetting;
  companions?: number;
  activityLevel?: number;
  symptoms?: SymptomRelief[];
  sessionMethods?: ConsumptionMethod[];
}

export interface ConsumptionMethod {
  id: string;
  name: string;
  icon?: string;
}

export type SessionPurpose = 
  | 'recreational' 
  | 'medical' 
  | 'creative' 
  | 'relaxation' 
  | 'social' 
  | 'sleep' 
  | 'productivity'
  | 'spiritual'
  | 'other';

export type SessionSetting = 
  | 'home' 
  | 'outdoors' 
  | 'friends' 
  | 'party' 
  | 'work' 
  | 'concert' 
  | 'hiking'
  | 'meditation'
  | 'other';

export interface SymptomRelief {
  symptomName: string;
  beforeLevel: number;
  afterLevel?: number;
} 