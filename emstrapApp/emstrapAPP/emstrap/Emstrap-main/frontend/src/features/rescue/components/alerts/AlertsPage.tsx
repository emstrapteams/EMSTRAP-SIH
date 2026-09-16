import React, { useState } from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  BellRing,
  MapPin,
  CheckCircle2,
  Users,
  Search,
  Filter,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    resolveAlert,
    focusOnMapTarget,
  } = useDisaster();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assignTeamModal, setAssignTeamModal] = useState<{ alertId: string; title: string } | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('SDRF Water Rescue Taskforce Alpha');

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.type.toLowerCase().includes(q) ||
        alert.location.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q) ||
        alert.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAssignTeam = () => {
    if (!assignTeamModal) return;
    acknowledgeAlert(assignTeamModal.alertId);
    setAssignTeamModal(null);
  };

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Operational Warning Feed
            </span>
            <span className="text-xs text-slate-500">Auto-Generated & Telemetry Triggers</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Alert & Warning Management</h1>
          <p className="text-xs text-slate-600 mt-1">
            Automated sensor warnings, river flood condition triggers, and dispatch tracking for district response teams.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {activeCount} Active
          </div>
          <div className="px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            {acknowledgedCount} Acknowledged
          </div>
          <div className="px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            {resolvedCount} Resolved
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by ID, location, keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center bg-white rounded-lg border border-dashed border-slate-200">
            <BellRing className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">No alerts found matching your criteria.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';

            if (isCritical) {
              badgeStyle = 'bg-red-50 text-red-700 border-red-200';
            } else if (isHigh) {
              badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
            }

            return (
              <div
                key={alert.id}
                className="p-4.5 rounded-lg border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  {/* Top line: ID, Severity, Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {alert.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeStyle}`}>
                        {alert.severity}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        alert.status === 'ACTIVE'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{alert.type}</h3>
                  <div className="flex items-center gap-1 text-xs text-blue-700 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{alert.location}</span>
                    <span className="text-slate-300 mx-1">•</span>
                    <span className="text-slate-500 font-mono">{alert.time}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {alert.description}
                  </p>

                  {/* Telemetry info if available */}
                  {(alert.waterLevel || alert.dangerLevel) && (
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs mb-3">
                      {alert.waterLevel && (
                        <div>
                          <span className="text-[10px] text-slate-500 block">Water Level</span>
                          <strong className="text-blue-700 font-mono font-semibold">{alert.waterLevel} m</strong>
                        </div>
                      )}
                      {alert.dangerLevel && (
                        <div>
                          <span className="text-[10px] text-slate-500 block">Danger Level</span>
                          <strong className="text-red-600 font-mono font-semibold">{alert.dangerLevel} m</strong>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-slate-500 block">Affected Wards</span>
                        <strong className="text-amber-700 font-mono font-semibold">{alert.affectedSettlementsCount} Wards</strong>
                      </div>
                    </div>
                  )}

                  {alert.recommendedAction && (
                    <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 text-[11px] text-slate-700 mb-3">
                      <strong className="text-slate-800 block mb-0.5">Recommended Action:</strong>
                      <span>{alert.recommendedAction}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 flex items-center justify-between mb-4">
                    <span>Source: {alert.source}</span>
                    {alert.acknowledgedBy && (
                      <span className="text-slate-600">Ack: {alert.acknowledgedBy}</span>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  {alert.coordinates && (
                    <button
                      onClick={() =>
                        focusOnMapTarget({
                          id: alert.id,
                          type: 'riskZone',
                          title: alert.type,
                          coordinates: alert.coordinates!,
                          zoom: 15,
                        })
                      }
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>View on Map</span>
                    </button>
                  )}

                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setAssignTeamModal({ alertId: alert.id, title: alert.type })}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Assign Team</span>
                    </button>
                  )}

                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md flex items-center gap-1 transition-colors ml-auto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Team Modal */}
      {assignTeamModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Dispatch Response Battalion</h3>
            <p className="text-xs text-slate-600 mb-4">
              Assign field team to alert: <strong className="text-slate-900">{assignTeamModal.title}</strong>
            </p>

            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Response Task Force</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 mb-4 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="NDRF 10th Battalion Rescue Task Force">NDRF 10th Battalion Rescue Task Force</option>
              <option value="SDRF Water Rescue Taskforce Alpha">SDRF Water Rescue Taskforce Alpha</option>
              <option value="District Medical Emergency ALS Unit">District Medical Emergency ALS Unit</option>
              <option value="Irrigation Embankment Rapid Repair Squad">Irrigation Embankment Rapid Repair Squad</option>
              <option value="Municipal Civil Defense Evacuation Team">Municipal Civil Defense Evacuation Team</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignTeamModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md bg-slate-100 hover:bg-slate-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeam}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
