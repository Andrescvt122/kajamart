// frontend/src/features/products/productEditModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload } from "lucide-react";

export default function ProductEditModal({
  isModalOpen,
  setIsModalOpen,
  form,             // estado controlado desde el padre
  setForm,          // setter del padre
  handleImages,     // para manejar NUEVA imagen (usaremos solo la primera)
  removeImageAt,    // para quitar la única imagen (índice 0)
  handleSubmit,     // 👉 el padre recibe el form ya validado (NO el evento)
  estadoOpen,
  setEstadoOpen,
  categoriaOpen,
  setCategoriaOpen,
  estadoRef,
  categoriaRef,
  estadoOptions,
  categories = [],
  listVariants,
  itemVariants,
}) {
  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState([]);

  // Solo activas si traen estado; si no, usamos todas
  const activeCategories = Array.isArray(categories)
    ? categories.filter((c) => {
        if (!c) return false;
        if (c.estado === undefined) return true;
        return (
          c.estado === "Activo" ||
          c.estado === "activo" ||
          c.estado === true
        );
      })
    : [];

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        if (!value || !value.trim()) error = "El nombre es obligatorio.";
        break;
      case "estado":
        if (!value) error = "Selecciona un estado.";
        break;
      case "categoria":
        if (!value) error = "Selecciona una categoría.";
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

  // Submit local → valida y entrega "form" al padre
  const onSubmit = (e) => {
    e.preventDefault();
    const fields = ["nombre", "estado", "categoria"];
    const errs = {};
    let ok = true;
    fields.forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) {
        ok = false;
        errs[f] = err;
      }
    });
    setErrors(errs);
    if (!ok) return;
    handleSubmit(form); // <<<<<< pasa el form (no el evento)
  };

  // Previews (URL o File) — SOLO 1
  useEffect(() => {
    const toRevoke = [];
    const first = (form?.imagenes || []).filter(Boolean)[0];

    const p =
      typeof first === "string"
        ? { src: first, revoke: false }
        : first &&
          typeof first === "object" &&
          "preview" in first &&
          typeof first.preview === "string"
        ? { src: first.preview, revoke: false }
        : first instanceof File || first instanceof Blob
        ? (() => {
            const u = URL.createObjectURL(first);
            toRevoke.push(u);
            return { src: u, revoke: true };
          })()
        : null;

    setPreviews(p ? [p] : []);
    return () => toRevoke.forEach((u) => URL.revokeObjectURL(u));
  }, [form?.imagenes]);

  // Handler para SOLO 1 imagen (reemplaza la existente)
  const onPickSingleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Creamos un "fake event" con un único archivo para mantener compatibilidad con tu handleImages
    handleImages({ target: { files: [file] } });
    // Limpia el input para permitir volver a seleccionar la misma imagen si se desea
    e.target.value = "";
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          // 🔹 Igual overlay que el modal de Registrar: blur total + un poco más arriba
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-10 sm:pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // 🔹 Mismo comportamiento de altura que el de Registrar
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative text-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Editar Producto
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Nombre del Producto*
                </label>
                <input
                  name="nombre"
                  value={form.nombre || ""}
                  onChange={handleChange}
                  onBlur={(e) => validateField("nombre", e.target.value)}
                  placeholder="Nombre del producto"
                  className={`mt-1 w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 ${
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

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion || ""}
                  onChange={handleChange}
                  placeholder="Descripción corta"
                  rows="3"
                  className="mt-1 w-full px-4 py-3 border rounded-lg bg-white border-gray-300"
                />
              </div>

              {/* Imagen única */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Imagen
                </label>
                <label className="mt-2 block w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-green-300 cursor-pointer p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Upload size={20} className="text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Selecciona o arrastra una imagen aquí (máx. 1)
                    </span>
                  </div>
                  {/* 👇 sin multiple */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPickSingleImage}
                    className="hidden"
                  />
                </label>

                {previews.length > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                      <img
                        src={previews[0].src}
                        alt="img-0"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageAt(0)}
                        className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow"
                        aria-label="Quitar imagen"
                        title="Quitar"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Se admite solo una imagen.
                    </div>
                  </div>
                )}
              </div>

              {/* Estado y Categoría (sin precios ni stock) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Estado */}
                <div className="relative" ref={estadoRef}>
                  <label className="block text-sm font-semibold">
                    Estado*
                  </label>
                  <div
                    className={`mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border ${
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.estado}
                    </p>
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

                {/* Categoría */}
                <div className="relative" ref={categoriaRef}>
                  <label className="block text-sm font-semibold">
                    Categoría*
                  </label>
                  <div
                    className={`mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border ${
                      errors.categoria ? "border-red-500" : "border-gray-300"
                    } bg-white`}
                  >
                    <button
                      type="button"
                      onClick={() => setCategoriaOpen((s) => !s)}
                      className="flex w-full items-center justify-between text-sm"
                    >
                      <span
                        className={
                          form.categoria
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {form.categoria || "Seleccionar categoría"}
                      </span>
                      <motion.span
                        animate={{ rotate: categoriaOpen ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                  </div>
                  {errors.categoria && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.categoria}
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
                        {(activeCategories.length > 0
                          ? activeCategories
                          : categories
                        ).map((c) => {
                          const id = c.id ?? c.id_categoria;
                          const name = c.nombre_categoria || c.nombre;
                          return (
                            <motion.li
                              key={id}
                              variants={itemVariants}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  categoria: name,
                                }));
                                validateField("categoria", name);
                                setCategoriaOpen(false);
                              }}
                              className="px-4 py-3 cursor-pointer text-sm text-gray-700 hover:bg-green-50"
                            >
                              {name}
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
