import React, { useState } from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  MapPin,
  Sliders,
  Waves,
  RefreshCw,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { GaugingStation } from '../../types';

export const GaugingStationsPage: React.FC = () => {
  const { gaugingStations, updateStationWaterLevel, focusOnMapTarget, kpis } = useDisaster();

  const [selectedStationId, setSelectedStationId] = useState<string>(
    gaugingStations[0]?.id || ''
  );
  const [sliderValue, setSliderValue] = useState<number>(
    gaugingStations[0]?.waterLevel || 15.0
  );

  const selectedStation =
    gaugingStations.find((g) => g.id === selectedStationId) || gaugingStations[0];

  const handleSelectStation = (station: GaugingStation) => {
    setSelectedStationId(station.id);
    setSliderValue(station.waterLevel);
  };

  const handleApplySimulatedLevel = () => {
    if (selectedStation) {
      updateStationWaterLevel(selectedStation.id, sliderValue);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Krishna River Basin Hydrometric Network
            </span>
            <span className="text-xs text-slate-500">
              {gaugingStations.length} Active Telemetry Stations
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Gauging, Weather & Water-Level Stations
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Continuous acoustic Doppler telemetry, Prakasam Barrage discharge flow rates, and 24-hour flood hydrographs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 px-3.5 py-2 rounded-md border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px]">Stations in Danger</span>
            <span className="text-red-600 font-bold font-mono text-sm">
              {kpis.dangerStationsCount} of {gaugingStations.length}
            </span>
          </div>
          <div className="bg-slate-50 px-3.5 py-2 rounded-md border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px]">Peak Basin Level</span>
            <span className="text-blue-700 font-bold font-mono text-sm">17.2 m</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Hydrograph + Interactive Simulation Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Interactive 24-Hour Hydrograph */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Hydrograph: {selectedStation?.name}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Observed water levels vs Warning ({selectedStation?.warningLevel}m) & Danger ({selectedStation?.dangerLevel}m) thresholds
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  focusOnMapTarget({
                    id: selectedStation.id,
                    type: 'station',
                    title: selectedStation.name,
                    coordinates: [selectedStation.latitude, selectedStation.longitude],
                    zoom: 16,
                  })
                }
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Map
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedStation?.history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterLevelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis
                  stroke="#94a3b8"
                  domain={[
                    Math.floor((selectedStation?.warningLevel || 15) - 3),
                    Math.ceil((selectedStation?.dangerLevel || 17) + 2),
                  ]}
                  tick={{ fontSize: 10 }}
                  unit="m"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <ReferenceLine
                  y={selectedStation?.warningLevel}
                  label={{
                    value: `Warning (${selectedStation?.warningLevel}m)`,
                    fill: '#d97706',
                    fontSize: 10,
                    position: 'top',
                  }}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                />
                <ReferenceLine
                  y={selectedStation?.dangerLevel}
                  label={{
                    value: `Danger (${selectedStation?.dangerLevel}m)`,
                    fill: '#dc2626',
                    fontSize: 10,
                    position: 'top',
                  }}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="waterLevel"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#waterLevelGrad)"
                  name="Water Level (m)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Current Stage</span>
              <strong className="text-blue-700 font-mono text-base font-bold">
                {selectedStation?.waterLevel.toFixed(1)} m
              </strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Warning Threshold</span>
              <strong className="text-amber-700 font-mono text-base font-semibold">
                {selectedStation?.warningLevel} m
              </strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Danger Threshold</span>
              <strong className="text-red-600 font-mono text-base font-semibold">
                {selectedStation?.dangerLevel} m
              </strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Discharge Flow</span>
              <strong className="text-slate-800 font-mono text-base font-semibold">
                {selectedStation?.flowRate.toLocaleString()} cusecs
              </strong>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Interactive Water Level Simulation Lab */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Hydrological Simulation Lab
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Test multi-agency emergency readiness by simulating sudden upstream inflow surges and crest breaches.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Station to Simulate</label>
              <select
                value={selectedStationId}
                onChange={(e) => {
                  const s = gaugingStations.find((x) => x.id === e.target.value);
                  if (s) handleSelectStation(s);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                {gaugingStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} ({station.waterLevel}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Slider */}
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Target Simulation Level:</span>
                <span className="text-xl font-mono font-bold text-blue-700">{sliderValue.toFixed(1)} m</span>
              </div>

              <input
                type="range"
                min="10.0"
                max="20.0"
                step="0.1"
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>10.0m</span>
                <span className="text-amber-700">15.5m Warn</span>
                <span className="text-red-600">17.0m Danger</span>
                <span>20.0m</span>
              </div>

              {/* Status Preview */}
              <div className="text-[11px] pt-1">
                Estimated Status:{' '}
                {sliderValue >= selectedStation?.dangerLevel ? (
                  <strong className="text-red-600 font-bold">DANGER (Automated sensor alert fires)</strong>
                ) : sliderValue >= selectedStation?.warningLevel ? (
                  <strong className="text-amber-700 font-semibold">WARNING (Advisory notification fires)</strong>
                ) : (
                  <strong className="text-emerald-700 font-semibold">NORMAL (Safe Channel Flow)</strong>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleApplySimulatedLevel}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Apply Telemetry Surge
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              Changes update the live GIS map layers, active notifications, and settlement vulnerability metrics immediately.
            </p>
          </div>
        </div>
      </div>

      {/* All Gauging Stations Professional Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Basin Hydrometric Monitoring Stations
          </h3>
          <span className="text-xs text-slate-500">Real-Time Telemetry Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
                <th className="py-3 px-4">Station Name</th>
                <th className="py-3 px-4">River / Section</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Water Level</th>
                <th className="py-3 px-4 text-right">Warning Mark</th>
                <th className="py-3 px-4 text-right">Danger Mark</th>
                <th className="py-3 px-4 text-right">Discharge</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gaugingStations.map((st) => {
                const isSelected = st.id === selectedStationId;
                const isDanger = st.status === 'DANGER';
                const isWarning = st.status === 'WARNING';

                return (
                  <tr
                    key={st.id}
                    onClick={() => handleSelectStation(st)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isDanger ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                        />
                        <span>{st.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">{st.river}</td>
                    <td className="py-3 px-4 text-slate-500">{st.location}</td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 text-sm">
                      {st.waterLevel.toFixed(1)} m
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-amber-700 font-medium">
                      {st.warningLevel} m
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-red-600 font-medium">
                      {st.dangerLevel} m
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {st.flowRate.toLocaleString()} cusecs
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isDanger
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isWarning
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          focusOnMapTarget({
                            id: st.id,
                            type: 'station',
                            title: st.name,
                            coordinates: [st.latitude, st.longitude],
                            zoom: 16,
                          })
                        }
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-700 rounded text-xs font-medium transition-colors"
                      >
                        Map
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
