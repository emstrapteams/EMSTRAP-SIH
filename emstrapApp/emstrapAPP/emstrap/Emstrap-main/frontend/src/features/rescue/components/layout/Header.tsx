import React, { useState, useEffect, useRef } from 'react';
import { useDisaster } from '../../context/DisasterContext';
import {
  ShieldAlert,
  Bell,
  Clock,
  Menu,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Activity,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { OfficerRole } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    officerRole,
    setOfficerRole,
    officerName,
    setActiveTab,
    focusOnMapTarget,
    gaugingStations,
    incidents,
    safePlaces,
    kpis,
  } = useDisaster();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationRead(notif.id);
    setIsNotifOpen(false);
    if (notif.linkTo) {
      setActiveTab(notif.linkTo.page);
      if (notif.linkTo.targetId) {
        const station = gaugingStations.find((g) => g.id === notif.linkTo?.targetId);
        if (station) {
          focusOnMapTarget({
            id: station.id,
            type: 'station',
            title: station.name,
            coordinates: [station.latitude, station.longitude],
          });
          return;
        }
        const inc = incidents.find((i) => i.id === notif.linkTo?.targetId);
        if (inc) {
          focusOnMapTarget({
            id: inc.id,
            type: 'incident',
            title: inc.title,
            coordinates: [inc.latitude, inc.longitude],
          });
          return;
        }
        const shelter = safePlaces.find((s) => s.id === notif.linkTo?.targetId);
        if (shelter) {
          focusOnMapTarget({
            id: shelter.id,
            type: 'shelter',
            title: shelter.name,
            coordinates: [shelter.latitude, shelter.longitude],
          });
          return;
        }
      }
    }
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none shadow-xs"
    >
      {/* Left side branding */}
      <div className="flex items-center gap-3">
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-md bg-slate-50 border border-slate-200"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          id="brand-header-link"
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('Dashboard')}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white font-bold shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                Disaster Management Command Center
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Simulated Data
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
              GIS Decision Support System • Krishna Basin Command HQ
            </p>
          </div>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Status: "Operational" with small green indicator */}
        <div
          id="system-status-indicator"
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Operational</span>
        </div>

        {/* Current Date & Time */}
        <div
          id="header-clock-display"
          className="hidden lg:flex items-center gap-2 text-xs text-slate-600 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-mono"
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">{currentTime}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{currentDate}</span>
        </div>

        {/* Notification Dropdown Icon */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-header-notifications"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span
                id="header-notif-count-badge"
                className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white"
              >
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Flyout */}
          {isNotifOpen && (
            <div
              id="header-notifications-dropdown"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in"
            >
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                    {notifications.length}
                  </span>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-2.5 ${
                        !n.read ? 'bg-blue-50/40' : 'bg-white'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'critical' ? (
                          <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                            <AlertTriangle className="w-3 h-3" />
                          </div>
                        ) : n.type === 'warning' ? (
                          <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <AlertTriangle className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Info className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4
                            className={`text-xs truncate ${
                              !n.read
                                ? 'font-bold text-slate-900'
                                : 'font-medium text-slate-700'
                            }`}
                          >
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        {n.location && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            📍 {n.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  onClick={() => {
                    setActiveTab('Live Map');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                >
                  Open Live Map & Notifications Panel{' '}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Role Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            id="btn-user-role-menu"
            onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                {officerName}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                {officerRole}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isRoleDropdownOpen && (
            <div
              id="user-role-dropdown-menu"
              className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 animate-in fade-in"
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Officer Role Persona
                </p>
              </div>
              {(
                [
                  'Administrator',
                  'Disaster Management Officer',
                  'Field Response Team',
                  'Viewer',
                ] as OfficerRole[]
              ).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setOfficerRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    officerRole === role
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{role}</span>
                  {officerRole === role && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
