import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { BarChart as BarIcon, LineChart as LineIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Bar,
  Line,
} from 'recharts';
import './ConsumptionAnalytics.css';

// --- Mock Data & Types (Replace with actual data fetching and types) ---
type TimeFrame = 'week' | 'month' | 'year';
type ChartType = 'bar' | 'line';

interface AnalyticsDataPoint {
  date: string; // e.g., "Mon", "Week 1", "Jan"
  consumptionCount?: number;
  averageEffectiveness?: number;
  // Method distribution might need a separate visualization
}

// More realistic mock data names for axes
const mockData: { [key in TimeFrame]: AnalyticsDataPoint[] } = {
  week: [
    { date: 'Mon', consumptionCount: 3, averageEffectiveness: 7 },
    { date: 'Tue', consumptionCount: 2, averageEffectiveness: 8 },
    { date: 'Wed', consumptionCount: 4, averageEffectiveness: 6.5 },
    { date: 'Thu', consumptionCount: 1, averageEffectiveness: 9 },
    { date: 'Fri', consumptionCount: 5, averageEffectiveness: 7.5 },
    { date: 'Sat', consumptionCount: 6, averageEffectiveness: 8 },
    { date: 'Sun', consumptionCount: 2, averageEffectiveness: 7 },
  ],
  month: [
    { date: 'Week 1', consumptionCount: 15, averageEffectiveness: 7.5 },
    { date: 'Week 2', consumptionCount: 12, averageEffectiveness: 7 },
    { date: 'Week 3', consumptionCount: 18, averageEffectiveness: 8 },
    { date: 'Week 4', consumptionCount: 10, averageEffectiveness: 6.5 },
  ],
  year: [
    { date: 'Jan', consumptionCount: 50, averageEffectiveness: 6.8 },
    { date: 'Feb', consumptionCount: 45, averageEffectiveness: 7.2 },
    { date: 'Mar', consumptionCount: 60, averageEffectiveness: 7.5 },
    { date: 'Apr', consumptionCount: 55, averageEffectiveness: 7.1 },
    // ... add more months for a better yearly view
  ],
};
// --- End Mock Data ---

interface ConsumptionAnalyticsProps {
  userId: string; // To fetch data for the specific user
}

export const ConsumptionAnalytics: React.FC<ConsumptionAnalyticsProps> = ({ userId: _userId }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [chartType, setChartType] = useState<ChartType>('bar');

  // TODO: Replace mockData with actual data fetching based on userId and timeFrame
  const data = useMemo(() => mockData[timeFrame], [timeFrame]);

  const renderChart = () => {
    if (!data || data.length === 0) {
      return <p className="no-data-message">No consumption data available for this period.</p>;
    }

    const ChartComponent = chartType === 'bar' ? BarChart : LineChart;
    const DataComponent = chartType === 'bar' ? Bar : Line;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Count', angle: -90, position: 'insideLeft' }}/>
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Effectiveness', angle: -90, position: 'insideRight' }}/>
          <Tooltip />
          <Legend />
          <DataComponent
             yAxisId="left"
             type="monotone"
             dataKey="consumptionCount"
             fill="#8884d8"
             name="Consumption Count"
             {...(chartType === 'bar' ? { barSize: 20 } : { stroke: '#8884d8' })}
          />
           <DataComponent
             yAxisId="right"
             type="monotone"
             dataKey="averageEffectiveness"
             fill="#82ca9d"
             name="Avg. Effectiveness"
             {...(chartType === 'bar' ? { barSize: 20 } : { stroke: '#82ca9d' })}
           />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="consumption-analytics">
      <CardHeader className="analytics-header">
        <CardTitle>Consumption Analytics</CardTitle>
        <div className="controls">
           <Select value={timeFrame} onValueChange={(value: string) => setTimeFrame(value as TimeFrame)}>
             <SelectTrigger className="w-[180px]">
               <SelectValue placeholder="Select Time Frame" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="week">Last Week</SelectItem>
               <SelectItem value="month">Last Month</SelectItem>
               <SelectItem value="year">Last Year</SelectItem>
             </SelectContent>
           </Select>

           <Select value={chartType} onValueChange={(value: string) => setChartType(value as ChartType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart <BarIcon className="inline h-4 w-4 ml-2"/></SelectItem>
                <SelectItem value="line">Line Chart <LineIcon className="inline h-4 w-4 ml-2"/></SelectItem>
              </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="analytics-content">
        {renderChart()}
        {/* TODO: Add placeholder/component for Method Distribution Pie Chart */}
        {/* TODO: Add placeholder/component for Strain Effectiveness Analysis */}
      </CardContent>
    </Card>
  );
}; 