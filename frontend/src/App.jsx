// App.jsx
import { Routes, Route } from "react-router-dom";
import IndexSuppliers from "./features/suppliers/indexSuppliers.jsx";
import IndexCategories from "./features/Categories/indexCategories.jsx";
import IndexUsers from "./features/users/indexUsers.jsx";
import IndexRoles from "./features/roles/indexRoles.jsx";
import Sidebar from "./shared/sidebar.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* <- fijo, siempre cargado */}

      <div className="flex-1">
        <Routes>
          <Route path="/suppliers" element={<IndexSuppliers />} />
          <Route path="/categories" element={<IndexCategories />} />
          <Route path="/users" element={<IndexUsers />} />
          <Route path="/roles" element={<IndexRoles />} />
          <Route path="/" element={<h1 className="p-8">Inicio</h1>} />
        </Routes>
      </div>
    </div>
  );
}
