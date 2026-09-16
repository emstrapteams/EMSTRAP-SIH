import React, { useState } from 'react';
import { DisasterProvider, useDisaster } from './context/DisasterContext';
import { Login } from './components/auth/Login';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { DisasterMap } from './components/map/DisasterMap';
import { NotificationsPanel } from './components/map/NotificationsPanel';
import { AlertsPage } from './components/alerts/AlertsPage';
import { SafePlacesPage } from './components/shelters/SafePlacesPage';
import { IncidentsPage } from './components/incidents/IncidentsPage';
import { GaugingStationsPage } from './components/gauging/GaugingStationsPage';
import { SettlementsPage } from './components/settlements/SettlementsPage';
import { RiskAnalysisPage } from './components/risk/RiskAnalysisPage';
import { EmergencyResourcesPage } from './components/resources/EmergencyResourcesPage';
import { ReportsPage } from './components/reports/ReportsPage';

const MainAppContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useDisaster();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
      case 'Overview':
        return <DashboardHome />;
      case 'Live Map':
        return (
          <div
            id="live-map-split-view"
            className="h-[calc(100vh-62px)] w-full flex flex-col lg:flex-row gap-3 p-3 overflow-hidden"
          >
            <div
              id="map-viewport-container"
              className="flex-1 lg:w-[72%] h-[60vh] lg:h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden relative flex flex-col min-w-0"
            >
              <DisasterMap />
            </div>
            <div
              id="map-notifications-container"
              className="lg:w-[28%] h-[40vh] lg:h-full shrink-0 flex flex-col min-w-0"
            >
              <NotificationsPanel className="h-full" />
            </div>
          </div>
        );
      case 'Alerts':
        return <AlertsPage />;
      case 'Safe Places':
        return <SafePlacesPage />;
      case 'Incidents':
        return <IncidentsPage />;
      case 'Gauging Stations':
        return <GaugingStationsPage />;
      case 'Settlements':
        return <SettlementsPage />;
      case 'Risk Analysis':
        return <RiskAnalysisPage />;
      case 'Emergency Resources':
      case 'Resources':
        return <EmergencyResourcesPage />;
      case 'Reports':
        return <ReportsPage />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <main
          id="main-app-content-area"
          className={`flex-1 overflow-y-auto ${
            activeTab === 'Live Map' ? 'p-0' : 'p-3 sm:p-5 lg:p-6'
          }`}
        >
          {renderActiveView()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default function RescueApp() {
  return (
    <DisasterProvider>
      <MainAppContent />
    </DisasterProvider>
  );
}
