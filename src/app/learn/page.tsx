export default function LearnPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-slate-50 to-slate-100/50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent mb-8">
          About Atmosphere
        </h1>

        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
            <p className="text-slate-600">
              Atmosphere is a comprehensive environmental health monitoring dashboard that provides real-time insights into air quality, UV exposure, and pollen levels across the globe. Built with modern web technologies and designed with a beautiful, intuitive interface, it helps users make informed decisions about their outdoor activities.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Technical Stack</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Frontend</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Next.js 14 with App Router for modern React architecture</li>
                  <li>• TypeScript for type-safe development</li>
                  <li>• Tailwind CSS for utility-first styling</li>
                  <li>• Google Maps JavaScript API for interactive mapping</li>
                  <li>• Recharts for data visualization</li>
                  <li>• Radix UI for accessible components</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Backend & APIs</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Google Air Quality API for real-time data</li>
                  <li>• OpenUV API for UV index data</li>
                  <li>• Tomorrow.io for pollen forecasts</li>
                  <li>• TensorFlow.js for ML model deployment</li>
                  <li>• Custom ML Pipeline for predictions</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Environmental Monitoring</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Real-time AQI measurements</li>
                  <li>• Detailed pollutant breakdowns</li>
                  <li>• Historical AQI data</li>
                  <li>• Region-specific standards (US EPA / UAQI)</li>
                </ul>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Predictive Analytics</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Custom ML model for AQI forecasting</li>
                  <li>• Deep neural network architecture</li>
                  <li>• Fire risk assessment</li>
                  <li>• Pollen forecasting</li>
                </ul>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Interactive Features</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Beautiful hybrid satellite/terrain view</li>
                  <li>• Global coverage with street-level data</li>
                  <li>• Integrated Street View exploration</li>
                  <li>• Air quality heatmap overlay</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Machine Learning Model</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <p className="text-slate-600 mb-4">
                Our predictions are generated using a custom-built spatiotemporal ML model for AQI forecasting. The model features:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• Deep neural network architecture with 7 input features</li>
                <li>• Trained on comprehensive EPA dataset (2000-2023)</li>
                <li>• Real-time predictions for O₃, CO, SO₂, NO₂ concentrations</li>
                <li>• Pollutant-specific AQI value calculations</li>
                <li>• Peak hours and maximum value forecasting</li>
                <li>• Overall air quality risk assessment</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Data generated using a custom deep learning regression model trained on the EPA pollution dataset. 
                Check out our <a href="https://github.com/blakerand/atmosphere-ml" className="text-blue-600 hover:text-blue-800">ML Repository</a> to 
                see how the model was built and the <a href="https://www.kaggle.com/datasets/guslovesmath/us-pollution-data-200-to-2022/data" className="text-blue-600 hover:text-blue-800">EPA Dataset</a> used 
                for training.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Sources</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <p className="text-slate-600 mb-4">
                Atmosphere aggregates data from multiple reliable sources to provide accurate environmental information:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• Google Air Quality API for real-time air quality data and heatmap tiles</li>
                <li>• OpenUV API for UV index data and safe exposure times</li>
                <li>• Tomorrow.io for pollen forecasts and additional weather metrics</li>
                <li>• EPA historical data for model training and validation</li>
                <li>• Custom ML predictions for long-term forecasting</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 