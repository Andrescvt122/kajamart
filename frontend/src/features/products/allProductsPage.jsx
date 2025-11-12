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
import {
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts";
import {
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import { exportProductsToExcel } from "./helpers/exportToXlsProducts";
import { exportProductsToPDF } from "./helpers/exportToPdfProducts";
import Loading from "../../features/onboarding/loading.jsx"; // ⬅️ loader inline

// 🔹 hooks de productos y detalle_productos
import { useProduct } from "../../shared/components/hooks/products/products.hooks";
import {
  useDetailProductsByProduct,
  useDeleteDetailProduct,
} from "../../shared/components/hooks/productDetails/productDetails.hooks";

export default function AllProductsPage() {
  const { state } = useLocation();
  const params = useParams();

  const passedProduct = state?.product || null;

  const productId =
    (params.id && Number(params.id)) ||
    passedProduct?.id_producto ||
    passedProduct?.id ||
    null;

  // 🔹 Traer info del producto si no viene por state
  const { data: fetchedProduct } = useProduct(productId);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const product =
    passedProduct ??
    fetchedProduct ?? {
      nombre: "Producto desconocido",
      precio_venta: 0,
    };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 👇 estados modal detalle y delete
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);

  const perPage = 5;

  // 🔹 Traer detalles reales desde backend (detalle_productos)
  const {
    data: backendDetails = [],
    isLoading,
    error,
  } = useDetailProductsByProduct(productId);

  // 🔹 Formatear detalles para la tabla
  const allProducts = useMemo(() => {
    if (!Array.isArray(backendDetails)) return [];
    return backendDetails.map((d) => ({
      id: d.id_detalle_producto,
      nombre: product.nombre,
      barcode: d.codigo_barras_producto_compra,
      vencimiento: d.fecha_vencimiento
        ? new Date(d.fecha_vencimiento).toISOString().slice(0, 10)
        : "Sin fecha",
      cantidad: d.stock_producto,
      consumido: 0,
      precio: product.precio_venta ?? 0,
    }));
  }, [backendDetails, product]);

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
  }, [filtered, currentPage, perPage]); // ⬅️ incluye perPage

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // 🔴 mutation para eliminar detalle en backend
  const deleteDetailMutation = useDeleteDetailProduct();

  // 👉 funciones delete
  const handleDeleteClick = (p) => {
    setSelectedProductToDelete(p);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (p) => {
    try {
      showLoadingAlert("Eliminando detalle...");
      await deleteDetailMutation.mutateAsync({
        id_detalle_producto: p.id,
        id_producto: productId,
      });
      showSuccessAlert("Detalle eliminado correctamente");
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      showErrorAlert(
        err?.response?.data?.message || "Error al eliminar el detalle"
      );
    }
  };

  // Animaciones (stagger en tbody + cascada en filas)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const tbodyVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <table
              key={`${currentPage}-${filtered.length}-${searchTerm}`} // fuerza re-animación por página/filtro
              className="min-w-full"
            >
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
                variants={tbodyVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12">
                        <Loading inline heightClass="h-28" />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-red-500"
                      >
                        No hay Registros  
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No se encontraron detalles.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((p) => (
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
                                setSelectedDetail(p);
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
        detail={selectedDetail}
        product={product}
      />
    </div>
  );
}
