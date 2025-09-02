import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import IndexSuppliers from "./features/suppliers/indexSuppliers"
import IndexClientReturns from "./features/returns/indexClientReturns";
import IndexCategories from "./features/categories/indexCategories";
// ... otros componentes de página

export default function RoutesAdmin() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />} />
      <Route path="/app" element={<MainLayout />}>
        <Route path="suppliers" element={<IndexSuppliers />} />
        <Route path="categories" element={<IndexCategories />} />
        <Route path="returns">
          <Route path="clients" element={<IndexClientReturns />} />
        </Route>
        </Route>
      </Routes>
  );
}