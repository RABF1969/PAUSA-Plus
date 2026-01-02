
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
import { ThemeProvider } from './contexts/ThemeContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col w-full min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg filled">timer</span>
            </div>
            <span className="font-bold text-[var(--text-primary)]">PAUSA+</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] rounded-lg"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

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
          <Route path="/kiosk/login" element={<TabletLogin />} />
          <Route path="/kiosk/scan" element={<TabletScan />} />
          <Route path="/kiosk/active" element={<TabletTimer />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
