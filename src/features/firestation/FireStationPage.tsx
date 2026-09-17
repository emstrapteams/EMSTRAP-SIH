import React, { useEffect, useState } from 'react';

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
  createdAt?: string;
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

const FireStationPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('disaster_token') ||
        localStorage.getItem('rescue_token') ||
        localStorage.getItem('token');

      if (!token) {
        throw new Error('No responder login token found.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/disaster/dashboard/fire-station`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.message || 'Failed to load Fire Station dashboard');
      }

      setDashboard(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const emergencies =
    dashboard?.data?.emergencies ||
    dashboard?.data?.activeEmergencies ||
    dashboard?.emergencies ||
    dashboard?.activeEmergencies ||
    [];

  const activeIncidents = emergencies.filter(
    (incident) =>
      !['RESOLVED', 'CLOSED'].includes(
        String(incident.status || '').toUpperCase()
      )
  );

  const criticalIncidents = activeIncidents.filter(
    (incident) =>
      String(incident.severity || '').toUpperCase() === 'CRITICAL'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-8 py-6">
          <p className="font-semibold text-slate-700">
            Loading Fire Station Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-lg w-full">
          <h2 className="text-xl font-bold text-red-700">
            Fire Station Dashboard
          </h2>
          <p className="text-sm text-slate-600 mt-3">{error}</p>

          <button
            onClick={loadDashboard}
            className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-blue-600">
              EMSTRAP · EMERGENCY RESPONSE
            </p>
            <h1 className="text-2xl font-bold mt-1">
              Fire Station Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live emergency monitoring and response coordination
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">
              OPERATIONAL
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Active Incidents
            </p>
            <p className="text-3xl font-bold mt-2">
              {activeIncidents.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Critical Incidents
            </p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {criticalIncidents.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Assigned Emergencies
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {emergencies.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Connection
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-3">
              LIVE
            </p>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold">Live Operations</h2>
            <p className="text-sm text-slate-500">
              Emergencies associated with this fire station
            </p>
          </div>

          {emergencies.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-slate-600">
                No active emergencies
              </p>
              <p className="text-sm text-slate-400 mt-1">
                The station has no currently assigned incidents.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {emergencies.map((incident, index) => {
                const incidentId =
                  incident._id || incident.id || `incident-${index}`;

                const critical =
                  String(incident.severity || '').toUpperCase() === 'CRITICAL';

                return (
                  <div
                    key={incidentId}
                    className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">
                          {incident.disasterType || 'Emergency Incident'}
                        </h3>

                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            critical
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {incident.severity || 'UNKNOWN'}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        {incident.location?.address ||
                          'Location coordinates available'}
                      </p>

                      {incident.description && (
                        <p className="text-sm text-slate-600 mt-2">
                          {incident.description}
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                        Status
                      </p>
                      <p className="font-semibold text-blue-700 mt-1">
                        {incident.status || 'PENDING'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FireStationPage;
