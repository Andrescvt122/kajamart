import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/sidebar.jsx';

export default function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-grow p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}
