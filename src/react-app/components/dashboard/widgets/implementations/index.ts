import StatisticsCard from './StatisticsCard';
import ConsumptionTrendChart from './ConsumptionTrendChart';

// Export all widget implementations
export {
  StatisticsCard,
  ConsumptionTrendChart
};

// Widget component mapping for dynamic loading
const WidgetComponents = {
  'StatisticsCard': StatisticsCard,
  'ConsumptionTrendChart': ConsumptionTrendChart
};

export default WidgetComponents; 