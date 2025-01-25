import { PollutantCode, PollutantInfo } from "./types";

export const libraries: ("places" | "geocoding")[] = ["places", "geocoding"];

export const containerStyle = {
  width: "100%",
  height: "100vh",
};

export const defaultLocation = {
  lat: 20,
  lng: 0,
};

export const pollutantInfo: Record<PollutantCode, PollutantInfo> = {
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

export const mapOptions = {
  disableDefaultUI: true,
  minZoom: 2,
  maxZoom: 20,
  zoom: 3,
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
};

export const streetViewOptions = {
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
