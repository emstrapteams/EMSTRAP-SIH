import React, { useState } from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  Home,
  Plus,
  Search,
  Filter,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  X,
  Phone,
  User,
} from 'lucide-react';
import { SafePlace, ShelterType, ShelterStatus } from '../../types';

const SHELTER_TYPES: ShelterType[] = [
  'Emergency Shelter',
  'School',
  'Community Hall',
  'Hospital',
  'Relief Center',
  'Government Building',
  'Other',
];

const ALL_FACILITIES = [
  'Food',
  'Water',
  'Medical',
  'Toilets',
  'Electricity',
  'Wheelchair Access',
  'First Aid',
  'Sleeping Area',
];

export const SafePlacesPage: React.FC = () => {
  const { safePlaces, addSafePlace, updateSafePlace, deleteSafePlace, focusOnMapTarget, kpis } =
    useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SafePlace | null>(null);
  const [viewingPlace, setViewingPlace] = useState<SafePlace | null>(null);
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);

  // Form State
  const initialFormState: Omit<SafePlace, 'id'> = {
    name: '',
    type: 'Emergency Shelter',
    address: '',
    latitude: 16.5050,
    longitude: 80.6400,
    capacity: 500,
    occupancy: 0,
    contactPerson: '',
    contactNumber: '',
    facilities: ['Food', 'Water', 'Toilets', 'Electricity'],
    accessibility: true,
    status: 'Available',
    description: '',
    photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
  };

  const [formData, setFormData] = useState<Omit<SafePlace, 'id'>>(initialFormState);

  // Filtered & Search Results
  const filteredPlaces = safePlaces.filter((place) => {
    if (typeFilter !== 'ALL' && place.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && place.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        place.name.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        place.contactPerson.toLowerCase().includes(q) ||
        place.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage) || 1;
  const paginatedPlaces = filteredPlaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFacilityToggle = (facility: string) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facility)
          : [...prev.facilities, facility],
      };
    });
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (place: SafePlace) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      type: place.type,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      capacity: place.capacity,
      occupancy: place.occupancy,
      contactPerson: place.contactPerson,
      contactNumber: place.contactNumber,
      facilities: [...place.facilities],
      accessibility: place.accessibility,
      status: place.status,
      description: place.description,
      photoUrl: place.photoUrl,
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlace) {
      updateSafePlace(editingPlace.id, formData);
      setEditingPlace(null);
    } else {
      addSafePlace(formData);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    deleteSafePlace(id);
    setDeleteIdConfirm(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Disaster Evacuation Logistics
            </span>
            <span className="text-xs text-slate-500">
              Total Capacity: {kpis.totalShelterCapacity.toLocaleString()} | Available:{' '}
              {(kpis.totalShelterCapacity - kpis.currentShelterOccupancy).toLocaleString()} beds
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Safe Places & Emergency Relief Shelters
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Register and monitor designated community halls, schools, colleges, and relief camps across the Krishna river basin.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Safe Place</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search shelters by name, ward, contact person..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Shelter Types</option>
            {SHELTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Limited Capacity">Limited Capacity</option>
            <option value="Full">Full</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Safe Places Professional Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
                <th className="py-3 px-4">Shelter Name & Type</th>
                <th className="py-3 px-4">Address / Ward</th>
                <th className="py-3 px-4 text-right">Capacity</th>
                <th className="py-3 px-4 text-right">Occupancy</th>
                <th className="py-3 px-4 text-right">Available</th>
                <th className="py-3 px-4">Key Facilities</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPlaces.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No shelters found matching current search or filters.
                  </td>
                </tr>
              ) : (
                paginatedPlaces.map((place) => {
                  const availableSpots = place.capacity - place.occupancy;
                  const percentFilled = Math.round((place.occupancy / place.capacity) * 100);

                  let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (place.status === 'Limited Capacity') {
                    statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else if (place.status === 'Full') {
                    statusBadge = 'bg-red-50 text-red-700 border-red-200';
                  } else if (place.status === 'Closed') {
                    statusBadge = 'bg-slate-100 text-slate-600 border-slate-200';
                  }

                  return (
                    <tr key={place.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{place.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{place.type}</span>
                      </td>

                      <td className="py-3 px-4 max-w-[180px]">
                        <span className="text-slate-600 truncate block">{place.address}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        {place.capacity.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-amber-700 font-medium">
                        {place.occupancy.toLocaleString()}
                        <span className="text-[10px] text-slate-400 block">({percentFilled}%)</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {availableSpots.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {place.facilities.slice(0, 3).map((f) => (
                            <span
                              key={f}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                            >
                              {f}
                            </span>
                          ))}
                          {place.facilities.length > 3 && (
                            <span className="text-[9px] text-slate-400">+{place.facilities.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusBadge}`}>
                          {place.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              focusOnMapTarget({
                                id: place.id,
                                type: 'shelter',
                                title: place.name,
                                coordinates: [place.latitude, place.longitude],
                                zoom: 16,
                              })
                            }
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-slate-100"
                            title="View on Map"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setViewingPlace(place)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(place)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 rounded hover:bg-slate-100"
                            title="Edit Shelter"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteIdConfirm(place.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 rounded hover:bg-slate-100"
                            title="Delete Shelter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredPlaces.length)} of {filteredPlaces.length} shelters
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-medium transition-colors"
            >
              Prev
            </button>
            <span className="px-2 font-mono text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Safe Place Modal */}
      {(isAddModalOpen || editingPlace) && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                {editingPlace ? `Edit Safe Place: ${editingPlace.name}` : 'Register New Safe Place / Relief Shelter'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPlace(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Safe Place Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Zilla Parishad High School Shelter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ShelterType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {SHELTER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Address / Location</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Near Benz Circle, Ward 24, Vijayawada"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacity (Persons)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Occupancy</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.capacity}
                    value={formData.occupancy}
                    onChange={(e) => setFormData({ ...formData, occupancy: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Smt. K. Bhavani"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Number</label>
                  <input
                    type="text"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+91 94401 00000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ShelterStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Limited Capacity">Limited Capacity</option>
                    <option value="Full">Full</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Available Facilities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_FACILITIES.map((facility) => {
                    const selected = formData.facilities.includes(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => handleFacilityToggle(facility)}
                        className={`py-1.5 px-2.5 rounded-md border text-left text-xs transition-colors ${
                          selected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        ✓ {facility}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shelter Description & Details</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes on generator backup, kitchen facilities, medical team assignment..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPlace(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-xs"
                >
                  {editingPlace ? 'Save Changes' : 'Register Safe Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Details Modal */}
      {viewingPlace && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-xl p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {viewingPlace.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{viewingPlace.name}</h3>
                <p className="text-xs text-slate-500">{viewingPlace.address}</p>
              </div>
              <button
                onClick={() => setViewingPlace(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-md border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-500">Capacity</span>
                  <div className="text-base font-bold text-slate-900 font-mono">{viewingPlace.capacity}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Occupancy</span>
                  <div className="text-base font-bold text-amber-700 font-mono">{viewingPlace.occupancy}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Available</span>
                  <div className="text-base font-bold text-emerald-700 font-mono">
                    {viewingPlace.capacity - viewingPlace.occupancy}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                <strong className="block text-slate-700 mb-1">Facilities Provided:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {viewingPlace.facilities.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[11px] border border-emerald-200 font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>{viewingPlace.contactPerson}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{viewingPlace.contactNumber}</span>
                </div>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-md border border-slate-200">
                {viewingPlace.description}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    focusOnMapTarget({
                      id: viewingPlace.id,
                      type: 'shelter',
                      title: viewingPlace.name,
                      coordinates: [viewingPlace.latitude, viewingPlace.longitude],
                      zoom: 16,
                    });
                    setViewingPlace(null);
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MapPin className="w-4 h-4" /> Focus on GIS Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIdConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-5 shadow-xl">
            <h4 className="font-bold text-sm text-slate-900 mb-1">Delete Safe Place?</h4>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to remove this shelter from active GIS tracking and emergency registers?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteIdConfirm(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteIdConfirm)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
