import React from 'react';
import { useDashboard } from './DashboardContext';
import { ColumnDefinition } from './types';
import WidgetSlot from './WidgetSlot';

interface DashboardColumnProps {
  rowId: string;
  column: ColumnDefinition;
}

const DashboardColumn: React.FC<DashboardColumnProps> = ({ rowId, column }) => {
  const { isEditing } = useDashboard();

  // Calculate width based on percentage, accounting for the gap between columns
  const columnWidth = `calc(${column.widthPercentage}% - 0.5rem)`;

  return (
    <div 
      className={`dashboard-column ${isEditing ? 'edit-mode' : ''}`}
      style={{ 
        width: columnWidth,
        flexBasis: columnWidth
      }}
      data-column-id={column.id}
      data-width-percentage={column.widthPercentage}
    >
      <WidgetSlot 
        rowId={rowId} 
        columnId={column.id} 
        widgetId={column.widgetId} 
      />
    </div>
  );
};

export default DashboardColumn; 