import { Calendar as CalendarIcon } from "lucide-react";
import { ChartLine } from "lucide-react";
import { PredictionChart } from "../PredictionChart";
import { PredictionData } from "../../types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { getAqiColor } from "../../utils";

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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Add one day to compensate for timezone offset
      const adjustedDate = addDays(date, 1);
      onDateChange(format(adjustedDate, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-900">
          AQI Prediction
        </h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(new Date(selectedDate), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
        <div className="flex items-center gap-2 mb-3">
          <ChartLine className="text-blue-500" size={18} />
          <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
            Long-term AQI Prediction
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Predictions generated using a custom deep learning regression model trained on EPA pollution data (2000-2023).
          Model features 7 input parameters and predicts pollutant concentrations and AQI values.
        </p>
        <PredictionChart
          predictionData={predictionData}
          timeRanges={timeRanges}
        />
      </div>

      <div className="bg-white/90 rounded-lg border border-slate-200/50 p-4">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Overall AQI", key: "overallAQI" },
            { label: "O₃ AQI", key: "o3" },
            { label: "CO AQI", key: "co" },
            { label: "SO₂ AQI", key: "so2" },
            { label: "NO₂ AQI", key: "no2" },
          ].map(({ label, key }) => {
            const value = specificPrediction
              ? Math.round(
                  key === "overallAQI"
                    ? specificPrediction[key]
                    : specificPrediction[
                        key as keyof Omit<PredictionData, "overallAQI">
                      ].aqi
                )
              : 0;
            return (
              <div key={label} className="flex flex-col space-y-2">
                <div className="text-xs text-slate-600 h-8 flex items-center justify-center text-center">
                  {label}
                </div>
                <div className={cn(
                  "text-lg font-semibold h-8 flex items-center justify-center text-center",
                  getAqiColor(value)
                )}>
                  {specificPrediction ? value : "-"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
