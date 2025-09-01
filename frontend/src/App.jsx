// App.jsx
import { Routes, Route } from "react-router-dom";
import IndexSuppliers from "./features/suppliers/indexSuppliers.jsx";
import IndexCategories from "./features/categories/indexCategories.jsx";
import Sidebar from "./shared/sidebar.jsx";
import IndexClientReturns from "./features/returns/indexClientReturns.jsx";
import RoutesAdmin from "./routes.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* <- fijo, siempre cargado */}

      <div className="flex-1">
      <RoutesAdmin/>
      </div>
    </div>
  );
}
