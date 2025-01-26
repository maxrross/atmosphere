/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useState, useEffect } from "react";
import {
  Flame,
  Wind,
  Droplets,
  ThermometerSun,
  PlayCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { FireConditionsData } from "../../types";
import { FireSpreadOverlay } from "../FireSpreadOverlay";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface FireConditionsPanelProps {
  mapZoom: number;
  isLoading: boolean;
  fireData: {
    riskScore: number;
    explanation: string;
  };
  lat: number;
  lng: number;
  address: string;
  map: google.maps.Map | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

interface SimulationTimeframe {
  hours: number;
  coordinates: Array<{ lat: number; lng: number }>;
  radius?: number;
  impact: string;
}

interface SimulationData {
  timeframes: SimulationTimeframe[];
  explanation: string;
}

export const FireConditionsPanel: FC<FireConditionsPanelProps> = ({
  mapZoom,
  isLoading,
  fireData,
  lat,
  lng,
  address,
  map,
  selectedDate,
  onDateChange,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(
    null
  );
  const [showOverlay, setShowOverlay] = useState(false);

  // Reset simulation when location changes
  useEffect(() => {
    setSimulationData(null);
    setShowOverlay(false);
    setIsSimulating(false);
  }, [lat, lng]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Add one day to compensate for timezone offset
      const adjustedDate = addDays(date, 1);
      onDateChange(format(adjustedDate, "yyyy-MM-dd"));
    }
  };

  // Hide if zoomed out
  if (mapZoom < 10) return null;

  // Helpers for color and labels
  const getRiskColor = (score: number) => {
    if (score < 10) return "#22c55e"; // green
    if (score < 40) return "#84cc16"; // lime
    if (score < 60) return "#eab308"; // yellow
    if (score < 80) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getRiskLabel = (score: number) => {
    if (score < 10) return "Very Low";
    if (score < 40) return "Low";
    if (score < 60) return "Moderate";
    if (score < 80) return "High";
    return "Extreme";
  };

  const handleSimulation = async () => {
    // Clear any existing simulation first
    setSimulationData(null);
    setShowOverlay(false);
    setIsSimulating(true);
    try {
      console.log("Starting simulation with:", {
        lat,
        lng,
        address,
        date: selectedDate,
      });

      const response = await fetch("/api/fire-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, address, date: selectedDate }),
      });
      const data = await response.json();
      console.log("Received simulation data:", data);

      if (!data.timeframes?.[0]?.coordinates) {
        console.error("Invalid simulation data format:", data);
        throw new Error("Invalid simulation data format");
      }

      setSimulationData(data);
      setShowOverlay(true);
    } catch (error) {
      console.error("Error running simulation:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  // Gauge math
  const radius = 80;
  const circumference = radius * Math.PI; // half-circle circumference
  const adjustedScore = Math.max(10, fireData.riskScore); // Ensure minimum of 10
  const progressOffset = circumference - (adjustedScore / 100) * circumference;

  return (
    <>
      <div className="fixed top-36 right-4 z-20 w-72 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-red-500" size={24} />
            <h3 className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
              Fire Risk
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulation}
              disabled={isSimulating}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {isSimulating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlayCircle size={16} />
              )}
              {isSimulating ? "Loading" : "Simulate"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {/* Gauge Skeleton */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-[170px] h-[85px] overflow-hidden">
                <svg width="170" height="170" className="absolute top-0 left-0">
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    transform="rotate(-180, 85, 85)"
                    className="animate-pulse"
                  />
                </svg>
                {/* Score + Label Skeleton */}
                <div className="absolute w-full h-full top-0 left-0 flex flex-col items-center justify-end pb-2">
                  <div className="h-8 w-12 bg-slate-200 rounded-md animate-pulse mb-1"></div>
                  <div className="h-4 w-16 bg-slate-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Date Picker Skeleton */}
            <div className="flex justify-center">
              <div className="h-9 w-40 bg-slate-200 rounded-md animate-pulse"></div>
            </div>

            {/* Explanation Skeleton */}
            <div className="bg-slate-50/80 backdrop-blur-sm rounded-md p-3">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gauge + Score */}
            <div className="relative flex flex-col items-center">
              {/* Container for the half-circle gauge (170 wide, 85 tall) */}
              <div className="relative w-[170px] h-[85px] overflow-hidden">
                <svg width="170" height="170" className="absolute top-0 left-0">
                  {/* Background Circle (half) */}
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    transform="rotate(-180, 85, 85)"
                  />
                  {/* Colored Progress Arc */}
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke={getRiskColor(adjustedScore)}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    transform="rotate(-180, 85, 85)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>

                {/* Score + Label in the center of the half-circle */}
                <div className="absolute w-full h-full top-0 left-0 flex flex-col items-center justify-end pb-2">
                  <div className="text-3xl font-bold text-slate-800 leading-none">
                    {Math.round(adjustedScore)}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      adjustedScore >= 80
                        ? "text-red-600"
                        : adjustedScore >= 60
                        ? "text-orange-600"
                        : adjustedScore >= 40
                        ? "text-yellow-600"
                        : adjustedScore >= 10
                        ? "text-lime-600"
                        : "text-green-600"
                    }`}
                  >
                    {getRiskLabel(adjustedScore)}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(new Date(selectedDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? new Date(selectedDate) : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Explanation */}
            <div className="bg-slate-50/80 backdrop-blur-sm rounded-md p-3">
              <p className="text-sm text-slate-600">{fireData.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {simulationData && showOverlay && (
        <FireSpreadOverlay
          map={map}
          center={{ lat, lng }}
          simulationData={simulationData}
        />
      )}
    </>
  );
};
