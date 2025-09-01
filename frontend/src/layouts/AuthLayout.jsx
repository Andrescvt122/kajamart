import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <main>
      {/* Las rutas anidadas (Login, Register, etc.) se renderizarán aquí */}
      <Outlet />
    </main>
  );
}