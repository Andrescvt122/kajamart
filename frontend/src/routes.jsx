import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Auth
import ForgotPassword from "./auth/ForgotPassword";
import RecoverPassword from "./auth/recoverPassword";

// Features
import IndexSuppliers from "./features/suppliers/indexSuppliers";
import IndexCategories from "./features/categories/indexCategories";
import IndexClients from "./features/clients/indexClients";
import IndexSales from "./features/sales/indexSales";
import IndexProducts from "./features/products/indexProducts";
import IndexLow from "./features/returns/low/indexLow";
import IndexUsers from "./features/users/indexUsers";
import IndexRoles from "./features/roles/indexRoles";
import IndexSettings from "./features/settings/indexSettings";
import IndexPurchases from "./features/purchases/indexPurchases";
import IndexClientReturns from "./features/returns/returnClient/indexClientReturns";
import IndexRegisterSale from "./features/sales/indexRegisterSale";
import IndexRegisterPurchase from "./features/purchases/indeRegisterPurchase";
import IndexProductReturns from "./features/returns/returnProduct/indexProductReturns";

import Landing from "./pages/landing/landing.jsx";

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
import Welcome from "./pages/dashboard/Welcome";

import PublicRoute from "./PublicRoute.jsx";
import ProtectedRoute from "./protectedRoute.jsx";
import PrivatedRoute from "./privatedRoute.jsx";

import Error403 from "./pages/error/Error403.jsx";
import { useAuth } from "./context/useAtuh.jsx";

export default function RoutesAdmin() {
  const { hasPermission } = useAuth();

  const canView = {
    users: hasPermission("Ver usuarios"),
    roles: hasPermission("Ver roles"),
    products: hasPermission("Ver productos"),
    categories: hasPermission("Ver categorías"),
    suppliers: hasPermission("Ver proveedores"),
    clients: hasPermission("Ver clientes"),
    purchases: hasPermission("Ver compras"),
    sales: hasPermission("Ver ventas"),
    returnClients: hasPermission("Ver devolución clientes"),
    returnProducts: hasPermission("Ver Gestión devolución productos"),
    low: hasPermission("Ver baja productos"),
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />

      {/* Auth (solo si NO está logueado) */}
      <Route element={<PublicRoute />}>
        <Route path="/auth" element={<AuthLayout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<RecoverPassword />} />
      </Route>

      {/* App (logueado) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<MainLayout />}>
          {/* Suppliers */}
          <Route element={<PrivatedRoute permission={canView.suppliers} />}>
            <Route path="suppliers" element={<IndexSuppliers />} />
          </Route>

          {/* Categories */}
          <Route element={<PrivatedRoute permission={canView.categories} />}>
            <Route path="categories" element={<IndexCategories />} />
          </Route>

          {/* Clients */}
          <Route element={<PrivatedRoute permission={canView.clients} />}>
            <Route path="clients" element={<IndexClients />} />
          </Route>

          {/* Sales */}
          <Route element={<PrivatedRoute permission={canView.sales} />}>
            <Route path="sales" element={<IndexSales />} />
            <Route path="sales/register" element={<IndexRegisterSale />} />
          </Route>

          {/* Purchases */}
          <Route element={<PrivatedRoute permission={canView.purchases} />}>
            <Route path="purchases" element={<IndexPurchases />} />
            <Route
              path="purchases/register"
              element={<IndexRegisterPurchase />}
            />
          </Route>

          {/* Products (incluye detalles) */}
          <Route element={<PrivatedRoute permission={canView.products} />}>
            <Route path="products" element={<ProductsLayout />}>
              <Route index element={<IndexProducts />} />
              <Route path=":id/detalles" element={<AllProductsPage />} />
            </Route>
          </Route>

          {/* Returns */}
          <Route path="returns">
            <Route
              element={<PrivatedRoute permission={canView.returnClients} />}
            >
              <Route path="clients" element={<IndexClientReturns />} />
            </Route>

            <Route
              element={<PrivatedRoute permission={canView.returnProducts} />}
            >
              <Route path="products" element={<IndexProductReturns />} />
            </Route>

            <Route element={<PrivatedRoute permission={canView.low} />}>
              <Route path="low" element={<IndexLow />} />
            </Route>
          </Route>

          {/* Settings */}
          <Route path="settings">
            <Route element={<PrivatedRoute permission={canView.users} />}>
              <Route path="users" element={<IndexUsers />} />
            </Route>

            <Route element={<PrivatedRoute permission={canView.roles} />}>
              <Route path="roles" element={<IndexRoles />} />
            </Route>

            {/* Si “general” también debe tener permiso, dime cuál.
                Por ahora lo dejo libre (logueado) como lo tenías */}
            <Route path="general" element={<IndexSettings />} />
          </Route>

          {/* Dashboard */}
          <Route element={<DashboardLayout />}>
            <Route index element={<Welcome />} />

            <Route element={<PrivatedRoute permission={canView.suppliers} />}>
              <Route
                path="dashboard/suppliers"
                element={<DashboardSuppliers />}
              />
            </Route>

            <Route element={<PrivatedRoute permission={canView.categories} />}>
              <Route
                path="dashboard/categories"
                element={<DashboardCategories />}
              />
            </Route>

            <Route element={<PrivatedRoute permission={canView.clients} />}>
              <Route path="dashboard/clients" element={<DashboardClients />} />
            </Route>

            <Route element={<PrivatedRoute permission={canView.sales} />}>
              <Route path="dashboard/sales" element={<DashboardSales />} />
            </Route>

            <Route element={<PrivatedRoute permission={canView.products} />}>
              <Route
                path="dashboard/products"
                element={<DashboardProducts />}
              />
            </Route>

            <Route element={<PrivatedRoute permission={canView.purchases} />}>
              <Route
                path="dashboard/purchases"
                element={<DashboardPurchases />}
              />
            </Route>

            <Route path="dashboard/return">
              <Route
                element={<PrivatedRoute permission={canView.returnClients} />}
              >
                <Route path="clients" element={<DashboardReturnClients />} />
              </Route>
              <Route
                element={<PrivatedRoute permission={canView.returnProducts} />}
              >
                <Route path="products" element={<DashboardReturnProducts />} />
              </Route>
              <Route element={<PrivatedRoute permission={canView.low} />}>
                <Route path="low" element={<DashboardLows />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Error */}
      <Route path="/403" element={<Error403 />} />
    </Routes>
  );
}
