
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import TabletLogin from './pages/TabletLogin';
import TabletScan from './pages/TabletScan';
import TabletTimer from './pages/TabletTimer';
import KioskPlateScan from './pages/KioskPlateScan';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './contexts/ThemeContext';
import MasterLogin from './pages/master/MasterLogin';
import MasterCompaniesList from './pages/master/MasterCompaniesList';
import MasterCompanyForm from './pages/master/MasterCompanyForm';
import MasterRouteGuard from './components/MasterRouteGuard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

import GlobalFooter from './components/GlobalFooter';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-[var(--bg-primary)]">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-8 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <GlobalFooter />
    </main>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          {/* Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes (Protected) */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute>
              <AdminLayout><Employees /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <AdminLayout><Reports /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AdminLayout><Settings /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Tablet Kiosk Routes (Public) */}
          <Route path="/kiosk" element={<KioskPlateScan />} />
          <Route path="/kiosk/login" element={<TabletLogin />} />
          <Route path="/kiosk/scan" element={<TabletScan />} />
          <Route path="/kiosk/active" element={<TabletTimer />} />

          {/* Master Layer Routes (Internal Alfabiz) */}
          <Route path="/alfabiz/login" element={<MasterLogin />} />
          <Route path="/alfabiz" element={<MasterRouteGuard />}>
              <Route path="companies" element={<MasterCompaniesList />} />
              <Route path="companies/new" element={<MasterCompanyForm />} />
              <Route path="companies/:id/edit" element={<MasterCompanyForm />} />
              <Route index element={<Navigate to="companies" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
