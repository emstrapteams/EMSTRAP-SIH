import React, { useEffect, useState } from "react";

type Emergency = {
  _id?: string;
  id?: string;
  disasterType?: string;
  severity?: string;
  status?: string;
  description?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
};

type DashboardResponse = {
  success?: boolean;
  data?: {
    emergencies?: Emergency[];
    activeEmergencies?: Emergency[];
    [key: string]: unknown;
  };
  emergencies?: Emergency[];
  activeEmergencies?: Emergency[];
};

const API_BASE = import.meta.env.VITE_API_URL;

const FireStationPage: React.FC = () => {
  const [token, setToken] = useState(
    () => localStorage.getItem("firefighter_token") || ""
  );
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [dashboardError, setDashboardError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_BASE}/disaster/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "FIREFIGHTER",
          identifier: employeeId.trim(),
          password,
        }),
      });

      const body = await response.json();

      if (!response.ok || !body?.token) {
        throw new Error(body?.message || "Invalid login credentials");
      }

      localStorage.setItem("firefighter_token", body.token);
      setToken(body.token);
      setPassword("");
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "Unable to sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (authToken: string) => {
    setLoading(true);
    setDashboardError("");

    try {
      const response = await fetch(
        `${API_BASE}/disaster/dashboard/fire-station`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const body = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("firefighter_token");
        setToken("");
        throw new Error("Session expired. Please sign in again.");
      }

      if (!response.ok) {
        throw new Error(
          body?.message || "Failed to load Fire Station dashboard"
        );
      }

      setDashboard(body);
    } catch (err) {
      setDashboardError(
        err instanceof Error ? err.message : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboard(token);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-xl bg-red-600 text-white flex items-center justify-center text-2xl font-bold">
              EM
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-4">
              Fire Station Login
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              EMSTRAP Emergency Response System
            </p>
          </div>

          <form onSubmit={login} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Employee ID
              </label>
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="FF-BLR-001"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Authorized Fire Station personnel only
          </p>
        </div>
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="font-semibold text-slate-600">
          Loading Fire Station Dashboard...
        </p>
      </div>
    );
  }

  if (dashboardError && !dashboard) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg w-full">
          <h2 className="text-xl font-bold text-red-700">
            Fire Station Dashboard
          </h2>
          <p className="text-sm text-slate-600 mt-3">{dashboardError}</p>
          <button
            onClick={() => loadDashboard(token)}
            className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const emergencies =
    dashboard?.data?.emergencies ||
    dashboard?.data?.activeEmergencies ||
    dashboard?.emergencies ||
    dashboard?.activeEmergencies ||
    [];

  const active = emergencies.filter(
    (incident) =>
      !["RESOLVED", "CLOSED"].includes(
        String(incident.status || "").toUpperCase()
      )
  );

  const critical = active.filter(
    (incident) =>
      String(incident.severity || "").toUpperCase() === "CRITICAL"
  );

  const logout = () => {
    localStorage.removeItem("firefighter_token");
    setToken("");
    setDashboard(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-600">
              EMSTRAP · EMERGENCY RESPONSE
            </p>
            <h1 className="text-2xl font-bold mt-1">
              Fire Station Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live disaster monitoring and response coordination
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-700">
                OPERATIONAL
              </span>
            </div>

            <button
              onClick={logout}
              className="text-sm font-semibold text-slate-600 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Active Incidents
            </p>
            <p className="text-3xl font-bold mt-2">{active.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Critical Incidents
            </p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {critical.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Assigned Emergencies
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {emergencies.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase font-semibold">
              System
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-3">
              LIVE
            </p>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold">Live Operations</h2>
            <p className="text-sm text-slate-500">
              Emergencies associated with your fire station
            </p>
          </div>

          {emergencies.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold">
                No active emergencies assigned to this station.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {emergencies.map((incident, index) => (
                <div
                  key={incident._id || incident.id || `incident-${index}`}
                  className="p-5 flex flex-col md:flex-row md:justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">
                        {incident.disasterType || "Emergency Incident"}
                      </h3>

                      <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">
                        {incident.severity || "UNKNOWN"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      {incident.location?.address ||
                        "Location coordinates available"}
                    </p>

                    {incident.description && (
                      <p className="text-sm text-slate-600 mt-2">
                        {incident.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase">
                      Status
                    </p>
                    <p className="font-bold text-blue-700 mt-1">
                      {incident.status || "PENDING"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FireStationPage;
