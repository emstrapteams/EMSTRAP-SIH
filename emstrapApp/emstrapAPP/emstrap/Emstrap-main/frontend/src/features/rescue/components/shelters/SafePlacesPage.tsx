import React from 'react';
import { useDisaster } from '../../context/DisasterContext';

const SafePlacesPage: React.FC = () => {
  const { safePlaces } = useDisaster();
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Safe Places / Shelters</h2>
      <div className="mt-3 space-y-2">
        {safePlaces.map((s) => (
          <div key={s.id} className="p-3 border rounded bg-white">
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-slate-600">{s.address}</p>
            <p className="text-sm">Capacity: {s.capacity} • Occupied: {s.occupancy}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafePlacesPage;
