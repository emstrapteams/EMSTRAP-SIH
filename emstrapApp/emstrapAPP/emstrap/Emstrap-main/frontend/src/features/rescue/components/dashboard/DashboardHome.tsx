import React from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  BellRing,
  AlertTriangle,
  Users,
  Home,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Map as MapIcon,
  PlusCircle,
} from 'lucide-react';
import { DisasterMap } from '../map/DisasterMap';

export const DashboardHome: React.FC = () => {
  const {
    kpis,
    alerts,
    incidents,
    gaugingStations,
    safePlaces,
    settlements,
    setActiveTab,
    acknowledgeAlert,
    focusOnMapTarget,
  } = useDisaster();

  const { usingLiveData, dashboardLoading, dashboardError, dashboardStats, currentEmergency, activeEmergencies } = useDisaster();

  // If we are using live data and loading, show loading.
  if (usingLiveData && dashboardLoading) {
    return <div className="p-6 text-center text-sm text-slate-600">Loading live dashboard...</div>;
  }

  // If live dashboard is enabled but has an error
  if (usingLiveData && dashboardError) {
    return (
      <div className="p-6 text-center text-sm text-red-600">Live dashboard unavailable: {dashboardError}</div>
    );
  }

  // If not using live data, clearly indicate demo mode or connection issues.
  if (!usingLiveData && dashboardError) {
    return (
      <div className="p-6 text-center text-sm text-red-600">
        Live data unavailable: {dashboardError}. Showing DEMO data (not live).
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed');

  // If live data present and backend provides currentEmergency/activeEmergencies, prefer those
  const displayCurrentEmergency = usingLiveData && currentEmergency ? currentEmergency : null;
  const displayActiveEmergencies = usingLiveData && activeEmergencies && activeEmergencies.length ? activeEmergencies : activeIncidents;

  return (
    <div className="space-y-6 pb-10">
      {/* Operational Header / Command Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Krishna River Basin • Vijayawada Zone
            </span>
            <span className="text-[11px] font-mono text-slate-500">Prakasam Barrage Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Disaster Management Operational Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time multi-agency situational awareness, hydrological telemetry, inundation GIS modeling, and shelter logistics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('Live Map')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <MapIcon className="w-4 h-4" />
            <span>Open Live GIS Map</span>
          </button>
          <button
            onClick={() => setActiveTab('Safe Places')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Shelter</span>
          </button>
          <button
            onClick={() => setActiveTab('Incidents')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>+ Log Incident</span>
          </button>
        </div>
      </div>

      {/* TOP 6 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Active Alerts */}
        <div
          onClick={() => setActiveTab('Alerts')}
          className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs hover:border-red-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Active Alerts</span>
            <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-red-600 transition-colors">
            {kpis.activeAlertsCount.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="text-red-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +3 this hour
            </span>
            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-semibold text-[9px] uppercase tracking-wider">
              CRITICAL
            </span>
          </div>
        </div>

        {/* Card 2: Critical Incidents */}
        <div
          onClick={() => setActiveTab('Incidents')}
          className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs hover:border-amber-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Critical Incidents</span>
            <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-amber-600 transition-colors">
            {kpis.criticalIncidentsCount.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span>{activeIncidents.length} active logs</span>
            <span className="text-amber-700 font-semibold font-mono">2 unresolved</span>
          </div>
        </div>

        {/* Card 3: Affected Settlements */}
        <div
          onClick={() => setActiveTab('Settlements')}
          className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Affected Settlements</span>
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-blue-600 transition-colors">
            {settlements.filter((s) => s.waterDepth > 0.5).length.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span className="text-blue-600 font-medium">+6 today</span>
            <span>Wards 21, 22, 28</span>
          </div>
        </div>

        {/* Card 4: Safe Shelters */}
        <div
          onClick={() => setActiveTab('Safe Places')}
          className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs hover:border-emerald-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Safe Shelters</span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-emerald-600 transition-colors">
            {kpis.totalSheltersCount.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span className="text-emerald-700 font-semibold">{kpis.availableSheltersCount} available</span>
            <span>{Math.round((kpis.currentShelterOccupancy / kpis.totalShelterCapacity) * 100)}% filled</span>
          </div>
        </div>

        {/* Card 5: Gauging Stations */}
        <div
          onClick={() => setActiveTab('Gauging Stations')}
          className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Gauging Stations</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-blue-600 transition-colors">
            {kpis.gaugingStationsCount.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span className="text-red-600 font-semibold">{kpis.dangerStationsCount} at Danger</span>
            <span className="text-slate-600 font-mono">17.2m Peak</span>
          </div>
        </div>

        {/* Card 6: People at Risk */}
        <div
          onClick={() => setActiveTab('Risk Analysis')}
          className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs hover:border-purple-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">People at Risk</span>
            <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-purple-600 transition-colors">
            {kpis.totalPeopleAtRisk.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span className="text-amber-700 font-semibold">18,400 evacuated</span>
            <span>Krishnalanka</span>
          </div>
        </div>
      </div>

      {/* Main Dual Grid: GIS Live Map + Operational Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Interactive GIS Disaster Map */}
        <div className="lg:col-span-8 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-blue-600" />
                Live GIS Inundation & Incident Map
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 rounded border border-emerald-200 font-medium">
                ACTIVE TELEMETRY
              </span>
            </div>
            <button
              onClick={() => setActiveTab('Live Map')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
            >
              Full Command View <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-[520px] rounded-lg overflow-hidden border border-slate-200 shadow-xs relative bg-white">
            <DisasterMap />
          </div>
        </div>

        {/* Right 4 Cols: Real-Time Gauges & Critical Alerts */}
        <div className="lg:col-span-4 space-y-4">
          {/* Krishna Basin Gauging Stations Quick Feeds */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">River Gauging Stations</h3>
              </div>
              <button
                onClick={() => setActiveTab('Gauging Stations')}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                All Stations
              </button>
            </div>

            <div className="space-y-2.5">
              {gaugingStations.slice(0, 3).map((station) => {
                const isDanger = station.status === 'DANGER';
                const isWarning = station.status === 'WARNING';
                const statusColor = isDanger
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : isWarning
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200';

                return (
                  <div
                    key={station.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-md hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                          {station.name.replace('Krishna River Gauge ', 'Gauge ')}
                        </h4>
                        <span className="text-[10px] text-slate-500">{station.location}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${statusColor}`}>
                        {station.status}
                      </span>
                    </div>

                    {/* Water Level Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-600">Level: <strong className="text-slate-900 text-xs">{station.waterLevel.toFixed(1)}m</strong></span>
                        <span className="text-red-600 font-semibold">Danger: {station.dangerLevel}m</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isDanger ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${Math.min(100, (station.waterLevel / station.dangerLevel) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Flow: {station.flowRate.toLocaleString()} cusecs</span>
                      <button
                        onClick={() =>
                          focusOnMapTarget({
                            id: station.id,
                            type: 'station',
                            title: station.name,
                            coordinates: [station.latitude, station.longitude],
                          })
                        }
                        className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                      >
                        Locate on Map
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Alerts Stream */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Active Alerts Feed</h3>
              </div>
              <button
                onClick={() => setActiveTab('Alerts')}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                Manage ({alerts.length})
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activeAlerts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No active alerts at this time.</div>
              ) : (
                activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-red-50/50 border border-red-100 rounded-md text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-800 text-[11px]">{alert.type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] line-clamp-2 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-red-100">
                      <span className="text-[10px] text-slate-500 truncate max-w-[140px]">{alert.location}</span>
                      <div className="flex items-center gap-2">
                        {alert.coordinates && (
                          <button
                            onClick={() =>
                              focusOnMapTarget({
                                id: alert.id,
                                type: 'riskZone',
                                title: alert.type,
                                coordinates: alert.coordinates!,
                              })
                            }
                            className="text-[10px] text-blue-600 hover:underline font-medium"
                          >
                            Map
                          </button>
                        )}
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-[10px] text-emerald-700 hover:underline font-semibold"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Shelter Capacity Status & Critical Incident Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Shelter Capacity Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Evacuation Shelters & Relief Camps
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('Safe Places')}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage Shelters
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 mb-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 text-[11px]">Total Capacity:</span>
              <div className="text-lg font-bold text-slate-900 font-mono">{kpis.totalShelterCapacity.toLocaleString()} beds</div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Occupied:</span>
              <div className="text-lg font-bold text-amber-700 font-mono">{kpis.currentShelterOccupancy.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Vacant Spots:</span>
              <div className="text-lg font-bold text-emerald-700 font-mono">
                {(kpis.totalShelterCapacity - kpis.currentShelterOccupancy).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {safePlaces.slice(0, 3).map((shelter) => (
              <div
                key={shelter.id}
                className="flex items-center justify-between p-2.5 rounded-md bg-white border border-slate-200 text-xs"
              >
                <div className="truncate max-w-[200px]">
                  <h4 className="font-semibold text-slate-800 truncate">{shelter.name}</h4>
                  <span className="text-[10px] text-slate-500">{shelter.type} • {shelter.facilities.slice(0, 3).join(', ')}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono text-emerald-700 font-bold">
                    {shelter.capacity - shelter.occupancy} available
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{shelter.occupancy}/{shelter.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Emergency Incidents */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Active Field Emergency Incidents
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('Incidents')}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Incidents
            </button>
          </div>

          <div className="space-y-2.5">
            {activeIncidents.slice(0, 3).map((incident) => (
              <div
                key={incident.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate max-w-[220px]">{incident.title}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      incident.severity === 'CRITICAL'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {incident.severity}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-1">{incident.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Assigned: <strong className="text-slate-700">{incident.assignedTeam}</strong></span>
                  <button
                    onClick={() =>
                      focusOnMapTarget({
                        id: incident.id,
                        type: 'incident',
                        title: incident.title,
                        coordinates: [incident.latitude, incident.longitude],
                      })
                    }
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Focus Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
