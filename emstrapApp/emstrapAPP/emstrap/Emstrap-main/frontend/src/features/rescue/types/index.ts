export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface EmergencyAlert {
  id: string;
  type: string;
  severity: SeverityLevel;
  location: string;
  waterLevel?: number;
  dangerLevel?: number;
  affectedSettlementsCount: number;
  time: string;
  timestamp: number;
  description: string;
  source: string;
  status: AlertStatus;
  recommendedAction?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  coordinates?: [number, number];
}

export type IncidentType =
  | 'Flood'
  | 'Landslide'
  | 'Fire'
  | 'Earthquake'
  | 'Storm'
  | 'Road Blockage'
  | 'Building Damage'
  | 'Medical Emergency'
  | 'Other';

export type IncidentStatus =
  | 'Reported'
  | 'Under Investigation'
  | 'Response Active'
  | 'Resolved'
  | 'Closed';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  reportedBy: string;
  dateTime: string;
  timestamp: number;
  affectedPeople: number;
  requiredResources: string[];
  assignedTeam: string;
  status: IncidentStatus;
}

export type ShelterType =
  | 'Emergency Shelter'
  | 'School'
  | 'Community Hall'
  | 'Hospital'
  | 'Relief Center'
  | 'Government Building'
  | 'Other';

export type ShelterStatus = 'Available' | 'Limited Capacity' | 'Full' | 'Closed';

export interface SafePlace {
  id: string;
  name: string;
  type: ShelterType;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupancy: number;
  contactPerson: string;
  contactNumber: string;
  facilities: string[];
  accessibility: boolean;
  status: ShelterStatus;
  description: string;
  photoUrl?: string;
}

export type StationStatus = 'NORMAL' | 'WARNING' | 'DANGER';

export interface GaugingStation {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  waterLevel: number;
  warningLevel: number;
  dangerLevel: number;
  flowRate: number; // in cusecs or m3/s
  lastUpdated: string;
  status: StationStatus;
  river: string;
  history: { time: string; waterLevel: number; flowRate: number }[];
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type EvacuationStatus = 'Normal' | 'Advisory Issued' | 'Evacuating' | 'Evacuated';

export interface Settlement {
  id: string;
  name: string;
  wardNumber: string;
  latitude: number;
  longitude: number;
  population: number;
  riskLevel: RiskLevel;
  waterDepth: number; // in meters
  affectedPopulation: number;
  evacuationStatus: EvacuationStatus;
  nearestShelterId: string;
  nearestShelterName: string;
  status: 'Normal' | 'At Risk' | 'Flooded' | 'Submerged';
  notes: string;
}

export type ResourceStatus = 'Available' | 'Dispatched' | 'Busy' | 'Maintenance';

export interface EmergencyResource {
  id: string;
  resource: string;
  category: 'Ambulance' | 'Fire Truck' | 'Rescue Team' | 'Boat' | 'Medical Team' | 'Food Supplies' | 'Water Supplies' | 'Emergency Vehicle';
  quantity: number;
  available: number;
  location: string;
  assignedIncident?: string;
  status: ResourceStatus;
  contactPerson: string;
  contactPhone: string;
}

export interface RiskZone {
  id: string;
  name: string;
  level: 'High' | 'Moderate' | 'Low';
  depthRange: string;
  estimatedWaterDepth: number;
  affectedAreaSqKm: number;
  affectedPopulation: number;
  nearbySettlements: string[];
  nearestSafePlaces: string[];
  lastUpdated: string;
  coordinates: [number, number][]; // Polygon coords [lat, lng]
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  location?: string;
  source?: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  linkTo?: { page: string; targetId?: string };
}

export type OfficerRole =
  | 'Administrator'
  | 'Disaster Management Officer'
  | 'Field Response Team'
  | 'Viewer';

export interface GISLayerVisibility {
  riverCenterline: boolean;
  inundationExtent: boolean;
  riskZones: boolean;
  transportArterials: boolean;
  settlements: boolean;
  gaugingStations: boolean;
  safePlaces: boolean;
  emergencyIncidents: boolean;
}

// API Response Types
export interface RescueLoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: {
    id: string;
    role: 'RESCUE_TEAM' | string;
    name: string;
  };
}

export interface RescueTeamDashboardStats {
  activeAlertsCount?: number;
  criticalIncidentsCount?: number;
  affectedSettlementsCount?: number;
  totalSheltersCount?: number;
  availableSheltersCount?: number;
  totalShelterCapacity?: number;
  currentShelterOccupancy?: number;
  gaugingStationsCount?: number;
  dangerStationsCount?: number;
  totalPeopleAtRisk?: number;
}

export interface RescueTeamDashboardResponse {
  success: boolean;
  message?: string;
  dashboard?: {
    team?: {
      id?: string;
      name?: string;
      code?: string;
      station?: string;
      specialization?: string;
      availability?: string;
      location?: string;
    };
    currentEmergency?: Incident | null;
    activeEmergencies?: Incident[];
    emergencies?: Incident[];
    recentUpdates?: {
      id?: string;
      title?: string;
      message?: string;
      timestamp?: string;
      type?: string;
    }[];
    stats?: RescueTeamDashboardStats;
  };
}
