export interface WidgetType {
  id: string;
  name: string;
  category: string;
  component: string;
  defaultProps?: Record<string, any>;
}

export interface WidgetInstance {
  id: string;
  widgetTypeId: string;
  props?: Record<string, any>;
  showTitle?: boolean;
}

export interface ColumnDefinition {
  id: string;
  widthPercentage: number;
  widgetId?: string;
}

export interface RowLayout {
  id: string;
  columns: ColumnDefinition[];
}

export interface DashboardRow {
  id: string;
  layout: RowLayout;
  name?: string;
  index?: number;
  showTitle?: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  rows: DashboardRow[];
  isDefault?: boolean;
}

export interface LayoutModalState {
  isOpen: boolean;
  rowId: string | null;
}

export interface WidgetSelectorModalState {
  isOpen: boolean;
  rowId: string | null;
  columnId: string | null;
}

export interface DashboardContextType {
  dashboard: Dashboard | null;
  isEditing: boolean;
  setDashboard: (dashboard: Dashboard) => void;
  toggleEditMode: () => void;
  addRow: (afterRowId?: string) => void;
  removeRow: (rowId: string) => void;
  moveRow: (rowId: string, direction: 'up' | 'down') => void;
  updateRowLayout: (rowId: string, layout: RowLayout) => void;
  addWidget: (rowId: string, columnId: string, widgetTypeId: string) => void;
  removeWidget: (rowId: string, columnId: string) => void;
  duplicateRow: (rowId: string) => void;
  selectLayoutForRow: (rowId: string, layout: RowLayout) => void;
  saveCurrentLayout: () => void;
  discardChanges: () => void;
  layoutModalState: LayoutModalState;
  openLayoutModal: (rowId: string) => void;
  closeLayoutModal: () => void;
  widgetSelectorModalState: WidgetSelectorModalState;
  openWidgetSelectorModal: (rowId: string, columnId: string) => void;
  closeWidgetSelectorModal: () => void;
  updateWidgetProps: (widgetId: string, newProps: Record<string, any>) => void;
  getWidgetInstance: (widgetId: string) => WidgetInstance | null;
  renameRow: (rowId: string, newName: string) => void;
  toggleRowTitle: (rowId: string) => void;
  toggleWidgetTitle: (widgetId: string) => void;
} 