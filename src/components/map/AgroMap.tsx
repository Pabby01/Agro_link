import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Truck,
  MapPin,
  ShieldCheck,
  Package,
  ArrowUpRight,
  Navigation,
  Gauge,
  Thermometer,
  Zap,
  Activity,
  Layers,
  Crosshair,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp, formatNaira } from "@/lib/store";
import { cn } from "@/lib/utils";

// Real GPS coordinates for major Nigerian agricultural hubs
export interface HubLocation {
  id: string;
  name: string;
  region: string;
  role: "Farmer Hub" | "Buyer Hub" | "Logistics Hub" | "Processing HQ";
  coords: [number, number]; // [lat, lng]
  description: string;
  activeUsers: string[];
}

const AGRO_HUBS: HubLocation[] = [
  {
    id: "kano",
    name: "Kano Agricultural Belt",
    region: "Northern Region",
    role: "Farmer Hub",
    coords: [12.0022, 8.592],
    description: "Major northern harvest zone for Roma tomatoes, grains, onions, and root crops.",
    activeUsers: ["Abdul Farms"],
  },
  {
    id: "jos",
    name: "Jos Plateau Highlands",
    region: "North Central",
    role: "Farmer Hub",
    coords: [9.8965, 8.8583],
    description:
      "Cool highland region producing bell peppers, Irish potatoes, and premium legumes.",
    activeUsers: ["Greenvale Cooperative"],
  },
  {
    id: "kaduna",
    name: "Kaduna Grain Depot",
    region: "North West",
    role: "Processing HQ",
    coords: [10.5105, 7.4165],
    description: "Major grain aggregation, sorting facilities, and rail-road freight junction.",
    activeUsers: ["Sahel Foods Processing"],
  },
  {
    id: "abuja",
    name: "Abuja Trade Gateway",
    region: "Federal Capital Territory",
    role: "Logistics Hub",
    coords: [9.0765, 7.3986],
    description: "Central aggregation hub, cold-storage base, and heavy haulage fleet dispatch.",
    activeUsers: ["SwiftHaul Logistics"],
  },
  {
    id: "ibadan",
    name: "Ibadan Processing Corridor",
    region: "South West",
    role: "Farmer Hub",
    coords: [7.3775, 3.947],
    description: "Southern cassava, plantain, and yam farming belt with regional haulage depot.",
    activeUsers: ["Oyelaran Agro", "Kola Movers"],
  },
  {
    id: "lagos",
    name: "Lagos Megacity & Terminal",
    region: "Commercial Hub",
    role: "Buyer Hub",
    coords: [6.5244, 3.3792],
    description:
      "Highest retail, supermarket, and wholesale demand market for fresh food across Nigeria.",
    activeUsers: ["FreshMart Retail", "Agrolink Operations"],
  },
];

export interface MovingVehicle {
  id: string;
  carrier: string;
  type: "truck" | "van" | "bike";
  typeLabel: string;
  driverName: string;
  driverTrust: number;
  cargo: string;
  cargoWeightKg: number;
  speedKmh: number;
  tempCelsius?: number;
  origin: string;
  destination: string;
  waypoints: [number, number][]; // List of [lat, lng]
  currentSegment: number;
  progress: number; // 0 to 1 along segment
  status: "In Transit" | "Arriving" | "Dispatching";
  statusText: string;
}

