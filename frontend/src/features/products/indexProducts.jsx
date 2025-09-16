import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import { Search, ChevronDown, Upload } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import SearchBar from "../../shared/components/searchBars/searchbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  showInfoAlert,
  showInputAlert,
  showLoadingAlert,
} from "../../shared/components/alerts";

export default function IndexProducts() {
  const [categories] = useState([
    { id: "CAT001", nombre: "Lácteos" },
    { id: "CAT002", nombre: "Carnes" },
    { id: "CAT003", nombre: "Bebidas" },
    { id: "CAT004", nombre: "Snacks" },
  ]);

  const [products, setProducts] = useState([
    {
      id: "P001",
      nombre: "Leche Entera 1L",
      categoria: "Lácteos",
      stockActual: 24,
      stockMin: 6,
      stockMax: 80,
      precio: 4200,
      estado: "Activo",
      imagen: null,
    },
    {
      id: "P002",
      nombre: "Papas Fritas 80g",
      categoria: "Snacks",
      stockActual: 120,
      stockMin: 20,
      stockMax: 300,
      precio: 2500,
      estado: "Inactivo",
      imagen: null,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    imagenes: [], // File objects
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

  // bloquear scroll cuando modal abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflowY = "auto";
      document.body.style.overflowX = "hidden";
    }
    return () => {
      document.body.style.overflowY = "auto";
      document.body.style.overflowX = "hidden";
    };
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

  // Manejar selección de imágenes y previews
  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    // limitar a 6 imágenes por ejemplo
    const next = [...form.imagenes, ...files].slice(0, 6);
    setForm((prev) => ({ ...prev, imagenes: next }));
  };
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    if (!s) return products;

    if (/^activos?$/.test(s)) {
      return products.filter((p) => p.estado.toLowerCase() === "activo");
    }

    if (/^inactivos?$/.test(s)) {
      return products.filter((p) => p.estado.toLowerCase() === "inactivo");
    }

    return products.filter((p) =>
      `${p.id} ${p.nombre} ${p.descripcion || ""} ${p.categoria} ${p.estado}`
        .toLowerCase()
        .includes(s)
    );
  }, [products, searchTerm]);

  const removeImageAt = (idx) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
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

    const newProduct = {
      id: `P${String(products.length + 1).padStart(3, "0")}`,
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      stockActual: Number(form.stock),
      stockMin: 0,
      stockMax: Number(form.stock) * 5,
      precio: Number(form.precioVenta),
      precioCompra: Number(form.precioCompra),
      iva: form.iva || "0",
      estado: form.estado,
      imagen: form.imagenes[0] ? URL.createObjectURL(form.imagenes[0]) : null,
    };

    setProducts((p) => [newProduct, ...p]);
    // Reset form
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
    showLoadingAlert("Producto registrado");
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // Animations
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  };
  const listVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0 },
  };

  const estadoButtonClasses = () => {
    if (form.estado === "Activo") {
      return "bg-green-50 text-green-700 border border-green-200 focus:ring-green-200";
    }
    if (form.estado === "Inactivo") {
      return "bg-red-50 text-red-700 border border-red-200 focus:ring-red-200";
    }
    return "bg-white text-gray-700 border border-gray-200 focus:ring-green-200"; // texto más oscuro por defecto
  };

  return (
    <div className="flex min-h-screen">
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Productos</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de Inventario
              </p>
            </div>
          </div>

          {/* Barra búsqueda y acciones */}
          <div className="mb-6 flex items-center gap-3">
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
              <ExportExcelButton>Excel</ExportExcelButton>
              <ExportPDFButton>PDF</ExportPDFButton>
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
                            alert={() => showInfoAlert("Ver producto")}
                          />
                          <EditButton
                            alert={() => showLoadingAlert("Editar producto")}
                          />
                          <DeleteButton
                            alert={() => showInputAlert("Eliminar producto")}
                          />
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

      {/* Modal Registrar Producto (solo cambios visuales aquí) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative text-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Registrar Producto
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Nombre del Producto*
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    autoComplete="off"
                    onChange={handleChange}
                    placeholder="Nombre del producto"
                    className="mt-1 w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-gray-900 placeholder-gray-400 transition"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción corta"
                    rows="3"
                    className="mt-1 w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-gray-900 placeholder-gray-400 transition"
                  />
                </div>

                {/* Imágenes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Imágenes
                  </label>
                  <label className="mt-2 block w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-green-300 cursor-pointer p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Upload size={20} className="text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Selecciona o arrastra imágenes aquí (máx. 6)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImages}
                      className="hidden"
                    />
                  </label>

                  {form.imagenes && form.imagenes.length > 0 && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {form.imagenes.map((f, i) => (
                        <div
                          key={i}
                          className="relative w-full h-20 rounded-md overflow-hidden border"
                        >
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageAt(i)}
                            className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grid para precios y stock mejor distribuido */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Precio de Compra*
                    </label>
                    <input
                      name="precioCompra"
                      value={form.precioCompra}
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      min="0"
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Precio de Venta*
                    </label>
                    <input
                      name="precioVenta"
                      value={form.precioVenta}
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      min="0"
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      IVA
                    </label>
                    <input
                      name="iva"
                      value={form.iva}
                      onChange={handleChange}
                      placeholder="%"
                      type="text"
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Stock *
                    </label>
                    <input
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      min="0"
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900"
                      required
                    />
                  </div>

                  <div className="relative" ref={estadoRef}>
                    {/* Label */}
                    <label className="block text-sm font-semibold text-gray-800">
                      Estado*
                    </label>

                    {/* Contenedor con borde dinámico */}
                    <div
                      className={`mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border 
      ${
        form.estado === "Activo"
          ? "border-green-500 bg-green-50"
          : form.estado === "Inactivo"
          ? "border-red-500 bg-red-50"
          : "border-gray-300 bg-white"
      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setEstadoOpen((s) => !s)}
                        className="flex w-full items-center justify-between text-sm focus:outline-none"
                        aria-haspopup="listbox"
                        aria-expanded={estadoOpen}
                      >
                        {/* Texto dinámico */}
                        <span
                          className={`${
                            form.estado === "Activo"
                              ? "text-green-700 font-medium"
                              : form.estado === "Inactivo"
                              ? "text-red-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {form.estado || "Seleccionar estado"}
                        </span>

                        {/* Icono */}
                        <motion.span
                          animate={{ rotate: estadoOpen ? 180 : 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <ChevronDown size={18} />
                        </motion.span>
                      </button>
                    </div>

                    {/* Lista de opciones */}
                    <AnimatePresence>
                      {estadoOpen && (
                        <motion.ul
                          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-50"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={listVariants}
                        >
                          {estadoOptions.map((opt) => (
                            <motion.li
                              key={opt.value}
                              variants={itemVariants}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  estado: opt.value,
                                }));
                                setEstadoOpen(false);
                              }}
                              className={`px-4 py-3 cursor-pointer text-sm ${
                                opt.value === "Activo"
                                  ? "hover:bg-green-50 text-green-700"
                                  : opt.value === "Inactivo"
                                  ? "hover:bg-red-50 text-red-700"
                                  : "text-gray-700"
                              } ${
                                form.estado === opt.value
                                  ? opt.value === "Activo"
                                    ? "bg-green-100 font-medium"
                                    : "bg-red-100 font-medium"
                                  : ""
                              }`}
                            >
                              {opt.label}
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative" ref={categoriaRef}>
                    {/* Label */}
                    <label className="block text-sm font-semibold text-gray-800">
                      Categoría*
                    </label>

                    {/* Contenedor con borde fijo gris */}
                    <div className="mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border border-gray-300 bg-white">
                      <button
                        type="button"
                        onClick={() => setCategoriaOpen((s) => !s)}
                        className="flex w-full items-center justify-between text-sm focus:outline-none"
                        aria-haspopup="listbox"
                        aria-expanded={categoriaOpen}
                      >
                        {/* Texto dinámico */}
                        <span
                          className={`${
                            form.categoria
                              ? "text-gray-900 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {form.categoria || "Seleccionar categoría"}
                        </span>

                        {/* Icono */}
                        <motion.span
                          animate={{ rotate: categoriaOpen ? 180 : 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <ChevronDown size={18} />
                        </motion.span>
                      </button>
                    </div>

                    {/* Lista de opciones */}
                    <AnimatePresence>
                      {categoriaOpen && (
                        <motion.ul
                          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-50"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={listVariants}
                        >
                          {categories.map((c) => (
                            <motion.li
                              key={c.id}
                              variants={itemVariants}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  categoria: c.nombre,
                                }));
                                setCategoriaOpen(false);
                              }}
                              className="px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50"
                            >
                              {c.nombre}
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                  >
                    Registrar Producto
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
