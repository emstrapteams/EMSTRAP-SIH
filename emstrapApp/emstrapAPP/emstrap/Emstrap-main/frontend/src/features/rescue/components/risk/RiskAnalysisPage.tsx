import React from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  MapPin,
} from 'lucide-react';

export const RiskAnalysisPage: React.FC = () => {
  const { riskZones, focusOnMapTarget, setActiveTab } = useDisaster();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              Hydrological Inundation Risk Modeling
            </span>
            <span className="text-xs text-slate-500">Prakasam Barrage Inflow Calibration</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Disaster Risk & Vulnerability Zones</h1>
          <p className="text-xs text-slate-600 mt-1">
            Categorized risk perimeters based on terrain elevation, water depth contours, embankment integrity, and population density.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('Live Map')}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span>View Risk Polygons on GIS Map</span>
        </button>
      </div>

      {/* Risk Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {riskZones.map((zone) => {
          const isHigh = zone.level === 'High';

          return (
            <div
              key={zone.id}
              className={`p-5 rounded-lg border flex flex-col justify-between bg-white shadow-xs ${
                isHigh
                  ? 'border-red-200'
                  : 'border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                      isHigh
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {zone.level} Risk ({zone.depthRange})
                  </span>

                  <span className="text-xs font-mono text-slate-500">Area: {zone.affectedAreaSqKm} sq km</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{zone.name}</h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Terrain elevation modeling indicates floodwaters between {zone.depthRange}. Embankments and drainage channels are operating at peak hydrological capacity.
                </p>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Water Depth Range</span>
                    <strong className={isHigh ? 'text-red-600 font-bold text-sm' : 'text-amber-700 font-bold text-sm'}>
                      {zone.depthRange} ({zone.estimatedWaterDepth}m peak)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Population in Zone</span>
                    <strong className="text-slate-800 font-mono text-sm font-semibold">{zone.affectedPopulation.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="space-y-3 text-xs mb-4">
                  <div>
                    <span className="text-slate-600 block font-medium mb-1.5">Intersecting Settlements / Wards:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.nearbySettlements.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-600 block font-medium mb-1.5">Assigned Relief Shelters:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.nearestSafePlaces.map((sh) => (
                        <span
                          key={sh}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium"
                        >
                          {sh}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">Updated: {zone.lastUpdated}</span>
                <button
                  onClick={() =>
                    focusOnMapTarget({
                      id: zone.id,
                      type: 'riskZone',
                      title: zone.name,
                      coordinates: zone.coordinates[0] || [16.4950, 80.6400],
                      zoom: 14,
                    })
                  }
                  className={`px-3 py-1.5 font-semibold rounded-md text-xs flex items-center gap-1.5 shadow-xs transition-colors ${
                    isHigh
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Inspect Risk Contour on Map</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
