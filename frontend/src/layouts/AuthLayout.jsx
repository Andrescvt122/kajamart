import React from 'react';
import { Outlet } from 'react-router-dom';
import Login from '../auth/login';

export default function AuthLayout() {
  return (
    <main>
      <Login />
      <Outlet />
    </main>
  );
}