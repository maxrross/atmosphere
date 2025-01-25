import { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { Search } from "lucide-react";

interface SearchBarProps {
  isLoaded: boolean;
  onPlaceSelect: (lat: number, lng: number) => void;
}

export const SearchBar = ({ isLoaded, onPlaceSelect }: SearchBarProps) => {
  const searchBoxRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceSelect = () => {
    const place = searchBoxRef.current?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onPlaceSelect(lat, lng);
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
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
  );
};
