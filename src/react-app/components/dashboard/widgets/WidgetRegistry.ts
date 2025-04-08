import React from 'react';
import { WidgetType } from '../types';

console.log("WidgetRegistry module loaded");

// This will be populated with actual widget components
const widgetComponents: Record<string, React.ComponentType<any>> = {};

// Widget categories for organization in the selector
export enum WidgetCategory {
  METRICS = 'Metrics',
  VISUALIZATION = 'Visualization',
  INVENTORY = 'Inventory',
  SESSIONS = 'Sessions',
  ACTIONS = 'Actions',
  ANALYTICS = 'Analytics',
}

// Registry of all available widget types
const widgetRegistry: WidgetType[] = [
  // Key Metric Widgets
  {
    id: 'statistics-card',
    name: 'Statistics Card',
    category: WidgetCategory.METRICS,
    component: 'StatisticsCard',
    defaultProps: { 
      metricType: 'inventory-count',
      title: 'Total Inventory',
    },
  },
  {
    id: 'status-indicator',
    name: 'Status Indicators',
    category: WidgetCategory.METRICS,
    component: 'StatusIndicator',
    defaultProps: { 
      alertType: 'inventory-low',
    },
  },
  
  // Data Visualization Widgets
  {
    id: 'consumption-trend',
    name: 'Consumption Trend',
    category: WidgetCategory.VISUALIZATION,
    component: 'ConsumptionTrendChart',
    defaultProps: { 
      timeRange: 'last-30-days',
    },
  },
  {
    id: 'inventory-breakdown',
    name: 'Inventory Breakdown',
    category: WidgetCategory.VISUALIZATION, 
    component: 'InventoryBreakdownPie',
    defaultProps: {
      groupBy: 'product-type',
    },
  },
  {
    id: 'session-heatmap',
    name: 'Session Calendar',
    category: WidgetCategory.VISUALIZATION,
    component: 'SessionCalendarHeatmap',
    defaultProps: {
      year: new Date().getFullYear(),
    },
  },
  
  // Action Widgets
  {
    id: 'quick-session',
    name: 'Quick Session Logger',
    category: WidgetCategory.ACTIONS,
    component: 'QuickSessionLogger',
    defaultProps: {},
  },
  {
    id: 'inventory-quick-add',
    name: 'Quick Inventory Add',
    category: WidgetCategory.ACTIONS,
    component: 'InventoryQuickAdd',
    defaultProps: {},
  },
  {
    id: 'recent-activity',
    name: 'Recent Activity',
    category: WidgetCategory.ACTIONS,
    component: 'RecentActivityFeed',
    defaultProps: {
      limit: 5,
    },
  },
];

// Get all widget types
export const getAllWidgetTypes = (): WidgetType[] => {
  return [...widgetRegistry];
};

// Get widget types by category
export const getWidgetTypesByCategory = (category: WidgetCategory): WidgetType[] => {
  return widgetRegistry.filter(widget => widget.category === category);
};

// Get a single widget type by ID
export const getWidgetTypeById = (id: string): WidgetType | undefined => {
  return widgetRegistry.find(widget => widget.id === id);
};

// Get all categories with their widget counts
export const getWidgetCategories = (): { category: string; count: number }[] => {
  const categoryCounts: Record<string, number> = {};
  
  widgetRegistry.forEach(widget => {
    if (!categoryCounts[widget.category]) {
      categoryCounts[widget.category] = 0;
    }
    categoryCounts[widget.category]++;
  });
  
  return Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));
};

// Register a new widget component
export const registerWidgetComponent = (
  componentName: string, 
  component: React.ComponentType<any>
) => {
  widgetComponents[componentName] = component;
  console.log(`Registered widget component: ${componentName}`);
};

// Get a widget component by name
export const getWidgetComponent = (componentName: string): React.ComponentType<any> | null => {
  if (componentName in widgetComponents) {
    return widgetComponents[componentName];
  }
  console.warn(`Widget component not found: ${componentName}`);
  return null;
};

export default {
  getAllWidgetTypes,
  getWidgetTypesByCategory,
  getWidgetTypeById,
  getWidgetCategories,
  registerWidgetComponent,
  getWidgetComponent,
}; 