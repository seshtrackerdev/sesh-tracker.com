import React from 'react';
import { BaseWidget, WidgetProps, withWidgetWrapper } from '../Widget';
import { WidgetCategory } from '../WidgetRegistry';

// Define props specific to the StatisticsCard widget
export interface StatisticsCardProps {
  metricType: 'inventory-count' | 'session-count' | 'strain-count' | 'custom';
  title: string;
  timeRange?: 'all-time' | 'last-30-days' | 'last-7-days' | 'today';
  customMetric?: string;
  customValue?: number;
}

// Implementation using the BaseWidget pattern
class StatisticsCardWidget extends BaseWidget<StatisticsCardProps> {
  displayName = 'Statistics Card';
  description = 'Display key metrics as a card with large numbers';
  category = WidgetCategory.METRICS;
  defaultProps: StatisticsCardProps = {
    metricType: 'inventory-count',
    title: 'Total Inventory',
    timeRange: 'all-time'
  };

  render(props: StatisticsCardProps & WidgetProps): React.ReactNode {
    // @ts-ignore
    const { instance, shouldShowTitle, metricType, title, timeRange, customMetric, customValue } = props;
    
    // In a real implementation, this would fetch actual data
    // For now, just showing the placeholder UI
    let displayMetric = '';
    let displayValue = 0;
    
    switch (metricType) {
      case 'inventory-count':
        displayMetric = 'Items';
        displayValue = 42; // Placeholder value
        break;
      case 'session-count':
        displayMetric = 'Sessions';
        displayValue = 87; // Placeholder value
        break;
      case 'strain-count':
        displayMetric = 'Strains';
        displayValue = 15; // Placeholder value
        break;
      case 'custom':
        displayMetric = customMetric || 'Value';
        displayValue = customValue || 0;
        break;
    }

    return (
      <div className="statistics-card-widget">
        {shouldShowTitle && <h3 className="widget-title">{title}</h3>}
        
        <div className="metric-value-container">
          <span className="metric-value">{displayValue}</span>
          <span className="metric-label">{displayMetric}</span>
        </div>
        
        <div className="metric-footer">
          <span className="time-range">{timeRange}</span>
        </div>
      </div>
    );
  }
}

// Create the component using the HOC wrapper
const StatisticsCard = withWidgetWrapper(
  (props: WidgetProps) => {
    const widgetProps = {
      ...(props.instance.props as StatisticsCardProps),
      ...props
    };
    
    return new StatisticsCardWidget().render(widgetProps);
  }
);

// Export the component as the default
export default StatisticsCard;

// Also export with a named export for explicit registration
export { StatisticsCard }; 