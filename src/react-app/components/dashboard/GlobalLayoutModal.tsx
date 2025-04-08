import React from 'react';
import { useDashboard } from './DashboardContext';
import LayoutSelectionModal from './LayoutSelectionModal';

// Global layout modal that persists regardless of where the user's mouse is
const GlobalLayoutModal: React.FC = () => {
  const { 
    layoutModalState, 
    closeLayoutModal, 
    selectLayoutForRow 
  } = useDashboard();

  if (!layoutModalState.isOpen || !layoutModalState.rowId) {
    return null;
  }

  return (
    <LayoutSelectionModal
      onSelect={(layout) => {
        selectLayoutForRow(layoutModalState.rowId!, layout);
        closeLayoutModal();
      }}
      onCancel={closeLayoutModal}
    />
  );
};

export default GlobalLayoutModal; 