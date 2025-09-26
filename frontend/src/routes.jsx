import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
// Auth
import ForgotPassword from "./auth/ForgotPassword";
import RecoverPassword from "./auth/RecoverPassword";
// Features
import IndexSuppliers from "./features/suppliers/indexSuppliers";
import IndexCategories from "./features/categories/indexCategories";
import IndexClients from "./features/clients/indexClients";
import IndexSales from "./features/Sales/indexSales";
import IndexProducts from "./features/products/indexProducts";
import IndexLow from "./features/returns/low/indexLow";
import IndexUsers from "./features/users/indexUsers";
import IndexRoles from "./features/roles/indexRoles";
import IndexSettings from "./features/settings/indexSettings";
import IndexPurchases from "./features/purchases/indexPurchases";
import IndexClientReturns from "./features/returns/returnClient/indexClientReturns";
import Landing from "./pages/landing/landing.jsx";
import IndexRegisterSale from "./features/sales/indexRegisterSale";
import IndexRegisterPurchase from "./features/purchases/indeRegisterPurchase";
import IndexProductReturns from "./features/returns/returnProduct/indexProductReturns";
import IndexRegisterPurchase from "./features/purchases/indeRegisterPurchase"
import IndexRegisterSale from "./features/sales/indexRegisterSale";
import DashboardLayout from "./layouts/dashboard/dashboardLayout";
import DashboardSuppliers from "./features/dashboard/dashboardSuppliers";
import DashboardCategories from "./features/dashboard/dashboardCategories";
import DashboardClients from "./features/dashboard/dashboardClients";
import DashboardSales from "./features/dashboard/dashboardSales";
import DashboardProducts from "./features/dashboard/dashboardProducts";
import DashboardPurchases from "./features/dashboard/dashboardPurchases";
import DashboardReturnClients from "./features/dashboard/returns/dashboardReturnClients";
import DashboardReturnProducts from "./features/dashboard/returns/dashboardReturnProducts";
import DashboardLows from "./features/dashboard/returns/dashboardLows";
import AllProductsPage from "./features/products/allProductsPage";
import ProductsLayout from "./layouts/ProductsLayout";

export default function RoutesAdmin() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<AuthLayout />} />
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthLayout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/recover-password" element={<RecoverPassword />} />
      {/* Main App */}
      <Route path="/app" element={<MainLayout />}>
        <Route path="suppliers" element={<IndexSuppliers />} />
        <Route path="categories" element={<IndexCategories />} />
        <Route path="clients" element={<IndexClients />} />
        <Route path="sales" element={<IndexSales />} />
        <Route path="sales/register" element={<IndexRegisterSale />} />
        <Route path="purchases" element={<IndexPurchases />} />
        <Route path="purchases/register" element={<IndexRegisterPurchase />} />
        <Route path="products" element={<IndexProducts />} />
        {/* Products */}
        <Route path="products" element={<ProductsLayout />}>
          <Route index element={<IndexProducts />} />
          <Route path=":id/detalles" element={<AllProductsPage />} />
        </Route>
        {/* Returns */}
        <Route path="returns">
          <Route path="clients" element={<IndexClientReturns />} />
          <Route path="products" element={<IndexProductReturns />} />
          <Route path="low" element={<IndexLow />} />
        </Route>

        {/* Settings */}
        <Route path="settings">
          <Route path="users" element={<IndexUsers />} />
          <Route path="roles" element={<IndexRoles />} />
          <Route path="general" element={<IndexSettings />} />
        </Route>
        <Route path="" element={<DashboardLayout />}>
          <Route path="dashboard/suppliers" element={<DashboardSuppliers />} />
          <Route path="dashboard/categories" element={<DashboardCategories />} />
          <Route path="dashboard/clients" element={<DashboardClients />} />
          <Route path="dashboard/sales" element={<DashboardSales />} />
          <Route path="dashboard/products" element={<DashboardProducts />} />
          <Route path="dashboard/purchases" element={<DashboardPurchases />} />
          <Route path="dashboard/return">
            <Route path="clients" element={<DashboardReturnClients />} />
            <Route path="products" element={<DashboardReturnProducts />} />
            <Route path="low" element={<DashboardLows />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
