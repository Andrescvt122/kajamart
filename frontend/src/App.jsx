// App.jsx
import { Routes, Route } from "react-router-dom";
import IndexSuppliers from "./features/suppliers/indexSuppliers.jsx";
import IndexCategories from "./features/categories/indexCategories.jsx";
import Sidebar from "./shared/sidebar.jsx";
import IndexClientReturns from "./features/returns/indexClientReturns.jsx";
import RoutesAdmin from "./routes.jsx";
import IndexCategories from "./features/categories/indexCategories.jsx";
import IndexUsers from "./features/users/indexUsers.jsx";
import IndexRoles from "./features/roles/indexRoles.jsx";
import IndexSales from "./features/sales/indexSales.jsx";
import IndexClients from "./features/clients/indexClients.jsx";
import IndexPurchases from "./features/purchases/indexPurchases.jsx";
import IndexProducts from "./features/products/indexProducts.jsx";
import IndexClientReturns from "./features/returns/indexClientReturns.jsx";
import IndexProductReturns from "./features/returns/indexProductReturns.jsx";
import IndexLow from "./features/returns/indexLow.jsx";
import IndexSettings from "./features/settings/indexSettings.jsx";
import Login from "./auth/login.jsx";

// 1. Importa los layouts
import MainLayout from "/src/layouts/MainLayout.jsx";
import AuthLayout from "/src/layouts/AuthLayout.jsx";

export default function App() {
  return (
    // Si ya tienes BrowserRouter en tu main.jsx, puedes quitarlo de aquí.
    <Routes>
      {/* --- Grupo de Rutas Públicas (SIN Sidebar) --- */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Login />} />
      </Route>
      <div className="flex-1">
      <RoutesAdmin/>
      </div>
    </div>
      {/* --- Grupo de Rutas Principales (CON Sidebar) --- */}
      <Route path="/app" element={<MainLayout />}>
        <Route index element={<h1 className="p-8">Inicio</h1>} />
        <Route path="suppliers" element={<IndexSuppliers />} />
        <Route path="categories" element={<IndexCategories />} />
        <Route path="users" element={<IndexUsers />} />
        <Route path="roles" element={<IndexRoles />} />
        <Route path="sales" element={<IndexSales />} />
        <Route path="clients" element={<IndexClients />} />
        <Route path="purchases" element={<IndexPurchases />} />
        <Route path="products" element={<IndexProducts />} />
        <Route path="settings" element={<IndexSettings />} />
        <Route path="returns">
          <Route path="clients" element={<IndexClientReturns />} />
          <Route path="products" element={<IndexProductReturns />} />
          <Route path="low" element={<IndexLow />} />
        </Route>
      </Route>
    </Routes>
  );
}
