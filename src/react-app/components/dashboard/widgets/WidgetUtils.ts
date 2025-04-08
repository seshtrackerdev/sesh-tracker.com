import { WidgetInstance, WidgetType } from '../types';

// Debug log to check if module is loaded
console.log('WidgetUtils module loaded');

// Generate a unique widget ID with a prefix and random string
export const generateWidgetId = (prefix: string = 'widget'): string => {
  const randomString = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${randomString}-${timestamp}`;
};

// Create a new widget instance from a widget type
export const createWidgetInstance = (widgetType: WidgetType): WidgetInstance => {
  return {
    id: generateWidgetId(widgetType.id),
    widgetTypeId: widgetType.id,
    props: widgetType.defaultProps || {},
    showTitle: true,
  };
};

// Update widget instance props
export const updateWidgetProps = (
  instance: WidgetInstance, 
  newProps: Record<string, any>
): WidgetInstance => {
  return {
    ...instance,
    props: {
      ...instance.props,
      ...newProps,
    },
  };
};

// Clone a widget instance with a new ID
export const cloneWidgetInstance = (instance: WidgetInstance): WidgetInstance => {
  return {
    ...instance,
    id: generateWidgetId(instance.widgetTypeId),
    showTitle: instance.showTitle !== undefined ? instance.showTitle : true,
  };
};

// Validates if a widget instance has all required props
export const validateWidgetInstance = (
  instance: WidgetInstance, 
  requiredProps: string[]
): boolean => {
  if (!instance.props) return false;
  
  return requiredProps.every(prop => 
    Object.prototype.hasOwnProperty.call(instance.props, prop)
  );
};

export default {
  generateWidgetId,
  createWidgetInstance,
  updateWidgetProps,
  cloneWidgetInstance,
  validateWidgetInstance,
}; 