// frontend/src/features/products/productRegisterModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload, X } from "lucide-react";
import Swal from "sweetalert2";

// Hooks reales
import { useCreateProduct } from "../../shared/components/hooks/products/products.hooks.js";
import { useSuppliers as useSuppliersQuery } from "../../shared/components/hooks/suppliers/suppliers.hooks.js";
import { useCategories } from "../../shared/components/hooks/categories/categories.hooks.js";

// Alerts
import {
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts.jsx";

const inputClass =
  "mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2";

const listVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function ProductRegisterModal({ isOpen, onClose }) {
  // === CATEGORÍAS (hook propio) ===
  const {
    categories: catList = [],
    loading: catLoading,
    error: catError,
  } = useCategories();

  // Solo categorías activas
  const activeCategories = catList.filter(
    (c) => c.estado === "Activo" || c.estado === "activo"
  );

  // === PROVEEDORES (React Query) ===
  const { data: suppliersRaw = [], isLoading: supLoading } =
    useSuppliersQuery();

  const suppliers = Array.isArray(suppliersRaw)
    ? suppliersRaw
        .map((s) => ({
          id: s.id_proveedor ?? null,
          nombre: s.nombre ?? "",
          estado: s.estado === true || s.estado === "Activo",
        }))
        .filter((s) => s.id && s.nombre)
    : [];

  // === FORM STATE ===
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precioCompra: "",
    precioVenta: "",
    subidaVenta: "",
    iva: "",
    stock: "",
    stockMin: "",
    stockMax: "",
    estado: "",
    categoriaId: "",
    proveedorId: "",
  });

  // 🔹 archivo de imagen (solo 1)
  const [imagenFile, setImagenFile] = useState(null);

  const [errors, setErrors] = useState({});

  // Dropdowns
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const [proveedorOpen, setProveedorOpen] = useState(false);
  const estadoRef = useRef(null);
  const categoriaRef = useRef(null);
  const proveedorRef = useRef(null);

  const estadoOptions = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ];

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) {
        setEstadoOpen(false);
      }
      if (categoriaRef.current && !categoriaRef.current.contains(e.target)) {
        setCategoriaOpen(false);
      }
      if (proveedorRef.current && !proveedorRef.current.contains(e.target)) {
        setProveedorOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Reset al abrir
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      nombre: "",
      descripcion: "",
      precioCompra: "",
      precioVenta: "",
      subidaVenta: "",
      iva: "",
      stock: "",
      stockMin: "",
      stockMax: "",
      estado: "",
      categoriaId: "",
      proveedorId: "",
    });
    setImagenFile(null);
    setErrors({});
    setEstadoOpen(false);
    setCategoriaOpen(false);
    setProveedorOpen(false);
  }, [isOpen]);

  // === VALIDACIONES ===
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        if (!value || !value.trim()) error = "El nombre es obligatorio.";
        break;
      case "precioCompra":
      case "precioVenta":
      case "subidaVenta":
      case "stock":
      case "stockMin":
      case "stockMax":
        if (value === "" || value === null || Number(value) < 0) {
          error = "Debe ser un número válido (>= 0).";
        }
        break;
      case "estado":
        if (!value) error = "Selecciona un estado.";
        break;
      case "categoriaId":
        if (!value) error = "Selecciona una categoría.";
        break;
      case "proveedorId":
        if (!value) error = "Selecciona un proveedor.";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && /[eE+\-]/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // 🔹 Manejar cambio de imagen (solo 1)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImagenFile(null);
      return;
    }
    setImagenFile(file);
  };

  const createMutation = useCreateProduct();

  const onSubmit = async (e) => {
    e.preventDefault();

    const required = [
      "nombre",
      "precioCompra",
      "precioVenta",
      "subidaVenta",
      "stock",
      "estado",
      "categoriaId",
      "proveedorId",
    ];
    let valid = true;
    required.forEach((f) => {
      validateField(f, form[f]);
      if (!form[f] || errors[f]) valid = false;
    });

    if (!imagenFile) {
      valid = false;
      showErrorAlert && showErrorAlert("Debes subir una imagen.");
    }

    if (!valid) {
      if (!imagenFile) return;
      showErrorAlert &&
        showErrorAlert("Por favor corrige los campos resaltados.");
      return;
    }

    // 🔹 Payload como FormData (incluye imagen)
    const fd = new FormData();
    fd.append("nombre", form.nombre.trim());
    fd.append("descripcion", form.descripcion?.trim() || "");
    fd.append("stock_actual", String(Number(form.stock) || 0));
    fd.append(
      "stock_minimo",
      String(form.stockMin !== "" ? Number(form.stockMin) : 0)
    );
    fd.append(
      "stock_maximo",
      String(
        form.stockMax !== ""
          ? Number(form.stockMax)
          : (Number(form.stock) || 0) * 5
      )
    );
    fd.append("estado", form.estado === "Activo" ? "true" : "false");
    fd.append("id_categoria", String(form.categoriaId));
    fd.append("iva", "0");
    fd.append("icu", "0");
    fd.append(
      "porcentaje_incremento",
      String(Number(form.subidaVenta) || 0)
    );
    fd.append("costo_unitario", String(Number(form.precioCompra)));
    fd.append("precio_venta", String(Number(form.precioVenta)));
    fd.append("id_proveedor", String(form.proveedorId));

    // 🔹 imagen (campo "imagen" debe coincidir con multer.single("imagen"))
    fd.append("imagen", imagenFile);

    try {
      showLoadingAlert && showLoadingAlert("Registrando producto...");
      await createMutation.mutateAsync(fd);
      try {
        Swal.close();
      } catch (_) {}
      showSuccessAlert && showSuccessAlert("Producto registrado");
      onClose?.();
    } catch (err) {
      try {
        Swal.close();
      } catch (_) {}
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al crear el producto";
      showErrorAlert && showErrorAlert(msg);
    }
  };

  // === RENDER ===
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -18 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full p-2 hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Registrar Producto
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Nombre del Producto*
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={(e) => validateField("nombre", e.target.value)}
                  placeholder="Nombre del producto"
                  className={`${inputClass} ${
                    errors.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
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
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-white border-gray-300"
                />
              </div>

              {/* Imagen (archivo único) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Imagen del producto*
                </label>

                <label className="mt-2 block w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-green-300 cursor-pointer p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Upload size={20} className="text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Selecciona una imagen desde tu dispositivo
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagenFile && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-20 h-20 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(imagenFile)}
                        alt={imagenFile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-gray-800">
                        {imagenFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setImagenFile(null)}
                        className="text-xs text-red-500 hover:underline mt-1 text-left"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Precios, subida y stock */}
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-semibold">
                    Precio Compra*
                  </label>
                  <input
                    name="precioCompra"
                    type="number"
                    min="0"
                    value={form.precioCompra}
                    onChange={handleChange}
                    onBlur={(e) =>
                      validateField("precioCompra", e.target.value)
                    }
                    className={`${inputClass} ${
                      errors.precioCompra ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    onKeyDown={(e) =>
                      ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                    }
                  />
                  {errors.precioCompra && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.precioCompra}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold">
                    Precio Venta*
                  </label>
                  <input
                    name="precioVenta"
                    type="number"
                    min="0"
                    value={form.precioVenta}
                    onChange={handleChange}
                    onBlur={(e) => validateField("precioVenta", e.target.value)}
                    className={`${inputClass} ${
                      errors.precioVenta ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    onKeyDown={(e) =>
                      ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                    }
                  />
                  {errors.precioVenta && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.precioVenta}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold">
                    Subida Venta* (%)
                  </label>
                  <input
                    name="subidaVenta"
                    type="number"
                    min="0"
                    value={form.subidaVenta}
                    onChange={handleChange}
                    onBlur={(e) =>
                      validateField("subidaVenta", e.target.value)
                    }
                    placeholder="Ej: 10"
                    className={`${inputClass} ${
                      errors.subidaVenta ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    onKeyDown={(e) =>
                      ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                    }
                  />
                  {errors.subidaVenta && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.subidaVenta}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold">
                    IVA (opcional)
                  </label>
                  <input
                    name="iva"
                    value={form.iva}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9%]/g, "");
                      setForm((prev) => ({ ...prev, iva: val }));
                    }}
                    placeholder="Ej: 19%"
                    className={`${inputClass} border-gray-300`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold">Stock*</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    onBlur={(e) => validateField("stock", e.target.value)}
                    className={`${inputClass} ${
                      errors.stock ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    onKeyDown={(e) =>
                      ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                    }
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                  )}
                </div>
              </div>

              {/* Stock min/max */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold">
                    Stock Mínimo
                  </label>
                  <input
                    name="stockMin"
                    type="number"
                    min="0"
                    value={form.stockMin}
                    onChange={handleChange}
                    onBlur={(e) => validateField("stockMin", e.target.value)}
                    placeholder="0"
                    className={`${inputClass} ${
                      errors.stockMin ? "border-red-500" : "border-gray-300"
                    }`}
                    onKeyDown={(e) =>
                      ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">
                    Stock Máximo
                  </label>
                  <input
                    name="stockMax"
                    type="number"
                    min="0"
                    value={form.stockMax}
                    onChange={handleChange}
                    onBlur={(e) => validateField("stockMax", e.target.value)}
                    placeholder="(auto) stock * 5"
                    className={`${inputClass} ${
                      errors.stockMax ? "border-red-500" : "border-gray-300"
                    }`}
                    onKeyDown={(e) =>
                      ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                    }
                  />
                </div>
              </div>

              {/* Estado, categoría, proveedor */}
              <div className="grid grid-cols-3 gap-3">
                {/* Estado */}
                <div className="relative" ref={estadoRef}>
                  <label className="block text-sm font-semibold">Estado*</label>
                  <div
                    className={`mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border 
                      ${
                        form.estado === "Activo"
                          ? "border-green-500 bg-green-50"
                          : form.estado === "Inactivo"
                          ? "border-red-500 bg-red-50"
                          : errors.estado
                          ? "border-red-500 bg-white"
                          : "border-gray-300 bg-white"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setEstadoOpen((s) => !s)}
                      className="flex w-full items-center justify-between text-sm"
                    >
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
                      <motion.span
                        animate={{ rotate: estadoOpen ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                  </div>
                  {errors.estado && (
                    <p className="text-red-500 text-xs mt-1">{errors.estado}</p>
                  )}
                  <AnimatePresence>
                    {estadoOpen && (
                      <motion.ul
                        className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50"
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
                              validateField("estado", opt.value);
                              setEstadoOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer text-sm ${
                              opt.value === "Activo"
                                ? "hover:bg-green-50 text-green-700"
                                : "hover:bg-red-50 text-red-700"
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

                {/* Categoría (solo activas) */}
                <div className="relative" ref={categoriaRef}>
                  <label className="block text-sm font-semibold">
                    Categoría*
                  </label>
                  <div
                    className={`mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border ${
                      errors.categoriaId ? "border-red-500" : "border-gray-300"
                    } bg-white`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!catLoading && activeCategories.length > 0) {
                          setCategoriaOpen((s) => !s);
                        }
                      }}
                      className="flex w-full items-center justify-between text-sm disabled:opacity-60"
                      disabled={catLoading || activeCategories.length === 0}
                    >
                      <span
                        className={
                          form.categoriaId
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {catLoading
                          ? "Cargando categorías…"
                          : activeCategories.length === 0
                          ? "No hay categorías activas"
                          : form.categoriaId
                          ? activeCategories.find(
                              (c) =>
                                String(c.id_categoria ?? c.id) ===
                                String(form.categoriaId)
                            )?.nombre || "Seleccionar categoría"
                          : "Seleccionar categoría"}
                      </span>
                      <motion.span
                        animate={{ rotate: categoriaOpen ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                  </div>
                  {errors.categoriaId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.categoriaId}
                    </p>
                  )}
                  <AnimatePresence>
                    {categoriaOpen && (
                      <motion.ul
                        className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-[180px] overflow-y-auto"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={listVariants}
                      >
                        {activeCategories.map((c) => {
                          const catId = c.id_categoria ?? c.id;
                          return (
                            <motion.li
                              key={catId}
                              variants={itemVariants}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  categoriaId: catId,
                                }));
                                validateField("categoriaId", catId);
                                setCategoriaOpen(false);
                              }}
                              className={`px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50 ${
                                String(form.categoriaId) === String(catId)
                                  ? "bg-green-100 font-medium"
                                  : ""
                              }`}
                            >
                              {c.nombre}
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Proveedor */}
                <div className="relative" ref={proveedorRef}>
                  <label className="block text-sm font-semibold">
                    Proveedor*
                  </label>
                  <div
                    className={`mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border ${
                      errors.proveedorId ? "border-red-500" : "border-gray-300"
                    } bg-white`}
                  >
                    <button
                      type="button"
                      onClick={() => setProveedorOpen((s) => !s)}
                      className="flex w-full items-center justify-between text-sm disabled:opacity-60"
                      disabled={supLoading || suppliers.length === 0}
                    >
                      <span
                        className={
                          form.proveedorId
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {supLoading
                          ? "Cargando proveedores…"
                          : suppliers.length === 0
                          ? "No hay proveedores"
                          : form.proveedorId
                          ? suppliers.find(
                              (s) =>
                                String(s.id) === String(form.proveedorId)
                            )?.nombre || "Seleccionar proveedor"
                          : "Seleccionar proveedor"}
                      </span>
                      <motion.span
                        animate={{ rotate: proveedorOpen ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                  </div>
                  {errors.proveedorId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.proveedorId}
                    </p>
                  )}
                  <AnimatePresence>
                    {proveedorOpen && (
                      <motion.ul
                        className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-[180px] overflow-y-auto"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={listVariants}
                      >
                        {suppliers.map((s) => (
                          <motion.li
                            key={s.id}
                            variants={itemVariants}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                proveedorId: s.id,
                              }));
                              validateField("proveedorId", s.id);
                              setProveedorOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50 ${
                              String(form.proveedorId) === String(s.id)
                                ? "bg-green-100 font-medium"
                                : ""
                            }`}
                          >
                            {s.nombre}
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
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Cancelar
                </button>
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
  );
}
