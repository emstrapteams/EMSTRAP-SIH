import React from 'react';
import { useDisaster } from '../../context/DisasterContext';

const RiskAnalysisPage: React.FC = () => {
  const { riskZones } = useDisaster();
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Risk Analysis</h2>
      <div className="mt-3 space-y-2">
        {riskZones.map((z) => (
          <div key={z.id} className="p-3 border rounded bg-white">
            <h3 className="font-semibold">{z.name}</h3>
            <p className="text-sm text-slate-600">Level: {z.level} • Affected pop: {z.affectedPopulation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAnalysisPage;
