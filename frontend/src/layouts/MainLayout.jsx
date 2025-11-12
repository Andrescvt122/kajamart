import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/components/sidebar.jsx';

export default function MainLayout() {
  return (
    <div className="flex flex-col lg:flex-row position-sticky min-h-screen">
      <Sidebar />
      <main className="flex-grow w-full p-4 sm:p-6 lg:p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}
