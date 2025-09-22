// pages/products/AllProducts.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ViewDetailsButton, DeleteButton } from "../../shared/components/buttons";
import Paginator from "../../shared/components/paginator";
import SearchBar from "../../shared/components/searchBars/searchbar";
import ondas from "../../assets/ondasHorizontal.png";
import DetailProductModal from "./DetailProductModal";

export default function AllProductsPage() {
  const { state } = useLocation();
  const params = useParams();
  const passedProduct = state?.product || null;
  const productId = params.id || null;

  const product = passedProduct ?? { nombre: "Producto desconocido", stockActual: 0, lotes: [] };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const perPage = 5;

  
  // Tomamos los lotes directamente
  const allProducts = product.lotes.map((l) => ({
    id: l.id,
    nombre: product.nombre,
    barcode: l.barcode,
    vencimiento: l.vencimiento,
    cantidad: l.stock,
    consumido: l.stockMax ? l.stockMax - l.stock : 0,
    precio: product.precio,
  }));
  

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return allProducts;
    return allProducts.filter((p) =>
      `${p.id} ${p.barcode} ${p.vencimiento}`.toLowerCase().includes(s)
    );
  }, [searchTerm, allProducts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen">
      {/* Fondo ondas */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          transform: "scaleX(1.15)",
          zIndex: 0,
        }}
      />

      <div className="flex-1 relative min-h-screen p-8 overflow-hidden">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Detalles — {product.nombre}</h2>
              <p className="text-sm text-gray-500 mt-1">Administrador de Inventario</p>
            </div>
          </div>

          {/* Barra búsqueda */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex-grow max-w-xl">
              <SearchBar
                placeholder="Buscar detalles..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Tabla */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <table key={currentPage} className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">ID Detalle</th>
                  <th className="px-6 py-4">Código de barras</th>
                  <th className="px-6 py-4">Fecha de vencimiento</th>
                  <th className="px-6 py-4">Cantidad</th>
                  <th className="px-6 py-4">Stock consumido</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No se encontraron detalles.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((p) => (
                    <motion.tr key={p.id} className="hover:bg-gray-50" variants={rowVariants}>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.barcode}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.vencimiento}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.cantidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.consumido}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${p.precio}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewDetailsButton
                            event={() => {
                              setSelectedProduct(p);
                              setIsModalOpen(true);
                            }}
                          />
                          <DeleteButton event={() => alert(`Eliminar ${p.id}`)} />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>

          {/* Paginador */}
          <div className="mt-4">
            <Paginator
              currentPage={currentPage}
              perPage={perPage}
              totalPages={totalPages}
              filteredLength={filtered.length}
              goToPage={goToPage}
            />
          </div>
        </div>
      </div>

      {/* Modal externo */}
      <DetailProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
