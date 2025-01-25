"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  StreetViewPanorama,
  Autocomplete,
} from "@react-google-maps/api";
import {
  Search,
  MapPin,
  Wind,
  Calendar,
  ChevronRight,
  Droplets,
  Mountain,
  ChartLine,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { predict, PredictionResult } from "../lib/prediction";
import { format, addYears } from "date-fns";

// Move libraries outside component
const libraries: ("places" | "geocoding")[] = ["places", "geocoding"];

interface LocationData {
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
    };
    tree: {
      index: number;
      risk: string;
    };
    weed: {
      index: number;
      risk: string;
    };
  };
  elevation?: number;
  address?: string;
}

const containerStyle = {
  width: "100%",
  height: "100vh",
};

// Start with a centered view of the globe
const defaultLocation = {
  lat: 20,
  lng: 0,
};

type PollutantCode = "pm25" | "pm10" | "no2" | "so2" | "o3" | "co";

interface PollutantInfo {
  name: string;
  fullName: string;
  sources: string;
  effects: string;
}

const pollutantInfo: Record<PollutantCode, PollutantInfo> = {
  pm25: {
    name: "PM2.5",
    fullName: "Fine particulate matter (<2.5µm)",
    sources:
      "Main sources are combustion processes (e.g. power plants, indoor heating, car exhausts, wildfires), mechanical processes (e.g. construction, mineral dust) and biological particles (e.g. bacteria, viruses).",
    effects:
      "Fine particles can penetrate into the lungs and bloodstream. Short term exposure can cause irritation of the airways, coughing and aggravation of heart and lung diseases, expressed as difficulty breathing, heart attacks and even premature death.",
  },
  pm10: {
    name: "PM10",
    fullName: "Inhalable particulate matter (<10µm)",
    sources:
      "Main sources are combustion processes (e.g. indoor heating, wildfires), mechanical processes (e.g. construction, mineral dust, agriculture) and biological particles (e.g. pollen, bacteria, mold).",
    effects:
      "Inhalable particles can penetrate into the lungs. Short term exposure can cause irritation of the airways, coughing, and aggravation of heart and lung diseases, expressed as difficulty breathing, heart attacks and even premature death.",
  },
  no2: {
    name: "NO₂",
    fullName: "Nitrogen dioxide",
    sources:
      "Main sources are fuel burning processes, such as those used in industry and transportation.",
    effects:
      "Exposure may cause increased bronchial reactivity in patients with asthma, lung function decline in patients with Chronic Obstructive Pulmonary Disease (COPD), and increased risk of respiratory infections, especially in young children.",
  },
  so2: {
    name: "SO₂",
    fullName: "Sulfur dioxide",
    sources:
      "Main sources are burning processes of sulfur-containing fuel in industry, transportation and power plants.",
    effects:
      "Exposure causes irritation of the respiratory tract, coughing and generates local inflammatory reactions. These in turn, may cause aggravation of lung diseases, even with short term exposure.",
  },
  o3: {
    name: "O₃",
    fullName: "Ozone",
    sources:
      "Ozone is created in a chemical reaction between atmospheric oxygen, nitrogen oxides, carbon monoxide and organic compounds, in the presence of sunlight.",
    effects:
      "Ozone can irritate the airways and cause coughing, a burning sensation, wheezing and shortness of breath. Additionally, ozone is one of the major components of photochemical smog.",
  },
  co: {
    name: "CO",
    fullName: "Carbon monoxide",
    sources:
      "Typically originates from incomplete combustion of carbon fuels, such as that which occurs in car engines and power plants.",
    effects:
      "When inhaled, carbon monoxide can prevent the blood from carrying oxygen. Exposure may cause dizziness, nausea and headaches. Exposure to extreme concentrations can lead to loss of consciousness.",
  },
};

const getPollutantName = (code: string): string => {
  return pollutantInfo[code.toLowerCase() as PollutantCode]?.name || code;
};

const mapOptions = {
  disableDefaultUI: true,
  minZoom: 2,
  maxZoom: 20,
  zoom: 3,
  mapTypeId: "hybrid",
  tilt: 45,
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      west: -180,
      east: 180,
    },
    strictBounds: true,
  },
  styles: [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.country",
      elementType: "geometry.stroke",
      stylers: [{ visibility: "on" }, { color: "#ffffff50" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#1a365d" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#1e293b" }],
    },
  ],
};

