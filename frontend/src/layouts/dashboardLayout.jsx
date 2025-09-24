import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/components/sidebar.jsx';
import NavBarDashboard from '../shared/components/navbars/navbarDashboard.jsx';

export default function DashboardLayout() {
  return (
      <div className="flex flex-col flex-grow min-h-screen">
        <NavBarDashboard />
        <main className="flex-grow p-8 relative">
          <Outlet />
        </main>
      </div>
  );
}
