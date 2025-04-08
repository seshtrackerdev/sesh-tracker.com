import { create } from 'zustand';

interface TourState {
  activeSection: number;
  totalSections: number; // Set this based on your actual sections
  isTourStarted: boolean;
  startTour: () => void;
  nextSection: () => void;
  prevSection: () => void;
  setActiveSection: (index: number) => void; // Allow directly setting section
}

// Placeholder section count - update when sections are defined
const INITIAL_TOTAL_SECTIONS = 4; 

export const useTourState = create<TourState>((set) => ({
  activeSection: 0,
  totalSections: INITIAL_TOTAL_SECTIONS, // Initialize with placeholder
  isTourStarted: false,
  startTour: () => set({ isTourStarted: true, activeSection: 0 }), // Reset to first section on start
  nextSection: () => set((state) => ({
    activeSection: Math.min(state.activeSection + 1, state.totalSections - 1)
  })),
  prevSection: () => set((state) => ({
    activeSection: Math.max(state.activeSection - 1, 0)
  })),
  setActiveSection: (index) => set((state) => ({
    // Ensure index is within bounds
    activeSection: Math.max(0, Math.min(index, state.totalSections - 1))
  })),
  // You might add a function here later to update totalSections dynamically if needed
})); 