// Optimize street view settings
const streetViewOptions = {
  disableDefaultUI: true,
  enableCloseButton: false,
  addressControl: false,
  showRoadLabels: false,
  motionTracking: false,
  motionTrackingControl: false,
  linksControl: true,
  panControl: true,
  zoomControl: true,
  fullscreenControl: false,
};

interface AqiIndex {
  code: string;
  aqi: number;
  category?: string;
  dominantPollutant?: string;
}

interface HistoryEntry {
  label: string;
  dateTime: string;
  indexes: AqiIndex[];
}

interface AirQualityPollutant {
  concentration: { value: number };
  code: string;
}

interface PredictionData {
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

const timeRanges = [5, 10, 15, 20]; // Years to predict

export default function MapPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [showStreetView, setShowStreetView] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [currentLocation, setCurrentLocation] = useState(defaultLocation);
  const [locationData, setLocationData] = useState<LocationData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(3);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [specificPrediction, setSpecificPrediction] =
    useState<PredictionData | null>(null);

  const fetchLocationData = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      // Geocoding API request
      const geocoder = new google.maps.Geocoder();
      const geocodeResult = await geocoder.geocode({ location: { lat, lng } });
      const address = geocodeResult.results[0]?.formatted_address;

      // Elevation API request
      const elevator = new google.maps.ElevationService();
      const elevationResult = await elevator.getElevationForLocations({
        locations: [{ lat, lng }],
      });
      const elevation = elevationResult.results[0]?.elevation;

