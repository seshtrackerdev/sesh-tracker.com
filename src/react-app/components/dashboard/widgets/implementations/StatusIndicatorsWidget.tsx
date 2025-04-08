'use client';

import React, { useState, useEffect } from 'react';
import { WidgetProps, withWidgetWrapper } from '../Widget';
import { getWidgetTypeById } from '../WidgetRegistry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, PackageX, Loader2 } from 'lucide-react';

// Define the shape of the API response data
interface StatusData {
  lowStockItemsCount: number;
  expiringSoonItemsCount: number;
}

interface StatusIndicatorsWidgetProps extends WidgetProps {
  lowStockThreshold?: number;
}

const StatusIndicatorsWidgetComponent: React.FC<StatusIndicatorsWidgetProps> = ({ 
  instance, 
  shouldShowTitle, 
  lowStockThreshold = 5 
}) => {
  const widgetType = getWidgetTypeById(instance.widgetTypeId);
  const widgetTitle = widgetType?.name || 'Status Indicators';

  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call using configured base URL and auth token
        const response = await fetch('/api/dashboards/widgets/status-indicators', {
          // Assuming auth token is handled globally or via a context/hook
          // headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setStatusData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch data');
        }
      } catch (err: any) {
        console.error("Error fetching status data:", err);
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // TODO: Add appropriate dependencies if needed (e.g., user ID changes)
  }, [instance.id]); // Re-fetch if widget instance changes (placeholder)

  return (
    <Card className="h-full flex flex-col">
      {shouldShowTitle && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{widgetTitle}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-grow flex flex-col justify-center">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-600 text-sm">
            Error: {error}
          </div>
        ) : statusData ? (
          <div className="space-y-2">
            <div className="flex items-center text-orange-500">
              <PackageX className="h-5 w-5 mr-2" />
              <span className="font-medium">{statusData.lowStockItemsCount}</span>
              <span className="text-xs text-muted-foreground ml-1">item(s) low stock (Threshold: {lowStockThreshold})</span>
            </div>
            <div className="flex items-center text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">{statusData.expiringSoonItemsCount}</span>
              <span className="text-xs text-muted-foreground ml-1">item(s) expiring soon</span>
            </div>
            {/* Add more indicators as needed */} 
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
            No data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const StatusIndicatorsWidget = withWidgetWrapper(StatusIndicatorsWidgetComponent);

// Metadata for the registry (optional but good practice)
export const statusIndicatorsWidgetInfo = {
  id: 'status-indicators', // Unique ID for this widget type
  name: 'Status Indicators',
  description: 'Displays key inventory alerts like low stock or expiring items.',
  category: 'inventory', // Matches one of the categories in WidgetRegistry
  defaultHeight: 1,
  defaultWidth: 1,
  component: StatusIndicatorsWidget,
}; 