export const INITIAL_ALERTS = [
  {
    id: 'A1',
    type: 'Flood Warning',
    severity: 'HIGH',
    location: 'Krishna River - North Bank',
    waterLevel: 6.2,
    dangerLevel: 8.0,
    affectedSettlementsCount: 5,
    time: '09:12 IST',
    timestamp: Date.now() - 1000 * 60 * 60,
    description: 'River level rising due to upstream releases. Localized flooding expected in low-lying wards.',
    source: 'Hydromet Network',
    status: 'ACTIVE',
    recommendedAction: 'Standby evacuation teams',
    coordinates: [16.5, 80.6],
  },
];

export const INITIAL_INCIDENTS = [
  {
    id: 'INC-1001',
    type: 'Flood',
    title: 'Road Submerged - NH16',
    description: 'Main access route submerged near Km 12, vehicles stranded.',
    location: 'NH16 near Prakasam Barrage',
    latitude: 16.45,
    longitude: 80.62,
    severity: 'HIGH',
    reportedBy: 'Citizen Report',
    dateTime: new Date().toISOString(),
    timestamp: Date.now() - 1000 * 60 * 50,
    affectedPeople: 20,
    requiredResources: ['Boat', 'Ambulance'],
    assignedTeam: 'Rescue Team A',
    status: 'Response Active',
  },
];

export const INITIAL_SAFE_PLACES = [
  {
    id: 'S1',
    name: 'Government High School (Ward 21)',
    type: 'School',
    address: 'Ward 21, Prakasam Nagar',
    latitude: 16.47,
    longitude: 80.61,
    capacity: 500,
    occupancy: 120,
    contactPerson: 'Mr. Rao',
    contactNumber: '9123456780',
    facilities: ['Toilets', 'Blankets', 'Medical Tent'],
    accessibility: true,
    status: 'Available',
    description: 'Large hall with open grounds for vehicles',
  },
];

export const INITIAL_GAUGING_STATIONS = [
  {
    id: 'G1',
    name: 'Krishna River Gauge 1',
    location: 'Upstream - Prakasam',
    latitude: 16.48,
    longitude: 80.59,
    waterLevel: 5.2,
    warningLevel: 6.5,
    dangerLevel: 8.0,
    flowRate: 1200,
    lastUpdated: '10:00 IST',
    status: 'NORMAL',
    river: 'Krishna',
    history: [
      { time: '04:00', waterLevel: 4.5, flowRate: 800 },
      { time: '08:00', waterLevel: 5.0, flowRate: 1000 },
      { time: '10:00', waterLevel: 5.2, flowRate: 1200 },
    ],
  },
];

export const INITIAL_SETTLEMENTS = [
  {
    id: 'ST1',
    name: 'Krishnalanka Colony',
    wardNumber: '21',
    latitude: 16.46,
    longitude: 80.60,
    population: 3500,
    riskLevel: 'High',
    waterDepth: 0.8,
    affectedPopulation: 1800,
    evacuationStatus: 'Advisory Issued',
    nearestShelterId: 'S1',
    nearestShelterName: 'Government High School (Ward 21)',
    status: 'At Risk',
    notes: 'Low-lying area near riverbank',
  },
];

export const INITIAL_RESOURCES = [
  {
    id: 'R1',
    resource: 'Ambulance 12',
    category: 'Ambulance',
    quantity: 1,
    available: 1,
    location: 'Station 3',
    status: 'Available',
    contactPerson: 'Driver Kumar',
    contactPhone: '9123456790',
  },
];

export const INITIAL_RISK_ZONES = [
  {
    id: 'Z1',
    name: 'Low-lying Sector A',
    level: 'High',
    depthRange: '0.5-1.5m',
    estimatedWaterDepth: 0.9,
    affectedAreaSqKm: 2.1,
    affectedPopulation: 1200,
    nearbySettlements: ['Krishnalanka Colony'],
    nearestSafePlaces: ['Government High School (Ward 21)'],
    lastUpdated: new Date().toISOString(),
    coordinates: [
      [16.45, 80.59],
      [16.46, 80.60],
      [16.47, 80.61],
    ],
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'N1',
    title: 'Reservoir Gate Opening',
    message: 'Upstream reservoir releasing additional 500 cusecs for flood control.',
    type: 'warning',
    timestamp: new Date().toISOString(),
    read: false,
  },
];


export const KRISHNA_RIVER_COORDINATES: [number, number][] = [
  [16.5200, 80.6100],
  [16.5150, 80.6250],
  [16.5100, 80.6400],
  [16.5050, 80.6550],
  [16.5000, 80.6700],
];

export const CANAL_NETWORKS: [number, number][][] = [
  [
    [16.5250, 80.6200],
    [16.5150, 80.6350],
    [16.5050, 80.6500],
  ],
  [
    [16.5350, 80.6500],
    [16.5250, 80.6650],
    [16.5150, 80.6800],
  ],
];

export const TRANSPORT_ARTERIALS: {
  name: string;
  coords: [number, number][];
}[] = [
  {
    name: 'NH16 Evacuation Corridor',
    coords: [
      [16.5400, 80.6000],
      [16.5250, 80.6200],
      [16.5100, 80.6400],
    ],
  },
  {
    name: 'MG Road Emergency Corridor',
    coords: [
      [16.5100, 80.6250],
      [16.5200, 80.6450],
      [16.5300, 80.6600],
    ],
  },
];

export const PROJECTED_INUNDATION_POLYGON: [number, number][] = [
  [16.5250, 80.6150],
  [16.5350, 80.6350],
  [16.5250, 80.6600],
  [16.5000, 80.6650],
  [16.4900, 80.6350],
  [16.5000, 80.6150],
];

export const HIGH_RISK_POLYGON: [number, number][] = [
  [16.5150, 80.6250],
  [16.5250, 80.6400],
  [16.5150, 80.6550],
  [16.4950, 80.6500],
  [16.4950, 80.6300],
];

export const MODERATE_RISK_POLYGON: [number, number][] = [
  [16.5300, 80.6150],
  [16.5400, 80.6400],
  [16.5300, 80.6650],
  [16.5000, 80.6700],
  [16.4850, 80.6400],
  [16.4950, 80.6150],
];


export const MAP_CENTER: [number, number] = [16.5062, 80.6480];
export const DEFAULT_ZOOM = 12;
