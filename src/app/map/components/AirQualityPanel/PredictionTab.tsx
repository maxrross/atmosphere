import { Calendar, ChartLine } from "lucide-react";
import { PredictionChart } from "../PredictionChart";
import { PredictionData } from "../../types";

interface PredictionTabProps {
  isPredictionLoading: boolean;
  predictionData: PredictionData[];
  timeRanges: number[];
  selectedDate: string;
  specificPrediction: PredictionData | null;
  onDateChange: (date: string) => void;
}

export const PredictionTab = ({
  isPredictionLoading,
  predictionData,
  timeRanges,
  selectedDate,
  specificPrediction,
  onDateChange,
}: PredictionTabProps) => {
  if (isPredictionLoading) {
    return (
      <div className="space-y-3">
        <div className="h-64 bg-slate-200/50 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-slate-900">
            Specific Date Prediction
          </h3>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-10 pr-4 py-1.5 border border-slate-200 rounded-lg bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Calendar
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={16}
            />
          </div>
        </div>

        <div className="bg-white/90 rounded-lg border border-slate-200/50 p-4">
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Overall AQI", key: "overallAQI" },
              { label: "O₃ AQI", key: "o3" },
              { label: "CO AQI", key: "co" },
              { label: "SO₂ AQI", key: "so2" },
              { label: "NO₂ AQI", key: "no2" },
            ].map(({ label, key }) => (
              <div key={label} className="text-center">
                <div className="text-xs text-slate-600 mb-1">{label}</div>
                <div className="text-lg font-semibold text-slate-900">
                  {specificPrediction
                    ? Math.round(
                        key === "overallAQI"
                          ? specificPrediction[key]
                          : specificPrediction[
                              key as keyof Omit<PredictionData, "overallAQI">
                            ].aqi
                      )
                    : "-"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
        <div className="flex items-center gap-2 mb-3">
          <ChartLine className="text-blue-500" size={18} />
          <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
            Long-term AQI Prediction
          </span>
        </div>
        <PredictionChart
          predictionData={predictionData}
          timeRanges={timeRanges}
        />
      </div>
    </div>
  );
};
