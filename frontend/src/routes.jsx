import react from "react";
import { Routes, Route } from "react-router-dom";
import IndexSuppliers from "./features/suppliers/indexSuppliers";
import IndexClientReturns from "./features/returns/indexClientReturns";
import IndexCategories from "./features/Categories/indexCategories";
import FooterComponent from "./components/footerComponent";
export default function RoutesAdmin() {
  return (
    <>
      <Routes>
        <Route path="/suppliers" element={<IndexSuppliers />} />
        <Route path="/categories" element={<FooterComponent />} />
        <Route path="/returns/clients" element={<IndexClientReturns />} />
        <Route path="/" element={<h1 className="p-8">Inicio</h1>} />
      </Routes>
    </>
  );
}
