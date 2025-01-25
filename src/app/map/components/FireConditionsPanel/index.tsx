import { FC, useState } from "react";
import {
  Flame,
  Wind,
  Droplets,
  ThermometerSun,
  PlayCircle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import type { FireConditionsData } from "../../types";
import { FireSpreadOverlay } from "../FireSpreadOverlay";

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
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(
    null
  );
  const [showOverlay, setShowOverlay] = useState(false);

  // Hide if zoomed out
  if (mapZoom < 10) return null;

  // Helpers for color and labels
  const getRiskColor = (score: number) => {
    if (score < 20) return "#22c55e"; // green
    if (score < 40) return "#84cc16"; // lime
    if (score < 60) return "#eab308"; // yellow
    if (score < 80) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getRiskLabel = (score: number) => {
    if (score < 20) return "Very Low";
    if (score < 40) return "Low";
    if (score < 60) return "Moderate";
    if (score < 80) return "High";
    return "Extreme";
  };

  const handleSimulation = async () => {
    setIsSimulating(true);
    try {
      console.log("Starting simulation with:", { lat, lng, address });

      const response = await fetch("/api/fire-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, address }),
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
  const strokeDashoffset =
    circumference - (fireData.riskScore / 100) * circumference;

  return (
    <>
      <div className="fixed top-36 right-4 z-20 w-72 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-red-500" size={20} />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
              Fire Risk Assessment
            </h3>
          </div>
          <div className="flex gap-2">
            {simulationData && (
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-white bg-slate-600 rounded-md hover:bg-slate-700 transition-colors"
              >
                {showOverlay ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
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
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gauge + Score */}
            <div className="relative flex flex-col items-center">
              {/* Container for the half-circle gauge (170 wide, 85 tall) */}
              <div className="relative w-[170px] h-[85px] overflow-hidden">
                <svg
                  width="170"
                  height="170" // full circle size, though we only show half
                  className="absolute top-0 left-0"
                >
                  {/* Background Circle (half) */}
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference / 2}
                    transform="rotate(180, 85, 85)"
                  />
                  {/* Colored Progress Arc */}
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke={getRiskColor(fireData.riskScore)}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(180, 85, 85)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>

                {/* Score + Label in the center of the half-circle */}
                <div className="absolute w-full h-full top-0 left-0 flex flex-col items-center justify-end pb-2">
                  <div className="text-3xl font-bold text-slate-800 leading-none">
                    {Math.round(fireData.riskScore)}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      fireData.riskScore >= 80
                        ? "text-red-600"
                        : fireData.riskScore >= 60
                        ? "text-orange-600"
                        : fireData.riskScore >= 40
                        ? "text-yellow-600"
                        : fireData.riskScore >= 20
                        ? "text-lime-600"
                        : "text-green-600"
                    }`}
                  >
                    {getRiskLabel(fireData.riskScore)}
                  </div>
                </div>
              </div>

              {/* Scale Labels */}
              <div className="w-full flex justify-between px-2 mt-2 text-xs text-slate-500">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-slate-50/80 backdrop-blur-sm rounded-md p-3">
              <p className="text-sm text-slate-600">{fireData.explanation}</p>
            </div>
          </div>
        )}
      </div>

      <FireSpreadOverlay
        map={map}
        center={{ lat, lng }}
        simulationData={simulationData}
      />
    </>
  );
};
