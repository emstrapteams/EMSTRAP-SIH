import React, { useState } from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  AlertTriangle,
  Plus,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Incident, IncidentType, SeverityLevel, IncidentStatus } from '../../types';

const INCIDENT_TYPES: IncidentType[] = [
  'Flood',
  'Landslide',
  'Fire',
  'Earthquake',
  'Storm',
  'Road Blockage',
  'Building Damage',
  'Medical Emergency',
  'Other',
];

const INCIDENT_STATUSES: IncidentStatus[] = [
  'Reported',
  'Under Investigation',
  'Response Active',
  'Resolved',
  'Closed',
];

export const IncidentsPage: React.FC = () => {
  const { incidents, addIncident, updateIncidentStatus, focusOnMapTarget } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form
  const [formData, setFormData] = useState<Omit<Incident, 'id' | 'dateTime' | 'timestamp'>>({
    type: 'Flood',
    title: '',
    description: '',
    location: '',
    latitude: 16.5050,
    longitude: 80.6400,
    severity: 'CRITICAL',
    reportedBy: 'Field Response Officer',
    affectedPeople: 50,
    requiredResources: ['Rescue Boats', 'Sandbags', 'First Aid'],
    assignedTeam: 'SDRF Quick Response Unit',
    status: 'Reported',
  });

  const [resourceInput, setResourceInput] = useState('');

  const filteredIncidents = incidents.filter((inc) => {
    if (typeFilter !== 'ALL' && inc.type !== typeFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.assignedTeam.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddResourceTag = () => {
    if (resourceInput.trim() && !formData.requiredResources.includes(resourceInput.trim())) {
      setFormData({
        ...formData,
        requiredResources: [...formData.requiredResources, resourceInput.trim()],
      });
      setResourceInput('');
    }
  };

  const handleRemoveResourceTag = (tag: string) => {
    setFormData({
      ...formData,
      requiredResources: formData.requiredResources.filter((r) => r !== tag),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIncident(formData);
    setIsAddModalOpen(false);
    setFormData({
      type: 'Flood',
      title: '',
      description: '',
      location: '',
      latitude: 16.5050,
      longitude: 80.6400,
      severity: 'CRITICAL',
      reportedBy: 'Field Response Officer',
      affectedPeople: 50,
      requiredResources: ['Rescue Boats', 'Sandbags'],
      assignedTeam: 'SDRF Quick Response Unit',
      status: 'Reported',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Operations & Incident Command
            </span>
            <span className="text-xs text-slate-500">Total Logged: {incidents.length} incidents</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Emergency Incident Management</h1>
          <p className="text-xs text-slate-600 mt-1">
            Dispatch rescue teams, track embankment breaches, manage building damage, and record field responses.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log New Incident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident title, location, team..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Types</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

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
            {INCIDENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center bg-white rounded-lg border border-dashed border-slate-200">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">No incidents found matching criteria.</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isCritical = incident.severity === 'CRITICAL';
            const isHigh = incident.severity === 'HIGH';

            let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
            if (isCritical) {
              badgeStyle = 'bg-red-50 text-red-700 border-red-200';
            } else if (isHigh) {
              badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
            }

            return (
              <div
                key={incident.id}
                className="p-4.5 rounded-lg border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {incident.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeStyle}`}>
                        {incident.severity}
                      </span>
                      <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                        {incident.type}
                      </span>
                    </div>

                    {/* Status dropdown */}
                    <select
                      value={incident.status}
                      onChange={(e) => updateIncidentStatus(incident.id, e.target.value as IncidentStatus)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase cursor-pointer ${
                        incident.status === 'Resolved' || incident.status === 'Closed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {INCIDENT_STATUSES.map((st) => (
                        <option key={st} value={st} className="bg-white text-slate-800">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{incident.title}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-blue-700 mb-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{incident.location}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">{incident.dateTime}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {incident.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-md border border-slate-200 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Affected Persons</span>
                      <strong className="text-slate-800 font-mono font-semibold">{incident.affectedPeople.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Assigned Team</span>
                      <strong className="text-blue-700 truncate block font-medium">{incident.assignedTeam}</strong>
                    </div>
                  </div>

                  {incident.requiredResources.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] text-slate-500 block mb-1 font-medium">Required Resources:</span>
                      <div className="flex flex-wrap gap-1">
                        {incident.requiredResources.map((res) => (
                          <span
                            key={res}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 mb-3">
                    Reported by: <span className="text-slate-700 font-medium">{incident.reportedBy}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() =>
                      focusOnMapTarget({
                        id: incident.id,
                        type: 'incident',
                        title: incident.title,
                        coordinates: [incident.latitude, incident.longitude],
                        zoom: 16,
                      })
                    }
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>View on Map</span>
                  </button>

                  {incident.status !== 'Resolved' && (
                    <button
                      onClick={() => updateIncidentStatus(incident.id, 'Resolved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Incident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Log Emergency Incident
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Incident Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as IncidentType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Severity</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: lvl })}
                        className={`py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                          formData.severity === lvl
                            ? lvl === 'CRITICAL'
                              ? 'bg-red-600 text-white border-red-700'
                              : lvl === 'HIGH'
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-blue-600 text-white border-blue-700'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Breached Earthen Bund at Low-lying Ramalingeswara Nagar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location Details</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Ward 28, Bund Chainage 4.2 km"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Affected People</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.affectedPeople}
                    onChange={(e) => setFormData({ ...formData, affectedPeople: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reported By</label>
                  <input
                    type="text"
                    required
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Response Team</label>
                  <input
                    type="text"
                    required
                    value={formData.assignedTeam}
                    onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description & Field Observations</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details of water level, structural damage, trapped residents..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Required Emergency Resources</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={resourceInput}
                    onChange={(e) => setResourceInput(e.target.value)}
                    placeholder="e.g. Inflatable Boats, Sandbags, Ambulances..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddResourceTag}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold border border-slate-200 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.requiredResources.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 text-xs"
                    >
                      {tag}
                      <button type="button" onClick={() => handleRemoveResourceTag(tag)}>
                        <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md shadow-xs transition-colors"
                >
                  Create Incident & Alert Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
