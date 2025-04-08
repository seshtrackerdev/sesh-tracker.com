export { default as DashboardContainer } from './DashboardContainer';
export { default as DashboardContext, DashboardProvider, useDashboard } from './DashboardContext';
export { default as DashboardHeader } from './DashboardHeader';
export { default as DashboardRow } from './DashboardRow';
export { default as DashboardColumn } from './DashboardColumn';
export { default as DashboardGrid } from './DashboardGrid';
export { default as WidgetSlot } from './WidgetSlot';
export { default as GlobalLayoutModal } from './GlobalLayoutModal';
export { default as LayoutSelectionModal } from './LayoutSelectionModal';
export { default as WelcomeHeader } from './WelcomeHeader';
export { default as WidgetSelectorModal } from './WidgetSelectorModal';

// Export widget-related components and utilities directly with explicit paths
export { WidgetRegistry, WidgetCategory, WidgetComponents, WidgetUtils } from './widgets';
export * from './types'; 