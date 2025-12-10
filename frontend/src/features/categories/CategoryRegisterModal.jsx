import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DESC_MAX = 80;

export default function CategoryRegisterModal({ isOpen, onClose, onRegister }) {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [errors, setErrors] = useState({ nombre: "", descripcion: "" });

  useEffect(() => {
    if (!isOpen) return;
    setForm({ nombre: "", descripcion: "" });
    setErrors({ nombre: "", descripcion: "" });
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        name === "descripcion"
          ? value.slice(0, DESC_MAX) // hard limit
          : value,
    }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const newErrors = { nombre: "", descripcion: "" };
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!form.descripcion.trim())
      newErrors.descripcion = "La descripción es obligatoria.";
    if (form.descripcion.length > DESC_MAX)
      newErrors.descripcion = `Máximo ${DESC_MAX} caracteres.`;
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // 🔒 Siempre activo al registrar
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim().slice(0, DESC_MAX),
      estado: true, // boolean real
    };

    onRegister?.(payload);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Registro de Categoría</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Nombre*</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre de la categoría"
                  className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black ${
                    errors.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>

              {/* Descripción (máx 80) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Descripción*</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder={`Descripción de la categoría (máx ${DESC_MAX} caracteres)`}
                  rows={4}
                  maxLength={DESC_MAX}
                  className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-200 text-black ${
                    errors.descripcion ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                <div className="flex justify-between">
                  {errors.descripcion ? (
                    <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>
                  ) : (
                    <span className="text-xs text-gray-500 mt-1">
                      {form.descripcion.length}/{DESC_MAX}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800">
                  Cancelar
                </button>
                <button type="submit"
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm">
                  Registrar Categoría
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
