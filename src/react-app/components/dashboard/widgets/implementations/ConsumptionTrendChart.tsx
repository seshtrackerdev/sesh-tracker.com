import React from 'react';
import { BaseWidget, WidgetProps, withWidgetWrapper } from '../Widget';
import { WidgetCategory } from '../WidgetRegistry';

// Define props specific to the ConsumptionTrendChart widget
export interface ConsumptionTrendChartProps {
  timeRange: 'last-30-days' | 'last-7-days' | 'last-90-days' | 'year-to-date';
  dataType?: 'quantity' | 'frequency' | 'duration';
  chartType?: 'line' | 'bar' | 'area';
}

// Implementation using the BaseWidget pattern
class ConsumptionTrendChartWidget extends BaseWidget<ConsumptionTrendChartProps> {
  displayName = 'Consumption Trend Chart';
  description = 'Visualize your consumption patterns over time';
  category = WidgetCategory.VISUALIZATION;
  defaultProps: ConsumptionTrendChartProps = {
    timeRange: 'last-30-days',
    dataType: 'quantity',
    chartType: 'line'
  };

  render(props: ConsumptionTrendChartProps & WidgetProps): React.ReactNode {
    const { shouldShowTitle, instance, timeRange, dataType, chartType } = props;
    
    // In a real implementation, this would fetch and render actual chart data
    // For now, just showing a placeholder chart UI
    return (
      <div className="consumption-trend-chart-widget">
        {shouldShowTitle && <h3 className="widget-title">{instance.props?.title || 'Consumption Trend'}</h3>}
        
        <div className="chart-container">
          <div className="chart-placeholder">
            <svg width="100%" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
              {/* X and Y axes */}
              <line x1="40" y1="10" x2="40" y2="120" stroke="#888" strokeWidth="1" />
              <line x1="40" y1="120" x2="290" y2="120" stroke="#888" strokeWidth="1" />
              
              {/* Sample data points for a trend line */}
              {chartType === 'line' && (
                <polyline
                  points="40,100 70,90 100,110 130,70 160,80 190,60 220,40 250,50 280,30"
                  fill="none"
                  stroke="#4C9AFF"
                  strokeWidth="2"
                />
              )}
              
              {/* Sample data points for a bar chart */}
              {chartType === 'bar' && (
                <>
                  <rect x="50" y="80" width="20" height="40" fill="#4C9AFF" />
                  <rect x="80" y="70" width="20" height="50" fill="#4C9AFF" />
                  <rect x="110" y="90" width="20" height="30" fill="#4C9AFF" />
                  <rect x="140" y="50" width="20" height="70" fill="#4C9AFF" />
                  <rect x="170" y="60" width="20" height="60" fill="#4C9AFF" />
                  <rect x="200" y="40" width="20" height="80" fill="#4C9AFF" />
                  <rect x="230" y="70" width="20" height="50" fill="#4C9AFF" />
                  <rect x="260" y="30" width="20" height="90" fill="#4C9AFF" />
                </>
              )}
              
              {/* X-axis labels */}
              <text x="40" y="140" fontSize="10" textAnchor="middle">1</text>
              <text x="100" y="140" fontSize="10" textAnchor="middle">10</text>
              <text x="160" y="140" fontSize="10" textAnchor="middle">20</text>
              <text x="220" y="140" fontSize="10" textAnchor="middle">30</text>
              <text x="280" y="140" fontSize="10" textAnchor="middle">40</text>
              
              {/* Y-axis labels */}
              <text x="30" y="120" fontSize="10" textAnchor="end">0</text>
              <text x="30" y="90" fontSize="10" textAnchor="end">5</text>
              <text x="30" y="60" fontSize="10" textAnchor="end">10</text>
              <text x="30" y="30" fontSize="10" textAnchor="end">15</text>
            </svg>
          </div>
        </div>
        
        <div className="chart-footer">
          <span className="time-range-label">Time Range: {timeRange}</span>
          <span className="data-type-label">Showing: {dataType}</span>
        </div>
      </div>
    );
  }
}

// Create the component using the HOC wrapper
const ConsumptionTrendChart = withWidgetWrapper(
  (props: WidgetProps) => {
    const widgetProps = {
      ...(props.instance.props as ConsumptionTrendChartProps),
      ...props
    };
    
    return new ConsumptionTrendChartWidget().render(widgetProps);
  }
);

// Export the component as the default
export default ConsumptionTrendChart;

// Also export with a named export for explicit registration
export { ConsumptionTrendChart }; 