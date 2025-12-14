// frontend/src/features/products/productRegisterModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload, X } from "lucide-react";
import Swal from "sweetalert2";
import { useCreateProduct } from "../../../../shared/components/hooks/products/products.hooks.js";
import { useCategories } from "../../../../shared/components/hooks/categories/categories.hooks.js";
import {
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../../../shared/components/alerts.jsx";

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

export default function ProductRegisterModal({ isOpen, onClose, onCreated }) {
  const { categories: catList = [], loading: catLoading } = useCategories();
  // 🔹 Solo categorías activas
  const activeCategories = (Array.isArray(catList) ? catList : []).filter((c) =>
    isActive(c?.estado)
  );

  // 🔹 Form SIN precios, stock actual ni proveedor
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    stockMin: "",
    stockMax: "",
    categoriaId: "",
    cantidadUnitaria: "",
    precio_venta: "",
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  const [errors, setErrors] = useState({});

  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const categoriaRef = useRef(null);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoriaRef.current && !categoriaRef.current.contains(e.target))
        setCategoriaOpen(false);
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
      stockMin: "",
      stockMax: "",
      categoriaId: "",
      cantidadUnitaria: "",
      precio_venta: "",
    });
    setImagenFile(null);
    setPreviewURL(null);
    setErrors({});
    setCategoriaOpen(false);
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
      case "stockMin":
      case "stockMax":
        if (
          value !== "" &&
          (value === null || Number.isNaN(Number(value)) || Number(value) < 0)
        ) {
          error = "Debe ser un número válido (>= 0).";
        }
        break;
      case "categoriaId":
        if (!value) error = "Selecciona una categoría.";
        break;
      case "cantidadUnitaria":
        if (
          value !== "" &&
          (value === null || Number.isNaN(Number(value)) || Number(value) < 1)
        ) {
          error = "Si se indica, debe ser un número válido (>= 1).";
        }
        break;
      case "precio_venta":
        if (
          value === "" ||
          value === null ||
          Number.isNaN(Number(value)) ||
          Number(value) < 0
        ) {
          error = "El precio de venta es obligatorio y debe ser >= 0.";
        }
        break;

      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
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

    // Extra: asegurar que la categoría seleccionada sigue siendo activa al enviar
    const catOk = activeCategories.some(
      (c) => String(c.id_categoria ?? c.id) === String(form.categoriaId)
    );

    const required = ["nombre", "categoriaId", "precio_venta"];
    let valid = true;
    const newErrors = {};

    // Validar obligatorios
    required.forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) {
        valid = false;
        newErrors[f] = err;
      }
    });

    // Validar numéricos opcionales
    ["stockMin", "stockMax", "cantidadUnitaria"].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) {
        valid = false;
        newErrors[f] = err;
      }
    });

    if (!catOk) {
      valid = false;
      newErrors.categoriaId = "La categoría no es válida o está inactiva.";
    }

    setErrors((p) => ({ ...p, ...newErrors }));

    if (!imagenFile) {
      valid = false;
      showErrorAlert && showErrorAlert("Debes subir una imagen.");
    }

    if (!valid) {
      if (imagenFile) {
        showErrorAlert &&
          showErrorAlert("Por favor corrige los campos resaltados.");
      }
      return;
    }

    const fd = new FormData();
    fd.append("nombre", form.nombre.trim());
    fd.append("descripcion", form.descripcion?.trim() || "");

    // Como ya no pedimos stock en el formulario:
    const stockMinNum = form.stockMin !== "" ? Number(form.stockMin) || 0 : 0;
    const stockMaxNum =
      form.stockMax !== "" ? Number(form.stockMax) || 0 : stockMinNum * 5; // regla simple por defecto

    fd.append("stock_actual", "0");
    fd.append("stock_minimo", String(stockMinNum));
    fd.append("stock_maximo", String(stockMaxNum));

    // 🔹 siempre activo
    fd.append("estado", "true");
    fd.append("id_categoria", String(form.categoriaId));

    // 🔹 Campos de precio eliminados del formulario → se envían en 0
    fd.append("iva", "0");
    fd.append("icu", "0");
    fd.append("porcentaje_incremento", "0");
    fd.append("costo_unitario", "0");
    fd.append("precio_venta", String(Number(form.precio_venta) || 0));
    // cantidad_unitaria opcional: si viene vacío => no forzamos, lo mandamos vacío
    if (form.cantidadUnitaria !== "") {
      fd.append("cantidad_unitaria", String(Number(form.cantidadUnitaria)));
    } else {
      // si tu backend interpreta ausencia como null, esto es mejor que mandar 0
      fd.append("cantidad_unitaria", "");
    }

    // 🔹 sin proveedor (se asocia en otro módulo)
    fd.append("imagen", imagenFile);

    try {
      showLoadingAlert && showLoadingAlert("Registrando producto...");
      const created = await createMutation.mutateAsync(fd);
      onCreated?.(created?.newProduct ?? created);
      console.log("created product:", created);
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

  // === RENDER ===
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-start justify-center bg-black/50 backdrop-blur-sm px-2 sm:px-4 pt-10 pb-10 overflow-y-auto"
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl text-gray-800 mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
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
            <form onSubmit={onSubmit}>
              {/* Contenido: sin scroll interno salvo que la pantalla sea MUY pequeña */}
              <div className="px-6 pt-4 pb-2 space-y-5">
                {/* Nombre y descripción */}
                <div className="space-y-3">
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
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Imagen del producto*
                  </label>
                  <label className="block w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-green-300 cursor-pointer p-3 text-center">
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
                    {errors.stockMin && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.stockMin}
                      </p>
                    )}
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
                      placeholder="(auto) stockMin * 5"
                      className={`${inputClass} ${
                        errors.stockMax ? "border-red-500" : "border-gray-300"
                      }`}
                      onKeyDown={(e) =>
                        ["e", "E", "+", "-"].includes(e.key) &&
                        e.preventDefault()
                      }
                    />
                    {errors.stockMax && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.stockMax}
                      </p>
                    )}
                  </div>
                </div>
                {/* Cantidad unitaria y Precio de venta - lado a lado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-semibold text-gray-800">
                        Cantidad unitaria (opcional)
                      </label>

                      {/* Icono info */}
                      <div className="relative group">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-xs font-bold text-gray-600 cursor-help bg-white">
                          i
                        </span>

                        {/* Tooltip */}
                        <div className="absolute left-0 top-7 hidden group-hover:block z-50">
                          <div className="max-w-xs text-xs text-gray-700 bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2">
                            Si el producto contiene unidades adentro, indícalo. Si
                            no, déjalo en blanco.
                          </div>
                        </div>
                      </div>
                    </div>
                    <input
                      name="cantidadUnitaria"
                      type="number"
                      min="1"
                      value={form.cantidadUnitaria}
                      onChange={handleChange}
                      onBlur={(e) =>
                        validateField("cantidadUnitaria", e.target.value)
                      }
                      placeholder="Ej: 20"
                      className={`${inputClass} ${
                        errors.cantidadUnitaria
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onKeyDown={(e) =>
                        ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                      }
                    />

                    {errors.cantidadUnitaria && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.cantidadUnitaria}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">
                      Precio de venta*
                    </label>
                    <input
                      name="precio_venta"
                      type="number"
                      min="0"
                      value={form.precio_venta}
                      onChange={handleChange}
                      onBlur={(e) =>
                        validateField("precio_venta", e.target.value)
                      }
                      placeholder="Ej: 2000"
                      className={`${inputClass} ${
                        errors.precio_venta ? "border-red-500" : "border-gray-300"
                      }`}
                      onKeyDown={(e) =>
                        ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                      }
                      required
                    />
                    {errors.precio_venta && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.precio_venta}
                      </p>
                    )}
                  </div>
                </div>
                {/* Categoría */}
                <div className="grid grid-cols-1 gap-4">
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
                          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
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
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
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
