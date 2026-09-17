import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronRight,
  CircleDot,
  FileText,
  Gauge,
  MapPinned,
  PhoneCall,
  Plus,
  Truck,
} from "lucide-react";
import { io } from "socket.io-client";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

type Coordinates = { latitude?: number | null; longitude?: number | null };

type Emergency = {
  _id?: string;
  disasterType?: string;
  severity?: string;
  status?: string;
  description?: string;
  reportedBy?: string | { _id?: string; name?: string; email?: string } | null;
  assignedFirefighter?: string | { _id?: string; name?: string } | null;
  assignedRescueTeam?: string | { _id?: string; teamName?: string } | null;
  createdAt?: string;
  location?: Coordinates & { address?: string };
};

type RecentUpdate = {
  _id?: string;
  status?: string;
  message?: string;
  updatedByType?: string;
  createdAt?: string;
  location?: Coordinates | null;
};

type Dashboard = {
  station?: {
    _id?: string;
    name?: string;
    stationCode?: string;
    status?: string;
    address?: string;
    contactNumber?: string;
    location?: Coordinates | null;
  };
  activeEmergencies?: Emergency[];
  recentUpdates?: RecentUpdate[];
  firefighters?: Array<{
    _id?: string;
    name?: string;
    employeeId?: string;
    availability?: string;
  }>;
  rescueTeams?: Array<{
    _id?: string;
    teamName?: string;
    teamCode?: string;
    availability?: string;
  }>;
  vehicles?: FireVehicle[];
  stats?: {
    total?: number;
    active?: number;
    resolved?: number;
    critical?: number;
    availableVehicles?: number;
    dispatchedUnits?: number;
    todaysIncidents?: number;
  };
};

type FireVehicle = {
  _id?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  status?: "AVAILABLE" | "DISPATCHED" | "MAINTENANCE" | string;
  crew?: Array<{ name?: string; employeeId?: string; availability?: string }>;
  currentEmergency?: Emergency | string | null;
  currentLocation?: Coordinates | null;
  fuelLevel?: number | null;
  waterLevel?: number | null;
  equipment?: string[];
};

type ApiResponse = {
  success?: boolean;
  dashboard?: Dashboard;
  message?: string;
};

const API_BASE = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "firefighter_token";
const STATUS_FLOW: Record<
  string,
  { status: string; label: string; message: string }
> = {
  RESPONDER_ASSIGNED: {
    status: "ACKNOWLEDGED",
    label: "Acknowledge Emergency",
    message: "Emergency acknowledged by fire station.",
  },
  ACKNOWLEDGED: {
    status: "EN_ROUTE",
    label: "Start Response",
    message: "Fire station response started.",
  },
  EN_ROUTE: {
    status: "ARRIVED",
    label: "Mark Arrived",
    message: "Fire station responder arrived at the emergency.",
  },
  ARRIVED: {
    status: "RESOLVED",
    label: "Resolve Emergency",
    message: "Emergency response resolved by fire station.",
  },
};

const MapFocusController: React.FC<{ center: [number, number] | null }> = ({
  center,
}) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13);
  }, [center, map]);
  return null;
};

const formatTime = (value?: string) => {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

const validCoordinates = (
  location?: Coordinates | null,
): location is { latitude: number; longitude: number } =>
  typeof location?.latitude === "number" &&
  Number.isFinite(location.latitude) &&
  typeof location?.longitude === "number" &&
  Number.isFinite(location.longitude);

const displayReference = (value: unknown) => {
  if (!value) return "Not assigned";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const item = value as {
      name?: string;
      teamName?: string;
      email?: string;
      _id?: string;
    };
    return item.name || item.teamName || item.email || item._id || "Assigned";
  }
  return "Assigned";
};

