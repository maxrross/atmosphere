import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { PredictionData } from "../types";

interface PredictionChartProps {
  predictionData: PredictionData[];
  timeRanges: number[];
}

export const PredictionChart = ({
  predictionData,
  timeRanges,
}: PredictionChartProps) => {
  const chartData = useMemo(() => {
    if (!predictionData.length) return [];

    return predictionData.map((data, index) => {
      const year = new Date().getFullYear() + index + 1;
      return {
        year,
        aqi: Math.round(data.overallAQI),
        o3: Math.round(data.o3.aqi),
        co: Math.round(data.co.aqi),
        so2: Math.round(data.so2.aqi),
        no2: Math.round(data.no2.aqi),
      };
    });
  }, [predictionData]);

  if (!predictionData.length) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white/90 rounded-lg border border-slate-200/50 p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#64748b20" />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                fontSize={12}
                ticks={timeRanges.map(
                  (years) => new Date().getFullYear() + years
                )}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                label={{
                  value: "AQI",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#64748b" },
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="#0f172a"
                strokeWidth={2}
                name="Overall AQI"
                dot={{ fill: "#0f172a", r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="o3"
                stroke="#3b82f6"
                strokeWidth={1}
                name="O₃ AQI"
                dot={{ fill: "#3b82f6", r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="co"
                stroke="#ef4444"
                strokeWidth={1}
                name="CO AQI"
                dot={{ fill: "#ef4444", r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="so2"
                stroke="#eab308"
                strokeWidth={1}
                name="SO₂ AQI"
                dot={{ fill: "#eab308", r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="no2"
                stroke="#84cc16"
                strokeWidth={1}
                name="NO₂ AQI"
                dot={{ fill: "#84cc16", r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
