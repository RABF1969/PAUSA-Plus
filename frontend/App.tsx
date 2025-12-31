
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import TabletLogin from './pages/TabletLogin';
import TabletScan from './pages/TabletScan';
import TabletTimer from './pages/TabletTimer';
import Sidebar from './components/Sidebar';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-[#f6f8f7]">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-8">
      {children}
    </main>
  </div>
);

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(true); // Toggle logic for demo

  return (
    <HashRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/employees" element={<AdminLayout><Employees /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} />

        {/* Tablet Kiosk Routes */}
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
