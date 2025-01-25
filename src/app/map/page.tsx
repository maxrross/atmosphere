"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { predict } from "../lib/prediction";
import { format, addYears } from "date-fns";
import { SearchBar } from "./components/SearchBar";
import { MapControls } from "./components/MapControls";
import { AirQualityPanel } from "./components/AirQualityPanel";
import { FireConditionsPanel } from "./components/FireConditionsPanel";
import {
  libraries,
  containerStyle,
  defaultLocation,
  mapOptions,
  streetViewOptions,
} from "./constants";
import { getHealthRecommendations } from "./utils";
import type { LocationData, PredictionData, FireConditionsData } from "./types";

export default function MapPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [showStreetView, setShowStreetView] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState(defaultLocation);
  const [locationData, setLocationData] = useState<LocationData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(3);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [streetViewPanorama, setStreetViewPanorama] =
    useState<google.maps.StreetViewPanorama | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [specificPrediction, setSpecificPrediction] =
    useState<PredictionData | null>(null);
  const [fireData, setFireData] = useState<FireConditionsData>({
    riskScore: 0,
    explanation: "No fire risk data available",
  });
  const [isFireDataLoading, setIsFireDataLoading] = useState(false);

  const timeRanges = [5, 10, 15, 20]; // Years to predict

  const fetchFireData = useCallback(
    async (lat: number, lng: number, address: string) => {
      setIsFireDataLoading(true);
      try {
        const response = await fetch("/api/fire-risk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat,
            lng,
            address,
            date: new Date().toISOString().split("T")[0],
          }),
        });

        if (!response.ok) {
          throw new Error(`Fire risk API error: ${response.status}`);
        }

        const data = await response.json();
        setFireData(data);
      } catch (error) {
        console.error("Error fetching fire data:", error);
        setFireData({
          riskScore: 0,
          explanation: "Unable to assess fire risk at this time",
        });
      }
      setIsFireDataLoading(false);
    },
    []
  );

  const fetchLocationData = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true);
      try {
        // Geocoding API request
        const geocoder = new google.maps.Geocoder();
        const geocodeResult = await geocoder.geocode({
          location: { lat, lng },
        });
        const address = geocodeResult.results[0]?.formatted_address;

        // Elevation API request
        const elevator = new google.maps.ElevationService();
        const elevationResult = await elevator.getElevationForLocations({
          locations: [{ lat, lng }],
        });
        const elevation = elevationResult.results[0]?.elevation;

        // Fetch air quality, pollen, and UV data from our API routes
        const [locationResponse, uvResponse] = await Promise.all([
          fetch("/api/location-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ lat, lng, hours: 120 }), // Fixed at 5 days of history
          }),
          fetch("/api/uv-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ lat, lng, alt: elevation || 0 }),
          }),
        ]);

        if (!locationResponse.ok) {
          throw new Error(`Location API error: ${locationResponse.status}`);
        }

        const { airQualityData, historyData, pollenData } =
          await locationResponse.json();
        const uvData = uvResponse.ok ? await uvResponse.json() : null;

        // Process data if available
        if (airQualityData && !airQualityData.error) {
          const getPreferredAqiIndex = (indexes: any[], regionCode: string) => {
            if (regionCode === "us") {
              return (
                indexes?.find((idx) => idx.code === "usa_epa") || indexes?.[0]
              );
            }
            return indexes?.find((idx) => idx.code === "uaqi") || indexes?.[0];
          };

          const preferredIndex = getPreferredAqiIndex(
            airQualityData.indexes,
            airQualityData.regionCode
          );

          const pollutants: {
            [key: string]: { concentration: number; aqi: number };
          } = {};
          airQualityData?.pollutants?.forEach((pollutant: any) => {
            pollutants[pollutant.code] = {
              concentration: pollutant.concentration.value,
              aqi: pollutant.aqi || 0,
            };
          });

          const processedHistory =
            historyData && !historyData.error
              ? historyData.map((entry: any) => ({
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
              level: "Unknown",
              pollutants,
            },
            regionCode: airQualityData.regionCode,
            history: processedHistory,
            pollen:
              pollenData && !pollenData.error
                ? {
                    grass: {
                      index: pollenData.grassIndex,
                      risk: "Unknown",
                    },
                    tree: {
                      index: pollenData.treeIndex,
                      risk: "Unknown",
                    },
                    weed: {
                      index: pollenData.weedIndex,
                      risk: "Unknown",
                    },
                  }
                : undefined,
            uvData: uvData?.result
              ? {
                  uv: uvData.result.uv,
                  uvMax: uvData.result.uv_max,
                  uvMaxTime: uvData.result.uv_max_time,
                  safeExposureMinutes:
                    uvData.result.safe_exposure_time?.st1 || 0,
                }
              : undefined,
            elevation,
            address,
          });
        } else {
          setLocationData({
            elevation,
            address,
          });
        }

        if (address) {
          // After getting the address, fetch fire data
          fetchFireData(lat, lng, address);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        setLocationData({
          elevation: 0,
          address: "Location data unavailable",
        });
      }
      setIsLoading(false);
    },
    [fetchFireData]
  );

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

  const handlePlaceSelect = useCallback(
    (lat: number, lng: number) => {
      if (mapRef.current) {
        mapRef.current.setZoom(17);
        mapRef.current.panTo({ lat, lng });

        mapRef.current.setMapTypeId("hybrid");
      }
      setCurrentLocation({ lat, lng });
      fetchLocationData(lat, lng);
      fetchPredictions(lat, lng);
    },
    [fetchLocationData, fetchPredictions]
  );

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

      if (heatmapLayer) {
        map.overlayMapTypes.clear();
        map.overlayMapTypes.push(heatmapLayer);
      }

      map.setTilt(45);
    },
    [heatmapLayer]
  );

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
        if (locationData.address) {
          fetchFireData(
            currentLocation.lat,
            currentLocation.lng,
            locationData.address
          );
        }
        mapRef.current?.set("lastFetch", { location, time: currentTime });
      }
    }
  }, [
    isLoaded,
    currentLocation,
    fetchLocationData,
    fetchPredictions,
    fetchFireData,
    mapZoom,
    locationData.address,
  ]);

  useEffect(() => {
    if (mapRef.current && isLoaded) {
      if (showStreetView) {
        const panorama = new google.maps.StreetViewPanorama(
          mapRef.current.getDiv(),
          {
            ...streetViewOptions,
            position: currentLocation,
            visible: true,
          }
        );
        mapRef.current.setStreetView(panorama);
        setStreetViewPanorama(panorama);
      } else if (streetViewPanorama) {
        streetViewPanorama.setVisible(false);
        mapRef.current.setStreetView(null);
        setStreetViewPanorama(null);
      }
    }
  }, [showStreetView, currentLocation, isLoaded, streetViewPanorama]);

  const recommendations = getHealthRecommendations(
    locationData.airQuality,
    locationData.pollen
  );

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      minZoom: 2,
      maxZoom: 20,
      mapTypeId: "hybrid",
      tilt: 45,
      streetView: null as google.maps.StreetViewPanorama | null,
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
    }),
    []
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
      <SearchBar isLoaded={isLoaded} onPlaceSelect={handlePlaceSelect} />

      <AirQualityPanel
        mapZoom={mapZoom}
        isLoading={isLoading}
        isPredictionLoading={isPredictionLoading}
        locationData={locationData}
        predictionData={predictionData}
        timeRanges={timeRanges}
        selectedDate={selectedDate}
        specificPrediction={specificPrediction}
        recommendations={recommendations}
        onDateChange={(date: string) => {
          setSelectedDate(date);
          if (currentLocation) {
            predict(date, currentLocation.lng, currentLocation.lat).then(
              (specific) => setSpecificPrediction(specific)
            );
          }
        }}
      />

      <FireConditionsPanel
        mapZoom={mapZoom}
        isLoading={isFireDataLoading}
        fireData={fireData}
        lat={currentLocation.lat}
        lng={currentLocation.lng}
        address={locationData.address || ""}
        map={mapRef.current}
      />

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation}
        zoom={3}
        onLoad={onMapLoad}
        options={mapOptions}
        onClick={(e) => {
          if (e.latLng && mapZoom >= 10) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            setCurrentLocation({ lat: newLat, lng: newLng });
            fetchLocationData(newLat, newLng);
            fetchPredictions(newLat, newLng);
          }
        }}
      />

      <MapControls
        showHeatmap={showHeatmap}
        showStreetView={showStreetView}
        mapZoom={mapZoom}
        onHeatmapToggle={() => setShowHeatmap(!showHeatmap)}
        onStreetViewToggle={() => setShowStreetView(!showStreetView)}
      />
    </div>
  );
}
