import React, { useState } from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  Truck,
  LifeBuoy,
  HeartPulse,
  Package,
  Droplets,
  Search,
  Send,
  MapPin,
  X,
  User,
} from 'lucide-react';
import { EmergencyResource } from '../../types';

export const EmergencyResourcesPage: React.FC = () => {
  const { resources, deployResource, incidents, settlements } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [deployModalResource, setDeployModalResource] = useState<EmergencyResource | null>(null);
  const [deployLocation, setDeployLocation] = useState(settlements[0]?.name || 'Krishnalanka Ward 21');
  const [deployQty, setDeployQty] = useState(5);

  const filteredResources = resources.filter((res) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.resource.toLowerCase().includes(q) ||
        res.category.toLowerCase().includes(q) ||
        res.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployModalResource) return;
    deployResource(deployModalResource.id, deployQty, deployLocation);
    setDeployModalResource(null);
  };

  const getResourceIcon = (cat: string) => {
    switch (cat) {
      case 'Boat':
        return <LifeBuoy className="w-5 h-5 text-blue-600" />;
      case 'Medical Team':
      case 'Ambulance':
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'Food Supplies':
        return <Package className="w-5 h-5 text-amber-600" />;
      case 'Water Supplies':
        return <Droplets className="w-5 h-5 text-sky-600" />;
      default:
        return <Truck className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              State Disaster Relief Stockpile & Logistics
            </span>
            <span className="text-xs text-slate-500">
              {resources.reduce((acc, r) => acc + r.quantity, 0).toLocaleString()} Total Units in Fleet
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Emergency Resource Allocation & Deployment
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Mobilize zodiac rescue boats, dewatering pumps, medical trauma units, potable water tankers, and ration packets.
          </p>
        </div>
      </div>

      {/* Quick Search */}
      <div className="flex items-center bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emergency assets (boats, sandbags, pumps, rations)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const deployedCount = res.quantity - res.available;
          const percentDeployed = Math.round((deployedCount / res.quantity) * 100);

          return (
            <div
              key={res.id}
              className="p-4.5 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
                      {getResourceIcon(res.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{res.resource}</h3>
                      <span className="text-[10px] text-slate-500">{res.category}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      res.status === 'Dispatched' || res.status === 'Busy'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-slate-50 rounded-md border border-slate-200 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total</span>
                    <strong className="text-slate-800 font-mono font-semibold">{res.quantity}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Deployed</span>
                    <strong className="text-amber-700 font-mono font-semibold">{deployedCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Available</span>
                    <strong className="text-emerald-700 font-mono font-semibold">{res.available}</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Deployment Utilization</span>
                    <span className="font-medium">{percentDeployed}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${percentDeployed}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Base: {res.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{res.contactPerson} ({res.contactPhone})</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  disabled={res.available <= 0}
                  onClick={() => {
                    setDeployModalResource(res);
                    setDeployQty(Math.min(res.available, 5));
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-white font-semibold rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Deploy to Field
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deployment Modal */}
      {deployModalResource && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                Deploy {deployModalResource.resource}
              </h3>
              <button
                onClick={() => setDeployModalResource(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeploySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quantity to Dispatch (Max: {deployModalResource.available})
                </label>
                <input
                  type="number"
                  min="1"
                  max={deployModalResource.available}
                  required
                  value={deployQty}
                  onChange={(e) => setDeployQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Ward / Incident Site</label>
                <select
                  value={deployLocation}
                  onChange={(e) => setDeployLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                >
                  {settlements.map((s) => (
                    <option key={s.id} value={`${s.name} (${s.wardNumber})`}>
                      {s.name} ({s.wardNumber}) - Risk: {s.riskLevel}
                    </option>
                  ))}
                  {incidents.map((i) => (
                    <option key={i.id} value={`Incident: ${i.title}`}>
                      [Incident] {i.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeployModalResource(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-xs transition-colors"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
