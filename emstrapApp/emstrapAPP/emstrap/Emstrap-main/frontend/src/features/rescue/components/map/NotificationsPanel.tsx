import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Check,
  Trash2,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { AppNotification } from '../../types';

interface NotificationsPanelProps {
  className?: string;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  className = '',
  onSelectNotification,
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    setActiveTab,
    focusOnMapTarget,
    gaugingStations,
    incidents,
    safePlaces,
    settlements,
  } = useDisaster();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'critical') return n.type === 'critical';
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationRead(notif.id);

    if (onSelectNotification) {
      onSelectNotification(notif);
      return;
    }

    // Navigate and focus on map if a target exists
    if (notif.linkTo?.targetId) {
      const station = gaugingStations.find((g) => g.id === notif.linkTo?.targetId);
      if (station) {
        focusOnMapTarget({
          id: station.id,
          type: 'station',
          title: station.name,
          coordinates: [station.latitude, station.longitude],
          zoom: 16,
        });
      } else {
        const inc = incidents.find((i) => i.id === notif.linkTo?.targetId);
        if (inc) {
          focusOnMapTarget({
            id: inc.id,
            type: 'incident',
            title: inc.title,
            coordinates: [inc.latitude, inc.longitude],
            zoom: 16,
          });
        } else {
          const shelter = safePlaces.find((s) => s.id === notif.linkTo?.targetId);
          if (shelter) {
            focusOnMapTarget({
              id: shelter.id,
              type: 'shelter',
              title: shelter.name,
              coordinates: [shelter.latitude, shelter.longitude],
              zoom: 16,
            });
          } else {
            const st = settlements.find((s) => s.id === notif.linkTo?.targetId);
            if (st) {
              focusOnMapTarget({
                id: st.id,
                type: 'settlement',
                title: st.name,
                coordinates: [st.latitude, st.longitude],
                zoom: 16,
              });
            }
          }
        }
      }
    }
    if (notif.linkTo?.page) {
      setActiveTab(notif.linkTo.page);
    }
  };

  const renderSeverityIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'critical':
        return (
          <div className="w-7 h-7 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        );
      case 'info':
        return (
          <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
            <Info className="w-3.5 h-3.5" />
          </div>
        );
      case 'success':
        return (
          <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div
      id="notifications-panel-container"
      className={`bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col ${className}`}
    >
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-700" />
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span
              id="notifications-unread-badge"
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
            >
              {unreadCount} unread
            </span>
          )}
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            id="btn-mark-all-read"
            onClick={markAllNotificationsRead}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-1"
            title="Mark all notifications as read"
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pt-2 pb-1 flex items-center gap-1 border-b border-slate-100 bg-white">
        <button
          id="tab-notif-all"
          onClick={() => setActiveFilter('all')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-slate-100 text-slate-900 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          id="tab-notif-unread"
          onClick={() => setActiveFilter('unread')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
            activeFilter === 'unread'
              ? 'bg-slate-100 text-slate-900 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          id="tab-notif-critical"
          onClick={() => setActiveFilter('critical')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
            activeFilter === 'critical'
              ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
              : 'text-slate-500 hover:text-rose-700'
          }`}
        >
          Critical ({notifications.filter((n) => n.type === 'critical').length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            No notifications in this view
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              id={`notification-item-${notif.id}`}
              onClick={() => handleNotificationClick(notif)}
              className={`group p-3 transition-colors cursor-pointer relative flex gap-3 ${
                !notif.read
                  ? 'bg-blue-50/40 hover:bg-blue-50/70'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              {/* Unread subtle indicator dot */}
              {!notif.read && (
                <span
                  className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-blue-100"
                  title="Unread"
                />
              )}

              {/* Severity Icon */}
              {renderSeverityIcon(notif.type)}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1 mb-0.5">
                  <h3
                    className={`text-xs truncate ${
                      !notif.read
                        ? 'font-bold text-slate-900'
                        : 'font-medium text-slate-800'
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-1">
                  {notif.message}
                </p>

                {/* Location / Source */}
                {(notif.location || notif.source) && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                    {notif.location && (
                      <span className="flex items-center gap-1 font-medium text-slate-700 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {notif.location}
                      </span>
                    )}
                    {notif.location && notif.source && (
                      <span className="text-slate-300">•</span>
                    )}
                    {notif.source && (
                      <span className="text-[10px] text-slate-400 truncate">
                        {notif.source}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end justify-between shrink-0 pl-1">
                <button
                  id={`btn-clear-notif-${notif.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notif.id);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                  title="Clear notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {!notif.read ? (
                  <button
                    id={`btn-mark-read-${notif.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(notif.id);
                    }}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel Footer */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Click alert to focus on GIS map</span>
        <span className="font-mono text-[10px] text-slate-400">
          Auto-synced
        </span>
      </div>
    </div>
  );
};
