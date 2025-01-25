import { Wind, ChevronRight } from "lucide-react";

interface MapControlsProps {
  showHeatmap: boolean;
  showStreetView: boolean;
  mapZoom: number;
  onHeatmapToggle: () => void;
  onStreetViewToggle: () => void;
}

export const MapControls = ({
  showHeatmap,
  showStreetView,
  mapZoom,
  onHeatmapToggle,
  onStreetViewToggle,
}: MapControlsProps) => {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex gap-2">
      <button
        onClick={onHeatmapToggle}
        className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-md shadow-lg border border-slate-200/50 text-sm font-medium hover:bg-slate-50 transition-colors group"
      >
        <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent inline-flex items-center gap-1">
          {showHeatmap ? "Hide Air Quality" : "Show Air Quality"}
          <Wind className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </button>
      {mapZoom >= 10 && (
        <button
          onClick={onStreetViewToggle}
          className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-md shadow-lg border border-slate-200/50 text-sm font-medium hover:bg-slate-50 transition-colors group"
        >
          <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent inline-flex items-center gap-1">
            {showStreetView ? "Exit Street View" : "Enter Street View"}
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      )}
    </div>
  );
};
