// frontend/src/features/products/AllProductsPage.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
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
import { useAuth } from "../../context/useAtuh.jsx";

// hooks
import { useProduct } from "../../shared/components/hooks/products/products.hooks";
import {
  useDetailProductsByProduct,
  useDeleteDetailProduct,
} from "../../shared/components/hooks/productDetails/productDetails.hooks";

const LONG_TEXT_CLS =
  "whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] hyphens-auto max-w-full overflow-hidden";
const ONE_LINE_SAFE =
  "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";

const STATUS_BADGE_BASE =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";

const getStatusBadgeClass = (status) =>
  status === "Activo"
    ? "bg-green-50 text-green-700 border-green-100"
    : "bg-red-50 text-red-700 border-red-100";

function ChevronIcon({ open }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
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

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback ||
  "Ocurrió un error inesperado.";

const getErrorTitle = (err) => {
  const status = err?.response?.status;
  if (!err?.response) return "No se pudo conectar";
  if (status === 400) return "Datos inválidos";
  if (status === 401) return "No autorizado";
  if (status === 403) return "Acceso denegado";
  if (status === 404) return "No encontrado";
  if (status === 409) return "No se puede completar";
  if (status >= 500) return "Error del servidor";
  return `Error (${status || "desconocido"})`;
};
const formatPriceOrUnassigned = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return "—";
  if (n === 1001) return "aun no asignado";
  return `$${n.toLocaleString()}`;
};
export default function AllProductsPage() {
  const { state } = useLocation();
  const params = useParams();
  const { hasPermission } = useAuth();
  const canDelete = hasPermission("Eliminar productos");

  const passedProduct = state?.product || null;
  const productId =
    (params.id && Number(params.id)) ||
    passedProduct?.id_producto ||
    passedProduct?.id ||
    null;

  const { data: fetchedProduct } = useProduct(productId);

  const product = passedProduct ??
    fetchedProduct ?? { nombre: "Producto desconocido", precio_venta: 0 };

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductToDelete, setSelectedProductToDelete] =
    useState(null);

  const perPage = 5;

  const {
    data: backendDetails = [],
    isLoading,
    error,
  } = useDetailProductsByProduct(productId);

  const errorMessage = error
    ? getErrorMessage(error, "Error al cargar los detalles del producto.")
    : null;

  const lastListErrorRef = useRef(null);
  useEffect(() => {
    if (!error) return;
    const title = getErrorTitle(error);
    const msg = getErrorMessage(
      error,
      "Error al cargar los detalles del producto."
    );
    const key = `${title}::${msg}`;
    if (lastListErrorRef.current !== key) {
      showErrorAlert(`${title}: ${msg}`);
      lastListErrorRef.current = key;
    }
  }, [error]);

  // ✅ MAP UI CORRECTO
  const allProducts = useMemo(() => {
    if (!Array.isArray(backendDetails)) return [];

    return backendDetails.map((d) => ({
      id: d.id_detalle_producto,
      nombre: product.nombre,
      barcode: d.codigo_barras_producto_compra ?? "—",
      estado: d.estado === false ? "Inactivo" : "Activo",
      vencimiento: d.fecha_vencimiento
        ? new Date(d.fecha_vencimiento).toISOString().slice(0, 10)
        : "Sin fecha",
      cantidad: d.stock_producto ?? 0,
      consumido: 0,

      // 🔥 precio por lote si existe
      precio: d.precio_venta ?? product.precio_venta ?? 0,

      // datos extra para modal
      id_detalle_producto: d.id_detalle_producto,
      codigo_barras_producto_compra: d.codigo_barras_producto_compra,
      fecha_vencimiento: d.fecha_vencimiento,
      stock_producto: d.stock_producto,
      es_devolucion: d.es_devolucion,
      iva_porcentaje: d.iva_porcentaje,
      icu_porcentaje: d.icu_porcentaje,
      precio_venta: d.precio_venta,
      costo_unitario: d.costo_unitario,
      incremento_venta: d.incremento_venta,
    }));
  }, [backendDetails, product]);

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return allProducts;
    return allProducts.filter((p) =>
      `${p.id} ${p.barcode} ${p.vencimiento} ${p.estado}`
        .toLowerCase()
        .includes(s)
    );
  }, [searchTerm, allProducts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  const goToPage = (n) => setCurrentPage(Math.min(Math.max(1, n), totalPages));

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
      const title = getErrorTitle(err);
      const msg = getErrorMessage(err, "Error al eliminar el detalle");
      showErrorAlert(`${title}: ${msg}`);
    }
  };

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
      <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-screen-xl">
          <div className="mb-4 sm:mb-6">
            <h2 className={"text-2xl sm:text-3xl font-semibold " + ONE_LINE_SAFE}>
              Detalles — {product.nombre}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Administrador de Inventario
            </p>
          </div>

          {/* BUSCAR + EXPORT */}
          <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
            <SearchBar
              placeholder="Buscar detalles..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <ExportExcelButton event={() => exportProductsToExcel(filtered)}>
              Excel
            </ExportExcelButton>

            <ExportPDFButton event={() => exportProductsToPDF(filtered)}>
              PDF
            </ExportPDFButton>
          </div>

          {/* TABLA */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Código</th>
                    <th className="px-6 py-4">Vencimiento</th>
                    <th className="px-6 py-4">Cantidad</th>
                    <th className="px-6 py-4">Consumido</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12">
                        <Loading inline heightClass="h-28" />
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                        No se encontraron detalles.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-black">{p.id}</td>
                        <td className="px-6 py-4 text-black">{p.barcode}</td>
                        <td className="px-6 py-4 text-black">{p.vencimiento}</td>
                        <td className="px-6 py-4 text-black">{p.cantidad}</td>
                        <td className="px-6 py-4 text-black">{p.consumido}</td>
                        <td className="px-6 py-4 text-black">
                          ${Number(p.precio || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`${STATUS_BADGE_BASE} ${getStatusBadgeClass(
                              p.estado
                            )}`}
                          >
                            {p.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <ViewDetailsButton
                              event={() => {
                                setSelectedDetail(p);
                                setIsModalOpen(true);
                              }}
                            />
                            <DeleteButton
                              canDelete={canDelete}
                              event={() => handleDeleteClick(p)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="mt-6">
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

      <ProductDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        product={selectedProductToDelete}
      />

      <DetailProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        detail={selectedDetail}
        product={product}
      />
    </div>
  );
}