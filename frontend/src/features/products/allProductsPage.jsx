// frontend/src/features/products/AllProductsPage.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ViewDetailsButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
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
import { exportProductsToExcel } from "./helpers/exportToXlsProducts";
import { exportProductsToPDF } from "./helpers/exportToPdfProducts";
import Loading from "../../features/onboarding/loading.jsx";

// hooks
import { useProduct } from "../../shared/components/hooks/products/products.hooks";
import {
  useDetailProductsByProduct,
  useDeleteDetailProduct,
} from "../../shared/components/hooks/productDetails/productDetails.hooks";

// Textos seguros
const LONG_TEXT_CLS =
  "whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] hyphens-auto max-w-full overflow-hidden";
const ONE_LINE_SAFE =
  "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";

// Chevron acordeón móvil
function ChevronIcon({ open }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      className="text-gray-500"
    >
      <path
        d="M5.5 7.5l4.5 4 4.5-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

// Helper para extraer mensaje de error del backend
const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.message ||
  fallback ||
  "Ocurrió un error inesperado.";

export default function AllProductsPage() {
  const { state } = useLocation();
  const params = useParams();

  const passedProduct = state?.product || null;
  const productId =
    (params.id && Number(params.id)) ||
    passedProduct?.id_producto ||
    passedProduct?.id ||
    null;

  const { data: fetchedProduct } = useProduct(productId);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const product =
    passedProduct ?? fetchedProduct ?? { nombre: "Producto desconocido", precio_venta: 0 };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);

  const perPage = 5;

  // data
  const {
    data: backendDetails = [],
    isLoading,
    error,
  } = useDetailProductsByProduct(productId);

  // Mensaje de error legible para listar
  const errorMessage = error
    ? getErrorMessage(error, "Error al cargar los detalles del producto.")
    : null;

  // map UI
  const allProducts = useMemo(() => {
    if (!Array.isArray(backendDetails)) return [];
    return backendDetails.map((d) => ({
      id: d.id_detalle_producto,
      nombre: product.nombre,
      barcode: d.codigo_barras_producto_compra ?? "—",
      vencimiento: d.fecha_vencimiento
        ? new Date(d.fecha_vencimiento).toISOString().slice(0, 10)
        : "Sin fecha",
      cantidad: d.stock_producto ?? 0,
      consumido: 0,
      precio: product.precio_venta ?? 0,
    }));
  }, [backendDetails, product]);

  // filtro + paginación
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
  }, [filtered, currentPage, perPage]);

  const goToPage = (n) =>
    setCurrentPage(Math.min(Math.max(1, n), totalPages));

  // delete
  const deleteDetailMutation = useDeleteDetailProduct();

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

  // Animaciones tipo “Proveedores”
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.12 },
    },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  // acordeón móvil
  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Fondo ondas */}
      <div
        className="absolute bottom-0 inset-x-0 w-full pointer-events-none overflow-x-clip"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          zIndex: 0,
        }}
      >
        <div className="h-full w-full" />
      </div>

      <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip">
        <div className="relative z-10 mx-auto w-full max-w-screen-xl min-w-0">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2
              className={"text-2xl sm:text-3xl font-semibold " + ONE_LINE_SAFE}
              title={product.nombre}
            >
              Detalles — {product.nombre}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Administrador de Inventario
            </p>
          </div>

          {/* Toolbar */}
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-3">
              {/* Buscar */}
              <div className="min-w-0">
                <SearchBar
                  placeholder="Buscar detalles..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10"
                />
              </div>

              {/* Exportar Excel */}
              <div className="flex justify-end">
                <ExportExcelButton
                  event={() => exportProductsToExcel(filtered)}
                >
                  Excel
                </ExportExcelButton>
              </div>

              {/* Exportar PDF */}
              <div className="flex justify-end">
                <ExportPDFButton event={() => exportProductsToPDF(filtered)}>
                  PDF
                </ExportPDFButton>
              </div>
            </div>
          </div>

          {/* ====== LISTADO ====== */}

          {/* Móvil: acordeón con cascada */}
          <motion.div
            className="md:hidden"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
                <Loading inline heightClass="h-28" />
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-red-500">
                {errorMessage}
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron detalles.
              </div>
            ) : (
              <motion.ul
                className="space-y-3"
                variants={listVariants}
                key={`m-${currentPage}-${filtered.length}-${searchTerm}`}
                initial="hidden"
                animate="visible"
              >
                {pageItems.map((p) => {
                  const isOpen = expanded.has(p.id);
                  const pid = `detail-${p.id}`;
                  return (
                    <motion.li
                      key={p.id + "-m"}
                      variants={rowVariants}
                      className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(p.id)}
                        aria-expanded={isOpen}
                        aria-controls={pid}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <p
                              className={
                                "text-base font-semibold text-gray-900 " +
                                ONE_LINE_SAFE
                              }
                              title={p.barcode}
                            >
                              {p.barcode}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Vence: {p.vencimiento}
                            </p>
                          </div>
                          <ChevronIcon open={isOpen} />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={pid}
                            initial={{ height: 0, opacity: 0, y: -4 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -2 }}
                            transition={{
                              duration: 0.32,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="overflow-hidden border-t border-gray-100"
                            aria-live="polite"
                          >
                            <div className="px-4 py-4 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  ID Detalle
                                </p>
                                <p className="text-sm text-gray-800">{p.id}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Cantidad
                                </p>
                                <p className="text-sm text-gray-800">
                                  {p.cantidad}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Consumido
                                </p>
                                <p className="text-sm text-gray-800">
                                  {p.consumido}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Precio
                                </p>
                                <p className="text-sm text-gray-800">
                                  ${Number(p.precio || 0).toLocaleString()}
                                </p>
                              </div>

                              <div className="col-span-2 pt-1 flex items-center gap-2">
                                <ViewDetailsButton
                                  event={() => {
                                    setSelectedDetail(p);
                                    setIsModalOpen(true);
                                  }}
                                />
                                <DeleteButton
                                  event={() => handleDeleteClick(p)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </motion.div>

          {/* Desktop: tabla con cascada */}
          <motion.div
            className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto max-w-full">
              <table className="min-w-[780px] lg:min-w-[940px] w-full md:table-fixed">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 lg:px-6 py-3 lg:py-4">ID Detalle</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">
                      Código de barras
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">
                      Fecha de vencimiento
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Cantidad</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">
                      Stock consumido
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Precio</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <motion.tbody
                  key={`d-${currentPage}-${filtered.length}-${searchTerm}`}
                  className="divide-y divide-gray-100"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
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
                        {errorMessage}
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
                        className="hover:bg-gray-50 align-top"
                        variants={rowVariants}
                      >
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {p.id}
                        </td>

                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">
                          <div className="min-w-0 max-w-[30ch] lg:max-w-[40ch]">
                            <div className={ONE_LINE_SAFE} title={p.barcode}>
                              {p.barcode}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {p.vencimiento}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {p.cantidad}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {p.consumido}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          ${Number(p.precio || 0).toLocaleString()}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right">
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
                </motion.tbody>
              </table>
            </div>
          </motion.div>

          {/* Paginador */}
          <div className="mt-4 sm:mt-6">
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
