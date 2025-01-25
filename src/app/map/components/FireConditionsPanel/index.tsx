import { FC } from "react";
import { Flame, Wind, Droplets, ThermometerSun } from "lucide-react";
import type { FireConditionsData } from "../../types";

interface FireConditionsPanelProps {
  mapZoom: number;
  isLoading: boolean;
  fireData: {
    riskScore: number;
    explanation: string;
  };
}

export const FireConditionsPanel: FC<FireConditionsPanelProps> = ({
  mapZoom,
  isLoading,
  fireData,
}) => {
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

  // Gauge math
  const radius = 80;
  const circumference = radius * Math.PI; // half-circle circumference
  const strokeDashoffset =
    circumference - (fireData.riskScore / 100) * circumference;

  return (
    <div className="fixed top-36 right-4 z-20 w-72 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="text-red-500" size={20} />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
          Fire Risk Assessment
        </h3>
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
                  // Rotating so the arc appears at the top
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
  );
};
