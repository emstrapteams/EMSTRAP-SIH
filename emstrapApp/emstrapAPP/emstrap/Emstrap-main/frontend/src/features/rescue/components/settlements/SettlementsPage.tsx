import React from 'react';
import { useDisaster } from '../../context/DisasterContext';

const SettlementsPage: React.FC = () => {
  const { settlements } = useDisaster();
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Settlements</h2>
      <div className="mt-3 space-y-2">
        {settlements.map((s) => (
          <div key={s.id} className="p-3 border rounded bg-white">
            <h3 className="font-semibold">{s.name} (Ward {s.wardNumber})</h3>
            <p className="text-sm text-slate-600">Risk: {s.riskLevel} • Evacuation: {s.evacuationStatus}</p>
            <p className="text-sm">Population: {s.population.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettlementsPage;
