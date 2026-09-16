import React from 'react';
import { useDisaster } from '../../context/DisasterContext';

const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert } = useDisaster();
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Alerts</h2>
      <div className="mt-3 space-y-2">
        {alerts.map((a) => (
          <div key={a.id} className="p-3 border rounded bg-white">
            <div className="flex justify-between">
              <h3 className="font-semibold">{a.type}</h3>
              <span className="text-sm">{a.time}</span>
            </div>
            <p className="text-sm text-slate-600">{a.description}</p>
            <div className="mt-2">
              <button onClick={() => acknowledgeAlert(a.id)} className="text-emerald-700">Acknowledge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