// Realistic waypoint routes along Nigerian highways (A2, A122, A234)
const INITIAL_VEHICLES: MovingVehicle[] = [
  {
    id: "veh-1",
    carrier: "SwiftHaul Heavy Reefer #TR-801",
    type: "truck",
    typeLabel: "40T Refrigerated Hauler",
    driverName: "Ibrahim Musa",
    driverTrust: 95,
    cargo: "Roma Tomatoes (Grade A)",
    cargoWeightKg: 1200,
    speedKmh: 74,
    tempCelsius: 4.2,
    origin: "Kano (Abdul Farms)",
    destination: "Lagos (FreshMart Retail)",
    waypoints: [
      [12.0022, 8.592], // Kano
      [11.0855, 7.7199], // Zaria
      [10.5105, 7.4165], // Kaduna
      [9.0765, 7.3986], // Abuja
      [7.8023, 6.743], // Lokoja
      [7.3775, 3.947], // Ibadan
      [6.5244, 3.3792], // Lagos
    ],
    currentSegment: 1,
    progress: 0.45,
    status: "In Transit",
    statusText: "On Highway A2 approaching Kaduna corridor",
  },
  {
    id: "veh-2",
    carrier: "Sahel Grain Freight #FL-340",
    type: "truck",
    typeLabel: "20T Flatbed Truck",
    driverName: "Danjuma Bala",
    driverTrust: 92,
    cargo: "Yellow Maize Harvest Lots",
    cargoWeightKg: 900,
    speedKmh: 65,
    origin: "Jos (Greenvale)",
    destination: "Abuja Trade Gateway",
    waypoints: [
      [9.8965, 8.8583], // Jos
      [9.4833, 8.4167], // Keffi route
      [9.0765, 7.3986], // Abuja
    ],
    currentSegment: 0,
    progress: 0.7,
    status: "In Transit",
    statusText: "Descending Jos Plateau along Keffi corridor",
  },
  {
    id: "veh-3",
    carrier: "Kola Fresh Express #VN-109",
    type: "van",
    typeLabel: "Medium Temperature Van",
    driverName: "Tunde Kolawole",
    driverTrust: 89,
    cargo: "Fresh Cassava & Plantain",
    cargoWeightKg: 650,
    speedKmh: 58,
    tempCelsius: 16.0,
    origin: "Ibadan (Oyelaran Agro)",
    destination: "Lagos Megacity Hub",
    waypoints: [
      [7.3775, 3.947], // Ibadan
      [6.8375, 3.6305], // Sagamu
      [6.5244, 3.3792], // Lagos
    ],
    currentSegment: 0,
    progress: 0.6,
    status: "In Transit",
    statusText: "Lagos-Ibadan Expressway near Sagamu interchange",
  },
  {
    id: "veh-4",
    carrier: "SwiftBike Courier #BK-042",
    type: "bike",
    typeLabel: "Agri-Dispatch Motorcycle",
    driverName: "Emeka Obi",
    driverTrust: 96,
    cargo: "Organic Bell Pepper Samples & Soil Tests",
    cargoWeightKg: 25,
    speedKmh: 38,
    origin: "Ikeja Distribution Point",
    destination: "Victoria Island Gourmet Mart",
    waypoints: [
      [6.6018, 3.3515], // Ikeja
      [6.545, 3.365], // Maryland
      [6.5005, 3.37], // Yaba
      [6.4281, 3.4219], // Victoria Island
    ],
    currentSegment: 1,
    progress: 0.35,
    status: "In Transit",
    statusText: "Express urban courier en route to Victoria Island",
  },
  {
    id: "veh-5",
    carrier: "Abuja City Dispatch #BK-088",
    type: "bike",
    typeLabel: "Rapid Produce Dispatch",
    driverName: "Ahmed Sani",
    driverTrust: 94,
    cargo: "Certified Tomato Seedlings (urgent)",
    cargoWeightKg: 18,
    speedKmh: 42,
    origin: "Abuja Gateway Center",
    destination: "Gwarinpa Cooperative Hub",
    waypoints: [
      [9.0765, 7.3986], // Central Abuja
      [9.105, 7.42], // Wuse 2
      [9.115, 7.38], // Gwarinpa
    ],
    currentSegment: 0,
    progress: 0.8,
    status: "Arriving",
    statusText: "Approaching Gwarinpa drop-off point in 8 mins",
  },
];

// Helper to interpolate between two [lat, lng] points
function interpolateCoords(
  p1: [number, number],
  p2: [number, number],
  fraction: number,
): [number, number] {
  return [p1[0] + (p2[0] - p1[0]) * fraction, p1[1] + (p2[1] - p1[1]) * fraction];
}

// Calculate heading/bearing between two coordinates in degrees
function calculateBearing(p1: [number, number], p2: [number, number]): number {
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  Polyline as LeafletPolyline,
} from "leaflet";

