import Image from 'next/image';
import { AnimatedSection } from './components/AnimatedSection';
import { AQIChart } from './components/AQIChart';
import { TechStack } from './components/TechStack';

const sampleData = [
  { name: 'Jan', aqi: 50 },
  { name: 'Feb', aqi: 45 },
  { name: 'Mar', aqi: 60 },
  { name: 'Apr', aqi: 55 },
  { name: 'May', aqi: 70 },
  { name: 'Jun', aqi: 65 },
];

const techStack = [
  { name: 'Next.js', logo: '/logos/nextjs.svg' },
  { name: 'TypeScript', logo: '/logos/typescript.svg' },
  { name: 'TailwindCSS', logo: '/logos/tailwind.svg' },
  { name: 'TensorFlow', logo: '/logos/tensorflow.svg' },
  { name: 'Google Cloud', logo: '/logos/google-cloud.svg' },
  { name: 'Framer Motion', logo: '/logos/framer.svg' },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-slate-50 to-slate-100/50">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
            About Atmosphere
          </h1>
        </AnimatedSection>

        <div className="prose prose-slate max-w-none">
          <AnimatedSection delay={0.2} className="mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
                <p className="text-slate-600">
                  Atmosphere is a comprehensive environmental health monitoring dashboard that provides real-time insights into air quality, UV exposure, and pollen levels across the globe. Built with modern web technologies and designed with a beautiful, intuitive interface, it helps users make informed decisions about their outdoor activities.
                </p>
              </div>
              <AQIChart />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.4} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Technical Stack</h2>
            <TechStack />
          </AnimatedSection>

          <AnimatedSection delay={0.6} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Custom ML Model</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">TensorFlow Architecture</h3>
                <div className="relative h-48 mb-4 bg-slate-100 rounded-lg overflow-hidden">
                  <Image
                    src="/images/ml-architecture.svg"
                    alt="ML Architecture Diagram"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-slate-600">
                  Our custom TensorFlow model utilizes a deep neural network architecture specifically designed for environmental data processing. The model incorporates:
                </p>
                <ul className="space-y-2 text-slate-600 mt-4">
                  <li>• Multiple LSTM layers for temporal pattern recognition</li>
                  <li>• Spatial convolution layers for geographic feature extraction</li>
                  <li>• Attention mechanisms for focusing on critical data points</li>
                  <li>• Custom loss functions optimized for AQI prediction</li>
                </ul>
              </div>
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Model Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Training Accuracy</span>
                      <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-slate-800 font-medium">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Validation Accuracy</span>
                      <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-[89%] h-full bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-slate-800 font-medium">89%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Training Dataset</h3>
                  <p className="text-slate-600">
                    Trained on over 20 years of EPA data (2000-2023), including:
                  </p>
                  <ul className="space-y-2 text-slate-600 mt-4">
                    <li>• 50+ million air quality measurements</li>
                    <li>• Geographic data from 3,000+ monitoring stations</li>
                    <li>• Weather patterns and seasonal variations</li>
                    <li>• Pollution source mapping</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.8} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Pollen Forecasting</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Google Pollen API Integration</h3>
                  <p className="text-slate-600 mb-4">
                    We leverage Google's advanced pollen forecasting system to provide accurate predictions for:
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Tree pollen levels</li>
                    <li>• Grass pollen concentrations</li>
                    <li>• Weed pollen forecasts</li>
                    <li>• Regional allergen patterns</li>
                  </ul>
                </div>
                <div className="relative h-48 bg-slate-100 rounded-lg overflow-hidden">
                  <Image
                    src="/images/pollen-forecast.svg"
                    alt="Pollen Forecast Visualization"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={1} className="mb-12">
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
          </AnimatedSection>

          <AnimatedSection delay={1.2} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Sources</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <p className="text-slate-600 mb-4">
                Atmosphere aggregates data from multiple reliable sources to provide accurate environmental information:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>• Google Air Quality API for real-time air quality data and heatmap tiles</li>
                <li>• OpenUV API for UV index data and safe exposure times</li>
                <li>• Google Pollen API for pollen forecasts and additional weather metrics</li>
                <li>• EPA historical data for model training and validation</li>
                <li>• Custom ML predictions for long-term forecasting</li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
} 