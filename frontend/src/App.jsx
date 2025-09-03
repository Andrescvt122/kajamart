// App.jsx
import { Routes, Route } from "react-router-dom";
import IndexSuppliers from "./features/suppliers/indexSuppliers.jsx";
import IndexCategories from "./features/Categories/indexCategories.jsx";
import Sidebar from "./shared/sidebar.jsx";
import IndexClients from "./features/clients/indexClients.jsx";
import IndexSales from "./features/Sales/indexSales.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* <- fijo, siempre cargado */}

      <div className="flex-1">
        <Routes>
          {/* Proveedores */}
          <Route path="/suppliers" element={<IndexSuppliers />} />
          {/* Categories */}
          <Route path="/categories" element={<IndexCategories />} />
          <Route path="/" element={<h1 className="p-8">Inicio</h1>} />
           {/* Clientes */}
          <Route path="/clients" element={<IndexClients />} />
          <Route path="/sales" element={<IndexSales />} />
        </Routes>
      </div>
    </div>
  );
    <>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Sidebar />} />

        {/* Proveedores */}
        <Route path="/suppliers" element={<IndexSuppliers />} />

        {/* Clientes */}
        <Route path="/clients" element={<IndexClients />} />
        <Route path="/sales" element={<IndexSales />} />
      </Routes>
    </>
  );
}
