/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { PlayCircle, PauseCircle, SkipBack, SkipForward } from "lucide-react";

interface Coordinate {
  lat: number;
  lng: number;
}

interface FireSpreadOverlayProps {
  map: google.maps.Map | null;
  center: { lat: number; lng: number };
  simulationData: {
    timeframes: Array<{
      hours: number;
      coordinates: Coordinate[];
      impact: string;
    }>;
  } | null;
}

const createFireOverlay = (google: typeof globalThis.google) => {
  return class FireOverlay extends google.maps.OverlayView {
    private div: HTMLDivElement | null = null;
    private currentPolygon: google.maps.Polygon | null = null;
    private isVisible: boolean = true;

    constructor() {
      super();
    }

    onAdd() {
      this.div = document.createElement("div");
      this.div.style.position = "absolute";

      const panes = this.getPanes();
      if (panes) {
        panes.overlayLayer.appendChild(this.div);
      }

      // Add zoom change listener to handle visibility
      const map = this.getMap() as google.maps.Map;
      if (map) {
        google.maps.event.addListener(map, "zoom_changed", () => {
          const zoom = map.getZoom();
          if (zoom !== undefined) {
            this.handleZoomChange(zoom);
          }
        });
      }
    }

    handleZoomChange(zoom: number) {
      if (zoom < 10 && this.isVisible) {
        this.hide();
      } else if (zoom >= 10 && !this.isVisible) {
        this.show();
      }
    }

    hide() {
      this.isVisible = false;
      if (this.currentPolygon) {
        this.currentPolygon.setMap(null);
      }
    }

    show() {
      this.isVisible = true;
      if (this.currentPolygon) {
        this.currentPolygon.setMap(this.getMap() as google.maps.Map);
      }
    }

    draw() {
      if (!this.div || !this.currentPolygon || !this.isVisible) return;

      const overlayProjection = this.getProjection();
      if (!overlayProjection) return;

      const bounds = new google.maps.LatLngBounds();
      const path = this.currentPolygon.getPath();
      path.forEach((coord) => bounds.extend(coord));

      const sw = overlayProjection.fromLatLngToDivPixel(bounds.getSouthWest());
      const ne = overlayProjection.fromLatLngToDivPixel(bounds.getNorthEast());

      if (!sw || !ne) return;

      this.div.style.left = sw.x + "px";
      this.div.style.top = ne.y + "px";
      this.div.style.width = ne.x - sw.x + "px";
      this.div.style.height = sw.y - ne.y + "px";
    }

    onRemove() {
      if (this.div) {
        this.div.parentNode?.removeChild(this.div);
        this.div = null;
      }
      if (this.currentPolygon) {
        this.currentPolygon.setMap(null);
        this.currentPolygon = null;
      }
    }

    updatePolygon(
      startCoords: Coordinate[],
      endCoords: Coordinate[],
      progress: number
    ) {
      if (!startCoords?.length || !endCoords?.length || !this.isVisible) {
        console.error("Invalid coordinates provided or overlay hidden:", {
          startCoords,
          endCoords,
          isVisible: this.isVisible,
        });
        return;
      }

      if (this.currentPolygon) {
        this.currentPolygon.setMap(null);
      }

      const interpolatedCoords = startCoords.map((start, index) => {
        const end = endCoords[index] || endCoords[endCoords.length - 1];
        return {
          lat: start.lat + (end.lat - start.lat) * progress,
          lng: start.lng + (end.lng - start.lng) * progress,
        };
      });

      this.currentPolygon = new google.maps.Polygon({
        paths: interpolatedCoords,
        strokeColor: "#FF4444",
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map: this.getMap() as google.maps.Map,
        zIndex: 1000,
        geodesic: true,
        clickable: true,
      });

      google.maps.event.addListener(this.currentPolygon, "mouseover", () => {
        if (this.currentPolygon) {
          this.currentPolygon.setOptions({
            fillOpacity: 0.5,
            strokeWeight: 4,
          });
        }
      });

      google.maps.event.addListener(this.currentPolygon, "mouseout", () => {
        if (this.currentPolygon) {
          this.currentPolygon.setOptions({
            fillOpacity: 0.35,
            strokeWeight: 3,
          });
        }
      });

      google.maps.event.addListener(
        this.currentPolygon,
        "click",
        (e: google.maps.MapMouseEvent) => {
          const area = google.maps.geometry.spherical.computeArea(
            this.currentPolygon!.getPath()
          );
          const areaInKm = (area / 1000000).toFixed(2);

          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 8px;">
              <strong>Fire Spread Area</strong><br>
              ${areaInKm} km²
            </div>`,
            position: e.latLng,
          });

          infoWindow.open(this.getMap() as google.maps.Map);
        }
      );

      this.draw();
    }
  };
};

export const FireSpreadOverlay: React.FC<FireSpreadOverlayProps> = ({
  map,
  simulationData,
}) => {
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const overlayRef = useRef<InstanceType<
    ReturnType<typeof createFireOverlay>
  > | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateTime = useRef<number>(0);
  const animationProgress = useRef<number>(0);

  useEffect(() => {
    console.log("FireSpreadOverlay mounted with:", {
      map,
      simulationData,
      timeframes: simulationData?.timeframes,
      firstTimeframe: simulationData?.timeframes?.[0],
      coordinates: simulationData?.timeframes?.[0]?.coordinates,
    });

    if (!map || !simulationData || !window.google) {
      console.log("Missing required props:", {
        hasMap: !!map,
        hasSimulationData: !!simulationData,
        hasGoogle: !!window.google,
        timeframesLength: simulationData?.timeframes?.length,
      });
      return;
    }

    // Create the overlay if it doesn't exist
    if (!overlayRef.current) {
      console.log("Creating new FireOverlay");
      const FireOverlay = createFireOverlay(window.google);
      overlayRef.current = new FireOverlay();
      overlayRef.current.setMap(map);

      // Initialize with first frame
      if (simulationData.timeframes.length > 0) {
        console.log(
          "Initializing with first frame:",
          simulationData.timeframes[0]
        );
        const firstFrame = simulationData.timeframes[0];
        overlayRef.current.updatePolygon(
          firstFrame.coordinates,
          firstFrame.coordinates,
          1
        );
      }
    }

    return () => {
      console.log("Cleaning up FireSpreadOverlay");
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, [map, simulationData]);

  useEffect(() => {
    if (!simulationData || !overlayRef.current) {
      console.log("Missing data for frame update:", {
        hasSimulationData: !!simulationData,
        hasOverlay: !!overlayRef.current,
      });
      return;
    }

    console.log("Updating frame:", {
      currentTimeIndex,
      totalFrames: simulationData.timeframes.length,
    });

    const currentFrame = simulationData.timeframes[currentTimeIndex];
    const nextFrame = simulationData.timeframes[currentTimeIndex + 1];

    if (currentFrame && nextFrame) {
      overlayRef.current.updatePolygon(
        currentFrame.coordinates,
        nextFrame.coordinates,
        animationProgress.current
      );
    } else if (currentFrame) {
      overlayRef.current.updatePolygon(
        currentFrame.coordinates,
        currentFrame.coordinates,
        1
      );
    }
  }, [currentTimeIndex, simulationData]);

  useEffect(() => {
    if (!isPlaying || !simulationData) return;

    const animate = (timestamp: number) => {
      if (!lastUpdateTime.current) {
        lastUpdateTime.current = timestamp;
      }

      const elapsed = timestamp - lastUpdateTime.current;
      const duration = 3000; // 3 seconds per transition for slower growth

      animationProgress.current = (elapsed % duration) / duration;

      if (elapsed >= duration) {
        lastUpdateTime.current = timestamp;
        setCurrentTimeIndex((prev) => {
          if (prev >= simulationData.timeframes.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }

      if (overlayRef.current) {
        const currentFrame = simulationData.timeframes[currentTimeIndex];
        const nextFrame = simulationData.timeframes[currentTimeIndex + 1];

        if (currentFrame && nextFrame) {
          overlayRef.current.updatePolygon(
            currentFrame.coordinates,
            nextFrame.coordinates,
            animationProgress.current
          );
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastUpdateTime.current = 0;
      animationProgress.current = 0;
    };
  }, [isPlaying, simulationData, currentTimeIndex]);

  if (!simulationData) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 text-white text-center max-w-xl">
        <p className="text-sm font-medium">
          {simulationData.timeframes[currentTimeIndex].impact}
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/50 p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentTimeIndex(0);
              lastUpdateTime.current = 0;
              animationProgress.current = 0;
            }}
            className="p-1 hover:bg-slate-100 rounded"
            title="Restart"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:bg-slate-100 rounded"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
          </button>
          <button
            onClick={() => {
              setCurrentTimeIndex(simulationData.timeframes.length - 1);
              lastUpdateTime.current = 0;
              animationProgress.current = 1;
            }}
            className="p-1 hover:bg-slate-100 rounded"
            title="Skip to end"
          >
            <SkipForward size={20} />
          </button>
          <div className="text-sm font-medium text-slate-700 ml-2">
            {simulationData.timeframes[currentTimeIndex].hours}h
          </div>
        </div>
      </div>
    </div>
  );
};
