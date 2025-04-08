import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dashboard, DashboardContextType, DashboardRow, RowLayout, WidgetInstance } from './types';
// Import directly from their source files to avoid circular dependencies
import WidgetRegistry from './widgets/WidgetRegistry';
import WidgetUtils from './widgets/WidgetUtils';

// Debug log to verify imports
console.log('DashboardContext imports loaded:', {
  WidgetRegistry: !!WidgetRegistry,
  WidgetUtils: !!WidgetUtils
});

// Create context with default values
const DashboardContext = createContext<DashboardContextType>({
  dashboard: null,
  isEditing: false,
  setDashboard: () => {},
  toggleEditMode: () => {},
  addRow: () => {},
  removeRow: () => {},
  moveRow: () => {},
  updateRowLayout: () => {},
  addWidget: () => {},
  removeWidget: () => {},
  duplicateRow: () => {},
  selectLayoutForRow: () => {},
  saveCurrentLayout: () => {},
  discardChanges: () => {},
  layoutModalState: {
    isOpen: false,
    rowId: null
  },
  openLayoutModal: () => {},
  closeLayoutModal: () => {},
  widgetSelectorModalState: {
    isOpen: false,
    rowId: null,
    columnId: null
  },
  openWidgetSelectorModal: () => {},
  closeWidgetSelectorModal: () => {},
  updateWidgetProps: () => {},
  getWidgetInstance: () => null,
  renameRow: () => {},
  toggleRowTitle: () => {},
  toggleWidgetTitle: () => {},
});

