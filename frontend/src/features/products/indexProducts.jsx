// frontend/src/features/products/indexProducts.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import SearchBar from "../../shared/components/searchBars/searchbar";
import { motion, AnimatePresence } from "framer-motion";
import { exportProductsToExcel } from "./helpers/exportToXls";
import { exportProductsToPDF } from "./helpers/exportToPdf";

import {
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts";

import ProductRegisterModal from "./productRegisterModal.jsx";
import ProductEditModal from "./productEditModal.jsx";
import ProductDeleteModal from "./productDeleteModal.jsx";
import { useCategories } from "../../shared/components/hooks/categories/categories.hooks.js";
import Loading from "../../features/onboarding/loading.jsx";

import {
  useProducts,
  useDeleteProduct,
  useUpdateProduct,
} from "../../shared/components/hooks/products/products.hooks.js";

// ===== Texto seguro / anti-overflow
const LONG_TEXT_CLS =
  "whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] hyphens-auto max-w-full overflow-hidden";
const ONE_LINE_SAFE =
  "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";

// ===== Animaciones (idénticas a Proveedores)
const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.12,
    },
  },
};
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

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

// Evitar overflow-x global
if (typeof document !== "undefined") {
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";
  document.documentElement.style.width = "100%";
  document.body.style.width = "100%";
}

