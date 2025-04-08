import { useRef } from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { TourManager } from '../components/landing/TourManager';
import { TourSection } from '../components/landing/TourSection';
import { CallToAction } from '../components/landing/CallToAction';
import { useTourState } from '../components/landing/TourManager/useTourState';

export default function LandingPage() {
  const { startTour, isTourStarted } = useTourState();
  const tourSectionRef = useRef<HTMLDivElement>(null);

  // Handler for when the Discover button is clicked
  const handleDiscoverClick = () => {
    startTour();
    
    // After starting the tour, wait a bit for DOM updates then scroll to the first tour section
    setTimeout(() => {
      if (tourSectionRef.current) {
        tourSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <main className={`landing-container ${isTourStarted ? 'landing-container-tour-active' : ''}`}>
      {/* Hero section is always visible - full width */}
      <HeroSection onDiscoverClick={handleDiscoverClick} />
      
      {/* Only render these sections if the tour has started */}
      {isTourStarted && (
        <div ref={tourSectionRef} className="tour-content-wrapper">
          <TourManager>
            <TourSection />
          </TourManager>
          
          <CallToAction />
        </div>
      )}
    </main>
  );
} 