      // Fetch air quality and pollen data from our API route
      const response = await fetch("/api/location-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng, hours: 120 }), // Fixed at 5 days of history
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const { airQualityData, historyData, pollenData } = await response.json();

      // Only process data if it's available and doesn't contain errors
      if (airQualityData && !airQualityData.error) {
        // Function to determine which AQI to use based on region
        const getPreferredAqiIndex = (
          indexes: AqiIndex[],
          regionCode: string
        ) => {
          if (regionCode === "us") {
            return (
              indexes?.find((idx) => idx.code === "usa_epa") || indexes?.[0]
            );
          }
          return indexes?.find((idx) => idx.code === "uaqi") || indexes?.[0];
        };

        // Get the appropriate AQI index based on region
        const preferredIndex = getPreferredAqiIndex(
          airQualityData.indexes,
          airQualityData.regionCode
        );

        // Process air quality data
        const pollutants: {
          [key: string]: {
            concentration: number;
            aqi: number;
            additionalInfo?: { sources: string; effects: string };
          };
        } = {};
        airQualityData?.pollutants?.forEach(
          (pollutant: AirQualityPollutant) => {
            pollutants[pollutant.code] = {
              concentration: pollutant.concentration?.value || 0,
              aqi: 0,
              additionalInfo:
                pollutantInfo[pollutant.code.toLowerCase() as PollutantCode],
            };
          }
        );

        // Process history data if available
        const processedHistory =
          historyData && !historyData.error
            ? historyData.map((entry: HistoryEntry) => ({
                ...entry,
                preferredIndex: getPreferredAqiIndex(
                  entry.indexes,
                  airQualityData.regionCode
                ),
              }))
            : [];

        setLocationData({
          airQuality: {
            aqi: preferredIndex?.aqi || 0,
            mainPollutant: preferredIndex?.dominantPollutant || "Unknown",
            level: getAqiLevel(preferredIndex?.aqi || 0),
            pollutants,
          },
          regionCode: airQualityData.regionCode,
          history: processedHistory,
          pollen:
            pollenData && !pollenData.error
              ? {
                  grass: {
                    index: pollenData.grassIndex,
                    risk: getRiskLevel(pollenData.grassIndex),
                  },
                  tree: {
                    index: pollenData.treeIndex,
                    risk: getRiskLevel(pollenData.treeIndex),
                  },
                  weed: {
                    index: pollenData.weedIndex,
                    risk: getRiskLevel(pollenData.weedIndex),
                  },
                }
              : undefined,
          elevation,
          address,
        });
      } else {
        // Clear the data if we got an error
        setLocationData({
          elevation,
          address,
        });
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      // Set some default data in case of error
      setLocationData({
        airQuality: {
          aqi: 50,
          mainPollutant: "PM2.5",
          level: "Moderate",
          pollutants: {
            "PM2.5": { concentration: 15, aqi: 50 },
            PM10: { concentration: 25, aqi: 40 },
            O3: { concentration: 45, aqi: 60 },
            NO2: { concentration: 30, aqi: 45 },
          },
        },
        pollen: {
          grass: { index: 2, risk: "Low" },
          tree: { index: 1, risk: "Low" },
          weed: { index: 3, risk: "Moderate" },
        },
        elevation: 0,
        address: "Location data unavailable",
      });
    }
    setIsLoading(false);
  }, []);

  const fetchPredictions = useCallback(
    async (lat: number, lng: number) => {
      setIsPredictionLoading(true);
      try {
        // Get long-term predictions
        const startDate = new Date();
        const predictions = await Promise.all(
          Array.from({ length: 20 }, async (_, i) => {
            const date = format(addYears(startDate, i + 1), "yyyy-MM-dd");
            return await predict(date, lng, lat);
          })
        );
        setPredictionData(predictions);

        // Get specific date prediction if set
        if (selectedDate) {
          const specific = await predict(selectedDate, lng, lat);
          setSpecificPrediction(specific);
        }
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      }
      setIsPredictionLoading(false);
    },
    [selectedDate]
  );

  const handlePlaceSelect = useCallback(() => {
    const place = searchBoxRef.current?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // Always zoom in to the selected location
      if (mapRef.current) {
        mapRef.current.setZoom(14); // Zoom to street level
        mapRef.current.panTo({ lat, lng });
      }

      setCurrentLocation({ lat, lng });
    }
  }, []);

  // Memoize the heatmap layer to prevent unnecessary re-renders
  const heatmapLayer = useMemo(() => {
    if (!showHeatmap || !isLoaded) return null;
    return new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        return `https://airquality.googleapis.com/v1/mapTypes/US_AQI/heatmapTiles/${zoom}/${coord.x}/${coord.y}?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 16,
      minZoom: 0,
      opacity: 0.6,
      name: "Air Quality",
    });
  }, [showHeatmap, isLoaded]);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      map.addListener("zoom_changed", () => {
        setMapZoom(map.getZoom()!);
      });

      // Add the heatmap layer
      if (heatmapLayer) {
        // Remove any existing heatmap layers first
        map.overlayMapTypes.clear();
        map.overlayMapTypes.push(heatmapLayer);
      }

      map.setTilt(45);
    },
    [heatmapLayer]
  );

  // Update heatmap when toggled
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      if (showHeatmap && heatmapLayer) {
        mapRef.current.overlayMapTypes.clear();
        mapRef.current.overlayMapTypes.push(heatmapLayer);
      } else {
        mapRef.current.overlayMapTypes.clear();
      }
    }
  }, [showHeatmap, heatmapLayer, isLoaded]);

  // Update useEffect to use fetchPredictions
  useEffect(() => {
    if (isLoaded && currentLocation && mapZoom >= 10) {
      const lastFetch = mapRef.current?.get("lastFetch");
      const currentTime = Date.now();
      const location = `${currentLocation.lat},${currentLocation.lng}`;

      if (
        !lastFetch ||
        lastFetch.location !== location ||
        currentTime - lastFetch.time > 300000
      ) {
        fetchLocationData(currentLocation.lat, currentLocation.lng);
        fetchPredictions(currentLocation.lat, currentLocation.lng);
        mapRef.current?.set("lastFetch", { location, time: currentTime });
      }
    }
  }, [isLoaded, currentLocation, fetchLocationData, fetchPredictions, mapZoom]);

  // Memoize street view component to prevent unnecessary re-renders
  const streetViewComponent = useMemo(() => {
    if (!showStreetView) return null;
    return (
      <StreetViewPanorama
        options={{
          ...streetViewOptions,
          position: currentLocation,
        }}
      />
    );
  }, [showStreetView, currentLocation]);

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-500"; // Good (0-50) - Green
    if (aqi <= 100) return "text-yellow-500"; // Moderate (51-100) - Yellow
    if (aqi <= 150) return "text-orange-500"; // Unhealthy for Sensitive Groups (101-150) - Orange
    if (aqi <= 200) return "text-red-500"; // Unhealthy (151-200) - Red
    if (aqi <= 300) return "text-purple-600"; // Very Unhealthy (201-300) - Purple
    return "text-rose-900"; // Hazardous (301+) - Maroon
  };

  const getAqiLevel = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const getRiskLevel = (index: number) => {
    if (index <= 1) return "Low";
    if (index <= 3) return "Moderate";
    if (index <= 5) return "High";
    return "Very High";
  };

  const PredictionChart = useMemo(() => {
    if (!predictionData.length) return null;

    const chartData = predictionData.map((data, index) => {
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

        {/* Specific date prediction */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-slate-900">
              Specific Date Prediction
            </h3>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={async (e) => {
                  setSelectedDate(e.target.value);
                  if (currentLocation) {
                    const specific = await predict(
                      e.target.value,
                      currentLocation.lng,
                      currentLocation.lat
                    );
                    setSpecificPrediction(specific);
                  }
                }}
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
      </div>
    );
  }, [predictionData, selectedDate, currentLocation, specificPrediction]);

  const AirQualityPanel = useMemo(
    () => (
      <div
        className={`absolute top-40 left-4 z-10 w-96 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-4 transition-opacity duration-300 ${
          mapZoom < 10 ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
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
                <Wind className="w-4 h-4" />
                <span>Current</span>
              </TabsTrigger>
              <TabsTrigger
                value="prediction"
                className="flex items-center gap-2"
              >
                <ChartLine className="w-4 h-4" />
                <span>Prediction</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-6 bg-slate-200/50 animate-pulse rounded"></div>

                  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 w-1/2">
                        <div className="h-5 bg-slate-200/50 animate-pulse rounded"></div>
                        <div className="h-4 bg-slate-200/50 animate-pulse rounded w-3/4"></div>
                      </div>
                      <div className="h-8 w-12 bg-slate-200/50 animate-pulse rounded"></div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200/50 space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center"
                        >
                          <div className="h-4 bg-slate-200/50 animate-pulse rounded w-20"></div>
                          <div className="h-4 bg-slate-200/50 animate-pulse rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md space-y-2">
                      <div className="h-4 bg-slate-200/50 animate-pulse rounded w-16"></div>
                      <div className="space-y-1.5">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex justify-between">
                            <div className="h-3 bg-slate-200/50 animate-pulse rounded w-12"></div>
                            <div className="h-3 bg-slate-200/50 animate-pulse rounded w-14"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md space-y-2">
                      <div className="h-4 bg-slate-200/50 animate-pulse rounded w-16"></div>
                      <div className="h-4 bg-slate-200/50 animate-pulse rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-3 mt-2">
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
                                  locationData.airQuality?.mainPollutant ||
                                    "Unknown"
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
                          {Object.entries(
                            locationData.airQuality?.pollutants || {}
                          ).map(([pollutant, data]) => (
                            <TooltipProvider key={pollutant}>
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-between hover:bg-slate-100/50 rounded px-2 py-1.5 transition-colors select-none">
                                    <div className="text-sm text-slate-700">
                                      {getPollutantName(pollutant)}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      {data.concentration.toFixed(1)}{" "}
                                      {data.concentration > 100
                                        ? "ppb"
                                        : "μg/m³"}
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
                                      pollutantInfo[
                                        pollutant.toLowerCase() as PollutantCode
                                      ]?.fullName
                                    }
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900 mb-1">
                                      Sources:
                                    </div>
                                    <div className="text-slate-600">
                                      {
                                        pollutantInfo[
                                          pollutant.toLowerCase() as PollutantCode
                                        ]?.sources
                                      }
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900 mb-1">
                                      Effects:
                                    </div>
                                    <div className="text-slate-600">
                                      {
                                        pollutantInfo[
                                          pollutant.toLowerCase() as PollutantCode
                                        ]?.effects
                                      }
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>

                      {locationData.history &&
                        locationData.history.length > 0 &&
                        locationData.history.some((entry) => {
                          // For US locations, require US EPA data
                          if (locationData.regionCode === "us") {
                            return entry.indexes?.some(
                              (idx: { code: string }) => idx.code === "usa_epa"
                            );
                          }
                          // For non-US locations, show if we have UAQI data
                          return entry.indexes?.some(
                            (idx: { code: string }) => idx.code === "uaqi"
                          );
                        }) && (
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
                                  // For US locations, only show entries with US EPA data
                                  if (locationData.regionCode === "us") {
                                    return entry.indexes?.some(
                                      (idx: { code: string }) =>
                                        idx.code === "usa_epa"
                                    );
                                  }
                                  // For non-US locations, show entries with UAQI data
                                  return entry.indexes?.some(
                                    (idx: { code: string }) =>
                                      idx.code === "uaqi"
                                  );
                                })
                                .map((entry) => {
                                  const aqi =
                                    locationData.regionCode === "us"
                                      ? entry.indexes?.find(
                                          (idx: { code: string }) =>
                                            idx.code === "usa_epa"
                                        )?.aqi || 0
                                      : entry.indexes?.find(
                                          (idx: { code: string }) =>
                                            idx.code === "uaqi"
                                        )?.aqi || 0;

                                  return (
                                    <div
                                      key={`${entry.label}-${entry.dateTime}`}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="text-slate-600">
                                        {entry.label}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span
                                          className={`font-medium ${getAqiColor(
                                            aqi
                                          )}`}
                                        >
                                          {aqi}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          AQI
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="text-blue-500" size={18} />
                            <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
                              Pollen
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Grass</span>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-700">
                                  {locationData.pollen?.grass.risk}
                                </span>
                                <span className="text-xs text-slate-400">
                                  ({locationData.pollen?.grass.index})
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Tree</span>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-700">
                                  {locationData.pollen?.tree.risk}
                                </span>
                                <span className="text-xs text-slate-400">
                                  ({locationData.pollen?.tree.index})
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Weed</span>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-700">
                                  {locationData.pollen?.weed.risk}
                                </span>
                                <span className="text-xs text-slate-400">
                                  ({locationData.pollen?.weed.index})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Mountain className="text-blue-500" size={18} />
                            <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
                              Elevation
                            </span>
                          </div>
                          <div className="text-sm text-slate-700">
                            {locationData.elevation
                              ? `${Math.round(locationData.elevation)}m`
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="prediction">
              {isPredictionLoading ? (
                <div className="space-y-3">
                  <div className="h-64 bg-slate-200/50 animate-pulse rounded"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
                    <div className="flex items-center gap-2 mb-3">
                      <ChartLine className="text-blue-500" size={18} />
                      <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">
                        5-Year AQI Prediction
                      </span>
                    </div>
                    {PredictionChart}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    ),
    [locationData, isLoading, mapZoom, isPredictionLoading, PredictionChart]
  );

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg font-medium text-slate-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Search Bar */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50">
          <div className="relative">
            {isLoaded && (
              <Autocomplete
                onLoad={(autocomplete) => {
                  searchBoxRef.current = autocomplete;
                }}
                onPlaceChanged={handlePlaceSelect}
                options={{
                  fields: ["formatted_address", "geometry", "name"],
                  strictBounds: false,
                  types: ["geocode", "establishment"],
                }}
              >
                <input
                  type="text"
                  placeholder="Search for any location..."
                  className="w-full px-4 py-3 pl-12 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </Autocomplete>
            )}
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={20}
            />
          </div>
        </div>
      </div>

      {AirQualityPanel}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation}
        zoom={3}
        onLoad={onMapLoad}
        options={mapOptions}
        onClick={(e) => {
          if (e.latLng && mapZoom >= 10) {
            setCurrentLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }
        }}
      >
        {streetViewComponent}
      </GoogleMap>

      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-md shadow-lg border border-slate-200/50 text-sm font-medium hover:bg-slate-50 transition-colors group"
        >
          <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent inline-flex items-center gap-1">
            {showHeatmap ? "Hide Air Quality" : "Show Air Quality"}
            <Wind className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
        {mapZoom >= 10 && (
          <button
            onClick={() => setShowStreetView(!showStreetView)}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-md shadow-lg border border-slate-200/50 text-sm font-medium hover:bg-slate-50 transition-colors group"
          >
            <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent inline-flex items-center gap-1">
              {showStreetView ? "Exit Street View" : "Enter Street View"}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