export default function IndexProducts() {
  const navigate = useNavigate();

  // Datos
  const { data: productsRaw = [], isLoading, isError, error } = useProducts();

  const catHook =
    (typeof useCategories === "function" ? useCategories() : null) || {};
  const categoriesRaw = Array.isArray(catHook.categories)
    ? catHook.categories
    : [];
  const isCatLoading = catHook.isLoading ?? catHook.loading ?? false;
  const isCatError = catHook.isError ?? !!catHook.error ?? false;

  const deleteMutation = useDeleteProduct();
  const updateMutation = useUpdateProduct();

  // Normalizar categorías
  const categories = useMemo(
    () =>
      categoriesRaw
        .map((c) => ({
          id: c.id_categoria ?? c.id ?? "",
          nombre: c.nombre_categoria || c.nombre || "",
          estado: c.estado,
        }))
        .filter((c) => c.id && c.nombre),
    [categoriesRaw]
  );

  // Normalizar productos
  const products = useMemo(() => {
    if (!Array.isArray(productsRaw)) return [];
    return productsRaw.map((p) => ({
      id: p.id_producto,
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria:
        p.categoria ||
        p?.categorias?.nombre_categoria ||
        p?.categorias?.nombre ||
        "—",
      stockActual: p.stock_actual ?? 0,
      stockMin: p.stock_minimo ?? 0,
      stockMax: p.stock_maximo ?? 0,
      precio: p.precio_venta ?? 0,
      estado: p.estado ? "Activo" : "Inactivo",
      imagen: p.url_imagen || null,
      raw: p,
    }));
  }, [productsRaw]);

  // Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);

  const handleDeleteClick = (product) => {
    setSelectedProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (product) => {
    const id = product?.id;
    if (!id) {
      showErrorAlert && showErrorAlert("No se encontró id del producto.");
      return;
    }
    showLoadingAlert("Eliminando producto...");
    deleteMutation.mutate(id, {
      onSuccess: () => {
        showSuccessAlert &&
          showSuccessAlert("Producto eliminado correctamente.");
        setIsDeleteModalOpen(false);
        setSelectedProductToDelete(null);
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Error al eliminar el producto.";
        showErrorAlert && showErrorAlert(msg);
      },
    });
  };

  // Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    precioCompra: "",
    precioVenta: "",
    iva: "",
    stock: "",
    estado: "",
    categoria: "",
    imagenes: [],
  });
  const [selectedProductRaw, setSelectedProductRaw] = useState(null);

  const handleEditClick = (product) => {
    const p = product?.raw || product;
    setSelectedProductRaw(p);
    setSelectedProduct({
      id: p.id_producto,
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      precioCompra: p.costo_unitario != null ? String(p.costo_unitario) : "",
      precioVenta: p.precio_venta != null ? String(p.precio_venta) : "",
      iva:
        p.iva_detalle?.valor_impuesto != null
          ? `${p.iva_detalle.valor_impuesto}%`
          : p.iva != null && p.iva !== 0
          ? `${p.iva}%`
          : "",
      stock: p.stock_actual != null ? String(p.stock_actual) : "",
      estado: p.estado ? "Activo" : "Inactivo",
      categoria:
        p.categoria ||
        p?.categorias?.nombre_categoria ||
        p?.categorias?.nombre ||
        "",
      imagenes: p.url_imagen ? [p.url_imagen] : [],
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (editedForm) => {
    const id = selectedProductRaw?.id_producto;
    if (!id) {
      showErrorAlert && showErrorAlert("No se encontró el producto a editar.");
      return;
    }

    try {
      showLoadingAlert && showLoadingAlert("Guardando cambios...");

      const cat = categories.find((c) => c.nombre === editedForm.categoria);
      const id_categoria =
        cat?.id ??
        selectedProductRaw?.id_categoria ??
        selectedProductRaw?.categorias?.id_categoria ??
        null;

      const ivaVal =
        editedForm.iva && editedForm.iva.trim() !== ""
          ? editedForm.iva.replace("%", "")
          : "0";

      const newFile = (editedForm.imagenes || []).find(
        (it) => it instanceof File || it instanceof Blob
      );

      if (newFile) {
        const fd = new FormData();
        fd.append("nombre", editedForm.nombre.trim());
        fd.append("descripcion", editedForm.descripcion?.trim() || "");
        fd.append("stock_actual", String(Number(editedForm.stock) || 0));
        fd.append("estado", editedForm.estado === "Activo" ? "true" : "false");
        if (id_categoria) fd.append("id_categoria", String(id_categoria));
        fd.append("iva", String(ivaVal || "0"));
        fd.append(
          "costo_unitario",
          String(Number(editedForm.precioCompra) || 0)
        );
        fd.append("precio_venta", String(Number(editedForm.precioVenta) || 0));
        fd.append("imagen", newFile);

        await updateMutation.mutateAsync({ id, data: fd });
      } else {
        const payload = {
          nombre: editedForm.nombre.trim(),
          descripcion: editedForm.descripcion?.trim() || "",
          stock_actual: String(Number(editedForm.stock) || 0),
          estado: editedForm.estado === "Activo" ? "true" : "false",
          iva: String(ivaVal || "0"),
          costo_unitario: String(Number(editedForm.precioCompra) || 0),
          precio_venta: String(Number(editedForm.precioVenta) || 0),
        };
        if (id_categoria) payload.id_categoria = String(id_categoria);

        await updateMutation.mutateAsync({ id, ...payload });
      }

      showSuccessAlert && showSuccessAlert("Producto actualizado");
      setIsEditModalOpen(false);
      setSelectedProductRaw(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo actualizar el producto.";
      showErrorAlert && showErrorAlert(msg);
    }
  };

  // UI local
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const estadoRef = useRef(null);
  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const categoriaRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (estadoRef.current && !estadoRef.current.contains(e.target))
        setEstadoOpen(false);
      if (categoriaRef.current && !categoriaRef.current.contains(e.target))
        setCategoriaOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
  }, [isModalOpen]);

  const handleOpenModal = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setIsModalOpen(true);
  };

  // Filtro + paginación
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return products;
    if (/^activos?$/.test(s))
      return products.filter((p) => p.estado.toLowerCase() === "activo");
    if (/^inactivos?$/.test(s))
      return products.filter((p) => p.estado.toLowerCase() === "inactivo");
    return products.filter((p) =>
      `${p.id} ${p.nombre} ${p.descripcion || ""} ${p.categoria} ${p.estado}`
        .toLowerCase()
        .includes(s)
    );
  }, [products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  const goToPage = (n) => setCurrentPage(Math.min(Math.max(1, n), totalPages));

  // Errores globales
  if (isError || isCatError) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Error al cargar productos.";
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600 text-center">{msg}</p>
      </div>
    );
  }

  // Acordeón móvil
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
      {/* Fondo decorativo */}
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

      {/* Contenido */}
      <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip">
        <div className="relative z-10 mx-auto w-full max-w-screen-xl min-w-0">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">Productos</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Administrador de Inventario
            </p>
          </div>

          {/* Toolbar (alineada en una fila; responsive) */}
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-3">
              {/* Buscar (ocupa todo el espacio disponible) */}
              <div className="min-w-0">
                <SearchBar
                  placeholder="Buscar productos..."
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

              {/* Registrar */}
              <div className="flex justify-end">
                <button
                  onClick={handleOpenModal}
                  className="h-10 px-4 rounded-full bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
                >
                  Registrar Nuevo Producto
                </button>
              </div>
            </div>
          </div>
          {/* ====== LISTAS ====== */}

          {/* MÓVIL: lista/accordion con cascada */}
          <motion.div
            className="md:hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading || isCatLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
                <Loading inline heightClass="h-28" />
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron productos.
              </div>
            ) : (
              <motion.ul
                className="space-y-3"
                variants={tableVariants}
                key={`m-${currentPage}-${filtered.length}-${searchTerm}`}
                initial="hidden"
                animate="visible"
              >
                {pageItems.map((p, i) => {
                  const key = p.id ?? i;
                  const isOpen = expanded.has(key);
                  const pid = `prod-${key}`;
                  return (
                    <motion.li
                      key={key}
                      variants={rowVariants} // <- hereda del ul
                      className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(key)}
                        aria-expanded={isOpen}
                        aria-controls={pid}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          {/* Imagen */}
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            {p.imagen ? (
                              <img
                                src={p.imagen}
                                alt={p.nombre}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                No img
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={
                                "text-base font-semibold text-gray-900 " +
                                ONE_LINE_SAFE
                              }
                              title={p.nombre}
                            >
                              {p.nombre}
                            </p>
                            <p
                              className={
                                "text-xs text-gray-500 mt-1 " + ONE_LINE_SAFE
                              }
                              title={p.categoria}
                            >
                              {p.categoria}
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
                                  Stock
                                </p>
                                <p className="text-sm text-gray-800">
                                  {p.stockActual} (min {p.stockMin}, max{" "}
                                  {p.stockMax})
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
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Estado
                                </p>
                                <span
                                  className={`inline-flex items-center justify-center px-2.5 py-[3px] text-[11px] font-semibold rounded-full ${
                                    p.estado === "Activo"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {p.estado}
                                </span>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Descripción
                                </p>
                                <p
                                  className={
                                    "text-sm text-gray-800 " + LONG_TEXT_CLS
                                  }
                                >
                                  {p.descripcion || "—"}
                                </p>
                              </div>

                              <div className="col-span-2 pt-1 flex items-center gap-2">
                                <ViewButton
                                  event={() =>
                                    navigate(`/app/products/${p.id}/detalles`, {
                                      state: { product: p.raw || p },
                                    })
                                  }
                                />
                                <EditButton event={() => handleEditClick(p)} />
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

          {/* DESKTOP: tabla con cascada real (tbody → filas) */}
          <motion.div
            className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Imagen</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Nombre</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 hidden lg:table-cell">
                    Categoría
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Stock Actual</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 hidden xl:table-cell">
                    Stock Mínimo
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 hidden xl:table-cell">
                    Stock Máximo
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Precio</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Estado</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              {/* IMPORTANTE: el stagger vive en el tbody y las filas solo heredan */}
              <motion.tbody
                key={`d-${currentPage}-${filtered.length}-${searchTerm}`}
                className="divide-y divide-gray-100"
                variants={tableVariants}
                initial="hidden"
                animate="visible"
              >
                {isLoading || isCatLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12">
                      <Loading inline heightClass="h-28" />
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((p, i) => (
                    <motion.tr
                      key={p.id + "-" + i}
                      variants={rowVariants} // <- hereda de tbody
                      className="hover:bg-gray-50 align-top"
                      layout
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">
                              No img
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="min-w-0">
                          <div className={ONE_LINE_SAFE} title={p.nombre}>
                            {p.nombre}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                        <div className="min-w-0">
                          <div className={ONE_LINE_SAFE} title={p.categoria}>
                            {p.categoria}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {p.stockActual}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap hidden xl:table-cell">
                        {p.stockMin}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap hidden xl:table-cell">
                        {p.stockMax}
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        ${Number(p.precio || 0).toLocaleString()}
                      </td>

                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
                            p.estado === "Activo"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton
                            event={() =>
                              navigate(`/app/products/${p.id}/detalles`, {
                                state: { product: p.raw || p },
                              })
                            }
                          />
                          <EditButton event={() => handleEditClick(p)} />
                          <DeleteButton event={() => handleDeleteClick(p)} />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
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

      {/* Edit Modal */}
      <ProductEditModal
        isModalOpen={isEditModalOpen}
        setIsModalOpen={setIsEditModalOpen}
        form={selectedProduct}
        setForm={setSelectedProduct}
        handleImages={(e) => {
          const files = Array.from(e.target.files || []);
          setSelectedProduct((prev) => ({
            ...prev,
            imagenes: [...prev.imagenes, ...files].slice(0, 6),
          }));
        }}
        removeImageAt={(index) => {
          setSelectedProduct((prev) => ({
            ...prev,
            imagenes: prev.imagenes.filter((_, i) => i !== index),
          }));
        }}
        handleSubmit={handleEditSubmit}
        estadoOpen={estadoOpen}
        setEstadoOpen={setEstadoOpen}
        categoriaOpen={categoriaOpen}
        setCategoriaOpen={setCategoriaOpen}
        estadoRef={estadoRef}
        categoriaRef={categoriaRef}
        estadoOptions={[
          { value: "Activo", label: "Activo" },
          { value: "Inactivo", label: "Inactivo" },
        ]}
        categories={categories}
        listVariants={tableVariants}
        itemVariants={rowVariants}
      />

      {/* Modal de registro */}
      <ProductRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
