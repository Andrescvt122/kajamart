import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload } from "lucide-react";

export default function ProductRegisterModal({
  isModalOpen,
  setIsModalOpen,
  form,
  setForm,
  handleImages,
  removeImageAt,
  handleSubmit,
  estadoOpen,
  setEstadoOpen,
  categoriaOpen,
  setCategoriaOpen,
  estadoRef,
  categoriaRef,
  estadoOptions,
  categories,
  listVariants,
  itemVariants,
}) {
  const [errors, setErrors] = useState({});

  // 🚨 Validaciones en tiempo real
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nombre":
        if (!value.trim()) error = "El nombre es obligatorio.";
        break;
      case "precioCompra":
      case "precioVenta":
      case "stock":
      case "subidaVenta":
        if (value === "" || value < 0) error = "Debe ser un número válido.";
        break;
      case "iva":
        if (value && !/^\d{1,2}%?$/.test(value)) {
          error = "Solo números o con % (ej: 19%).";
        }
        break;
      case "icu":
        if (!value.trim()) error = "El ICU es obligatorio.";
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
  };

  // 🚨 Manejo del cambio con validación inmediata
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // prevenir letras como "e", "+", "-" en inputs numéricos
    if (type === "number" && /[eE+\-]/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // 🚨 Validación al enviar
  const onSubmit = (e) => {
    e.preventDefault();

    const fieldsToValidate = [
      "nombre",
      "precioCompra",
      "precioVenta",
      "subidaVenta",
      "stock",
      "icu",
      "iva",
      "estado",
      "categoria",
    ];

    let valid = true;
    fieldsToValidate.forEach((f) => {
      validateField(f, form[f]);
      if (!form[f] || errors[f]) valid = false;
    });

    if (valid) {
      handleSubmit(e);
    }
  };

  return (
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
                  className={`mt-1 w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 ${
                    errors.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* ICU */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  ICU*
                </label>
                <input
                  name="icu"
                  value={form.icu}
                  onChange={handleChange}
                  onBlur={(e) => validateField("icu", e.target.value)}
                  placeholder="Código único (ICU)"
                  className={`mt-1 w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 ${
                    errors.icu ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.icu && (
                  <p className="text-red-500 text-xs mt-1">{errors.icu}</p>
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
                  className="mt-1 w-full px-4 py-3 border rounded-lg bg-white border-gray-300"
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

              {/* Precios y stock */}
              <div className="grid grid-cols-4 gap-3">
                {/* Compra */}
                <div>
                  <label className="block text-sm font-semibold">
                    Precio Compra*
                  </label>
                  <input
                    name="precioCompra"
                    value={form.precioCompra}
                    onBlur={handleChange}
                    type="number"
                    min="0"
                    placeholder="0"
                    className={`mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900
 ${errors.precioCompra ? "border-red-500" : "border-gray-300"}`}
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

                {/* Venta */}
                <div>
                  <label className="block text-sm font-semibold">
                    Precio Venta*
                  </label>
                  <input
                    name="precioVenta"
                    value={form.precioVenta}
                    onBlur={handleChange}
                    type="number"
                    min="0"
                    placeholder="0"
                    className={`mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900 ${
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

                {/* Subida de venta */}
                <div>
                  <label className="block text-sm font-semibold">
                    Subida de Venta (%)
                  </label>
                  <input
                    name="subidaVenta"
                    value={form.subidaVenta}
                    onBlur={handleChange}
                    type="number"
                    min="0"
                    placeholder="Ej: 10"
                    className={`mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900 ${
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

                {/* IVA */}
                <div>
                  <label className="block text-sm font-semibold">IVA</label>
                  <input
                    type="text"
                    name="iva"
                    value={form.iva}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9%]/g, ""); // 🔒 elimina letras
                      setForm({ ...form, iva: val });
                      validateField("iva", val);
                    }}
                    placeholder="%"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 bg-white shadow-sm text-sm 
    ${errors.iva ? "border-red-500" : "border-gray-300"}`}
                  />

                  {errors.iva && (
                    <p className="text-red-500 text-xs mt-1">{errors.iva}</p>
                  )}
                </div>
              </div>

              {/* Stock, Estado, Categoría */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold">Stock*</label>
                  <input
                    name="stock"
                    value={form.stock}
                    onBlur={handleChange}
                    type="number"
                    min="0"
                    placeholder="0"
                    className={`mt-1 w-full px-3 py-2 border rounded-lg bg-white text-gray-900${
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

                {/* Categoría */}
                <div className="relative" ref={categoriaRef}>
                  <label className="block text-sm font-semibold">
                    Categoría*
                  </label>
                  <div
                    className={`mt-1 w-full flex items-center justify-between px-3 py-2 rounded-md border ${
                      errors.categoria ? "border-red-500" : "border-gray-300"
                    }`}
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
                        className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-[144px] overflow-y-auto"
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
                              validateField("categoria", c.nombre);
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
  );
}