const FireStationPage: React.FC = () => {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || "",
  );
  const [identifier, setIdentifier] = useState("arun.ff@example.com");
  const [password, setPassword] = useState("Fire@123");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [mapFocus, setMapFocus] = useState<"active" | "station" | "incident">(
    "active",
  );
  const mapSectionRef = useRef<HTMLElement | null>(null);

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setDashboard(null);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      if (!API_BASE) throw new Error("Unable to connect to EMSTRAP backend.");
      const response = await fetch(`${API_BASE}/disaster/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "FIREFIGHTER",
          identifier: identifier.trim(),
          password,
        }),
      });
      const body = (await response.json()) as {
        token?: string;
        message?: string;
      };
      if (!response.ok || !body.token)
        throw new Error(body.message || "Invalid login credentials.");
      localStorage.setItem(TOKEN_KEY, body.token);
      setToken(body.token);
    } catch (error) {
      setLoginError(
        error instanceof TypeError
          ? "Unable to connect to EMSTRAP backend."
          : error instanceof Error
            ? error.message
            : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (authToken: string) => {
    setLoading(true);
    setDashboardError("");

    try {
      if (!API_BASE) throw new Error("Unable to connect to EMSTRAP backend.");
      const response = await fetch(
        `${API_BASE}/disaster/dashboard/fire-station`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        },
      );
      const body = (await response.json()) as ApiResponse;
      if (response.status === 401 || response.status === 403) {
        signOut();
        throw new Error("Your session has expired. Please sign in again.");
      }
      if (!response.ok || !body.dashboard)
        throw new Error(
          body.message || "Unable to connect to EMSTRAP backend.",
        );
      setDashboard(body.dashboard);
    } catch (error) {
      setDashboardError(
        error instanceof TypeError
          ? "Unable to connect to EMSTRAP backend."
          : error instanceof Error
            ? error.message
            : "Unable to connect to EMSTRAP backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (emergency: Emergency) => {
    const next = STATUS_FLOW[emergency.status || ""];
    if (!token || !emergency._id || !next) return;

    try {
      setLoading(true);
      setDashboardError("");
      const response = await fetch(`${API_BASE}/disaster/response/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          emergencyId: emergency._id,
          status: next.status,
          message: next.message,
        }),
      });
      const body = (await response.json()) as { message?: string };
      if (response.status === 401 || response.status === 403) {
        signOut();
        throw new Error("Your session has expired. Please sign in again.");
      }
      if (!response.ok)
        throw new Error(body.message || "Unable to update emergency status.");
      setSuccessMessage(body.message || `Emergency updated to ${next.status}.`);
      setSelectedEmergency(null);
      await loadDashboard(token);
    } catch (error) {
      setDashboardError(
        error instanceof TypeError
          ? "Unable to connect to EMSTRAP backend."
          : error instanceof Error
            ? error.message
            : "Unable to update emergency status.",
      );
    } finally {
      setLoading(false);
    }
  };

  const dispatchVehicle = async (vehicleId: string, emergencyId?: string) => {
    if (!token || !emergencyId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/disaster/fire-station/dispatch`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ emergencyId, vehicleId }),
        },
      );
      const body = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(body.message || "Unable to dispatch fire vehicle.");
      setSuccessMessage(body.message || "Fire vehicle dispatched.");
      await loadDashboard(token);
    } catch (error) {
      setDashboardError(
        error instanceof TypeError
          ? "Unable to connect to EMSTRAP backend."
          : error instanceof Error
            ? error.message
            : "Unable to dispatch fire vehicle.",
      );
    } finally {
      setLoading(false);
    }
  };

  const setVehicleStatus = async (vehicleId: string, status: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/disaster/fire-station/vehicles/${vehicleId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );
      const body = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(body.message || "Unable to update vehicle status.");
      setSuccessMessage(body.message || "Vehicle status updated.");
      await loadDashboard(token);
    } catch (error) {
      setDashboardError(
        error instanceof TypeError
          ? "Unable to connect to EMSTRAP backend."
          : error instanceof Error
            ? error.message
            : "Unable to update vehicle status.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void loadDashboard(token);
  }, [token]);

  useEffect(() => {
    const stationId = dashboard?.station?._id;
    if (!token || !stationId || !API_BASE) return undefined;
    const socket = io(API_BASE.replace(/\/api$/, ""), {
      transports: ["websocket"],
    });
    socket.on("connect", () => socket.emit("join_fire_station", { stationId }));
    socket.on("fire_station_updated", () => void loadDashboard(token));
    return () => socket.disconnect();
  }, [dashboard?.station?._id, token]);

  const emergencies = dashboard?.activeEmergencies || [];
  const coordinates = emergencies.filter((item) =>
    validCoordinates(item.location),
  );
  const stationHasCoordinates = validCoordinates(dashboard?.station?.location);
  const mapCenter =
    coordinates[0]?.location && validCoordinates(coordinates[0].location)
      ? ([
          coordinates[0].location.latitude,
          coordinates[0].location.longitude,
        ] as [number, number])
      : stationHasCoordinates && dashboard?.station?.location
        ? ([
            dashboard.station.location.latitude,
            dashboard.station.location.longitude,
          ] as [number, number])
        : null;
  const availableFirefighters = dashboard?.firefighters?.filter(
    (item) => item.availability === "AVAILABLE",
  ).length;
  const criticalCount = dashboard?.stats?.critical;
  const nextStatus = selectedEmergency
    ? STATUS_FLOW[selectedEmergency.status || ""]
    : undefined;
  const activity = dashboard?.recentUpdates || [];
  const vehicles = dashboard?.vehicles || [];
  const selectedEmergencyId = selectedEmergency?._id || emergencies[0]?._id;
  const stationCenter =
    stationHasCoordinates && dashboard?.station?.location
      ? ([
          dashboard.station.location.latitude,
          dashboard.station.location.longitude,
        ] as [number, number])
      : null;
  const incidentCenter =
    coordinates[0]?.location && validCoordinates(coordinates[0].location)
      ? ([
          coordinates[0].location.latitude,
          coordinates[0].location.longitude,
        ] as [number, number])
      : null;
  const focusedCenter =
    mapFocus === "station"
      ? stationCenter
      : mapFocus === "incident"
        ? incidentCenter
        : mapCenter;

  const kpis = useMemo(
    () => [
      {
        label: "ACTIVE INCIDENTS",
        value: dashboard?.stats?.active ?? emergencies.length,
        tone: "red",
      },
      {
        label: "CRITICAL INCIDENTS",
        value: criticalCount ?? "N/A",
        tone: "red",
      },
      {
        label: "FIREFIGHTERS AVAILABLE",
        value: availableFirefighters ?? "N/A",
        tone: "blue",
      },
      {
        label: "AVAILABLE VEHICLES",
        value: dashboard?.stats?.availableVehicles ?? "N/A",
        tone: "blue",
      },
      {
        label: "TODAY'S INCIDENTS",
        value: dashboard?.stats?.todaysIncidents ?? "N/A",
        tone: "neutral",
      },
    ],
    [availableFirefighters, criticalCount, dashboard, emergencies.length],
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-600 text-2xl font-bold text-white">
              EM
            </div>
            <h1 className="mt-4 text-[28px] font-bold text-slate-900">
              Fire Station Login
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              EMSTRAP Emergency Response System
            </p>
          </div>
          <form onSubmit={login} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {loginError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">
            Authorized Fire Station personnel only
          </p>
        </div>
      </div>
    );
  }

  if (loading && !dashboard)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-slate-600">
          Loading Fire Station Dashboard...
        </p>
      </div>
    );

  if (dashboardError && !dashboard)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-8">
          <h2 className="text-xl font-bold text-red-700">
            Fire Station Dashboard
          </h2>
          <p className="mt-3 text-sm text-slate-600">{dashboardError}</p>
          <button
            onClick={() => void loadDashboard(token)}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white">
              EM
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.18em] text-blue-600">
                EMSTRAP
              </div>
              <div className="text-xs text-slate-500">Emergency Response</div>
            </div>
          </div>
          <nav className="hidden items-center gap-2 xl:flex" aria-label="Fire Station sections">
            {[
              ["Dashboard", "dashboard"],
              ["Incidents", "incidents"],
              ["Fire Vehicles", "fire-vehicles"],
              ["Firefighters", "firefighters"],
              ["Live Map", "live-map"],
            ].map(([label, sectionId]) => (
              <button key={sectionId} type="button" onClick={() => scrollToSection(sectionId)} className="rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-200 hover:bg-slate-50">
                {label}
              </button>
            ))}
            <button type="button" disabled className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400">Reports unavailable</button>
            <button type="button" disabled className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400">Settings unavailable</button>
          </nav>
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-slate-500" />
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold text-slate-700">
                {dashboard?.station?.name || "Fire Station"}
              </div>
              <div className="text-[10px] text-slate-500">
                {dashboard?.station?.stationCode || "FIREFIGHTER"}
              </div>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main id="dashboard" className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Operations Overview
              </p>
              <h1 className="mt-2 text-2xl font-bold">
                Fire Station Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Live emergency monitoring and response coordination.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold">
                  {dashboard?.station?.status || "ACTIVE"}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {dashboard?.station?.address || "Station address unavailable"}
              </div>
            </div>
          </div>
        </section>
        {successMessage && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss success"
            >
              Close
            </button>
          </div>
        )}
        {dashboardError && dashboard && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {dashboardError}
          </div>
        )}
        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {kpis.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.tone === "red" ? "bg-red-50 text-red-600" : item.tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"}`}
                >
                  <Gauge size={16} />
                </span>
              </div>
              <div className="mt-4 text-3xl font-bold">{item.value}</div>
            </div>
          ))}
        </section>
        <section className="grid gap-6 xl:grid-cols-[1.8fr_0.9fr]">
          <div
            ref={mapSectionRef}
            id="live-map"
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold">Live Operations Map</h2>
                <p className="text-sm text-slate-500">
                  Only coordinates returned by the EMSTRAP backend are shown.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!mapCenter}
                  onClick={() => setMapFocus("active")}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  Center Map
                </button>
                <button
                  type="button"
                  disabled={!stationCenter}
                  onClick={() => setMapFocus("station")}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  My Station
                </button>
              </div>
            </div>
            <div className="h-[500px] w-full overflow-hidden">
              {mapCenter ? (
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <MapFocusController center={focusedCenter} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {coordinates.map((incident) => (
                    <CircleMarker
                      key={incident._id}
                      center={[
                        incident.location!.latitude!,
                        incident.location!.longitude!,
                      ]}
                      radius={8}
                      pathOptions={{
                        color: "#ef4444",
                        fillColor: "#ef4444",
                        fillOpacity: 0.8,
                      }}
                    >
                      <Popup>
                        {incident.disasterType || "Emergency"} ·{" "}
                        {incident.location?.address || "Address unavailable"}
                      </Popup>
                    </CircleMarker>
                  ))}
                  {vehicles
                    .filter((vehicle) =>
                      validCoordinates(vehicle.currentLocation),
                    )
                    .map((vehicle) => (
                      <CircleMarker
                        key={vehicle._id}
                        center={[
                          vehicle.currentLocation!.latitude!,
                          vehicle.currentLocation!.longitude!,
                        ]}
                        radius={7}
                        pathOptions={{
                          color: "#2563eb",
                          fillColor: "#2563eb",
                          fillOpacity: 0.8,
                        }}
                      >
                        <Popup>
                          {vehicle.vehicleNumber || "Vehicle"} ·{" "}
                          {vehicle.status || "Status unavailable"}
                        </Popup>
                      </CircleMarker>
                    ))}
                  {stationHasCoordinates && dashboard?.station?.location && (
                    <CircleMarker
                      center={[
                        dashboard.station.location.latitude!,
                        dashboard.station.location.longitude!,
                      ]}
                      radius={9}
                      pathOptions={{
                        color: "#1f2937",
                        fillColor: "#1f2937",
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup>{dashboard.station.name || "Fire Station"}</Popup>
                    </CircleMarker>
                  )}
                </MapContainer>
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-50 text-center text-sm text-slate-500">
                  Location unavailable.
                </div>
              )}
            </div>
          </div>
          <aside id="incidents" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <h2 className="text-lg font-bold">Active Incidents</h2>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
            <div className="space-y-3 p-3">
              {emergencies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No active emergencies.
                </div>
              ) : (
                emergencies.map((incident) => (
                  <button
                    key={incident._id}
                    onClick={() => setSelectedEmergency(incident)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-red-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-slate-900">
                        {incident._id || "Emergency ID unavailable"}
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
                        {incident.severity || "Severity unavailable"}
                      </span>
                    </div>
                    <div className="mt-2 font-semibold">
                      {incident.disasterType || "Disaster type unavailable"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {incident.location?.address || "Address unavailable"}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Status: {incident.status || "Status unavailable"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div id="fire-vehicles" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Fire Vehicles</h3>
              <span className="text-xs text-slate-500">
                {vehicles.length} registered
              </span>
            </div>
            {vehicles.length === 0 ? (
              <p className="text-sm text-slate-500">
                No fire vehicles registered for this station.
              </p>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">
                          {vehicle.vehicleNumber ||
                            "Vehicle number unavailable"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {vehicle.vehicleType || "Vehicle type unavailable"}
                        </div>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold">
                        {vehicle.status || "Status unavailable"}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Crew:{" "}
                      {vehicle.crew?.length
                        ? vehicle.crew
                            .map(
                              (member) =>
                                member.name || member.employeeId || "Assigned",
                            )
                            .join(", ")
                        : "Not assigned"}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {vehicle.status === "AVAILABLE" &&
                        selectedEmergencyId && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                              void dispatchVehicle(
                                vehicle._id || "",
                                selectedEmergencyId,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Truck size={14} /> Dispatch
                          </button>
                        )}
                      {vehicle.status === "DISPATCHED" && (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            void setVehicleStatus(
                              vehicle._id || "",
                              "AVAILABLE",
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                        >
                          Return to available
                        </button>
                      )}
                      {vehicle.status !== "DISPATCHED" && (
                        <button
                          type="button"
                          disabled={loading || vehicle.status === "MAINTENANCE"}
                          onClick={() =>
                            void setVehicleStatus(
                              vehicle._id || "",
                              "MAINTENANCE",
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                        >
                          Maintenance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Select an active incident above to dispatch an available vehicle.
            </p>
          </div>
          <div id="firefighters" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <div className="mt-4 space-y-4">
              {activity.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No recent emergency activity.
                </p>
              ) : (
                activity.map((item, index) => (
                  <div
                    key={item._id || `${item.createdAt}-${index}`}
                    className="flex gap-3"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                    <div>
                      <div className="text-xs font-semibold text-slate-500">
                        {formatTime(item.createdAt)}
                      </div>
                      <div className="mt-1 font-semibold text-slate-800">
                        {item.status || "Status unavailable"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {item.message || "No message"}
                        {item.updatedByType ? ` · ${item.updatedByType}` : ""}
                      </div>
                      {validCoordinates(item.location) && (
                        <div className="text-xs text-slate-400">
                          {item.location.latitude}, {item.location.longitude}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-bold">Firefighters</h3>
            <div className="mt-4 space-y-3">
              {dashboard?.firefighters?.length ? (
                dashboard.firefighters.map((firefighter) => (
                  <div
                    key={firefighter._id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div>
                      <div className="font-semibold">
                        {firefighter.name || "Name unavailable"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {firefighter.employeeId || "Employee ID unavailable"}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {firefighter.availability || "Availability unavailable"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No firefighters registered for this station.
                </p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-bold">Quick Actions</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
              >
                <Plus size={16} /> Create Incident unavailable
              </button>
              <button
                type="button"
                onClick={() => {
                  setMapFocus("active");
                  mapSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                <MapPinned size={16} /> View Live Map
              </button>
              {dashboard?.station?.contactNumber ? (
                <a
                  href={`tel:${dashboard.station.contactNumber}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <PhoneCall size={16} /> Contact Command
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
                >
                  <PhoneCall size={16} /> Contact unavailable
                </button>
              )}
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
              >
                <FileText size={16} /> Reports unavailable
              </button>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-500">
                <CircleDot size={14} className="text-emerald-500" /> Live
                backend data
              </span>
            </div>
          </div>
        </section>
      </main>

      {selectedEmergency && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Incident Details
                </div>
                <h3 className="mt-1 text-xl font-bold">
                  {selectedEmergency._id || "Emergency ID unavailable"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmergency(null)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-sm font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Type
                </div>
                <div className="mt-2 font-bold">
                  {selectedEmergency.disasterType || "Unavailable"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Severity
                </div>
                <div className="mt-2 font-bold">
                  {selectedEmergency.severity || "Unavailable"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Status
                </div>
                <div className="mt-2 font-bold">
                  {selectedEmergency.status || "Unavailable"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Created
                </div>
                <div className="mt-2 font-bold">
                  {formatTime(selectedEmergency.createdAt)}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Location
                </div>
                <div className="mt-2 font-bold">
                  {selectedEmergency.location?.address || "Address unavailable"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Assigned firefighter
                </div>
                <div className="mt-2 font-semibold">
                  {displayReference(selectedEmergency.assignedFirefighter)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Assigned team
                </div>
                <div className="mt-2 font-semibold">
                  {displayReference(selectedEmergency.assignedRescueTeam)}
                </div>
              </div>
            </div>
            {selectedEmergency.description && (
              <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {selectedEmergency.description}
              </div>
            )}
            {nextStatus && (
              <button
                disabled={loading}
                onClick={() => void updateStatus(selectedEmergency)}
                className="mt-5 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Updating..." : nextStatus.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FireStationPage;
