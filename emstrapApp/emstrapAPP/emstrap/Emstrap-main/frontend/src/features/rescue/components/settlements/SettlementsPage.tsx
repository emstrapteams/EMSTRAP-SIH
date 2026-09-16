import React, { useState } from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  Search,
  Filter,
  MapPin,
  Send,
  Home,
  ShieldAlert,
} from 'lucide-react';
import { Settlement, EvacuationStatus } from '../../types';

export const SettlementsPage: React.FC = () => {
  const { settlements, updateSettlementEvacuation, focusOnMapTarget, broadcastAlert } =
    useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [evacFilter, setEvacFilter] = useState<string>('ALL');
  const [evacModalSettlement, setEvacModalSettlement] = useState<Settlement | null>(null);

  const filteredSettlements = settlements.filter((s) => {
    if (riskFilter !== 'ALL' && s.riskLevel !== riskFilter) return false;
    if (evacFilter !== 'ALL' && s.evacuationStatus !== evacFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.wardNumber.toLowerCase().includes(q) ||
        s.nearestShelterName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleIssueEvacuationOrder = (settlement: Settlement) => {
    updateSettlementEvacuation(settlement.id, 'Evacuating');
    broadcastAlert({
      type: `Mandatory Evacuation: ${settlement.name}`,
      severity: 'CRITICAL',
      location: `${settlement.name} (${settlement.wardNumber})`,
      description: `Immediate mandatory evacuation ordered for ${settlement.name}. Water depth has reached ${settlement.waterDepth}m. Proceed to ${settlement.nearestShelterName}.`,
      source: 'District Collector Evacuation Order',
      waterLevel: settlement.waterDepth,
      affectedSettlementsCount: 1,
      recommendedAction: `Relocate all families to ${settlement.nearestShelterName}. NDRF bus transport dispatched.`,
      coordinates: [settlement.latitude, settlement.longitude],
    });
    setEvacModalSettlement(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Vulnerable Settlement Matrix
            </span>
            <span className="text-xs text-slate-500">
              {settlements.length} Wards & Low-lying Neighborhoods Monitored
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Monitored Settlements & Inundation Risk
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Ward-level population vulnerabilities, water depth projections, shelter linkage, and automated evacuation orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px]">Total At-Risk Population</span>
            <span className="text-red-600 font-bold font-mono text-sm">
              {settlements.reduce((acc, s) => acc + s.affectedPopulation, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ward number, settlement name, shelter..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={evacFilter}
            onChange={(e) => setEvacFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Evacuation States</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Evacuated">Evacuated</option>
            <option value="Shelter Bound">Shelter Bound</option>
          </select>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
                <th className="py-3 px-4">Settlement & Ward</th>
                <th className="py-3 px-4 text-right">Total Pop</th>
                <th className="py-3 px-4 text-right">Affected Pop</th>
                <th className="py-3 px-4 text-right">Water Depth</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Evacuation Status</th>
                <th className="py-3 px-4">Designated Shelter</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSettlements.map((settlement) => {
                const isCritical = settlement.riskLevel === 'Critical';
                const isHigh = settlement.riskLevel === 'High';
                const isModerate = settlement.riskLevel === 'Moderate';

                let riskBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isCritical) riskBadge = 'bg-red-50 text-red-700 border-red-200';
                else if (isHigh) riskBadge = 'bg-orange-50 text-orange-700 border-orange-200';
                else if (isModerate) riskBadge = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr key={settlement.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{settlement.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {settlement.wardNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {settlement.population.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-red-600">
                      {settlement.affectedPopulation.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                      {settlement.waterDepth > 0 ? `${settlement.waterDepth.toFixed(2)} m` : 'Dry'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${riskBadge}`}
                      >
                        {settlement.riskLevel}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={settlement.evacuationStatus}
                        onChange={(e) =>
                          updateSettlementEvacuation(settlement.id, e.target.value as EvacuationStatus)
                        }
                        className={`text-[10px] font-bold px-2 py-1 rounded border uppercase cursor-pointer ${
                          settlement.evacuationStatus === 'Evacuated'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : settlement.evacuationStatus === 'Evacuating'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : settlement.evacuationStatus === 'Advisory Issued'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Normal" className="bg-white text-slate-900">Normal</option>
                        <option value="Advisory Issued" className="bg-white text-slate-900">Advisory Issued</option>
                        <option value="Evacuating" className="bg-white text-slate-900">Evacuating</option>
                        <option value="Evacuated" className="bg-white text-slate-900">Evacuated</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <Home className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate max-w-[160px]">{settlement.nearestShelterName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() =>
                            focusOnMapTarget({
                              id: settlement.id,
                              type: 'settlement',
                              title: settlement.name,
                              coordinates: [settlement.latitude, settlement.longitude],
                              zoom: 16,
                            })
                          }
                          className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-slate-100 transition-colors"
                          title="View on Map"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEvacModalSettlement(settlement)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                          title="Broadcast Evacuation Order"
                        >
                          <Send className="w-3 h-3" /> Evacuate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evacuation Confirmation Modal */}
      {evacModalSettlement && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-red-200 rounded-lg p-5 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Issue Mandatory Evacuation Order</h3>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              You are about to issue a formal District Disaster Management Evacuation order for{' '}
              <strong className="text-slate-900">{evacModalSettlement.name}</strong> ({evacModalSettlement.wardNumber}).
            </p>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1.5 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Water Depth:</span>
                <span className="font-mono text-blue-700 font-bold">{evacModalSettlement.waterDepth} meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">At-Risk Citizens:</span>
                <span className="font-mono text-red-600 font-bold">{evacModalSettlement.affectedPopulation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Relocation Shelter:</span>
                <span className="text-emerald-700 font-semibold">{evacModalSettlement.nearestShelterName}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEvacModalSettlement(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleIssueEvacuationOrder(evacModalSettlement)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Broadcast & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
