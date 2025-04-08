import React from 'react';
import { useDashboard } from './DashboardContext';
import DashboardRow from './DashboardRow';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Dashboard } from './types';

const DashboardGrid: React.FC = () => {
  const { dashboard, isEditing, addRow, setDashboard } = useDashboard();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !dashboard) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    // Reorder rows
    const newRows = Array.from(dashboard.rows);
    const [removed] = newRows.splice(sourceIndex, 1);
    newRows.splice(destinationIndex, 0, removed);

    // Update dashboard with reordered rows
    const newDashboard: Dashboard = {
      ...dashboard,
      rows: newRows
    };

    setDashboard(newDashboard);
  };

  if (!dashboard) {
    return (
      <div className="dashboard-empty-state">
        <p>No dashboard configured</p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {isEditing ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard-rows">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="dashboard-rows-container"
              >
                {dashboard.rows.map((row, index) => (
                  <Draggable key={row.id} draggableId={row.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`draggable-row ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <DashboardRow row={row} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <>
          {dashboard.rows.map((row) => (
            <DashboardRow key={row.id} row={row} />
          ))}
        </>
      )}
      
      {isEditing && (
        <button 
          className="add-row-button"
          onClick={() => addRow()}
          aria-label="Add new row"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4v16m-8-8h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add Row
        </button>
      )}
    </div>
  );
};

export default DashboardGrid; 