// pages/products/AllProducts.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ViewDetailsButton,
  DeleteButton,
} from "../../shared/components/buttons";
import Paginator from "../../shared/components/paginator";
import SearchBar from "../../shared/components/searchBars/searchbar";
import ondas from "../../assets/ondasHorizontal.png";
import DetailProductModal from "./DetailProductModal";
import ProductDeleteModal from "./productDeleteModal";
import { showLoadingAlert } from "../../shared/components/alerts";
import { ExportExcelButton,ExportPDFButton } from "../../shared/components/buttons";
import { exportProductsToExcel} from "./helpers/exportToXlsProducts"
import { exportProductsToPDF} from "./helpers/exportToPdfProducts"



export default function AllProductsPage() {
  const { state } = useLocation();
  const params = useParams();
  const passedProduct = state?.product || null;
  const productId = params.id || null;

  const product = passedProduct ?? {
    nombre: "Producto desconocido",
    stockActual: 0,
    lotes: [],
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 👇 estados modal detalle y delete
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);

  const perPage = 5;

  // Productos (lotes del producto)
  const [allProducts, setAllProducts] = useState(
    product.lotes.map((l) => ({
      id: l.id,
      nombre: product.nombre,
      barcode: l.barcode,
      vencimiento: l.vencimiento,
      cantidad: l.stock,
      consumido: l.stockMax ? l.stockMax - l.stock : 0,
      precio: product.precio,
    }))
  );

  // Filtro
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

  // 👉 funciones delete
  const handleDeleteClick = (p) => {
    setSelectedProductToDelete(p);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (p) => {
    setAllProducts((prev) => prev.filter((prod) => prod.id !== p.id));
    showLoadingAlert(`Detalle ${p.id} eliminado`);
  };

  // Animaciones
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }, // 👈 animación al eliminar
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
              <h2 className="text-3xl font-semibold">
                Detalles — {product.nombre}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de Inventario
              </p>
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

            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton event={() => exportProductsToExcel(filtered)}>
                Excel
              </ExportExcelButton>
              <ExportPDFButton event={() => exportProductsToPDF(filtered)}>
                PDF
              </ExportPDFButton>
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
              <motion.tbody
                className="divide-y divide-gray-100"
                variants={tableVariants}
              >
                <AnimatePresence>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No se encontraron detalles.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        className="hover:bg-gray-50"
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {p.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {p.barcode}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {p.vencimiento}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {p.cantidad}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {p.consumido}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          ${p.precio?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <ViewDetailsButton
                              event={() => {
                                setSelectedProduct(p);
                                setIsModalOpen(true);
                              }}
                            />

                            <DeleteButton event={() => handleDeleteClick(p)} />
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </motion.div>

          {/* Paginador */}
          <Paginator
            currentPage={currentPage}
            perPage={perPage}
            totalPages={totalPages}
            filteredLength={filtered.length}
            goToPage={goToPage}
          />
        </div>
      </div>

      {/* Delete Modal */}
      <ProductDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        product={selectedProductToDelete}
      />

      {/* Modal detalle */}
      <DetailProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
