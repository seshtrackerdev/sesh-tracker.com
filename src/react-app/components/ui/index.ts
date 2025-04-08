/**
 * UI Component Library Index
 * 
 * This file exports all UI components for easy importing throughout the application.
 * Import components using: import { Button, Card, etc } from '../components/ui';
 */

// Buttons
import Button from './buttons/Button';

// Form Elements
import Input from './input/Input';
import Checkbox from './checkbox/Checkbox';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from './select/Select';
import Slider from './slider/Slider';
import Label from './label/Label';

// Layout Components
import Card, { CardHeader, CardTitle, CardContent } from './card/Card';
import Modal from './modal/Modal';

// Feedback Components
import NotificationBanner from './notificationbanner/NotificationBanner';
import Badge from './badges/Badge';

// Tag Components
import {
  BaseTag,
  IconTag,
  RemovableTag,
  StrainTag,
  ChemicalTag,
  EffectTag,
  ProductTag,
  TerpeneTag
} from './tags';

// Export all components
export {
  // Buttons
  Button,
  
  // Form Elements
  Input,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Slider,
  Label,
  
  // Layout Components
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  
  // Feedback Components
  NotificationBanner,
  Badge,
  
  // Tag Components
  BaseTag,
  IconTag,
  RemovableTag,
  StrainTag,
  ChemicalTag,
  EffectTag,
  ProductTag,
  TerpeneTag
};

// Add more component exports as they are created 