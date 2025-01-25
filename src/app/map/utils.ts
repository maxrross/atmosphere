import { pollutantInfo } from "./constants";
import { PollutantCode, HealthRecommendation, LocationData } from "./types";

export const getPollutantName = (code: string): string => {
  return pollutantInfo[code.toLowerCase() as PollutantCode]?.name || code;
};

export const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return "text-green-500"; // Good (0-50) - Green
  if (aqi <= 100) return "text-yellow-500"; // Moderate (51-100) - Yellow
  if (aqi <= 150) return "text-orange-500"; // Unhealthy for Sensitive Groups (101-150) - Orange
  if (aqi <= 200) return "text-red-500"; // Unhealthy (151-200) - Red
  if (aqi <= 300) return "text-purple-600"; // Very Unhealthy (201-300) - Purple
  return "text-rose-900"; // Hazardous (301+) - Maroon
};

export const getAqiLevel = (aqi: number) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export const getRiskLevel = (index: number) => {
  if (index <= 1) return "Low";
  if (index <= 3) return "Moderate";
  if (index <= 5) return "High";
  return "Very High";
};

export const getUvRiskLevel = (uv: number) => {
  if (uv <= 2) return { risk: "Low", color: "text-green-600" };
  if (uv <= 5) return { risk: "Moderate", color: "text-yellow-600" };
  if (uv <= 7) return { risk: "High", color: "text-orange-600" };
  if (uv <= 10) return { risk: "Very High", color: "text-red-600" };
  return { risk: "Extreme", color: "text-purple-600" };
};

const getGeneralHealthAdvice = (aqi: number, highPollen: boolean): string => {
  if (aqi > 150)
    return "Limit outdoor activities. Keep windows closed. Use air purifiers if available.";
  if (aqi > 100)
    return "Consider reducing extended outdoor activities during peak hours.";
  if (highPollen)
    return "Monitor pollen forecasts. Keep windows closed during high pollen times.";
  return "Air quality is good for most outdoor activities.";
};

export const getHealthRecommendations = (
  airQuality?: LocationData["airQuality"],
  pollen?: LocationData["pollen"]
): HealthRecommendation => {
  const aqi = airQuality?.aqi || 0;
  const pollenLevels = Object.values(pollen || {}).some(
    (p) => p.risk === "High" || p.risk === "Very High"
  );

  const sensitiveGroups: string[] = [];
  if (aqi > 100) sensitiveGroups.push("People with respiratory conditions");
  if (aqi > 150) sensitiveGroups.push("Children and elderly");
  if (pollenLevels) sensitiveGroups.push("Allergy sufferers");

  let risk = "Low";
  if (aqi > 150 || pollenLevels) risk = "High";
  else if (aqi > 100) risk = "Moderate";

  const outdoorActivities = {
    avoid: [] as string[],
    bestHours: "6 AM - 10 AM",
  };

  if (aqi > 150) {
    outdoorActivities.avoid.push("Intense exercise");
    outdoorActivities.bestHours = "Limited outdoor activity recommended";
  } else if (aqi > 100) {
    outdoorActivities.avoid.push("Extended outdoor exercise");
    outdoorActivities.bestHours = "6 AM - 9 AM";
  }

  if (pollenLevels) {
    outdoorActivities.bestHours = "After light rain or in the evening";
    outdoorActivities.avoid.push("Peak pollen hours (10 AM - 4 PM)");
  }

  return {
    risk,
    generalAdvice: getGeneralHealthAdvice(aqi, pollenLevels),
    sensitiveGroups,
    outdoorActivities,
  };
};

export const getSafeExposureMinutes = (uv: number): number => {
  if (uv <= 2) return 60; // Low - 60 minutes
  if (uv <= 5) return 30; // Moderate - 30 minutes
  if (uv <= 7) return 20; // High - 20 minutes
  if (uv <= 10) return 15; // Very High - 15 minutes
  return 10; // Extreme - 10 minutes or less
};
