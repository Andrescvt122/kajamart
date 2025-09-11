// src/pages/roles/editRoles.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function EditRoles({ isOpen, onClose, role, permisosDisponibles, onUpdate }) {
  const [form, setForm] = useState({
    nombreRol: "",
    descripcion: "",
    estado: true,
    permisos: {},
  });

  // ✅ Cargar datos iniciales cuando cambie el rol
  useEffect(() => {
    if (role) {
      setForm({
        nombreRol: role.NombreRol || "",
        descripcion: role.Descripción || "",
        estado: role.Estado === "Activo",
        permisos: role.Permisos
          ? role.Permisos.reduce((acc, p) => {
              const key = `${p.modulo}-${p.permiso}`;
              acc[key] = true;
              return acc;
            }, {})
          : {},
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermisoChange = (key) => {
    setForm((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [key]: !prev.permisos[key],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...role,
      NombreRol: form.nombreRol,
      Descripción: form.descripcion,
      Estado: form.estado ? "Activo" : "Inactivo",
      Permisos: Object.entries(form.permisos)
        .filter(([_, checked]) => checked)
        .map(([key]) => {
          const [modulo, permiso] = key.split("-");
          return { modulo, permiso };
        }),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && role && (
        <>
          {/* Fondo */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Contenedor */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Editar rol: {role.NombreRol}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <motion.form
                onSubmit={handleSubmit}
                className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scroll"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {/* Nombre y Descripción */}
                <motion.div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del rol
                    </label>
                    <input
                      type="text"
                      name="nombreRol"
                      value={form.nombreRol}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-300 focus:outline-none"
                      placeholder="Nombre del rol"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-green-300 focus:outline-none"
                      rows={3}
                      placeholder="Descripción del rol"
                    />
                  </div>
                </motion.div>

                {/* Estado */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Estado del Rol
                  </span>
                  <span
                    className={`text-sm ${
                      form.estado ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {form.estado ? "Activo" : "Inactivo"}
                  </span>
                  <label className="inline-flex relative items-center cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={form.estado}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, estado: !prev.estado }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </div>

                {/* Permisos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Asignar Permisos y privilegios
                  </h3>
                  <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                    <table className="min-w-full text-sm">
                      <thead className="bg-green-50 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">Módulo</th>
                          <th className="px-4 py-3 text-left">
                            Permiso/privilegio
                          </th>
                          <th className="px-4 py-3 text-center">Asignación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {permisosDisponibles.map((p, i) => {
                          const key = `${p.modulo}-${p.permiso}`;
                          return (
                            <tr key={i}>
                              <td className="px-4 py-3 text-gray-900">
                                {p.modulo}
                              </td>
                              <td className="px-4 py-3 text-green-600">
                                {p.permiso}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={form.permisos[key] || false}
                                  onChange={() => handlePermisoChange(key)}
                                  className="custom-checkbox"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                  >
                    Actualizar rol
                  </button>
                </div>
              </motion.form>
            </motion.div>
          </div>

          {/* Estilos personalizados */}
          <style>{`
            .custom-scroll::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scroll::-webkit-scrollbar-track {
              background: #fff;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background-color: #ccc;
              border-radius: 4px;
            }
            .custom-checkbox {
              appearance: none;
              width: 18px;
              height: 18px;
              border: 2px solid #ccc;
              border-radius: 4px;
              background: #fff;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            }
            .custom-checkbox:checked {
              background-color: #fff;
              border-color: #22c55e;
            }
            .custom-checkbox:checked::after {
              content: "✔";
              color: #22c55e;
              font-size: 14px;
              font-weight: bold;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
