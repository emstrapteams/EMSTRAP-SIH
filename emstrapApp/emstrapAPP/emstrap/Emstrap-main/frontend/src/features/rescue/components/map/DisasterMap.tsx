import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useDisaster } from '../../context/DisasterContext';
import {
  KRISHNA_RIVER_COORDINATES,
  CANAL_NETWORKS,
  TRANSPORT_ARTERIALS,
  PROJECTED_INUNDATION_POLYGON,
  HIGH_RISK_POLYGON,
  MODERATE_RISK_POLYGON,
  MAP_CENTER,
  DEFAULT_ZOOM,
} from '../../data/mockData';
import {
  Layers,
  Search,
  Maximize2,
  Minimize2,
  RotateCcw,
  Navigation,
  Eye,
  EyeOff,
  Compass,
  AlertOctagon,
  ShieldCheck,
  Radio,
  Sliders,
  X,
  ExternalLink,
} from 'lucide-react';
import { GISLayerVisibility } from '../../types';

export const DisasterMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups refs to toggle independently
  const layerGroupsRef = useRef<{
    river?: L.LayerGroup;
    inundation?: L.LayerGroup;
    riskZones?: L.LayerGroup;
    transport?: L.LayerGroup;
    settlements?: L.LayerGroup;
    stations?: L.LayerGroup;
    safePlaces?: L.LayerGroup;
    incidents?: L.LayerGroup;
  }>({});

  const {
    layerVisibility,
    toggleLayer,
    setAllLayers,
    settlements,
    gaugingStations,
    safePlaces,
    incidents,
    riskZones,
    mapFocusTarget,
    clearMapFocusTarget,
    updateStationWaterLevel,
    updateIncidentStatus,
    setActiveTab,
  } = useDisaster();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [quickLevelModal, setQuickLevelModal] = useState<{ stationId: string; currentLevel: number; name: string } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Create Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: MAP_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false, // custom placed
    });

    mapInstanceRef.current = map;

    // CartoDB Positron clean light basemap for GIS clarity
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | DM-DSS GIS',
    }).addTo(map);

    // Custom Zoom controls
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initialize Layer Groups
    layerGroupsRef.current = {
      river: L.layerGroup().addTo(map),
      inundation: L.layerGroup().addTo(map),
      riskZones: L.layerGroup().addTo(map),
      transport: L.layerGroup().addTo(map),
      settlements: L.layerGroup().addTo(map),
      stations: L.layerGroup().addTo(map),
      safePlaces: L.layerGroup().addTo(map),
      incidents: L.layerGroup().addTo(map),
    };

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Focus Target if user clicked from elsewhere
  useEffect(() => {
    if (mapFocusTarget && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(mapFocusTarget.coordinates, mapFocusTarget.zoom || 15, {
        duration: 1.5,
      });
    }
  }, [mapFocusTarget]);

  // Render & Update Vector / Polygon Layers (River, Inundation, Risk Zones, Arterials)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layerGroupsRef.current.river) return;

    // 1. River Centerline & Canals
    layerGroupsRef.current.river.clearLayers();
    if (layerVisibility.riverCenterline) {
      // Main River Polyline
      const mainRiver = L.polyline(KRISHNA_RIVER_COORDINATES, {
        color: '#0284c7', // sky-600
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });
      mainRiver.bindTooltip('<b>Krishna River Main Channel</b><br>Discharge Flow Path', {
        sticky: true,
        className: 'leaflet-gis-tooltip',
      });
      layerGroupsRef.current.river.addLayer(mainRiver);

      // Canals
      CANAL_NETWORKS.forEach((canalCoords, idx) => {
        const canal = L.polyline(canalCoords, {
          color: '#38bdf8', // sky-400
          weight: 3.5,
          opacity: 0.8,
          dashArray: '5, 5',
        });
        canal.bindTooltip(
          idx === 0 ? '<b>Bandar Canal</b> (Irrigation Outflow)' : '<b>Eluru Canal</b> (Northern Branch)',
          { sticky: true, className: 'leaflet-gis-tooltip' }
        );
        layerGroupsRef.current.river?.addLayer(canal);
      });
    }

    // 2. Projected Inundation
    layerGroupsRef.current.inundation?.clearLayers();
    if (layerVisibility.inundationExtent) {
      const inundationPolygon = L.polygon(PROJECTED_INUNDATION_POLYGON, {
        color: '#0284c7',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#38bdf8',
        fillOpacity: 0.35,
      });
      inundationPolygon.bindPopup(`
        <div class="p-2 text-slate-900">
          <div class="text-xs font-bold uppercase text-sky-700">GIS Hydrological Model</div>
          <h4 class="font-bold text-sm">Projected Inundation Extent</h4>
          <p class="text-xs text-slate-600 mt-1">Simulated 48-hour flood envelope at 5.0 lakh cusecs Prakasam Barrage discharge.</p>
          <div class="mt-2 text-xs font-semibold">Affected Area: ~28.5 sq km</div>
        </div>
      `);
      layerGroupsRef.current.inundation?.addLayer(inundationPolygon);
    }

    // 3. Risk Zones (High & Moderate)
    layerGroupsRef.current.riskZones?.clearLayers();
    if (layerVisibility.riskZones) {
      // Moderate Risk Zone (1.0m - 2.0m)
      const moderatePoly = L.polygon(MODERATE_RISK_POLYGON, {
        color: '#d97706',
        weight: 2,
        fillColor: '#f59e0b',
        fillOpacity: 0.45,
      });
      moderatePoly.on('click', () => {
        setSelectedEntity({
          type: 'riskZone',
          name: 'Bhavanipuram & Vidyadharapuram Inundation Belt',
          level: 'Moderate Risk',
          depthRange: '1.0m â€“ 2.0m',
          estimatedWaterDepth: '1.45 m',
          affectedArea: '7.2 sq km',
          affectedPopulation: '48,200 people',
          nearbySettlements: ['Bhavanipuram Lowlands', 'Vidyadharapuram Ward 14', 'Tadepalli Bank'],
          nearestShelters: ['Siddhartha College Shelter', 'Bhavanipuram ZP High School'],
          lastUpdated: '15 minutes ago',
        });
      });
      moderatePoly.bindTooltip('<b>Moderate Risk Zone</b><br>Depth: 1.0m â€“ 2.0m', { sticky: true });
      layerGroupsRef.current.riskZones?.addLayer(moderatePoly);

      // High Risk Zone (> 2.0m)
      const highPoly = L.polygon(HIGH_RISK_POLYGON, {
        color: '#dc2626',
        weight: 2.5,
        fillColor: '#ef4444',
        fillOpacity: 0.55,
      });
      highPoly.on('click', () => {
        setSelectedEntity({
          type: 'riskZone',
          name: 'Krishnalanka Riverfront Zone A',
          level: 'High Risk',
          depthRange: '> 2.0 meters',
          estimatedWaterDepth: '2.45 m',
          affectedArea: '4.8 sq km',
          affectedPopulation: '34,500 people',
          nearbySettlements: ['Krishnalanka Ward 21', 'Ranigarithota', 'Ramalingeswara Nagar'],
          nearestShelters: ['Municipal Stadium Relief Shelter', 'Govt Polytechnic Relief Hall'],
          lastUpdated: '10 minutes ago',
        });
      });
      highPoly.bindTooltip('<b>High Risk Zone</b><br>Depth: &gt; 2.0m (Direct Inundation)', { sticky: true });
      layerGroupsRef.current.riskZones?.addLayer(highPoly);
    }

    // 4. Transport Arterials
    layerGroupsRef.current.transport?.clearLayers();
    if (layerVisibility.transportArterials) {
      TRANSPORT_ARTERIALS.forEach((arterial) => {
        const line = L.polyline(arterial.coords, {
          color: '#a855f7', // purple-500
          weight: 4,
          opacity: 0.85,
        });
        line.bindTooltip(`<b>Evacuation Corridor</b><br>${arterial.name}`, { sticky: true });
        layerGroupsRef.current.transport?.addLayer(line);
      });
    }
  }, [layerVisibility]);

  // Render & Update Markers (Gauging Stations, Settlements, Safe Places, Incidents)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 1. Gauging Stations Markers
    if (layerGroupsRef.current.stations) {
      layerGroupsRef.current.stations.clearLayers();
      if (layerVisibility.gaugingStations) {
        gaugingStations.forEach((station) => {
          const isDanger = station.status === 'DANGER';
          const isWarning = station.status === 'WARNING';
          const badgeBg = isDanger ? 'bg-rose-600 ring-rose-300' : isWarning ? 'bg-amber-500 ring-amber-200' : 'bg-blue-600 ring-blue-200';
          const pingDot = isDanger ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>' : '';

          const iconHtml = `
            <div class="relative cursor-pointer group">
              ${pingDot}
              <div class="w-8 h-8 rounded-full ${badgeBg} ring-4 ring-opacity-50 text-white shadow-md flex items-center justify-center font-bold text-xs border-2 border-white">
                <span class="font-mono text-[11px]">${station.waterLevel.toFixed(1)}m</span>
              </div>
              <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap border border-slate-200">
                ${station.name.split(' ')[2] || 'Gauge'}
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-gis-div-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([station.latitude, station.longitude], { icon: customIcon });

          marker.on('click', () => {
            setSelectedEntity({
              type: 'station',
              data: station,
            });
          });

          marker.bindTooltip(`<b>${station.name}</b><br>Level: ${station.waterLevel}m (${station.status})`, {
            direction: 'top',
            offset: [0, -18],
          });

          layerGroupsRef.current.stations?.addLayer(marker);
        });
      }
    }

    // 2. Monitored Settlements Markers
    if (layerGroupsRef.current.settlements) {
      layerGroupsRef.current.settlements.clearLayers();
      if (layerVisibility.settlements) {
        settlements.forEach((settlement) => {
          let dotColor = 'bg-emerald-500';
          if (settlement.riskLevel === 'Critical') dotColor = 'bg-rose-600 animate-pulse';
          else if (settlement.riskLevel === 'High') dotColor = 'bg-orange-600';
          else if (settlement.riskLevel === 'Moderate') dotColor = 'bg-amber-500';

          const iconHtml = `
            <div class="cursor-pointer group flex items-center gap-1 bg-white hover:bg-slate-50 px-2 py-0.5 rounded-full border border-slate-300 shadow-sm text-[10px] text-slate-800 font-semibold">
              <span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span>
              <span class="truncate max-w-[90px]">${settlement.name.split(' ')[0]}</span>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-gis-div-icon',
            iconSize: [110, 24],
            iconAnchor: [55, 12],
          });

          const marker = L.marker([settlement.latitude, settlement.longitude], { icon: customIcon });

          marker.on('click', () => {
            setSelectedEntity({
              type: 'settlement',
              data: settlement,
            });
          });

          marker.bindTooltip(
            `<b>${settlement.name}</b> (${settlement.wardNumber})<br>Risk: <b>${settlement.riskLevel}</b> | Depth: ${settlement.waterDepth}m<br>Affected Pop: ${settlement.affectedPopulation.toLocaleString()}`,
            { direction: 'top', offset: [0, -14] }
          );

          layerGroupsRef.current.settlements?.addLayer(marker);
        });
      }
    }

    // 3. Safe Places / Shelters Markers (Green Home/Shield Icon)
    if (layerGroupsRef.current.safePlaces) {
      layerGroupsRef.current.safePlaces.clearLayers();
      if (layerVisibility.safePlaces) {
        safePlaces.forEach((shelter) => {
          const isAvailable = shelter.status === 'Available';
          const badgeColor = isAvailable ? 'bg-emerald-600' : shelter.status === 'Limited Capacity' ? 'bg-amber-600' : 'bg-rose-600';

          const iconHtml = `
            <div class="cursor-pointer group relative flex flex-col items-center">
              <div class="w-7 h-7 rounded-md ${badgeColor} text-white shadow-sm flex items-center justify-center font-bold border-2 border-white transform rotate-45 hover:scale-110 transition-transform">
                <span class="transform -rotate-45 text-xs">ðŸ </span>
              </div>
              <div class="mt-1 bg-white text-emerald-800 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shadow-xs whitespace-nowrap border border-emerald-200">
                ${shelter.occupancy}/${shelter.capacity}
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-gis-div-icon',
            iconSize: [32, 44],
            iconAnchor: [16, 22],
          });

          const marker = L.marker([shelter.latitude, shelter.longitude], { icon: customIcon });

          marker.on('click', () => {
            setSelectedEntity({
              type: 'shelter',
              data: shelter,
            });
          });

          marker.bindTooltip(`<b>SAFE SHELTER: ${shelter.name}</b><br>Available: ${shelter.capacity - shelter.occupancy} spots`, {
            direction: 'top',
            offset: [0, -22],
          });

          layerGroupsRef.current.safePlaces?.addLayer(marker);
        });
      }
    }

    // 4. Emergency Incidents Markers (Red/Amber Warning Triangle)
    if (layerGroupsRef.current.incidents) {
      layerGroupsRef.current.incidents.clearLayers();
      if (layerVisibility.emergencyIncidents) {
        incidents.forEach((incident) => {
          if (incident.status === 'Resolved' || incident.status === 'Closed') return;

          const isCritical = incident.severity === 'CRITICAL';
          const iconHtml = `
            <div class="cursor-pointer group relative flex items-center justify-center">
              <div class="w-8 h-8 rounded-full ${isCritical ? 'bg-rose-600 animate-pulse ring-4 ring-rose-400/60' : 'bg-amber-600 ring-2 ring-amber-400/50'} text-white shadow-2xl flex items-center justify-center font-bold text-xs border border-white">`
          + `
                <span>âš ï¸</span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-gis-div-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const incidentLat = Number(incident.latitude);
          const incidentLng = Number(incident.longitude);
          if (!Number.isFinite(incidentLat) || !Number.isFinite(incidentLng)) return;

          const marker = L.marker([incidentLat, incidentLng], { icon: customIcon });

          marker.on('click', () => {
            setSelectedEntity({
              type: 'incident',
              data: incident,
            });
          });

          marker.bindTooltip(`<b>INCIDENT: ${incident.title}</b><br>Severity: ${incident.severity} (${incident.status})`, {
            direction: 'top',
            offset: [0, -18],
          });

          layerGroupsRef.current.incidents?.addLayer(marker);
        });
      }
    }
  }, [gaugingStations, settlements, safePlaces, incidents, layerVisibility]);

  // Global Search in Map
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    const query = searchQuery.toLowerCase().trim();

    // Check settlements
    const settlement = settlements.find((s) => s.name.toLowerCase().includes(query) || s.wardNumber.toLowerCase().includes(query));
    if (settlement) {
      mapInstanceRef.current.flyTo([settlement.latitude, settlement.longitude], 15);
      setSelectedEntity({ type: 'settlement', data: settlement });
      return;
    }

    // Check shelters
    const shelter = safePlaces.find((s) => s.name.toLowerCase().includes(query) || s.address.toLowerCase().includes(query));
    if (shelter) {
      mapInstanceRef.current.flyTo([shelter.latitude, shelter.longitude], 15);
      setSelectedEntity({ type: 'shelter', data: shelter });
      return;
    }

    // Check gauging stations
    const station = gaugingStations.find((g) => g.name.toLowerCase().includes(query) || g.location.toLowerCase().includes(query));
    if (station) {
      mapInstanceRef.current.flyTo([station.latitude, station.longitude], 15);
      setSelectedEntity({ type: 'station', data: station });
      return;
    }

    // Check incidents
    const incident = incidents.find((i) => i.title.toLowerCase().includes(query) || i.location.toLowerCase().includes(query));
    if (incident) {
      mapInstanceRef.current.flyTo([incident.latitude, incident.longitude], 15);
      setSelectedEntity({ type: 'incident', data: incident });
      return;
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(MAP_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
      clearMapFocusTarget();
      setSelectedEntity(null);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-100 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-[10000] h-screen w-screen' : 'h-full w-full'
      }`}
    >
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search Input Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="pointer-events-auto flex items-center bg-white/95 border border-slate-200 rounded-md shadow-sm px-2.5 py-1.5 backdrop-blur-xs max-w-md w-full sm:w-80"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settlement, shelter, station..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Action Buttons Toolbar */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 border border-slate-200 rounded-md p-1 shadow-sm backdrop-blur-xs">
          <button
            onClick={() => setShowLayersPanel((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              showLayersPanel ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle GIS Layers Panel"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          <button
            onClick={() => setShowLegend((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              showLegend ? 'bg-slate-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle Map Legend"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Legend</span>
          </button>

          <button
            onClick={handleResetView}
            className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Reset Map View to Krishna River / Vijayawada"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Geographic Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* LEFT: GIS LAYERS PANEL */}
      {showLayersPanel && (
        <div className="absolute top-16 left-3 z-[1000] w-64 sm:w-72 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-left-4">
          <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">GIS Layers</h3>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <button
                onClick={() => setAllLayers(true)}
                className="text-blue-600 hover:underline px-1 font-medium"
              >
                All On
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setAllLayers(false)}
                className="text-slate-500 hover:underline px-1 font-medium"
              >
                Off
              </button>
              <button
                onClick={() => setShowLayersPanel(false)}
                className="text-slate-400 hover:text-slate-700 ml-1 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3 space-y-1.5 text-xs max-h-96 overflow-y-auto">
            {/* Layer Checkboxes */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.riverCenterline}
                  onChange={() => toggleLayer('riverCenterline')}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">River Centerline</span>
              </div>
              <span className="w-3 h-1 bg-blue-600 rounded"></span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.inundationExtent}
                  onChange={() => toggleLayer('inundationExtent')}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">Inundation Extent</span>
              </div>
              <span className="w-3 h-3 bg-sky-200 border border-sky-400 rounded"></span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.riskZones}
                  onChange={() => toggleLayer('riskZones')}
                  className="rounded border-slate-300 text-rose-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">Risk Zones (Depth)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-300 border border-amber-500 rounded"></span>
                <span className="w-2.5 h-2.5 bg-rose-300 border border-rose-500 rounded"></span>
              </div>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.transportArterials}
                  onChange={() => toggleLayer('transportArterials')}
                  className="rounded border-slate-300 text-purple-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">Transport Arterials</span>
              </div>
              <span className="w-3 h-1 bg-purple-500 rounded"></span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.settlements}
                  onChange={() => toggleLayer('settlements')}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">Settlements & Wards</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">({settlements.length})</span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.gaugingStations}
                  onChange={() => toggleLayer('gaugingStations')}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">Gauging Stations</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">({gaugingStations.length})</span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.safePlaces}
                  onChange={() => toggleLayer('safePlaces')}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">Safe Places / Shelters</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono">({safePlaces.length})</span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.emergencyIncidents}
                  onChange={() => toggleLayer('emergencyIncidents')}
                  className="rounded border-slate-300 text-rose-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">Emergency Incidents</span>
              </div>
              <span className="text-[10px] text-rose-600 font-mono font-semibold">({incidents.filter(i => i.status !== 'Resolved').length})</span>
            </label>
          </div>
        </div>
      )}

      {/* RIGHT: MAP LEGEND (Matching Prompt Requirements) */}
      {showLegend && (
        <div className="absolute bottom-6 right-3 z-[1000] w-64 sm:w-72 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4">
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">Map Legend</h4>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-1 bg-blue-600 rounded"></span>
              <span className="text-slate-700">Main River Channel</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 bg-sky-200 border border-sky-400 rounded"></span>
              <span className="text-slate-700">Projected Inundation</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 bg-amber-200 border border-amber-500 rounded"></span>
              <span className="text-slate-700">Moderate Risk (1.0m â€“ 2.0m)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 bg-rose-200 border border-rose-500 rounded"></span>
              <span className="text-slate-700">High Risk (&gt; 2.0m)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[7px] text-white shadow-xs">â—‹</span>
              <span className="text-slate-700">Gauging Station</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-white shadow-xs"></span>
              <span className="text-slate-700">Monitored Settlement</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 bg-emerald-600 transform rotate-45 border border-white shadow-xs"></span>
              <span className="text-slate-700">Safe Shelter</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-rose-600 font-bold">â–²</span>
              <span className="text-slate-700">Emergency Incident</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM/CENTER: SELECTED ENTITY INSPECTOR POPUP MODAL */}
      {selectedEntity && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] w-[94%] max-w-lg bg-white border border-slate-200 rounded-lg shadow-xl p-4 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {selectedEntity.type === 'station'
                  ? 'Gauging Hydromet Station'
                  : selectedEntity.type === 'settlement'
                  ? 'Monitored Settlement'
                  : selectedEntity.type === 'shelter'
                  ? 'Safe Relief Shelter'
                  : selectedEntity.type === 'incident'
                  ? 'Active Incident'
                  : 'Risk Zone Inspection'}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                {selectedEntity.type === 'riskZone'
                  ? selectedEntity.name
                  : selectedEntity.data?.name || selectedEntity.data?.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Station Details */}
          {selectedEntity.type === 'station' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Water Level</div>
                  <div className="text-base font-bold font-mono text-blue-700">
                    {selectedEntity.data.waterLevel} m
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Warning Level</div>
                  <div className="text-base font-bold font-mono text-amber-600">
                    {selectedEntity.data.warningLevel} m
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Danger Level</div>
                  <div className="text-base font-bold font-mono text-rose-600">
                    {selectedEntity.data.dangerLevel} m
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Status: <strong className={selectedEntity.data.status === 'DANGER' ? 'text-rose-600' : selectedEntity.data.status === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'}>{selectedEntity.data.status}</strong></span>
                <span>Discharge Flow: <strong className="text-slate-800">{selectedEntity.data.flowRate.toLocaleString()} cusecs</strong></span>
                <span>Updated: {selectedEntity.data.lastUpdated}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setQuickLevelModal({
                      stationId: selectedEntity.data.id,
                      currentLevel: selectedEntity.data.waterLevel,
                      name: selectedEntity.data.name,
                    });
                  }}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" /> Simulate Water Level
                </button>
                <button
                  onClick={() => setActiveTab('Gauging Stations')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md text-xs flex items-center gap-1 transition-colors"
                >
                  Full Telemetry <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Settlement Details */}
          {selectedEntity.type === 'settlement' && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Total Population</span>
                  <strong className="text-slate-900 text-sm font-semibold">{selectedEntity.data.population.toLocaleString()}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">People Affected</span>
                  <strong className="text-rose-600 text-sm font-semibold">{selectedEntity.data.affectedPopulation.toLocaleString()}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-md border border-slate-200 text-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span>Water Depth: <strong className="text-amber-600">{selectedEntity.data.waterDepth} m</strong></span>
                  <span>Evacuation: <strong className="text-blue-700">{selectedEntity.data.evacuationStatus}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Nearest Shelter: <span className="text-emerald-700 font-semibold">{selectedEntity.data.nearestShelterName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">"{selectedEntity.data.notes}"</p>

              <button
                onClick={() => setActiveTab('Settlements')}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                View Settlement Matrix & Evacuation Orders
              </button>
            </div>
          )}

          {/* Shelter Details */}
          {selectedEntity.type === 'shelter' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Type: <strong className="text-slate-900">{selectedEntity.data.type}</strong></span>
                <span>Status: <strong className="text-emerald-700 font-semibold">{selectedEntity.data.status}</strong></span>
              </div>

              {/* Capacity Bar */}
              <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                  <span>Capacity: {selectedEntity.data.capacity}</span>
                  <span>Occupancy: {selectedEntity.data.occupancy}</span>
                  <span className="text-emerald-700 font-semibold">
                    {selectedEntity.data.capacity - selectedEntity.data.occupancy} Available
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (selectedEntity.data.occupancy / selectedEntity.data.capacity) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-600">
                <strong className="text-slate-700">Facilities:</strong>{' '}
                <span className="text-slate-500">{selectedEntity.data.facilities?.join(', ')}</span>
              </div>

              <div className="text-[11px] text-slate-600">
                Contact: <span className="text-slate-800 font-medium">{selectedEntity.data.contactPerson}</span> ({selectedEntity.data.contactNumber})
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => alert(`Directions calculated: Route via NH16 / MG Road to ${selectedEntity.data.name}`)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" /> Get Directions
                </button>
                <button
                  onClick={() => setActiveTab('Safe Places')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md text-xs transition-colors"
                >
                  Shelter Table
                </button>
              </div>
            </div>
          )}

          {/* Incident Details */}
          {selectedEntity.type === 'incident' && (
            <div className="space-y-2 text-xs">
              <p className="text-slate-700 leading-relaxed">{selectedEntity.data.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-md border border-slate-200 text-slate-600">
                <div>Severity: <strong className="text-rose-600">{selectedEntity.data.severity}</strong></div>
                <div>Status: <strong className="text-amber-700">{selectedEntity.data.status}</strong></div>
                <div>Affected: <strong className="text-slate-800">{selectedEntity.data.affectedPeople}</strong></div>
                <div>Team: <strong className="text-slate-800">{selectedEntity.data.assignedTeam}</strong></div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => updateIncidentStatus(selectedEntity.data.id, 'Response Active')}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-md text-xs transition-colors"
                >
                  Escalate Response
                </button>
                <button
                  onClick={() => setActiveTab('Incidents')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md text-xs transition-colors"
                >
                  Manage Incident
                </button>
              </div>
            </div>
          )}

          {/* Risk Zone Details */}
          {selectedEntity.type === 'riskZone' && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-md border border-slate-200 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-500 block">Water Depth Range</span>
                  <strong className="text-amber-700 text-sm font-semibold">{selectedEntity.depthRange}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Estimated Depth</span>
                  <strong className="text-rose-600 text-sm font-semibold">{selectedEntity.estimatedWaterDepth}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Affected Area</span>
                  <strong className="text-slate-800 font-semibold">{selectedEntity.affectedArea}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Affected Population</span>
                  <strong className="text-slate-800 font-semibold">{selectedEntity.affectedPopulation}</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-600">
                <strong className="block text-slate-700 mb-0.5">Nearby Settlements:</strong>
                <span className="text-slate-600">{selectedEntity.nearbySettlements?.join(', ')}</span>
              </div>

              <div className="text-[11px] text-slate-600">
                <strong className="block text-slate-700 mb-0.5">Recommended Safe Shelters:</strong>
                <span className="text-emerald-700 font-medium">{selectedEntity.nearestShelters?.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Water Level Simulation Modal */}
      {quickLevelModal && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-5 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Simulate Water Level
              </h4>
              <button
                onClick={() => setQuickLevelModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Adjust water level for <strong className="text-slate-900">{quickLevelModal.name}</strong> to test real-time warning and critical alert triggers.
            </p>

            <div className="mb-4">
              <div className="flex justify-between text-xs font-mono font-bold mb-2">
                <span className="text-slate-500">Current Reading:</span>
                <span className="text-lg text-blue-700">{quickLevelModal.currentLevel.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="12.0"
                max="19.0"
                step="0.1"
                value={quickLevelModal.currentLevel}
                onChange={(e) =>
                  setQuickLevelModal({
                    ...quickLevelModal,
                    currentLevel: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>12.0m (Normal)</span>
                <span className="text-amber-600 font-bold">15.5m (Warning)</span>
                <span className="text-rose-600 font-bold">17.0m (Danger)</span>
                <span>19.0m (Peak)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setQuickLevelModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded bg-slate-100 hover:bg-slate-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateStationWaterLevel(quickLevelModal.stationId, quickLevelModal.currentLevel);
                  setQuickLevelModal(null);
                  if (selectedEntity && selectedEntity.type === 'station') {
                    setSelectedEntity({
                      ...selectedEntity,
                      data: {
                        ...selectedEntity.data,
                        waterLevel: quickLevelModal.currentLevel,
                      },
                    });
                  }
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
              >
                Apply Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


