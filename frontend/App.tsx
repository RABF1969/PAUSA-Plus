
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
import Users from './pages/Users';
import ChangePassword from './pages/ChangePassword';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './contexts/ThemeContext';
import MasterLogin from './pages/master/MasterLogin';
import MasterCompaniesList from './pages/master/MasterCompaniesList';
import MasterCompanyForm from './pages/master/MasterCompanyForm';
import MasterPlansList from './pages/master/MasterPlansList';
import MasterPlanForm from './pages/master/MasterPlanForm';
import MasterRouteGuard from './components/MasterRouteGuard';
import GlobalFooter from './components/GlobalFooter';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const mustChangePassword = localStorage.getItem('must_change_password') === 'true';

  if (!token) {
    return <Navigate to="/login" />;
  }

  // If user must change password, block all routes except /change-password
  // But we can't easily check current route here inside the route element itself easily without useLocation
  // So we handle this logic:
  // If must_change_password is true, and we try to access anything inside AdminLayout (which this wrapper protects),
  // we should be careful. 
  // Ideally, the checks should be:
  // 1. Not logged in -> Login
  // 2. Logged in + must change -> ChangePassword
  // 3. Logged in + active -> Content
  
  if (mustChangePassword) {
      return <Navigate to="/change-password" />;
  }

  return <>{children}</>;
};

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
          
          {/* Change Password Route (Protected but isolated) */}
          <Route path="/change-password" element={
            localStorage.getItem('token') ? <ChangePassword /> : <Navigate to="/login" />
          } />

          {/* Admin Routes (Protected) */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <AdminLayout><Users /></AdminLayout>
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
              
              <Route path="plans" element={<MasterPlansList />} />
              <Route path="plans/new" element={<MasterPlanForm />} />
              <Route path="plans/:id/edit" element={<MasterPlanForm />} />
              
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
