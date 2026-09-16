import React, { useState } from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  BarChart3,
  Download,
  Printer,
  FileText,
  PieChart as PieChartIcon,
  Home,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { kpis, settlements, safePlaces, incidents } =
    useDisaster();

  // Prepare Chart Data
  const settlementEvacData = settlements.map((s) => ({
    name: s.name.split(' ')[0],
    total: s.population,
    affected: s.affectedPopulation,
  }));

  const shelterCapacityData = safePlaces.map((sp) => ({
    name: sp.name.split(' ')[0],
    occupied: sp.occupancy,
    available: sp.capacity - sp.occupancy,
  }));

  const incidentsByType = incidents.reduce((acc: Record<string, number>, inc) => {
    acc[inc.type] = (acc[inc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.keys(incidentsByType).map((key) => ({
    name: key,
    value: incidentsByType[key],
  }));

  const PIE_COLORS = ['#ef4444', '#f59e0b', '#2563eb', '#8b5cf6', '#10b981'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              State Disaster Management Authority (AP SDMA)
            </span>
            <span className="text-xs text-slate-500">Official Daily Situation Report (SITREP)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Disaster Statistics & Analytics Briefing</h1>
          <p className="text-xs text-slate-600 mt-1">
            Automated inter-departmental analytics, evacuation metrics, flood envelope verification, and print-ready executive summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-md border border-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print SITREP</span>
          </button>
          <button
            onClick={() => alert('Exporting complete CSV telemetry report for NDMA...')}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Raw Data</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Basin Evacuation Rate</span>
          <div className="text-2xl font-bold text-blue-700 font-mono mt-0.5">72.4%</div>
          <span className="text-[11px] text-emerald-700 font-medium">+14% since 06:00 hrs</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Shelter Vacancy</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">
            {(kpis.totalShelterCapacity - kpis.currentShelterOccupancy).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">{kpis.availableSheltersCount} Relief Camps Ready</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Discharge at Barrage</span>
          <div className="text-2xl font-bold text-red-600 font-mono mt-0.5">5.2L cusecs</div>
          <span className="text-[11px] text-red-600 font-medium">Second Warning Issued</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Incident Resolution</span>
          <div className="text-2xl font-bold text-amber-700 font-mono mt-0.5">83.3%</div>
          <span className="text-[11px] text-slate-500">5 of 6 active teams deployed</span>
        </div>
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Population vs Affected by Ward */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Settlement Population at Risk by Ward
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Persons</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={settlementEvacData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total" fill="#3b82f6" name="Total Ward Pop" radius={[4, 4, 0, 0]} />
                <Bar dataKey="affected" fill="#ef4444" name="Directly Inundated Pop" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Shelter Occupancy vs Availability */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              Shelter Occupancy vs Available Capacity
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Beds</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterCapacityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="occupied" stackId="a" fill="#f59e0b" name="Occupied Beds" />
                <Bar dataKey="available" stackId="a" fill="#10b981" name="Vacant Beds" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Type Breakdown */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-amber-600" />
              Emergency Incident Classification
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(props) => `${props.name} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Executive Action Summary Briefing */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Emergency Response Directives & Action Protocol
            </h3>
            <span className="text-[10px] text-emerald-700 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Authorized</span>
          </div>

          <div className="space-y-2.5 text-slate-600">
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
              <strong className="text-red-700 block mb-0.5">1. Krishna Embankment Vigilance:</strong>
              Irrigation Department deployed 40,000 sandbags at Ramalingeswara Nagar and Bhavani Island access roads to prevent crest overflow.
            </div>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
              <strong className="text-amber-700 block mb-0.5">2. Shelter Relief Distribution:</strong>
              Civil Supplies Department has stockpiled 15,000 meal packets and drinking water sachets at Municipal Stadium and Indira Gandhi Stadium relief camps.
            </div>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
              <strong className="text-blue-700 block mb-0.5">3. Power & Telecom Redundancy:</strong>
              APSPDCL grid substations in low-lying zones switched to diesel generator power banks; disaster wireless VHF net operational on Channel 7.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
