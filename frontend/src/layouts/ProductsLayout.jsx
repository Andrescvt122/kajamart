// layouts/ProductsLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function ProductsLayout() {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* 🔹 Aquí iría tu sidebar o menú si lo usás */}
      {/* <Sidebar /> */}

      {/* 🔹 Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
