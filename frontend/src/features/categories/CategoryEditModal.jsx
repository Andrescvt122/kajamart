import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function CategoryEditModal({ isOpen, onClose, category, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    estado: "",
    descripcion: "",
  });

  const [errors, setErrors] = useState({
    nombre: "",
    estado: "",
    descripcion: "",
  });

  const [estadoOpen, setEstadoOpen] = useState(false);
  const estadoRef = useRef(null);

  const estadoOptions = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ];

  // Cargar datos cuando cambia la categoría
  useEffect(() => {
    if (category) {
      setForm({
        nombre: category.nombre || "",
        estado: category.estado || "",
        descripcion: category.descripcion || "",
      });
      setErrors({ nombre: "", estado: "", descripcion: "" });
    }
  }, [category]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) {
        setEstadoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {
      nombre: "",
      estado: "",
      descripcion: "",
    };

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!form.estado) newErrors.estado = "Selecciona un estado.";
    if (!form.descripcion.trim())
      newErrors.descripcion = "La descripción es obligatoria.";

    setErrors(newErrors);
    return !Object.values(newErrors).some((msg) => msg);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category?.id_categoria) return;

    if (!validate()) return;

    const payload = {
      id_categoria: category.id_categoria,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      estado: form.estado,
    };

    onSave?.(payload); // IndexCategories lo manda al hook updateCategory
  };

  const listVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { staggerChildren: 0.02 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 w-full h-full p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Editar Categoría
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Nombre*
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  autoComplete="off"
                  onChange={handleChange}
                  placeholder="Nombre de la categoría"
                  className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black placeholder-gray-400 transition ${
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

              {/* Dropdown estado */}
              <div className="relative" ref={estadoRef}>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Estado*
                </label>

                <div
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md border transition ${
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
                    className="flex w-full items-center justify-between text-sm focus:outline-none"
                  >
                    <span
                      className={`${
                        form.estado === "Activo"
                          ? "text-green-700 font-medium"
                          : form.estado === "Inactivo"
                          ? "text-red-700 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {form.estado || "Seleccionar estado"}
                    </span>

                    <motion.span
                      animate={{ rotate: estadoOpen ? 180 : 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <ChevronDown
                        size={18}
                        className={`${
                          form.estado === "Activo"
                            ? "text-green-700"
                            : form.estado === "Inactivo"
                            ? "text-red-700"
                            : "text-gray-500"
                        }`}
                      />
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
                            setForm((prev) => ({ ...prev, estado: opt.value }));
                            setErrors((prev) => ({ ...prev, estado: "" }));
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

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Descripción*
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción de la categoría"
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black placeholder-gray-400 transition ${
                    errors.descripcion ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.descripcion && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.descripcion}
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
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
