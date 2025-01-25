export interface LocationData {
  airQuality?: {
    aqi: number;
    mainPollutant: string;
    level: string;
    pollutants: {
      [key: string]: {
        concentration: number;
        aqi: number;
        additionalInfo?: {
          sources: string;
          effects: string;
        };
      };
    };
  };
  regionCode?: string;
  history?: Array<{
    label: string;
    dateTime: string;
    indexes: Array<{
      code: string;
      aqi: number;
      category: string;
    }>;
    preferredIndex?: {
      aqi: number;
      category: string;
      dominantPollutant: string;
    };
  }>;
  pollen?: {
    grass: {
      index: number;
      risk: string;
      inSeason: boolean;
      recommendations: string[];
    };
    tree: {
      index: number;
      risk: string;
      inSeason: boolean;
      recommendations: string[];
    };
    weed: {
      index: number;
      risk: string;
      inSeason: boolean;
      recommendations: string[];
    };
  };
  uvData?: {
    uv: number;
    uvMax: number;
    uvMaxTime: string;
    safeExposureMinutes: number;
  };
  elevation?: number;
  address?: string;
}

export type PollutantCode = "pm25" | "pm10" | "no2" | "so2" | "o3" | "co";

export interface PollutantInfo {
  name: string;
  fullName: string;
  sources: string;
  effects: string;
}

export interface AqiIndex {
  code: string;
  aqi: number;
  category?: string;
  dominantPollutant?: string;
}

export interface HistoryEntry {
  label: string;
  dateTime: string;
  indexes: AqiIndex[];
}

export interface AirQualityPollutant {
  concentration: { value: number };
  code: string;
  aqi?: number;
}

export interface PredictionData {
  o3: {
    mean: number;
    maxValue: number;
    maxHour: number;
    aqi: number;
  };
  co: {
    mean: number;
    maxValue: number;
    maxHour: number;
    aqi: number;
  };
  so2: {
    mean: number;
    maxValue: number;
    maxHour: number;
    aqi: number;
  };
  no2: {
    mean: number;
    maxValue: number;
    maxHour: number;
    aqi: number;
  };
  overallAQI: number;
}

export interface HealthRecommendation {
  risk: string;
  generalAdvice: string;
  sensitiveGroups: string[];
  outdoorActivities: {
    avoid: string[];
    bestHours: string;
  };
}

export interface FireConditionsData {
  riskLevel: "Low" | "Moderate" | "High" | "Extreme";
  weather: {
    windSpeed: number;
    windDirection: string;
    temperature: number;
    humidity: number;
  };
  vegetation: {
    moistureContent: number;
    density: "Low" | "Medium" | "High";
    type: string;
  };
  warnings: Array<{
    title: string;
    description: string;
    severity: "Low" | "Moderate" | "High";
  }>;
}
