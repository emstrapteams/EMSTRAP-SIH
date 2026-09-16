import React from 'react';
import { useDisaster } from '../../context/DisasterContext';

const EmergencyResourcesPage: React.FC = () => {
  const { resources } = useDisaster();
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Emergency Resources</h2>
      <div className="mt-3 space-y-2">
        {resources.map((r) => (
          <div key={r.id} className="p-3 border rounded bg-white">
            <h3 className="font-semibold">{r.resource}</h3>
            <p className="text-sm text-slate-600">Status: {r.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyResourcesPage;