interface DashboardProviderProps {
  children: ReactNode;
  initialDashboard?: Dashboard;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ 
  children, 
  initialDashboard = null 
}) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(initialDashboard);
  const [isEditing, setIsEditing] = useState(false);
  const [originalDashboard, setOriginalDashboard] = useState<Dashboard | null>(initialDashboard);
  const [widgetInstances, setWidgetInstances] = useState<Record<string, WidgetInstance>>({});
  
  // Add layout modal state
  const [layoutModalState, setLayoutModalState] = useState<{
    isOpen: boolean;
    rowId: string | null;
  }>({
    isOpen: false,
    rowId: null
  });

  // Add widget selector modal state
  const [widgetSelectorModalState, setWidgetSelectorModalState] = useState<{
    isOpen: boolean;
    rowId: string | null;
    columnId: string | null;
  }>({
    isOpen: false,
    rowId: null,
    columnId: null
  });

  const openLayoutModal = useCallback((rowId: string) => {
    setLayoutModalState({
      isOpen: true,
      rowId
    });
  }, []);

  const closeLayoutModal = useCallback(() => {
    setLayoutModalState({
      isOpen: false,
      rowId: null
    });
  }, []);

  const openWidgetSelectorModal = useCallback((rowId: string, columnId: string) => {
    setWidgetSelectorModalState({
      isOpen: true,
      rowId,
      columnId
    });
  }, []);

  const closeWidgetSelectorModal = useCallback(() => {
    setWidgetSelectorModalState({
      isOpen: false,
      rowId: null,
      columnId: null
    });
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditing(prev => {
      if (!prev && dashboard) {
        setOriginalDashboard(JSON.parse(JSON.stringify(dashboard)));
      }
      return !prev;
    });
  }, [dashboard]);

  const addRow = useCallback((afterRowId?: string) => {
    if (!dashboard) return;

    const newIndex = dashboard.rows.length > 0 
      ? Math.max(...dashboard.rows.map(row => row.index || 0)) + 1 
      : 1;

    const newRow: DashboardRow = {
      id: uuidv4(),
      layout: {
        id: uuidv4(),
        columns: [
          { id: uuidv4(), widthPercentage: 100 }
        ]
      },
      index: newIndex
    };

    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      const newRows = [...prevDashboard.rows];
      
      if (afterRowId) {
        const afterIndex = newRows.findIndex(row => row.id === afterRowId);
        if (afterIndex !== -1) {
          newRows.splice(afterIndex + 1, 0, newRow);
        } else {
          newRows.push(newRow);
        }
      } else {
        newRows.push(newRow);
      }
      
      return {
        ...prevDashboard,
        rows: newRows
      };
    });
  }, [dashboard]);

  const removeRow = useCallback((rowId: string) => {
    if (!dashboard) return;

    // Clean up any widget instances when removing a row
    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      // First, find all widget instances in this row
      const rowToRemove = prevDashboard.rows.find(row => row.id === rowId);
      if (rowToRemove) {
        const widgetIdsToRemove: string[] = [];
        
        rowToRemove.layout.columns.forEach(column => {
          if (column.widgetId) {
            widgetIdsToRemove.push(column.widgetId);
          }
        });
        
        // Remove any widget instances
        if (widgetIdsToRemove.length > 0) {
          setWidgetInstances(prev => {
            const newInstances = { ...prev };
            widgetIdsToRemove.forEach(id => {
              delete newInstances[id];
            });
            return newInstances;
          });
        }
      }
      
      return {
        ...prevDashboard,
        rows: prevDashboard.rows.filter(row => row.id !== rowId)
      };
    });
  }, [dashboard]);

  const moveRow = useCallback((rowId: string, direction: 'up' | 'down') => {
    if (!dashboard) return;

    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      const newRows = [...prevDashboard.rows];
      const currentIndex = newRows.findIndex(row => row.id === rowId);
      
      if (currentIndex === -1) return prevDashboard;
      
      if (direction === 'up' && currentIndex > 0) {
        [newRows[currentIndex], newRows[currentIndex - 1]] = 
        [newRows[currentIndex - 1], newRows[currentIndex]];
      } else if (direction === 'down' && currentIndex < newRows.length - 1) {
        [newRows[currentIndex], newRows[currentIndex + 1]] = 
        [newRows[currentIndex + 1], newRows[currentIndex]];
      }
      
      return {
        ...prevDashboard,
        rows: newRows
      };
    });
  }, [dashboard]);

  const updateRowLayout = useCallback((rowId: string, layout: RowLayout) => {
    if (!dashboard) return;

    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      // Find existing widgets in the current row layout
      const currentRow = prevDashboard.rows.find(row => row.id === rowId);
      if (!currentRow) return prevDashboard;
      
      // Capture any existing widget IDs from the previous layout
      const existingWidgetMap = new Map<number, string | undefined>();
      currentRow.layout.columns.forEach((col, index) => {
        existingWidgetMap.set(index, col.widgetId);
      });
      
      // For any new columns in the layout, reuse widget IDs where possible
      const updatedColumns = layout.columns.map((col, index) => {
        // Try to preserve widget ID if the column existed before
        if (index < currentRow.layout.columns.length && existingWidgetMap.has(index)) {
          return {
            ...col,
            widgetId: existingWidgetMap.get(index)
          };
        }
        return col;
      });
      
      // Update the layout with the new columns that preserve widget IDs
      const updatedLayout = {
        ...layout,
        columns: updatedColumns
      };
      
      return {
        ...prevDashboard,
        rows: prevDashboard.rows.map(row => 
          row.id === rowId 
            ? { ...row, layout: updatedLayout } 
            : row
        )
      };
    });
  }, [dashboard]);

  const duplicateRow = useCallback((rowId: string) => {
    if (!dashboard) return;

    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      const rowToDuplicate = prevDashboard.rows.find(row => row.id === rowId);
      if (!rowToDuplicate) return prevDashboard;

      // Get the next index
      const newIndex = Math.max(...prevDashboard.rows.map(row => row.index || 0)) + 1;

      // Create new column IDs but duplicate any widgets
      const newColumns = rowToDuplicate.layout.columns.map(column => {
        const newColumnId = uuidv4();
        
        // If there's a widget, duplicate it
        if (column.widgetId && widgetInstances[column.widgetId]) {
          const originalWidget = widgetInstances[column.widgetId];
          const newWidgetId = uuidv4();
          
          // Clone the widget instance
          const clonedWidget = WidgetUtils.cloneWidgetInstance(originalWidget);
          clonedWidget.id = newWidgetId;
          
          // Add the new widget instance
          setWidgetInstances(prev => ({
            ...prev,
            [newWidgetId]: clonedWidget
          }));
          
          return {
            id: newColumnId,
            widthPercentage: column.widthPercentage,
            widgetId: newWidgetId
          };
        }
        
        return {
          id: newColumnId,
          widthPercentage: column.widthPercentage
        };
      });

      const newRow: DashboardRow = {
        id: uuidv4(),
        layout: {
          id: uuidv4(),
          columns: newColumns
        },
        name: rowToDuplicate.name ? `${rowToDuplicate.name} (Copy)` : undefined,
        index: newIndex
      };

      const newRows = [...prevDashboard.rows];
      const rowIndex = newRows.findIndex(row => row.id === rowId);
      newRows.splice(rowIndex + 1, 0, newRow);
      
      return {
        ...prevDashboard,
        rows: newRows
      };
    });
  }, [dashboard, widgetInstances]);

  const selectLayoutForRow = useCallback((rowId: string, layout: RowLayout) => {
    updateRowLayout(rowId, layout);
  }, [updateRowLayout]);

  const saveCurrentLayout = useCallback(() => {
    setIsEditing(false);
    setOriginalDashboard(dashboard ? JSON.parse(JSON.stringify(dashboard)) : null);
  }, [dashboard]);

  const discardChanges = useCallback(() => {
    if (originalDashboard) {
      setDashboard(originalDashboard);
    }
    setIsEditing(false);
  }, [originalDashboard]);

  const addWidget = useCallback((rowId: string, columnId: string, widgetTypeId: string) => {
    if (!dashboard) return;
    
    // Get the widget type from registry
    const widgetType = WidgetRegistry.getWidgetTypeById(widgetTypeId);
    if (!widgetType) return;
    
    // Create a new widget instance
    const newWidgetInstance = WidgetUtils.createWidgetInstance(widgetType);
    const widgetId = newWidgetInstance.id;
    
    // Add the widget instance to our state
    setWidgetInstances(prev => ({
      ...prev,
      [widgetId]: newWidgetInstance
    }));

    // Update the dashboard with the new widget ID
    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      return {
        ...prevDashboard,
        rows: prevDashboard.rows.map(row => {
          if (row.id !== rowId) return row;
          
          return {
            ...row,
            layout: {
              ...row.layout,
              columns: row.layout.columns.map(column => {
                if (column.id !== columnId) return column;
                
                return {
                  ...column,
                  widgetId
                };
              })
            }
          };
        })
      };
    });
  }, [dashboard]);

  const removeWidget = useCallback((rowId: string, columnId: string) => {
    if (!dashboard) return;

    // First find the widget ID to remove
    let widgetIdToRemove: string | undefined;
    
    dashboard.rows.forEach(row => {
      if (row.id === rowId) {
        row.layout.columns.forEach(column => {
          if (column.id === columnId && column.widgetId) {
            widgetIdToRemove = column.widgetId;
          }
        });
      }
    });

    // Remove the widget instance if found
    if (widgetIdToRemove) {
      setWidgetInstances(prev => {
        const newInstances = { ...prev };
        delete newInstances[widgetIdToRemove!];
        return newInstances;
      });
    }

    // Update the dashboard to remove the widget reference
    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      return {
        ...prevDashboard,
        rows: prevDashboard.rows.map(row => {
          if (row.id !== rowId) return row;
          
          return {
            ...row,
            layout: {
              ...row.layout,
              columns: row.layout.columns.map(column => {
                if (column.id !== columnId) return column;
                
                const { widgetId, ...rest } = column;
                return rest;
              })
            }
          };
        })
      };
    });
  }, [dashboard]);
  
  // Method to update a widget's props
  const updateWidgetProps = useCallback((widgetId: string, newProps: Record<string, any>) => {
    setWidgetInstances(prev => {
      const instance = prev[widgetId];
      if (!instance) return prev;
      
      return {
        ...prev,
        [widgetId]: WidgetUtils.updateWidgetProps(instance, newProps)
      };
    });
  }, []);
  
  // Method to get a widget instance by ID
  const getWidgetInstance = useCallback((widgetId: string): WidgetInstance | null => {
    return widgetInstances[widgetId] || null;
  }, [widgetInstances]);

  const renameRow = useCallback((rowId: string, newName: string) => {
    if (!dashboard) return;

    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      return {
        ...prevDashboard,
        rows: prevDashboard.rows.map(row => 
          row.id === rowId
            ? { ...row, name: newName }
            : row
        )
      };
    });
  }, [dashboard]);

  // Add the toggleRowTitle method
  const toggleRowTitle = useCallback((rowId: string) => {
    if (!dashboard) return;

    setDashboard(prevDashboard => {
      if (!prevDashboard) return null;
      
      return {
        ...prevDashboard,
        rows: prevDashboard.rows.map(row => 
          row.id === rowId
            ? { ...row, showTitle: !(row.showTitle ?? true) }
            : row
        )
      };
    });
  }, [dashboard]);

  // Add the toggleWidgetTitle method
  const toggleWidgetTitle = useCallback((widgetId: string) => {
    setWidgetInstances(prev => {
      const instance = prev[widgetId];
      if (!instance) return prev;
      
      return {
        ...prev,
        [widgetId]: {
          ...instance,
          showTitle: !(instance.showTitle ?? true)
        }
      };
    });
  }, []);

  const value = {
    dashboard,
    isEditing,
    setDashboard,
    toggleEditMode,
    addRow,
    removeRow,
    moveRow,
    updateRowLayout,
    addWidget,
    removeWidget,
    duplicateRow,
    selectLayoutForRow,
    saveCurrentLayout,
    discardChanges,
    layoutModalState,
    openLayoutModal,
    closeLayoutModal,
    widgetSelectorModalState,
    openWidgetSelectorModal,
    closeWidgetSelectorModal,
    updateWidgetProps,
    getWidgetInstance,
    renameRow,
    toggleRowTitle,
    toggleWidgetTitle,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);

export default DashboardContext; 