// First import utility files
import WidgetUtils from './WidgetUtils';
import WidgetRegistry, { WidgetCategory, registerWidgetComponent } from './WidgetRegistry';

// Then implementation files
import WidgetComponents from './implementations';

// Register all widget components
Object.entries(WidgetComponents).forEach(([name, component]) => {
  registerWidgetComponent(name, component);
});

// Use console.log to debug exports
console.log('widgets/index.ts exports:', { 
  WidgetUtils: !!WidgetUtils,
  WidgetRegistry: !!WidgetRegistry,
  WidgetComponents: !!WidgetComponents 
});

export {
  WidgetRegistry,
  WidgetCategory,
  WidgetComponents,
  WidgetUtils
}; 