export function AgroMap({
  className,
  highlightHubId,
}: {
  className?: string;
  highlightHubId?: string;
}) {
  const { state } = useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const polylinesRef = useRef<LeafletPolyline[]>([]);

  const [mounted, setMounted] = useState(false);
  const [vehicles, setVehicles] = useState<MovingVehicle[]>(INITIAL_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<MovingVehicle | null>(
    INITIAL_VEHICLES[0] ?? null,
  );
  const [selectedHub, setSelectedHub] = useState<HubLocation>(() => {
    const found = AGRO_HUBS.find((h) => h.id === highlightHubId);
    if (found) return found;
    return AGRO_HUBS[0] as HubLocation;
  });
  const [filterType, setFilterType] = useState<"all" | "truck" | "van" | "bike">("all");
  const [mapStyle, setMapStyle] = useState<"standard" | "satellite">("standard");

  // Mount check for client-side execution
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapInstanceRef.current) return;

    let isCancelled = false;

    async function initMap() {
      const L = await import("leaflet");
      if (isCancelled || !mapContainerRef.current) return;

      // Create map centered on Nigeria
      const map = L.map(mapContainerRef.current, {
        center: [9.082, 7.8],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      // CartoDB Positron / Google Maps clean tiles
      const tileUrl =
        mapStyle === "satellite"
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: "abcd",
      }).addTo(map);

      mapInstanceRef.current = map;

      // Draw trade corridor polylines
      const corridorColors = ["#173B32", "#7FAF8A", "#D6B85A", "#2563eb", "#10b981"];
      INITIAL_VEHICLES.forEach((veh, idx) => {
        const poly = L.polyline(veh.waypoints, {
          color: corridorColors[idx % corridorColors.length],
          weight: 3.5,
          opacity: 0.75,
          dashArray: "8, 8",
        }).addTo(map);
        polylinesRef.current.push(poly);
      });

      // Render Hub Markers
      AGRO_HUBS.forEach((hub) => {
        const isFarmer = hub.role === "Farmer Hub";
        const isLogistics = hub.role === "Logistics Hub";
        const badgeColor = isFarmer ? "#16a34a" : isLogistics ? "#d97706" : "#2563eb";

        const iconHtml = `
          <div class="agro-hub-marker flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 shadow-md border text-[11px] font-bold text-gray-800 backdrop-blur-xs whitespace-nowrap">
              <span class="size-2 rounded-full" style="background-color: ${badgeColor};"></span>
              ${hub.name.split(" ")[0]}
            </div>
            <div class="size-3.5 rounded-full border-2 border-white shadow-md mt-0.5" style="background-color: ${badgeColor};"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [0, 0],
        });

        const marker = L.marker(hub.coords, { icon: customIcon }).addTo(map);
        marker.on("click", () => {
          setSelectedHub(hub);
          setSelectedVehicle(null);
          map.flyTo(hub.coords, 8, { duration: 1.2 });
        });
        markersRef.current[`hub-${hub.id}`] = marker;
      });
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, mapStyle]);

  // Real-time Vehicle movement loop (Uber-style physics & live coordinates interpolation)
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          let nextProgress = v.progress + 0.04;
          let nextSegment = v.currentSegment;

          if (nextProgress >= 1) {
            nextProgress = 0;
            nextSegment = (v.currentSegment + 1) % (v.waypoints.length - 1);
          }

          // Fluctuating speed for realism
          const speedDelta = Math.floor(Math.random() * 5) - 2;
          const newSpeed = Math.max(30, Math.min(85, v.speedKmh + speedDelta));

          return {
            ...v,
            progress: nextProgress,
            currentSegment: nextSegment,
            speedKmh: newSpeed,
          };
        }),
      );
    }, 800);

    return () => clearInterval(interval);
  }, [mounted]);

  // Update vehicle markers on the real Leaflet map
  useEffect(() => {
    if (!mounted || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((L) => {
      vehicles.forEach((veh) => {
        const p1: [number, number] = veh.waypoints[veh.currentSegment] ??
          veh.waypoints[0] ?? [9.082, 8.6753];
        const p2: [number, number] = veh.waypoints[veh.currentSegment + 1] ?? p1;
        const currentPos = interpolateCoords(p1, p2, veh.progress);
        const heading = calculateBearing(p1, p2);

        const isBike = veh.type === "bike";
        const isVan = veh.type === "van";
        const iconSvg = isBike ? "🏍️" : isVan ? "🚐" : "🚚";

        const isSelected = selectedVehicle?.id === veh.id;

        const vehicleHtml = `
          <div class="uber-vehicle-marker flex flex-col items-center cursor-pointer transition-all duration-300" style="transform: translate(-50%, -50%);">
            <div class="relative flex items-center justify-center">
              ${
                isSelected
                  ? `<div class="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping"></div>`
                  : ""
              }
              <div class="flex size-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-xl ${
                isSelected ? "ring-2 ring-emerald-500 scale-110" : "hover:scale-110"
              }">
                <span class="text-base" style="transform: rotate(${heading - 90}deg); display: inline-block;">${iconSvg}</span>
              </div>
            </div>
            <div class="mt-1 flex items-center gap-1 rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow backdrop-blur-xs whitespace-nowrap">
              <span>${veh.speedKmh} km/h</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: vehicleHtml,
          className: "",
          iconSize: [0, 0],
        });

        const existingMarker = markersRef.current[veh.id];
        if (existingMarker) {
          existingMarker.setLatLng(currentPos);
          existingMarker.setIcon(customIcon);
        } else {
          const marker = L.marker(currentPos, { icon: customIcon }).addTo(map);
          marker.on("click", () => {
            setSelectedVehicle(veh);
            map.flyTo(currentPos, 9, { duration: 1 });
          });
          markersRef.current[veh.id] = marker;
        }
      });
    });
  }, [mounted, vehicles, selectedVehicle]);

  // Recenter map on full Nigeria view
  const recenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([9.082, 7.8], 6, { duration: 1.2 });
      setSelectedVehicle(null);
    }
  };

  // Focus on a specific vehicle
  const focusVehicle = (veh: MovingVehicle) => {
    setSelectedVehicle(veh);
    if (mapInstanceRef.current) {
      const p1: [number, number] = veh.waypoints[veh.currentSegment] ??
        veh.waypoints[0] ?? [9.082, 8.6753];
      const p2: [number, number] = veh.waypoints[veh.currentSegment + 1] ?? p1;
      const currentPos = interpolateCoords(p1, p2, veh.progress);
      mapInstanceRef.current.flyTo(currentPos, 9, { duration: 1 });
    }
  };

  const filteredVehicles =
    filterType === "all" ? vehicles : vehicles.filter((v) => v.type === filterType);

  return (
    <div className={cn("grid gap-5 lg:grid-cols-[1.75fr_1fr]", className)}>
      {/* Real Map Canvas Card */}
      <Card className="relative flex flex-col overflow-hidden border-border/80 bg-card p-0 shadow-[var(--shadow-lift)]">
        {/* Map Top Control Header (Uber/Logistics Style) */}
        <div className="absolute left-3 top-3 right-3 z-40 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Badge
              variant="default"
              className="bg-slate-900/90 text-white hover:bg-slate-900 border-0 shadow-lg px-3 py-1 text-xs font-semibold backdrop-blur-md"
            >
              <span className="mr-2 size-2 rounded-full bg-emerald-400 animate-ping" />
              Live Fleet Radar · {vehicles.length} Vehicles Moving
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto bg-card/90 p-1 rounded-xl shadow-md border backdrop-blur-md">
            <Button
              size="sm"
              variant={filterType === "all" ? "default" : "ghost"}
              className="h-7 px-2.5 text-xs font-semibold"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterType === "truck" ? "default" : "ghost"}
              className="h-7 px-2.5 text-xs font-semibold gap-1"
              onClick={() => setFilterType("truck")}
            >
              🚚 Trucks
            </Button>
            <Button
              size="sm"
              variant={filterType === "bike" ? "default" : "ghost"}
              className="h-7 px-2.5 text-xs font-semibold gap-1"
              onClick={() => setFilterType("bike")}
            >
              🏍️ Bikes
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="size-7"
              title="Recenter Nigeria Corridor Overview"
              onClick={recenterMap}
            >
              <Crosshair className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Map Container Element */}
        <div
          ref={mapContainerRef}
          className="relative h-[440px] sm:h-[500px] w-full z-0 bg-muted/40"
          style={{ minHeight: "440px" }}
        >
          {!mounted && (
            <div className="flex h-full w-full items-center justify-center bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="size-4 animate-spin text-primary" /> Loading Nigeria Logistics
                Grid…
              </span>
            </div>
          )}
        </div>

        {/* Bottom Live Corridor Status Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-card/95 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <span className="size-2 rounded-full bg-emerald-500" /> Farmers (Kano, Jos, Ibadan)
            </span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <span className="size-2 rounded-full bg-amber-500" /> Transporters (Abuja)
            </span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <span className="size-2 rounded-full bg-blue-500" /> Buyers (Lagos)
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Tap any moving vehicle or hub pin to inspect live telemetry
          </span>
        </div>
      </Card>

      {/* Right Column: Live Telemetry Inspector & Fleet Manager */}
      <div className="flex flex-col gap-4">
        {/* Selected Vehicle Live Telemetry HUD */}
        {selectedVehicle ? (
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)] border-primary/40 bg-card">
            <div className="flex items-start justify-between gap-2 border-b pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs font-bold text-primary border-primary/40 bg-primary/10"
                  >
                    {selectedVehicle.type === "truck"
                      ? "🚚 Heavy Haulage"
                      : selectedVehicle.type === "bike"
                        ? "🏍️ Dispatch Bike"
                        : "🚐 Agri-Van"}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE GPS
                  </span>
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground">
                  {selectedVehicle.carrier}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedVehicle.statusText}</p>
              </div>

              <div className="text-right">
                <span className="flex items-center justify-end gap-1 text-xs font-bold text-success">
                  <ShieldCheck className="size-3.5" />
                  {selectedVehicle.driverTrust} Trust
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {selectedVehicle.driverName}
                </span>
              </div>
            </div>

            {/* Live Gauges */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border bg-muted/40 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Speed
                </span>
                <span className="font-display text-base font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Gauge className="size-3.5 text-primary" />
                  {selectedVehicle.speedKmh}{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">km/h</span>
                </span>
              </div>

              <div className="rounded-xl border bg-muted/40 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Cargo Load
                </span>
                <span className="font-display text-base font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Package className="size-3.5 text-gold-foreground" />
                  {selectedVehicle.cargoWeightKg}{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">kg</span>
                </span>
              </div>

              <div className="rounded-xl border bg-muted/40 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Cold Chain
                </span>
                <span className="font-display text-base font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                  <Thermometer className="size-3.5" />
                  {selectedVehicle.tempCelsius !== undefined
                    ? `${selectedVehicle.tempCelsius}°C`
                    : "Dry"}
                </span>
              </div>
            </div>

            {/* Corridor Origin -> Destination */}
            <div className="mt-4 space-y-2 rounded-xl border bg-muted/30 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Origin:</span>
                <span className="font-semibold text-foreground">{selectedVehicle.origin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-semibold text-foreground">{selectedVehicle.destination}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Produce:</span>
                <span className="font-semibold text-primary">{selectedVehicle.cargo}</span>
              </div>
            </div>

            <Button asChild size="sm" className="mt-4 w-full font-bold">
              <Link to="/marketplace">
                Inspect Connected Orders
                <ArrowUpRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </Card>
        ) : (
          /* Selected Regional Hub View */
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {selectedHub.region}
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {selectedHub.name}
                </h3>
              </div>
              <Badge variant="secondary">{selectedHub.role}</Badge>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {selectedHub.description}
            </p>
            <div className="mt-4 space-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
              <p className="font-semibold text-foreground">Verified Local Operators</p>
              {selectedHub.activeUsers.map((u) => (
                <div key={u} className="flex items-center justify-between">
                  <span>{u}</span>
                  <span className="text-success font-bold text-[11px]">Active Operator</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Live Active Fleet Quick-Select List */}
        <Card className="flex-1 gap-0 p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h4 className="font-display text-sm font-bold text-foreground">
              Active Corridor Fleet
            </h4>
            <span className="text-[11px] text-muted-foreground font-medium">
              {filteredVehicles.length} vehicles
            </span>
          </div>

          <div className="mt-2.5 space-y-2 max-h-[190px] overflow-y-auto pr-1">
            {filteredVehicles.map((v) => {
              const isSelected = selectedVehicle?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => focusVehicle(v)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40 font-semibold"
                      : "border-border/70 bg-card hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">
                      {v.type === "truck" ? "🚚" : v.type === "bike" ? "🏍️" : "🚐"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">
                        {v.carrier.split("#")[0]}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {v.cargo} · {v.speedKmh} km/h
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 font-bold text-success shrink-0 text-[11px]">
                    <ShieldCheck className="size-3" />
                    {v.driverTrust}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
