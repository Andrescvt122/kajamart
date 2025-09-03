import { Routes, Route } from "react-router-dom";
import IndexSuppliers from "./features/suppliers/indexSuppliers.jsx";
import IndexClients from "./features/clients/indexClients.jsx";
import Sidebar from "./shared/sidebar.jsx";
import IndexSales from "./features/Sales/indexSales.jsx";

export default function App() {
  return (
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
