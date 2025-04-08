import { useState, useEffect } from 'react';

const headlines = [
  "Track your Strains",
  "Understand your Usage",
  "Visualize your High",
  "Never Forget What Worked",
];

interface HeroSectionProps {
  onDiscoverClick: () => void;
}

export function HeroSection({ onDiscoverClick }: HeroSectionProps) {
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentHeadlineIndex((prevIndex) => (prevIndex + 1) % headlines.length);
    }, 3000); // Change headline every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="font-bold">
          <span key={currentHeadlineIndex} className="animate-fade-in">
            {headlines[currentHeadlineIndex]}
          </span>
        </h1>
        
        <p>
          SeshTracker helps you understand your cannabis consumption patterns to optimize your experience.
        </p>
        
        <button 
          onClick={onDiscoverClick}
          className="discover-button"
          aria-label="Discover SeshTracker and start the interactive tour"
        >
          Discover SeshTracker
        </button>
      </div>
      
      <div className="hero-scroll-indicator">
        <div className="hero-mouse">
          <div className="hero-mouse-wheel"></div>
        </div>
        <div className="hero-arrow-down"></div>
      </div>
    </section>
  );
} 