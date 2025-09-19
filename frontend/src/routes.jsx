import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import ForgotPassword from "./auth/ForgotPassword";
import RecoverPassword from "./auth/RecoverPassword";
import IndexSuppliers from "./features/suppliers/indexSuppliers";
import IndexCategories from "./features/categories/indexCategories";
import IndexClients from "./features/clients/indexClients";
import IndexSales from "./features/Sales/indexSales";
import IndexProducts from "./features/products/indexProducts";
import IndexProductReturns from "./features/returns/indexProductReturns";
import IndexLow from "./features/returns/low/indexLow";
import IndexUsers from "./features/users/indexUsers";
import IndexRoles from "./features/roles/indexRoles";
import IndexSettings from "./features/settings/indexSettings";
import IndexPurchases from "./features/purchases/indexPurchases";
import IndexClientReturns from "./features/returns/returnClient/indexClientReturns";

export default function RoutesAdmin() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/recover-password" element={<RecoverPassword />} /> 
      
      <Route path="/app" element={<MainLayout />}>
        <Route path="suppliers" element={<IndexSuppliers />} />
        <Route path="categories" element={<IndexCategories />} />
        <Route path="clients" element={<IndexClients />} />
        <Route path="sales" element={<IndexSales />} />
        <Route path="purchases" element={<IndexPurchases />} />
        <Route path="products" element={<IndexProducts />} />
        <Route path="returns">
          <Route path="clients" element={<IndexClientReturns />} />
          <Route path="products" element={<IndexProductReturns />} />
          <Route path="low" element={<IndexLow />} />
        </Route>
        <Route path="settings">
          <Route path="users" element={<IndexUsers />} />
          <Route path="roles" element={<IndexRoles />} />
          <Route path="general" element={<IndexSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}