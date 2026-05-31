import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { destinations } from "@/data/destinations";
import { useNavigate } from "@tanstack/react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Plane } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Fix Leaflet default icon
(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl =
  undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const COORDS: Record<string, { lat: number; lng: number }> = {
  goa: { lat: 15.29, lng: 74.12 },
  kerala: { lat: 10.85, lng: 76.27 },
  manali: { lat: 32.24, lng: 77.18 },
  jaipur: { lat: 26.91, lng: 75.78 },
  ladakh: { lat: 34.15, lng: 77.57 },
  mumbai: { lat: 19.07, lng: 72.87 },
  chennai: { lat: 13.08, lng: 80.27 },
  delhi: { lat: 28.61, lng: 77.21 },
  pondicherry: { lat: 11.93, lng: 79.83 },
  bangalore: { lat: 12.97, lng: 77.59 },
  bali: { lat: -8.34, lng: 115.09 },
  paris: { lat: 48.85, lng: 2.35 },
  dubai: { lat: 25.2, lng: 55.27 },
  tokyo: { lat: 35.68, lng: 139.69 },
  "new-york": { lat: 40.71, lng: -74.0 },
  london: { lat: 51.5, lng: -0.12 },
  singapore: { lat: 1.35, lng: 103.82 },
  maldives: { lat: 3.2, lng: 73.22 },
};

interface ActiveDest {
  id: string;
  name: string;
  region: string;
  type: "indian" | "international";
  costPerPerson: number;
  description: string;
  duration: number;
}

function createAmberIcon(type: "indian" | "international") {
  const color = type === "indian" ? "#f59e0b" : "#0ea5e9";
  const glow = type === "indian" ? "#fbbf24" : "#38bdf8";
  return L.divIcon({
    className: "",
    html: `<div style="position: relative; width: 32px; height: 32px;">
      <div style="width: 32px; height: 32px; background: ${color}; border: 3px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 2px 10px ${glow}88, 0 0 0 2px ${glow}44;"></div>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -60%); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

export default function MapPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [activeDest, setActiveDest] = useState<ActiveDest | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 78],
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    for (const dest of destinations) {
      const coords = COORDS[dest.id];
      if (!coords) continue;
      const icon = createAmberIcon(dest.type);
      const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(map);
      const cost = dest.costPerPerson ?? dest.pricePerPerson ?? 0;
      const markerColor = dest.type === "indian" ? "#f59e0b" : "#0ea5e9";
      const tagBg = dest.type === "indian" ? "#fef3c7" : "#e0f2fe";
      const tagColor = dest.type === "indian" ? "#92400e" : "#075985";
      const shortDesc =
        dest.description.length > 80
          ? `${dest.description.slice(0, 80)}…`
          : dest.description;

      marker.bindPopup(
        `<div style="min-width:210px; max-width:240px; font-family: sans-serif; padding: 2px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <strong style="font-size:14px; flex:1; color:#111;">${dest.name}</strong>
            <span style="font-size:10px; font-weight:600; padding:2px 7px; border-radius:12px; background:${tagBg}; color:${tagColor};">${dest.type === "indian" ? "🇮🇳 India" : "🌍 Intl"}</span>
          </div>
          <p style="font-size:11px; color:#6b7280; margin:0 0 4px;">${dest.region} · ${dest.duration ?? 5} days</p>
          <p style="font-size:11px; color:#4b5563; margin:0 0 8px; line-height:1.5;">${shortDesc}</p>
          <p style="font-size:13px; font-weight:700; color:${markerColor}; margin:0 0 10px;">
            ₹${cost.toLocaleString("en-IN")}<span style="font-size:10px; color:#9ca3af; font-weight:400;">/person</span>
          </p>
          <a href="/travel-plan?destination=${encodeURIComponent(dest.name)}"
            style="display:block; text-align:center; background:${markerColor}; color:white; font-size:12px; font-weight:700; padding:7px 12px; border-radius:8px; text-decoration:none;"
            id="popup-book-${dest.id}">✈ Book Now</a>
        </div>`,
        { maxWidth: 260 },
      );

      marker.on("click", () => {
        setActiveDest({
          id: dest.id,
          name: dest.name,
          region: dest.region,
          type: dest.type,
          costPerPerson: cost,
          description: dest.description,
          duration: dest.duration ?? 5,
        });
      });

      marker.bindTooltip(dest.name, {
        permanent: false,
        direction: "top",
        offset: [0, -32],
        className: "leaflet-tooltip-custom",
      });
    }

    map.on("popupopen", (e) => {
      const container = e.popup.getElement();
      if (!container) return;
      const link = container.querySelector<HTMLAnchorElement>(
        "a[id^='popup-book-']",
      );
      if (!link) return;
      link.addEventListener("click", (ev) => {
        ev.preventDefault();
        const destName =
          new URL(link.href).searchParams.get("destination") ?? "";
        navigate({ to: "/travel-plan", search: { destination: destName } });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="relative py-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,22,40,0.82)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Explore
          </p>
          <h1 className="font-display font-bold text-4xl text-white text-shadow-hero mb-1">
            Explore Destinations on Map
          </h1>
          <p className="text-white/65">
            {destinations.length} destinations — click any marker or tile to
            book
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {/* Map + Side Panel */}
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-elevated">
          <div
            ref={mapContainerRef}
            className="w-full"
            style={{ height: "520px" }}
            data-ocid="leaflet-map"
            aria-label="Interactive destination map"
          />
          {/* Glass panel overlay */}
          {activeDest && (
            <div
              className="absolute top-4 right-4 z-[1000] w-72 rounded-2xl glass-card-dark animate-slide-up shadow-hero"
              data-ocid="map-popup-panel"
            >
              <div className="p-4">
                <button
                  type="button"
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full glass-card text-white/70 hover:text-white transition-fast text-sm"
                  onClick={() => setActiveDest(null)}
                  aria-label="Close destination panel"
                >
                  ✕
                </button>
                <div className="flex items-start gap-2 mb-2 pr-6">
                  <MapPin
                    className={`w-5 h-5 mt-0.5 shrink-0 ${activeDest.type === "indian" ? "text-amber-400" : "text-sky-400"}`}
                  />
                  <div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight">
                      {activeDest.name}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeDest.type === "indian" ? "bg-amber-500/20 text-amber-300" : "bg-sky-500/20 text-sky-300"}`}
                    >
                      {activeDest.type === "indian"
                        ? "🇮🇳 India"
                        : "🌍 International"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/60 mb-2">
                  {activeDest.region}
                </p>
                <p className="text-sm text-white/70 mb-3 leading-relaxed line-clamp-3">
                  {activeDest.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-display font-bold text-amber-400 text-base">
                      ₹{activeDest.costPerPerson.toLocaleString("en-IN")}
                      <span className="text-xs text-white/50 font-normal">
                        /person
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-white/60">
                    {activeDest.duration} days
                  </span>
                </div>
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold"
                  onClick={() =>
                    navigate({
                      to: "/travel-plan",
                      search: { destination: activeDest.name },
                    })
                  }
                  data-ocid="map-book-btn"
                >
                  <Plane className="w-4 h-4 mr-2" />
                  Book a Trip
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 px-1 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ background: "#f59e0b" }}
            />
            <span className="text-sm text-muted-foreground font-medium">
              India ({destinations.filter((d) => d.type === "indian").length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ background: "#0ea5e9" }}
            />
            <span className="text-sm text-muted-foreground font-medium">
              International (
              {destinations.filter((d) => d.type === "international").length})
            </span>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            Click a marker to explore · Click tile below to fly to destination
          </span>
        </div>

        {/* Destinations quick grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {destinations.map((dest) => {
            const coords = COORDS[dest.id];
            return (
              <button
                key={dest.id}
                type="button"
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-fast hover:border-amber-500/50 hover:bg-muted ${activeDest?.id === dest.id ? "border-amber-500 bg-amber-500/5" : "border-border bg-card"}`}
                onClick={() => {
                  const cost = dest.costPerPerson ?? dest.pricePerPerson ?? 0;
                  setActiveDest({
                    id: dest.id,
                    name: dest.name,
                    region: dest.region,
                    type: dest.type,
                    costPerPerson: cost,
                    description: dest.description,
                    duration: dest.duration ?? 5,
                  });
                  if (mapRef.current && coords)
                    mapRef.current.setView([coords.lat, coords.lng], 7, {
                      animate: true,
                    });
                }}
                data-ocid={`map-dest-${dest.id}`}
              >
                <MapPin
                  className={`w-4 h-4 shrink-0 ${dest.type === "indian" ? "text-amber-500" : "text-sky-500"}`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {dest.name}
                  </p>
                  <p className="text-[10px] text-amber-500 font-bold">
                    ₹
                    {(
                      (dest.costPerPerson ?? dest.pricePerPerson ?? 0) / 1000
                    ).toFixed(0)}
                    K
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .leaflet-tooltip-custom {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          white-space: nowrap;
        }
        .leaflet-tooltip-custom::before { border-top-color: hsl(var(--border)); }
        .leaflet-container { font-family: var(--font-body); }
        .leaflet-popup-content-wrapper { border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 0; }
        .leaflet-popup-content { margin: 12px 14px; }
        .leaflet-popup-tip { background: white; }
      `}</style>
    </div>
  );
}
