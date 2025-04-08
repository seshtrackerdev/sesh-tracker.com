import React, { useEffect } from 'react';
import { useTourState } from './useTourState';

interface TourManagerProps {
  children: React.ReactNode;
}

// This component will wrap the TourSection and potentially handle
// global key listeners or scroll management for the tour.
export function TourManager({ children }: TourManagerProps) {
  const { isTourStarted, /* startTour, */ nextSection, prevSection } = useTourState();

  // Add keyboard listeners for arrows if tour is active
  useEffect(() => {
    if (!isTourStarted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault(); // Prevent default scroll behavior
        nextSection();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault(); // Prevent default scroll behavior
        prevSection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Cleanup listener on component unmount or when tour stops
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourStarted, nextSection, prevSection]);

  // For now, it just renders children. We'll enhance it later.
  // The startTour function needs to be triggered, e.g., by the HeroSection button.

  return <>{children}</>;
} 