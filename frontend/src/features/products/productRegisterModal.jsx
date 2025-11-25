// frontend/src/features/products/productRegisterModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload, X, Info } from "lucide-react";
import Swal from "sweetalert2";
import { useCreateProduct } from "../../shared/components/hooks/products/products.hooks.js";
import { useSuppliers as useSuppliersQuery } from "../../shared/components/hooks/suppliers/suppliers.hooks.js";
import { useCategories } from "../../shared/components/hooks/categories/categories.hooks.js";

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

// 🔹 Helper para considerar activo: boolean true o string "Activo"/"activo"
const isActive = (v) => v === true || v === "Activo" || v === "activo";

export default function ProductRegisterModal({ isOpen, onClose }) {
  const { categories: catList = [], loading: catLoading } = useCategories();
  // 🔹 Solo categorías activas
  const activeCategories = (Array.isArray(catList) ? catList : []).filter((c) =>
    isActive(c?.estado)
  );

  const { data: suppliersRaw = [], isLoading: supLoading } =
    useSuppliersQuery();

  // 🔹 Solo proveedores activos
  const suppliers = (Array.isArray(suppliersRaw) ? suppliersRaw : [])
    .filter((s) => isActive(s?.estado))
    .map((s) => ({
      id: s.id_proveedor ?? s.id ?? null,
      nombre: s.nombre ?? "",
    }))
    .filter((s) => s.id && s.nombre);
  const [showSuggestedTooltip, setShowSuggestedTooltip] = useState(false);

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
    categoriaId: "",
    proveedorId: "",
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  const [errors, setErrors] = useState({});

  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const [proveedorOpen, setProveedorOpen] = useState(false);
  const categoriaRef = useRef(null);
  const proveedorRef = useRef(null);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoriaRef.current && !categoriaRef.current.contains(e.target))
        setCategoriaOpen(false);
      if (proveedorRef.current && !proveedorRef.current.contains(e.target))
        setProveedorOpen(false);
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
      categoriaId: "",
      proveedorId: "",
    });
    setImagenFile(null);
    setPreviewURL(null);
    setErrors({});
    setCategoriaOpen(false);
    setProveedorOpen(false);
  }, [isOpen]);

  // Preview seguro (y cleanup)
  useEffect(() => {
    if (!imagenFile) {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
      }
      return;
    }
    const u = URL.createObjectURL(imagenFile);
    setPreviewURL(u);
    return () => URL.revokeObjectURL(u);
  }, [imagenFile]);

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImagenFile(file ?? null);
  };

  const createMutation = useCreateProduct();

  const onSubmit = async (e) => {
    e.preventDefault();

    // Extra: asegurar que la selección sigue siendo activa al enviar
    const catOk = activeCategories.some(
      (c) => String(c.id_categoria ?? c.id) === String(form.categoriaId)
    );
    const provOk = suppliers.some(
      (s) => String(s.id) === String(form.proveedorId)
    );

    const required = [
      "nombre",
      "precioCompra",
      "precioVenta",
      "subidaVenta",
      "stock",
      "categoriaId",
      "proveedorId",
    ];
    let valid = true;
    required.forEach((f) => {
      validateField(f, form[f]);
      if (!form[f] || errors[f]) valid = false;
    });

    if (!catOk) {
      valid = false;
      setErrors((p) => ({
        ...p,
        categoriaId: "La categoría no es válida o está inactiva.",
      }));
    }
    if (!provOk) {
      valid = false;
      setErrors((p) => ({
        ...p,
        proveedorId: "El proveedor no es válido o está inactivo.",
      }));
    }

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
    // 🔹 siempre activo
    fd.append("estado", "true");
    fd.append("id_categoria", String(form.categoriaId));
    fd.append("iva", "0");
    fd.append("icu", "0");
    fd.append("porcentaje_incremento", String(Number(form.subidaVenta) || 0));
    fd.append("costo_unitario", String(Number(form.precioCompra)));
    fd.append("precio_venta", String(Number(form.precioVenta)));
    fd.append("id_proveedor", String(form.proveedorId));
    fd.append("imagen", imagenFile);

    try {
      showLoadingAlert && showLoadingAlert("Registrando producto...");
      await createMutation.mutateAsync(fd);
      try {
        Swal.close();
      } catch (e) {
        console.log(e);
      }
      showSuccessAlert && showSuccessAlert("Producto registrado");
      onClose?.();
    } catch (err) {
      try {
        Swal.close();
      } catch (e) {
        console.log(e);
      }
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al crear el producto";
      showErrorAlert && showErrorAlert(msg);
    }
  };

  // === PRECIO SUGERIDO ===
  const compraNum = Number(form.precioCompra);
  const subidaNum = Number(form.subidaVenta);

  let suggestedPrice = null;

  // solo calculamos si hay valores numéricos válidos
  if (
    form.precioCompra !== "" &&
    form.subidaVenta !== "" &&
    !Number.isNaN(compraNum) &&
    !Number.isNaN(subidaNum) &&
    compraNum >= 0
  ) {
    const base = compraNum + compraNum * (subidaNum / 100); // compra + (compra * %)
    // redondeo al múltiplo de 100 más cercano
    suggestedPrice = Math.round(base / 100) * 100;
  }

  // mostrar botón solo si:
  // - tenemos sugerido
  // - no hay errores en precioCompra / subidaVenta
  // - el valor sugerido es distinto al precioVenta actual
  const shouldShowSuggestedButton =
    suggestedPrice !== null &&
    !errors.precioCompra &&
    !errors.subidaVenta &&
    String(suggestedPrice) !== String(form.precioVenta || "");

  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

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
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header sticky */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white/90 backdrop-blur">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Registrar Producto
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={onSubmit} className="px-6">
              {/* Contenido scrollable */}
              <div className="pt-4 pb-24 max-h-[75vh] overflow-y-auto space-y-6">
                {/* Nombre y descripción */}
                <div className="space-y-4">
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      placeholder="Descripción corta"
                      rows={3}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white border-gray-300"
                    />
                  </div>
                </div>

                {/* Imagen */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Imagen del producto*
                  </label>
                  <label className="block w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-green-300 cursor-pointer p-4 text-center">
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

                  {previewURL && (
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                        <img
                          src={previewURL}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-gray-800">
                          {imagenFile?.name}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                        errors.precioCompra
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                      onKeyDown={(e) =>
                        ["e", "E", "+", "-"].includes(e.key) &&
                        e.preventDefault()
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
                        errors.subidaVenta
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                      onKeyDown={(e) =>
                        ["e", "E", "+", "-"].includes(e.key) &&
                        e.preventDefault()
                      }
                    />
                    {errors.subidaVenta && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.subidaVenta}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold">
                      Precio Venta*
                    </label>
                    <input
                      name="precioVenta"
                      type="number"
                      min="0"
                      value={form.precioVenta}
                      onChange={handleChange}
                      onBlur={(e) =>
                        validateField("precioVenta", e.target.value)
                      }
                      className={`${inputClass} ${
                        errors.precioVenta
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                      onKeyDown={(e) =>
                        ["e", "E", "+", "-"].includes(e.key) &&
                        e.preventDefault()
                      }
                    />
                    {errors.precioVenta && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.precioVenta}
                      </p>
                    )}

                    {/* Botón de precio sugerido + botón info */}
                    {shouldShowSuggestedButton && (
                      <div className="absolute left-0 top-full mt-1 z-30">
                        <div className="inline-flex items-center gap-2 relative">
                          {/* Botón principal: usar precio sugerido */}
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                precioVenta: String(suggestedPrice),
                              }));
                              setShowSuggestedTooltip(false);
                            }}
                            className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-md hover:bg-emerald-200 transition"
                          >
                            Usar precio sugerido:{" "}
                            <span className="font-semibold">
                              {formatCOP(suggestedPrice)}
                            </span>
                          </button>

                          {/* Botón info */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowSuggestedTooltip((prev) => !prev)
                              }
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 text-[10px]"
                            >
                              <Info size={14} />
                            </button>

                            {showSuggestedTooltip && (
                              <div className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full bg-gray-900 text-white text-[11px] px-3 py-2 rounded-md shadow-lg max-w-xs text-left whitespace-normal">
                                Calculado como{" "}
                                <span className="font-semibold">
                                  {formatCOP(compraNum)}
                                </span>{" "}
                                +{" "}
                                <span className="font-semibold">
                                  {subidaNum}% de subida
                                </span>
                                , redondeado al múltiplo de 100 más cercano.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold">
                      Stock*
                    </label>
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
                        ["e", "E", "+", "-"].includes(e.key) &&
                        e.preventDefault()
                      }
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stock min/max */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        ["e", "E", "+", "-"].includes(e.key) &&
                        e.preventDefault()
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
                        ["e", "E", "+", "-"].includes(e.key) &&
                        e.preventDefault()
                      }
                    />
                  </div>
                </div>

                {/* Categoría, proveedor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {/* Categoría */}
                  <div className="relative" ref={categoriaRef}>
                    <label className="block text-sm font-semibold">
                      Categoría*
                    </label>
                    <div
                      className={`mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border ${
                        errors.categoriaId
                          ? "border-red-500"
                          : "border-gray-300"
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
                          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto"
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
                        errors.proveedorId
                          ? "border-red-500"
                          : "border-gray-300"
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
                            ? "No hay proveedores activos"
                            : form.proveedorId
                            ? suppliers.find(
                                (s) => String(s.id) === String(form.proveedorId)
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
                          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto"
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
              </div>

              {/* Footer sticky */}
              <div className="sticky bottom-0 z-10 flex justify-end gap-3 -mx-6 px-6 py-4 border-t bg-white/90 backdrop-blur">
                <button
                  type="button"
                  onClick={() => {onClose()}}
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
