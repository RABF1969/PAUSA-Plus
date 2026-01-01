
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import TabletLogin from './pages/TabletLogin';
import TabletScan from './pages/TabletScan';
import TabletTimer from './pages/TabletTimer';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-[#f6f8f7]">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-8">
      {children}
    </main>
  </div>
);

const App: React.FC = () => {
  return (
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
        <Route path="/kiosk/login" element={<TabletLogin />} />
        <Route path="/kiosk/scan" element={<TabletScan />} />
        <Route path="/kiosk/active" element={<TabletTimer />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Prototype Switcher for Demo Purposes */}
      <div className="fixed bottom-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => window.location.hash = '#/'}
          className="bg-black text-white px-3 py-1 text-xs rounded-full hover:bg-gray-800"
        >
          Web Admin
        </button>
        <button
          onClick={() => window.location.hash = '#/kiosk/login'}
          className="bg-emerald-600 text-white px-3 py-1 text-xs rounded-full hover:bg-emerald-700"
        >
          Tablet Kiosk
        </button>
      </div>
    </HashRouter>
  );
};

export default App;
