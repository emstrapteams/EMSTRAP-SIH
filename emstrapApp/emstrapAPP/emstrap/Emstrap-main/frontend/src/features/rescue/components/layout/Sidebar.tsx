import React from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  LayoutDashboard,
  Map as MapIcon,
  BellRing,
  AlertTriangle,
  Home,
  Waves,
  Activity,
  Users,
  Truck,
  FileBarChart,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, kpis, officerName, officerRole } = useDisaster();

  const navigationItems = [
    { name: 'Overview', tabId: 'Dashboard', icon: LayoutDashboard },
    { name: 'Live Map', tabId: 'Live Map', icon: MapIcon },
    {
      name: 'Alerts',
      tabId: 'Alerts',
      icon: BellRing,
      badge: kpis.activeAlertsCount > 0 ? kpis.activeAlertsCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
    {
      name: 'Incidents',
      tabId: 'Incidents',
      icon: AlertTriangle,
      badge: kpis.criticalIncidentsCount > 0 ? kpis.criticalIncidentsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-700 border border-amber-200',
    },
    {
      name: 'Safe Places',
      tabId: 'Safe Places',
      icon: Home,
      badge: `${kpis.availableSheltersCount} open`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    { name: 'Risk Analysis', tabId: 'Risk Analysis', icon: Waves },
    {
      name: 'Gauging Stations',
      tabId: 'Gauging Stations',
      icon: Activity,
      badge: kpis.dangerStationsCount > 0 ? `${kpis.dangerStationsCount} danger` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
    { name: 'Settlements', tabId: 'Settlements', icon: Users },
    { name: 'Resources', tabId: 'Emergency Resources', icon: Truck },
    { name: 'Reports', tabId: 'Reports', icon: FileBarChart },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              DM
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Disaster Management
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Decision Support
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Navigation
          </p>
        </div>

        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.tabId ||
              (item.tabId === 'Dashboard' && activeTab === 'Overview');

            return (
              <button
                key={item.name}
                id={`sidebar-nav-${item.tabId.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleSelectTab(item.tabId)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Telemetry Status Box */}
        <div className="mx-3 my-2 p-2.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-800 text-[11px]">
              GIS Telemetry
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Live Feed
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Krishna Basin • 5 Gauges • 8 Wards
          </p>
        </div>

        {/* Officer Card */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-[11px]">
              DM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {officerName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{officerRole}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
