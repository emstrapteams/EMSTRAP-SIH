import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EmergencyAlert,
  Incident,
  SafePlace,
  GaugingStation,
  Settlement,
  EmergencyResource,
  RiskZone,
  AppNotification,
  OfficerRole,
  GISLayerVisibility,
  IncidentStatus,
  AlertStatus,
  EvacuationStatus,
  ResourceStatus,
} from '../types';
import { RescueLoginResponse, RescueTeamDashboardResponse, RescueTeamDashboardStats } from '../types';
import api, { ApiError } from '../../../services/disasterApi';
import {
  INITIAL_ALERTS,
  INITIAL_INCIDENTS,
  INITIAL_SAFE_PLACES,
  INITIAL_GAUGING_STATIONS,
  INITIAL_SETTLEMENTS,
  INITIAL_RESOURCES,
  INITIAL_RISK_ZONES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

export interface ToastItem {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
}

export interface MapFocusTarget {
  id: string;
  type: 'settlement' | 'shelter' | 'incident' | 'station' | 'riskZone';
  title: string;
  coordinates: [number, number];
  zoom?: number;
}

interface DisasterContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  officerRole: OfficerRole;
  setOfficerRole: (role: OfficerRole) => void;
  officerName: string;
  alerts: EmergencyAlert[];
  incidents: Incident[];
  safePlaces: SafePlace[];
  gaugingStations: GaugingStation[];
  settlements: Settlement[];
  resources: EmergencyResource[];
  riskZones: RiskZone[];
  notifications: AppNotification[];
  layerVisibility: GISLayerVisibility;
  toggleLayer: (layer: keyof GISLayerVisibility) => void;
  setAllLayers: (visible: boolean) => void;
  mapFocusTarget: MapFocusTarget | null;
  focusOnMapTarget: (target: MapFocusTarget) => void;
  clearMapFocusTarget: () => void;
  broadcastAlert: (alert: Omit<EmergencyAlert, 'id' | 'time' | 'timestamp' | 'status'>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  addIncident: (incidentData: Omit<Incident, 'id' | 'dateTime' | 'timestamp'>) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  addSafePlace: (shelter: Omit<SafePlace, 'id'>) => void;
  updateSafePlace: (id: string, updates: Partial<SafePlace>) => void;
  deleteSafePlace: (id: string) => void;
  updateStationWaterLevel: (stationId: string, newLevel: number) => void;
  assignResource: (resourceId: string, incidentId: string) => void;
  releaseResource: (resourceId: string) => void;
  deployResource: (resourceId: string, quantity: number, targetLocation: string) => void;
  updateSettlementEvacuation: (settlementId: string, status: EvacuationStatus) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
  triggerToast: (type: ToastItem['type'], title: string, message: string) => void;
  resetDemoData: () => void;
  token?: string | null;
  user?: { id: string; role: string; name: string } | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  usingLiveData: boolean;
  dashboardLoading: boolean;
  dashboardError: string | null;
  kpis: {
    activeAlertsCount: number;
    criticalIncidentsCount: number;
    affectedSettlementsCount: number;
    totalSheltersCount: number;
    availableSheltersCount: number;
    totalShelterCapacity: number;
    currentShelterOccupancy: number;
    gaugingStationsCount: number;
    dangerStationsCount: number;
    totalPeopleAtRisk: number;
  };
  dashboardStats?: RescueTeamDashboardStats | undefined;
  currentEmergency?: Incident | null;
  activeEmergencies?: Incident[];
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dss_disaster_management_state_v1';
const AUTH_TOKEN_KEY = 'emstrap_disaster_token';
const AUTH_USER_KEY = 'emstrap_disaster_user';

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [officerRole, setOfficerRole] = useState<OfficerRole>('Disaster Management Officer');
  const officerName = 'Officer K. S. Verma';

  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alerts`);
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_incidents`);
      return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  });

  const [safePlaces, setSafePlaces] = useState<SafePlace[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_safePlaces`);
      return saved ? JSON.parse(saved) : INITIAL_SAFE_PLACES;
    } catch {
      return INITIAL_SAFE_PLACES;
    }
  });

  const [gaugingStations, setGaugingStations] = useState<GaugingStation[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_stations`);
      return saved ? JSON.parse(saved) : INITIAL_GAUGING_STATIONS;
    } catch {
      return INITIAL_GAUGING_STATIONS;
    }
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settlements`);
      return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
    } catch {
      return INITIAL_SETTLEMENTS;
    }
  });

  const [resources, setResources] = useState<EmergencyResource[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_resources`);
      return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  });

  const [riskZones] = useState<RiskZone[]>(INITIAL_RISK_ZONES);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [layerVisibility, setLayerVisibility] = useState<GISLayerVisibility>({
    riverCenterline: true,
    inundationExtent: true,
    riskZones: true,
    transportArterials: false,
    settlements: true,
    gaugingStations: true,
    safePlaces: true,
    emergencyIncidents: true,
  });

  const [mapFocusTarget, setMapFocusTarget] = useState<MapFocusTarget | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<{ id: string; role: string; name: string } | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem(AUTH_TOKEN_KEY));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [usingLiveData, setUsingLiveData] = useState<boolean>(false);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardTried, setDashboardTried] = useState<boolean>(false);
  const [dashboardStats, setDashboardStats] = useState<RescueTeamDashboardStats | undefined>(undefined);
  const [currentEmergency, setCurrentEmergency] = useState<Incident | null>(null);
  const [activeEmergenciesList, setActiveEmergenciesList] = useState<Incident[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_alerts`, JSON.stringify(alerts));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_incidents`, JSON.stringify(incidents));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_safePlaces`, JSON.stringify(safePlaces));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_stations`, JSON.stringify(gaugingStations));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_settlements`, JSON.stringify(settlements));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_resources`, JSON.stringify(resources));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [alerts, incidents, safePlaces, gaugingStations, settlements, resources, notifications]);

  useEffect(() => {
    if (token) {
      fetchDashboard(token).catch(() => {
      });
    }
  }, []);

  const fetchDashboard = async (jwt: string) => {
    setDashboardLoading(true);
    setDashboardError(null);
    setDashboardTried(true);
    try {
      const resp: RescueTeamDashboardResponse = await api.getRescueTeamDashboard(jwt);
      if (!resp || !resp.success || !resp.dashboard) {
        const message = resp?.message || 'Failed to fetch dashboard';
        const e = new Error(message);
        throw e;
      }

      const d = resp.dashboard;

      if (d.emergencies) {
        setIncidents(d.emergencies);
      } else {
        setIncidents([]);
      }

      if (d.activeEmergencies) {
        setAlerts([]);
      } else {
        setAlerts([]);
      }

      setGaugingStations([]);
      setSafePlaces([]);
      setSettlements([]);
      setResources([]);

      if (d.recentUpdates) {
        const mapped = d.recentUpdates.map((u) => ({
          id: u.id ?? `upd-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          title: u.title ?? 'Update',
          message: u.message ?? '',
          location: undefined,
          source: undefined,
          type: 'info' as const,
          timestamp: u.timestamp ?? new Date().toISOString(),
          read: false,
          linkTo: undefined,
        }));
        setNotifications(mapped);
      } else {
        setNotifications([]);
      }

      setCurrentEmergency(d.currentEmergency ?? null);
      setActiveEmergenciesList(d.activeEmergencies ?? []);

      setDashboardStats(d.stats ?? undefined);

      setUsingLiveData(true);
      setDashboardLoading(false);
      setDashboardError(null);
    } catch (err: unknown) {
      setDashboardLoading(false);

      const message = err instanceof Error ? err.message : String(err);

      let status: number | undefined;
      if (typeof err === 'object' && err !== null && 'status' in err) {
        const s = (err as Record<string, unknown>).status;
        if (typeof s === 'number') status = s;
      }

      if (status === 401) {
        logout();
        setDashboardError('Session expired. Please log in again.');
      } else if (status === 403) {
        setDashboardError('Access denied. This account does not have Rescue Team access.');
      } else {
        setDashboardError(message || 'Unable to connect to the disaster management server.');
      }

      setUsingLiveData(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const resp: RescueLoginResponse = await api.loginRescueTeam(identifier, password);
      if (!resp || !resp.success || !resp.token) {
        throw new Error(resp?.message || 'Invalid credentials');
      }
      setToken(resp.token);
      setUser(resp.user);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, resp.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(resp.user));
      } catch {
      }
      await fetchDashboard(resp.token);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      setAuthError(message || 'Login failed');
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setUsingLiveData(false);
    setDashboardError(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch {
    }
  };

  const triggerToast = (type: ToastItem['type'], title: string, message: string) => {
    const newToast: ToastItem = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const focusOnMapTarget = (target: MapFocusTarget) => {
    setMapFocusTarget(target);
    setActiveTab('Live Map');
  };

  const clearMapFocusTarget = () => {
    setMapFocusTarget(null);
  };

  const toggleLayer = (layer: keyof GISLayerVisibility) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const setAllLayers = (visible: boolean) => {
    setLayerVisibility({
      riverCenterline: visible,
      inundationExtent: visible,
      riskZones: visible,
      transportArterials: visible,
      settlements: visible,
      gaugingStations: visible,
      safePlaces: visible,
      emergencyIncidents: visible,
    });
  };

  const broadcastAlert = (alertData: Omit<EmergencyAlert, 'id' | 'time' | 'timestamp' | 'status'>) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`;
    const newAlert: EmergencyAlert = {
      ...alertData,
      id: `ALERT-EMERG-${Date.now().toString().slice(-4)}`,
      time: timeStr,
      timestamp: Date.now(),
      status: 'ACTIVE',
    };

    setAlerts((prev) => [newAlert, ...prev]);

    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `🚨 ${newAlert.type}`,
      message: `${newAlert.location}: ${newAlert.description.slice(0, 80)}...`,
      type: newAlert.severity === 'CRITICAL' ? 'critical' : 'warning',
      timestamp: 'Just now',
      read: false,
      linkTo: { page: 'Alerts', targetId: newAlert.id },
    } as AppNotification;
    setNotifications((prev) => [newNotif, ...prev]);

    triggerToast(
      newAlert.severity === 'CRITICAL' ? 'critical' : 'warning',
      `BROADCAST: ${newAlert.type}`,
      `${newAlert.location} - Alert disseminated to response units!`
    );
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'ACKNOWLEDGED' as AlertStatus, acknowledgedBy: `${officerName} (${officerRole})` }
          : a
      )
    );
    triggerToast('info', 'Alert Acknowledged', `Alert ${id} marked as acknowledged by officer.`);
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'RESOLVED' as AlertStatus, resolvedBy: `${officerName} (${officerRole})` }
          : a
      )
    );
    triggerToast('success', 'Alert Resolved', `Alert ${id} has been marked resolved.`);
  };

  const addIncident = (incidentData: Omit<Incident, 'id' | 'dateTime' | 'timestamp'>) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`;
    const newIncident: Incident = {
      ...incidentData,
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      dateTime: dateStr,
      timestamp: Date.now(),
    };

    setIncidents((prev) => [newIncident, ...prev]);

    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `${newIncident.title}`,
      message: `Emergency response active: ${newIncident.description}`,
      location: newIncident.location,
      source: `Field Officer • ${newIncident.assignedTeam}`,
      type: newIncident.severity === 'CRITICAL' ? 'critical' : 'warning',
      timestamp: 'Just now',
      read: false,
      linkTo: { page: 'Incidents', targetId: newIncident.id },
    } as AppNotification;
    setNotifications((prev) => [newNotif, ...prev]);

    triggerToast(
      newIncident.severity === 'CRITICAL' ? 'critical' : 'warning',
      `New Incident: ${newIncident.type}`,
      `${newIncident.title} reported at ${newIncident.location}`
    );
  };

  const updateIncidentStatus = (id: string, status: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          if (status === 'Resolved' && inc.status !== 'Resolved') {
            const resolutionNotif: AppNotification = {
              id: `NOTIF-${Date.now()}`,
              title: `Incident Resolved: ${inc.title}`,
              message: `Situation under control and resolved at ${inc.location}. Normal access restored.`,
              location: inc.location,
              source: `Team ${inc.assignedTeam}`,
              type: 'info',
              timestamp: 'Just now',
              read: false,
              linkTo: { page: 'Incidents', targetId: inc.id },
            } as AppNotification;
            setNotifications((nPrev) => [resolutionNotif, ...nPrev]);
          }
          return { ...inc, status };
        }
        return inc;
      })
    );
    triggerToast('info', 'Incident Status Updated', `Incident ${id} set to ${status}.`);
  };

  const addSafePlace = (shelterData: Omit<SafePlace, 'id'>) => {
    const newShelter: SafePlace = {
      ...shelterData,
      id: `SHELTER-${Date.now().toString().slice(-4)}`,
    };
    setSafePlaces((prev) => [newShelter, ...prev]);

    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `Safe Shelter Registered`,
      message: `${newShelter.name} active with capacity for ${newShelter.capacity} evacuees.`,
      location: newShelter.address,
      source: 'Shelter Registration Desk',
      type: 'info',
      timestamp: 'Just now',
      read: false,
      linkTo: { page: 'Safe Places', targetId: newShelter.id },
    } as AppNotification;
    setNotifications((prev) => [newNotif, ...prev]);

    triggerToast('success', 'Safe Shelter Added', `${newShelter.name} is now operational on the GIS map.`);
  };

  const updateSafePlace = (id: string, updates: Partial<SafePlace>) => {
    setSafePlaces((prev) =>
      prev.map((place) => {
        if (place.id === id) {
          const updated = { ...place, ...updates };
          const occupancyRate = updated.capacity > 0 ? (updated.occupancy / updated.capacity) : 0;
          if (occupancyRate >= 0.9 && (place.capacity > 0 ? place.occupancy / place.capacity : 0) < 0.9) {
            const capNotif: AppNotification = {
              id: `NOTIF-${Date.now()}`,
              title: `Shelter Capacity Warning: ${updated.name}`,
              message: `Occupancy has reached ${Math.round(occupancyRate * 100)}% (${updated.occupancy}/${updated.capacity}). Re-route evacuees to adjacent facilities.`,
              location: updated.name,
              source: 'Camp Management Officer',
              type: 'warning',
              timestamp: 'Just now',
              read: false,
              linkTo: { page: 'Safe Places', targetId: updated.id },
            } as AppNotification;
            setNotifications((nPrev) => [capNotif, ...nPrev]);
          }
          return updated;
        }
        return place;
      })
    );
    triggerToast('info', 'Safe Place Updated', `Shelter records updated successfully.`);
  };

  const deleteSafePlace = (id: string) => {
    setSafePlaces((prev) => prev.filter((place) => place.id !== id));
    triggerToast('info', 'Shelter Removed', `Safe place removed from GIS register.`);
  };

  const updateStationWaterLevel = (stationId: string, newLevel: number) => {
    setGaugingStations((prev) =>
      prev.map((station) => {
        if (station.id !== stationId) return station;

        const warningThreshold = station.warningLevel;
        const dangerThreshold = station.dangerLevel;
        let newStatus: GaugingStation['status'] = 'NORMAL';

        if (newLevel >= dangerThreshold) {
          newStatus = 'DANGER';
        } else if (newLevel >= warningThreshold) {
          newStatus = 'WARNING';
        }

        if (newStatus === 'DANGER' && station.status !== 'DANGER') {
          const criticalAlert: EmergencyAlert = {
            id: `ALERT-AUTO-${Date.now().toString().slice(-4)}`,
            type: 'CRITICAL FLOOD ALERT',
            severity: 'CRITICAL',
            location: station.name,
            waterLevel: newLevel,
            dangerLevel: dangerThreshold,
            affectedSettlementsCount: 14,
            time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} IST`,
            timestamp: Date.now(),
            description: `AUTOMATIC SENSOR TRIGGER: Water level at ${station.name} reached ${newLevel.toFixed(2)}m, crossing DANGER threshold (${dangerThreshold}m). Immediate flood mitigation protocols activated.`,
            source: 'Central Telemetry Sensor Automation',
            status: 'ACTIVE',
            recommendedAction: 'Immediate sirens, mass evacuation of vulnerable wards, NDRF boat deployment.',
            coordinates: [station.latitude, station.longitude],
          };

          setAlerts((aPrev) => [criticalAlert, ...aPrev]);

          const notif: AppNotification = {
            id: `NOTIF-${Date.now()}`,
            title: `Water level exceeded danger level`,
            message: `Water level reached ${newLevel.toFixed(2)}m (Danger: ${dangerThreshold}m). Immediate evacuation required.`,
            location: station.name,
            source: 'Hydromet Sensor Network',
            type: 'critical',
            timestamp: 'Just now',
            read: false,
            linkTo: { page: 'Gauging Stations', targetId: station.id },
          } as AppNotification;
          setNotifications((nPrev) => [notif, ...nPrev]);

          triggerToast(
            'critical',
            '🚨 DANGER LEVEL EXCEEDED!',
            `Water level at ${station.name} is now ${newLevel.toFixed(2)}m! Critical alert broadcasted.`
          );
        } else if (newStatus === 'WARNING' && station.status === 'NORMAL') {
          const warningAlert: EmergencyAlert = {
            id: `ALERT-WARN-${Date.now().toString().slice(-4)}`,
            type: 'RIVER WARNING',
            severity: 'HIGH',
            location: station.name,
            waterLevel: newLevel,
            dangerLevel: dangerThreshold,
            affectedSettlementsCount: 6,
            time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} IST`,
            timestamp: Date.now(),
            description: `Water level at ${station.name} reached ${newLevel.toFixed(2)}m, exceeding WARNING threshold (${warningThreshold}m).`,
            source: 'Hydromet Telemetry Station',
            status: 'ACTIVE',
            recommendedAction: 'Alert riverbank colonies; prepare evacuation transit centers.',
            coordinates: [station.latitude, station.longitude],
          };
          setAlerts((aPrev) => [warningAlert, ...aPrev]);

          triggerToast(
            'warning',
            '⚠️ WARNING LEVEL CROSSED',
            `Water level at ${station.name} (${newLevel.toFixed(2)}m) has crossed warning threshold.`
          );
        }

        const now = new Date();
        const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newHistory = [
          ...station.history.slice(1),
          { time: timeLabel, waterLevel: newLevel, flowRate: Math.round(station.flowRate * (newLevel / station.waterLevel)) },
        ];

        return {
          ...station,
          waterLevel: newLevel,
          status: newStatus,
          lastUpdated: 'Just now',
          history: newHistory,
        };
      })
    );
  };

  const assignResource = (resourceId: string, incidentId: string) => {
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId && res.available > 0) {
          const newAvail = res.available - 1;
          return {
            ...res,
            available: newAvail,
            assignedIncident: incidentId,
            status: newAvail === 0 ? 'Busy' : 'Dispatched',
          };
        }
        return res;
      })
    );
    triggerToast('info', 'Resource Dispatched', `Resource dispatched to incident ${incidentId}.`);
  };

  const releaseResource = (resourceId: string) => {
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          const newAvail = Math.min(res.quantity, res.available + 1);
          return {
            ...res,
            available: newAvail,
            assignedIncident: undefined,
            status: 'Available',
          };
        }
        return res;
      })
    );
    triggerToast('success', 'Resource Released', `Resource returned to available status.`);
  };

  const deployResource = (resourceId: string, quantity: number, targetLocation: string) => {
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          const deployCount = Math.min(res.available, quantity);
          const newAvail = res.available - deployCount;
          return {
            ...res,
            available: newAvail,
            location: targetLocation,
            status: (newAvail === 0 ? 'Busy' : 'Dispatched') as ResourceStatus,
          };
        }
        return res;
      })
    );
    triggerToast('info', 'Resource Deployed', `${quantity} units mobilized to ${targetLocation}.`);
  };

  const updateSettlementEvacuation = (settlementId: string, status: EvacuationStatus) => {
    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === settlementId) {
          if (status === 'Evacuating' || status === 'Advisory Issued') {
            const evacNotif: AppNotification = {
              id: `NOTIF-${Date.now()}`,
              title: `High-risk settlement: ${s.name}`,
              message: `Evacuation order updated to "${status}". Population at risk: ${s.affectedPopulation.toLocaleString()} evacuees.`,
              location: s.name,
              source: `Ward Command • ${s.wardNumber}`,
              type: status === 'Evacuating' ? 'critical' : 'warning',
              timestamp: 'Just now',
              read: false,
              linkTo: { page: 'Settlements', targetId: s.id },
            } as AppNotification;
            setNotifications((nPrev) => [evacNotif, ...nPrev]);
          }
          return { ...s, evacuationStatus: status };
        }
        return s;
      })
    );
    triggerToast('info', 'Evacuation Status Updated', `Settlement evacuation updated to "${status}".`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const resetDemoData = () => {
    setAlerts(INITIAL_ALERTS);
    setIncidents(INITIAL_INCIDENTS);
    setSafePlaces(INITIAL_SAFE_PLACES);
    setGaugingStations(INITIAL_GAUGING_STATIONS);
    setSettlements(INITIAL_SETTLEMENTS);
    setResources(INITIAL_RESOURCES);
    setNotifications(INITIAL_NOTIFICATIONS);
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_alerts`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_incidents`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_safePlaces`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_stations`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_settlements`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_resources`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_notifications`);
    } catch {
    }
    triggerToast('info', 'Demo Data Reset', 'All records reset to standard demonstration baseline.');
  };

  const activeAlertsCount = dashboardStats?.activeAlertsCount ?? alerts.filter((a) => a.status === 'ACTIVE').length;
  const criticalIncidentsCount =
    dashboardStats?.criticalIncidentsCount ??
    incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'Resolved' && i.status !== 'Closed').length;
  const affectedSettlementsCount =
    dashboardStats?.affectedSettlementsCount ??
    settlements.filter((s) => s.riskLevel === 'High' || s.riskLevel === 'Critical' || s.waterDepth > 1.0).length;
  const totalSheltersCount = dashboardStats?.totalSheltersCount ?? safePlaces.length;
  const availableSheltersCount = dashboardStats?.availableSheltersCount ?? safePlaces.filter((s) => s.status === 'Available' || s.status === 'Limited Capacity').length;
  const totalShelterCapacity = dashboardStats?.totalShelterCapacity ?? safePlaces.reduce((sum, s) => sum + s.capacity, 0);
  const currentShelterOccupancy = dashboardStats?.currentShelterOccupancy ?? safePlaces.reduce((sum, s) => sum + s.occupancy, 0);
  const gaugingStationsCount = dashboardStats?.gaugingStationsCount ?? gaugingStations.length;
  const dangerStationsCount = dashboardStats?.dangerStationsCount ?? gaugingStations.filter((g) => g.status === 'DANGER').length;
  const totalPeopleAtRisk = dashboardStats?.totalPeopleAtRisk ?? settlements.reduce((sum, s) => sum + s.affectedPopulation, 0);

  return (
    <DisasterContext.Provider
      value={{
        activeTab,
        setActiveTab,
        officerRole,
        setOfficerRole,
        officerName,
        alerts,
        incidents,
        safePlaces,
        gaugingStations,
        settlements,
        resources,
        riskZones,
        notifications,
        layerVisibility,
        toggleLayer,
        setAllLayers,
        mapFocusTarget,
        focusOnMapTarget,
        clearMapFocusTarget,
        broadcastAlert,
        acknowledgeAlert,
        resolveAlert,
        addIncident,
        updateIncidentStatus,
        addSafePlace,
        updateSafePlace,
        deleteSafePlace,
        updateStationWaterLevel,
        assignResource,
        releaseResource,
        deployResource,
        updateSettlementEvacuation,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotification,
        toasts,
        dismissToast,
        triggerToast,
        resetDemoData,
        token,
        user,
        isAuthenticated,
        authLoading,
        authError,
        login,
        logout,
        usingLiveData,
        dashboardLoading,
        dashboardError,
        kpis: {
          activeAlertsCount,
          criticalIncidentsCount,
          affectedSettlementsCount,
          totalSheltersCount,
          availableSheltersCount,
          totalShelterCapacity,
          currentShelterOccupancy,
          gaugingStationsCount,
          dangerStationsCount,
          totalPeopleAtRisk,
        },
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = (): DisasterContextType => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};
