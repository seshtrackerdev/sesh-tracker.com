import { useTourState } from './TourManager/useTourState';

// Placeholder for section content - replace with actual data
const sections = [
  { title: "Track Effects", benefits: ["📊 Know what works, what doesn't"], visual: "Visual 1" },
  { title: "Personalized Dashboards", benefits: ["📊 Build your own view"], visual: "Visual 2" },
  { title: "Inventory Tracking", benefits: ["📊 Link usage to stock"], visual: "Visual 3" },
  { title: "Mood Correlation", benefits: ["📊 See patterns over time"], visual: "Visual 4" },
];

export function TourSection() {
  const { activeSection, isTourStarted, nextSection, prevSection } = useTourState();

  if (!isTourStarted) {
    return null; // Don't render until tour starts
  }

  const currentSection = sections[activeSection];

  return (
    <section 
      aria-live="polite" 
      aria-label={`Tour section ${activeSection + 1} of ${sections.length}: ${currentSection.title}`}
      className="tour-section"
    >
      <div role="region" aria-labelledby={`tour-heading-${activeSection}`} className="text-center max-w-lg">
        <h2 id={`tour-heading-${activeSection}`} className="text-3xl font-semibold mb-4">
          {currentSection.title}
        </h2>
        <ul className="list-disc list-inside mb-4">
          {currentSection.benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
        <div className="mb-8 h-48 bg-gray-300 flex items-center justify-center"> {/* Placeholder for visual */}
          {currentSection.visual}
        </div>
        <div className="flex justify-between w-full">
          <button 
            onClick={prevSection} 
            disabled={activeSection === 0}
            className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            onClick={nextSection} 
            disabled={activeSection === sections.length - 1}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* Add TourProgress indicator later */}
    </section>
  );
} 