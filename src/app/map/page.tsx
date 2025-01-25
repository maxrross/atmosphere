"use client"

import { useState, useRef, useEffect } from "react"
import { GoogleMap, LoadScript, StreetViewPanorama } from "@react-google-maps/api"
import { Search, MapPin, Wind, Calendar, ChevronRight } from "lucide-react"

const containerStyle = {
  width: "100%",
  height: "100vh",
}

const center = {
  lat: 40.7128,
  lng: -74.0060, // New York by default
}

export default function MapPage() {
  const [showStreetView, setShowStreetView] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [airQuality, setAirQuality] = useState<any>(null)
  const [predictions, setPredictions] = useState<any>(null)
  const mapRef = useRef(null)

  return (
    <div className="relative h-screen">
      {/* Search Bar */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by address, coordinates, or zip code..."
              className="w-full px-4 py-3 pl-12 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          </div>
        </div>
      </div>

      {/* Air Quality Panel */}
      <div className="absolute top-40 left-4 z-10 w-80 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
              Air Quality Insights
            </h2>
            <MapPin className="text-slate-400" size={20} />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
              <div className="flex items-center gap-2">
                <Wind className="text-blue-500" size={18} />
                <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">Current AQI</span>
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">45</span>
            </div>

            <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-blue-500" size={18} />
                <span className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">AI Prediction</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Based on current trends and historical data, air quality is expected to improve over the next 24 hours due to incoming weather patterns.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/50 pt-4">
            <h3 className="text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">Pollutant Levels</h3>
            <div className="grid grid-cols-2 gap-2">
              {["PM2.5", "PM10", "O3", "NO2"].map((pollutant) => (
                <div key={pollutant} className="p-2 bg-slate-50/80 backdrop-blur-sm rounded-md">
                  <div className="text-xs text-slate-500">{pollutant}</div>
                  <div className="text-sm font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent">Good</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          ref={mapRef}
          options={{
            styles: [
              {
                featureType: "all",
                elementType: "all",
                stylers: [{ saturation: -50 }]
              }
            ]
          }}
        >
          {showStreetView && (
            <StreetViewPanorama
              position={center}
              visible={true}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Street View Toggle */}
      <button
        onClick={() => setShowStreetView(!showStreetView)}
        className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-md shadow-lg border border-slate-200/50 text-sm font-medium hover:bg-slate-50 transition-colors group"
      >
        <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent inline-flex items-center gap-1">
          {showStreetView ? "Exit Street View" : "Enter Street View"}
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </button>
    </div>
  )
}

