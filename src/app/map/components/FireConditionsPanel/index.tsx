import { Flame, Wind, Droplets, ThermometerSun } from "lucide-react";
import type { FireConditionsData } from "../../types";

interface FireConditionsPanelProps {
  mapZoom: number;
  isLoading: boolean;
  fireData: FireConditionsData;
}

export const FireConditionsPanel = ({
  mapZoom,
  isLoading,
  fireData,
}: FireConditionsPanelProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div
      className={`fixed top-36 right-4 z-20 w-96 max-h-[calc(100vh-10rem)] overflow-y-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-4 transition-opacity duration-300 ${
        mapZoom < 10 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
          Fire Conditions
        </h2>
        <Flame className="text-red-500" size={20} />
      </div>

      <div className="space-y-4 mt-4">
        <RiskLevelSection riskLevel={fireData.riskLevel} />
        <WeatherSection weatherData={fireData.weather} />
        <VegetationSection vegetation={fireData.vegetation} />
        <WarningsSection warnings={fireData.warnings} />
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="fixed top-36 right-4 z-20 w-96 max-h-[calc(100vh-10rem)] overflow-y-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="h-8 w-48 bg-slate-200/50 animate-pulse rounded"></div>
      <div className="h-6 w-6 bg-slate-200/50 animate-pulse rounded"></div>
    </div>
    <div className="space-y-4">
      {/* Risk Level Section */}
      <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-200/50 animate-pulse rounded"></div>
          <div className="h-6 w-20 bg-slate-200/50 animate-pulse rounded-full"></div>
        </div>
      </div>
      
      {/* Weather Section */}
      <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
        <div className="h-6 w-40 bg-slate-200/50 animate-pulse rounded mb-3"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-slate-200/50 animate-pulse rounded mb-1"></div>
              <div className="h-5 w-16 bg-slate-200/50 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Vegetation Section */}
      <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
        <div className="h-6 w-36 bg-slate-200/50 animate-pulse rounded mb-3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 bg-slate-200/50 animate-pulse rounded"></div>
              <div className="h-4 w-16 bg-slate-200/50 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Warnings Section */}
      <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
        <div className="h-6 w-32 bg-slate-200/50 animate-pulse rounded mb-3"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full mt-1.5 bg-slate-200/50 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-full bg-slate-200/50 animate-pulse rounded mb-1"></div>
                <div className="h-3 w-3/4 bg-slate-200/50 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RiskLevelSection = ({ riskLevel }: { riskLevel: string }) => (
  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="text-red-500" size={20} />
          <span className="text-base font-medium text-slate-800">
            Fire Risk Level
          </span>
        </div>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          riskLevel === "Extreme"
            ? "bg-red-100 text-red-700"
            : riskLevel === "High"
            ? "bg-orange-100 text-orange-700"
            : riskLevel === "Moderate"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {riskLevel}
      </div>
    </div>
  </div>
);

const WeatherSection = ({
  weatherData,
}: {
  weatherData: FireConditionsData["weather"];
}) => (
  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <div className="flex items-center gap-2 mb-3">
      <Wind className="text-blue-500" size={18} />
      <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
        Weather Conditions
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-xs text-slate-500">Wind Speed</div>
        <div className="text-sm text-slate-700">
          {weatherData.windSpeed} km/h
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500">Wind Direction</div>
        <div className="text-sm text-slate-700">
          {weatherData.windDirection}
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500">Temperature</div>
        <div className="text-sm text-slate-700">
          {weatherData.temperature}°C
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500">Humidity</div>
        <div className="text-sm text-slate-700">{weatherData.humidity}%</div>
      </div>
    </div>
  </div>
);

const VegetationSection = ({
  vegetation,
}: {
  vegetation: FireConditionsData["vegetation"];
}) => (
  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <div className="flex items-center gap-2 mb-3">
      <ThermometerSun className="text-green-500" size={18} />
      <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
        Vegetation Status
      </span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Moisture Content</span>
        <span className="text-slate-700">{vegetation.moistureContent}%</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Density</span>
        <span className="text-slate-700">{vegetation.density}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Type</span>
        <span className="text-slate-700">{vegetation.type}</span>
      </div>
    </div>
  </div>
);

const WarningsSection = ({
  warnings,
}: {
  warnings: FireConditionsData["warnings"];
}) => (
  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <div className="flex items-center gap-2 mb-3">
      <Droplets className="text-blue-500" size={18} />
      <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
        Active Warnings
      </span>
    </div>
    <div className="space-y-2">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className="text-sm text-slate-700 flex items-start gap-2"
        >
          <div
            className={`w-2 h-2 rounded-full mt-1.5 ${
              warning.severity === "High"
                ? "bg-red-500"
                : warning.severity === "Moderate"
                ? "bg-orange-500"
                : "bg-yellow-500"
            }`}
          />
          <div>
            <div className="font-medium">{warning.title}</div>
            <div className="text-slate-500 text-xs">{warning.description}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
