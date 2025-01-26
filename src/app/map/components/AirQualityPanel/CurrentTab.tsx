/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wind, Calendar, Droplets, Mountain, Sun } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LocationData } from "../../types";
import { getAqiColor, getPollutantName, getUvRiskLevel } from "../../utils";
import { pollutantInfo } from "../../constants";

interface CurrentTabProps {
  isLoading: boolean;
  locationData: LocationData;
  recommendations: {
    risk: string;
    generalAdvice: string;
    sensitiveGroups: string[];
    outdoorActivities: {
      avoid: string[];
      bestHours: string;
    };
  };
}

export const CurrentTab = ({
  isLoading,
  locationData,
  recommendations,
}: CurrentTabProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 mt-2">
        <AirQualitySection locationData={locationData} />
        <HistoricalSection locationData={locationData} />
        <ElevationSection elevation={locationData.elevation} />

        <div className="grid grid-cols-2 gap-2">
          <PollenSection pollen={locationData.pollen} />
          <UVSection uvData={locationData.uvData} />
        </div>

        <HealthRecommendationsSection recommendations={recommendations} />
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="space-y-3">
    <div className="h-6 bg-slate-200/50 animate-pulse rounded"></div>
    <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md space-y-3">
      {/* Loading state content */}
      <div className="flex items-center justify-between">
        <div className="space-y-2 w-1/2">
          <div className="h-5 bg-slate-200/50 animate-pulse rounded"></div>
          <div className="h-4 bg-slate-200/50 animate-pulse rounded w-3/4"></div>
        </div>
        <div className="h-8 w-12 bg-slate-200/50 animate-pulse rounded"></div>
      </div>
      <div className="pt-3 mt-3 border-t border-slate-200/50 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-slate-200/50 animate-pulse rounded w-20"></div>
            <div className="h-4 bg-slate-200/50 animate-pulse rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AirQualitySection = ({
  locationData,
}: {
  locationData: LocationData;
}) => (
  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Wind className="text-blue-500" size={20} />
          <span className="text-base font-medium text-slate-800">
            Air Quality
          </span>
        </div>
        <div className="text-sm text-slate-700">
          Main Pollutant:{" "}
          <span className="font-medium">
            {getPollutantName(
              locationData.airQuality?.mainPollutant || "Unknown"
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={`text-2xl font-bold ${getAqiColor(
            locationData.airQuality?.aqi || 0
          )}`}
        >
          {locationData.airQuality?.aqi || "N/A"}
        </span>
        <span className="text-sm text-slate-600">
          {locationData.airQuality?.level || "Unknown"}
        </span>
      </div>
    </div>
    <div className="space-y-2 pt-3 mt-3 border-t border-slate-200/50">
      {Object.entries(locationData.airQuality?.pollutants || {}).map(
        ([pollutant, data]) => (
          <PollutantRow key={pollutant} pollutant={pollutant} data={data} />
        )
      )}
    </div>
  </div>
);

const PollutantRow = ({
  pollutant,
  data,
}: {
  pollutant: string;
  data: any;
}) => (
  <TooltipProvider>
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-between hover:bg-slate-100/50 rounded px-2 py-1.5 transition-colors select-none">
          <div className="text-sm text-slate-700">
            {getPollutantName(pollutant)}
          </div>
          <div className="text-sm text-slate-600">
            {data.concentration.toFixed(1)}{" "}
            {data.concentration > 100 ? "ppb" : "μg/m³"}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="left"
        sideOffset={20}
        className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-3 text-xs space-y-2 w-80"
      >
        <div className="font-medium text-slate-900 mb-1">
          {
            pollutantInfo[pollutant.toLowerCase() as keyof typeof pollutantInfo]
              ?.fullName
          }
        </div>
        <div>
          <div className="font-medium text-slate-900 mb-1">Sources:</div>
          <div className="text-slate-600">
            {
              pollutantInfo[
                pollutant.toLowerCase() as keyof typeof pollutantInfo
              ]?.sources
            }
          </div>
        </div>
        <div>
          <div className="font-medium text-slate-900 mb-1">Effects:</div>
          <div className="text-slate-600">
            {
              pollutantInfo[
                pollutant.toLowerCase() as keyof typeof pollutantInfo
              ]?.effects
            }
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const HistoricalSection = ({
  locationData,
}: {
  locationData: LocationData;
}) => {
  if (!locationData.history?.length) return null;

  const hasValidData = locationData.history.some((entry) => {
    if (locationData.regionCode === "us") {
      return entry.indexes?.some((idx) => idx.code === "usa_epa");
    }
    return entry.indexes?.some((idx) => idx.code === "uaqi");
  });

  if (!hasValidData) return null;

  return (
    <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="text-blue-500" size={18} />
        <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
          Historical AQI
        </span>
      </div>
      <div className="space-y-2">
        {locationData.history
          .filter((entry) => {
            if (locationData.regionCode === "us") {
              return entry.indexes?.some((idx) => idx.code === "usa_epa");
            }
            return entry.indexes?.some((idx) => idx.code === "uaqi");
          })
          .map((entry) => {
            const aqi =
              locationData.regionCode === "us"
                ? entry.indexes?.find((idx) => idx.code === "usa_epa")?.aqi || 0
                : entry.indexes?.find((idx) => idx.code === "uaqi")?.aqi || 0;

            return (
              <div
                key={`${entry.label}-${entry.dateTime}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600">{entry.label}</span>
                <div className="flex items-center gap-1">
                  <span className={`font-medium ${getAqiColor(aqi)}`}>
                    {aqi}
                  </span>
                  <span className="text-xs text-slate-400">AQI</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const ElevationSection = ({ elevation }: { elevation?: number }) => (
  <div className="flex items-center gap-2 mb-3 text-sm p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <Mountain className="text-blue-500" size={16} />
    <span className="text-sm flex flex-row bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
      <p className="text-slate-700 font-md mr-2">Elevation</p>{" "}
      {elevation ? `${Math.round(elevation)}m` : "N/A"}
    </span>
  </div>
);

const PollenSection = ({ pollen }: { pollen?: LocationData["pollen"] }) => (
  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <div className="flex items-center gap-2 mb-2">
      <Droplets className="text-blue-500" size={18} />
      <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
        Pollen
      </span>
    </div>
    <div className="space-y-1">
      {["grass", "tree", "weed"].map((type) => (
        <div key={type} className="flex justify-between text-xs">
          <span className="text-slate-500">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-slate-700">
              {pollen?.[type as keyof typeof pollen]?.risk}
            </span>
            <span className="text-xs text-slate-400">
              ({pollen?.[type as keyof typeof pollen]?.index})
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UVSection = ({ uvData }: { uvData?: LocationData["uvData"] }) => (
  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <div className="flex items-center gap-2 mb-2">
      <Sun className="text-yellow-500" size={18} />
      <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
        UV Index
      </span>
    </div>
    {uvData ? (
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs">Current</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${getUvRiskLevel(uvData.uv).color}`}>
              {uvData.uv.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({getUvRiskLevel(uvData.uv).risk})
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs">Max Today</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${getUvRiskLevel(uvData.uvMax).color}`}>
              {uvData.uvMax.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs">Safe Exposure</span>
          <span className="text-xs text-slate-700">
            {uvData.safeExposureMinutes === -1
              ? "Unlimited"
              : `${Math.round(uvData.safeExposureMinutes)} min`}
          </span>
        </div>
      </div>
    ) : (
      <div className="text-xs text-slate-500">No UV data available</div>
    )}
  </div>
);

const HealthRecommendationsSection = ({
  recommendations,
}: {
  recommendations: CurrentTabProps["recommendations"];
}) => (
  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-medium bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
        Health Recommendations
      </h3>
      <div
        className={`px-2 py-1 rounded text-sm ${
          recommendations.risk === "High"
            ? "bg-red-100 text-red-700"
            : recommendations.risk === "Moderate"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {recommendations.risk} Risk
      </div>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-slate-700">
          {recommendations.generalAdvice}
        </div>

        {recommendations.sensitiveGroups.length > 0 && (
          <div>
            <div className="text-sm font-medium text-slate-800">
              Sensitive Groups:
            </div>
            <ul className="text-sm text-slate-600 list-disc list-inside">
              {recommendations.sensitiveGroups.map((group, i) => (
                <li key={i}>{group}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {recommendations.risk !== "Low" && (
        <div>
          <div className="text-sm font-medium text-slate-800 mb-2">
            Outdoor Activities
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-500">Recommended Hours</div>
              <div className="text-sm text-slate-700">
                {recommendations.outdoorActivities.bestHours}
              </div>
            </div>

            {recommendations.outdoorActivities.avoid.length > 0 && (
              <div>
                <div className="text-xs text-slate-500">
                  Activities to Avoid
                </div>
                <div className="text-sm text-slate-700">
                  {recommendations.outdoorActivities.avoid.join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
