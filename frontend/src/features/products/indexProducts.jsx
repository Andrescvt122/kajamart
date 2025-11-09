// features/products/indexProducts.jsx
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
import { motion } from "framer-motion";
import { exportProductsToExcel } from "./helpers/exportToXls";
import { exportProductsToPDF } from "./helpers/exportToPdf";

import {
  showInfoAlert,
  showInputAlert,
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts";

import ProductRegisterModal from "./productRegisterModal.jsx";
import ProductEditModal from "./productEditModal.jsx";
import ProductDeleteModal from "./productDeleteModal.jsx";

// 🔹 Hooks reales
import {
  useProducts,
  useDeleteProduct,
} from "../../shared/components/hooks/products/products.hooks.js";

if (typeof document !== "undefined") {
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";
  document.documentElement.style.width = "100%";
  document.body.style.width = "100%";
}

export default function IndexProducts() {
  const navigate = useNavigate();

  // === CARGA DESDE BACKEND ===
  const {
    data: productsRaw = [],
    isLoading,
    isError,
    error,
  } = useProducts();

  const {
    categories: categoriesRaw = [],
    isLoading: isCatLoading,
    isError: isCatError,
  } = useCategories?.() || { categories: [], isLoading: false, isError: false };

  const deleteMutation = useDeleteProduct();

  // 🔹 Normalizamos categorías para pasarlas al modal (siguen siendo nombres, pero vienen de BD)
  const categories = useMemo(
    () =>
      (Array.isArray(categoriesRaw) ? categoriesRaw : [])
        .map((c) => ({
          id: c.id_categoria ?? c.id ?? "",
          nombre: c.nombre_categoria || c.nombre || "",
        }))
        .filter((c) => c.id && c.nombre),
    [categoriesRaw]
  );

  // 🔹 Normalizamos productos de la BD → forma usada por la tabla
  const products = useMemo(() => {
    if (!Array.isArray(productsRaw)) return [];
    return productsRaw.map((p) => ({
      // backend
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
      // por si necesitas más adelante:
      raw: p,
    }));
  }, [productsRaw]);

  // === DELETE MODAL ===
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
        showSuccessAlert && showSuccessAlert("Producto eliminado correctamente.");
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

  // === EDIT MODAL (sigue siendo local hasta que conectes el modal al backend) ===
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
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

  const listVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const handleEditClick = (product) => {
    const p = product?.raw || product;
    setSelectedProduct({
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      precioCompra: p.costo_unitario ?? "",
      precioVenta: p.precio_venta ?? "",
      iva: p.iva ?? "",
      stock: p.stock_actual ?? "",
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

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Aquí idealmente usarías useUpdateProduct()
    console.log("Producto editado (pendiente conectar backend):", selectedProduct);
    setIsEditModalOpen(false);
  };

  // === REGISTRO MODAL (sigue local hasta que lo conectes al backend) ===
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    imagenes: [],
    precioCompra: "",
    precioVenta: "",
    iva: "",
    stock: "",
    estado: "",
    categoria: "",
  });

  const [estadoOpen, setEstadoOpen] = useState(false);
  const estadoRef = useRef(null);
  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const categoriaRef = useRef(null);

  const estadoOptions = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) {
        setEstadoOpen(false);
      }
      if (categoriaRef.current && !categoriaRef.current.contains(e.target)) {
        setCategoriaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalOpen]);

  const handleOpenModal = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    const next = [...form.imagenes, ...files].slice(0, 6);
    setForm((prev) => ({ ...prev, imagenes: next }));
  };

  const removeImageAt = (idx) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== idx),
    }));
  };

  // ⚠️ De momento sigue creando solo en el front (no en BD).
  // Cuando quieras, aquí puedes usar useCreateProduct y mandar el payload al backend.
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.nombre.trim() ||
      !form.precioCompra ||
      !form.precioVenta ||
      !form.stock ||
      !form.estado ||
      !form.categoria
    ) {
      showInfoAlert(
        "Por favor complete los campos obligatorios marcados con *"
      );
      return;
    }

    showInfoAlert(
      "Este formulario aún no está conectado al backend. Solo se creó en memoria."
    );

    setForm({
      nombre: "",
      descripcion: "",
      imagenes: [],
      precioCompra: "",
      precioVenta: "",
      iva: "",
      stock: "",
      estado: "",
      categoria: "",
    });
    setIsModalOpen(false);
    setEstadoOpen(false);
    setCategoriaOpen(false);
  };

  // === FILTRO + PAGINACIÓN SOBRE DATOS REALES ===
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return products;

    if (/^activos?$/.test(s)) {
      return products.filter(
        (p) => p.estado.toLowerCase() === "activo"
      );
    }
    if (/^inactivos?$/.test(s)) {
      return products.filter(
        (p) => p.estado.toLowerCase() === "inactivo"
      );
    }

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
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // ANIMACIONES
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  // === LOADING / ERROR ===
  if (isLoading || isCatLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (isError || isCatError) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Error al cargar productos.";
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{msg}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Fondo decorativo */}
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

      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Productos</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de Inventario
              </p>
            </div>
          </div>

          {/* Barra búsqueda + acciones */}
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex-grow">
              <SearchBar
                placeholder="Buscar productos..."
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
              <button
                onClick={handleOpenModal}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nuevo Producto
              </button>
            </div>
          </div>

          {/* Tabla productos */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <table key={currentPage} className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">Imagen</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Stock Actual</th>
                  <th className="px-6 py-4">Stock Mínimo</th>
                  <th className="px-6 py-4">Stock Máximo</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-gray-100"
                variants={tableVariants}
              >
                {pageItems.length === 0 ? (
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
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
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
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {p.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.categoria}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.stockActual}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.stockMin}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.stockMax}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${p.precio.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-right">
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

      {/* Edit Modal (de momento solo cambia estado local, no BD) */}
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
        estadoOptions={estadoOptions}
        categories={categories}
        listVariants={listVariants}
        itemVariants={itemVariants}
      />

      {/* Modal de registro (aún sin backend) */}
      <ProductRegisterModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        form={form}
        setForm={setForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleImages={handleImages}
        removeImageAt={removeImageAt}
        estadoOpen={estadoOpen}
        setEstadoOpen={setEstadoOpen}
        categoriaOpen={categoriaOpen}
        setCategoriaOpen={setCategoriaOpen}
        estadoRef={estadoRef}
        categoriaRef={categoriaRef}
        categories={categories}
        estadoOptions={estadoOptions}
      />
    </div>
  );
}
