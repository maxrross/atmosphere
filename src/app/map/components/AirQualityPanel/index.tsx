import { MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationData, PredictionData } from "../../types";
import { CurrentTab } from "./CurrentTab";
import { PredictionTab } from "./PredictionTab";

interface AirQualityPanelProps {
  mapZoom: number;
  isLoading: boolean;
  isPredictionLoading: boolean;
  locationData: LocationData;
  predictionData: PredictionData[];
  timeRanges: number[];
  selectedDate: string;
  specificPrediction: PredictionData | null;
  recommendations: {
    risk: string;
    generalAdvice: string;
    sensitiveGroups: string[];
    outdoorActivities: {
      avoid: string[];
      bestHours: string;
    };
  };
  onDateChange: (date: string) => void;
}

export const AirQualityPanel = ({
  mapZoom,
  isLoading,
  isPredictionLoading,
  locationData,
  predictionData,
  timeRanges,
  selectedDate,
  specificPrediction,
  recommendations,
  onDateChange,
}: AirQualityPanelProps) => {
  return (
    <div
      className={`fixed top-36 left-4 z-20 w-96 max-h-[calc(100vh-10rem)] overflow-y-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-4 transition-opacity duration-300 ${
        mapZoom < 10 ? "opacity-0 pointer-events-none" : "opacity-100"
      } sm:w-[calc(100%-2rem)] sm:left-4 sm:right-4 md:w-96 md:left-4`}
    >
      <div className="">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
            Location Insights
          </h2>
          <MapPin className="text-slate-400" size={20} />
        </div>

        <div className="text-sm text-slate-600 pb-2 pt-1">
          {locationData.address}
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <span>Current</span>
            </TabsTrigger>
            <TabsTrigger value="prediction" className="flex items-center gap-2">
              <span>Prediction</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <CurrentTab
              isLoading={isLoading}
              locationData={locationData}
              recommendations={recommendations}
            />
          </TabsContent>

          <TabsContent value="prediction">
            <PredictionTab
              isPredictionLoading={isPredictionLoading}
              predictionData={predictionData}
              timeRanges={timeRanges}
              selectedDate={selectedDate}
              specificPrediction={specificPrediction}
              onDateChange={onDateChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
