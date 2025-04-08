export function CallToAction() {
  return (
    <section className="cta-section">
      <h2 className="text-2xl font-bold">Ready to Start Tracking?</h2>
      <p className="mt-2 mb-4">Track smarter, understand better.</p>
      
      {/* Trust indicators */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="flex items-center">
          <span role="img" aria-label="private" className="mr-2 text-xl">🔒</span>
          <span>Private</span>
        </div>
        <div className="flex items-center">
          <span role="img" aria-label="free" className="mr-2 text-xl">✨</span>
          <span>Free</span>
        </div>
      </div>
      
      <div className="mt-4">
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold mr-4 hover:bg-green-700 transition-colors">
          Start Tracking
        </button>
        <button className="px-6 py-3 bg-transparent text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
          Log In
        </button>
      </div>
    </section>
  );
} 