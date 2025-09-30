import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterRoles({
  isOpen,
  onClose,
  form,
  setForm,
  handleChange,
  handlePermisoChange,
  handleSubmit,
  permisosAgrupados,
}) {
  // Seleccionar/Deseleccionar todos
  const toggleSelectAll = () => {
    const allSelected = Object.entries(permisosAgrupados).every(([modulo, permisos]) =>
      permisos.every((permiso) => form.permisos[`${modulo}-${permiso}`])
    );

    const newPermisos = {};
    Object.entries(permisosAgrupados).forEach(([modulo, permisos]) => {
      permisos.forEach((permiso) => {
        const key = `${modulo}-${permiso}`;
        newPermisos[key] = !allSelected;
      });
    });

    setForm((prev) => ({
      ...prev,
      permisos: { ...prev.permisos, ...newPermisos },
    }));
  };

  // Seleccionar/Deseleccionar todos los permisos de un módulo
  const toggleSelectModule = (modulo, permisos) => {
    const allSelected = permisos.every(
      (permiso) => form.permisos[`${modulo}-${permiso}`]
    );

    const newPermisos = {};
    permisos.forEach((permiso) => {
      const key = `${modulo}-${permiso}`;
      newPermisos[key] = !allSelected;
    });

    setForm((prev) => ({
      ...prev,
      permisos: { ...prev.permisos, ...newPermisos },
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Crear Rol</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  ✕
                </button>
              </div>

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
                {/* Nombre y descripción */}
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
                      required
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

                {/* Permisos agrupados */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Asignar permisos y privilegios
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={Object.entries(permisosAgrupados).every(
                          ([modulo, permisos]) =>
                            permisos.every(
                              (permiso) => form.permisos[`${modulo}-${permiso}`]
                            )
                        )}
                        className="custom-checkbox"
                      />
                      <span className="text-green-700 text-sm">
                        Seleccionar todos
                      </span>
                    </label>
                  </div>
                  <div className="overflow-hidden rounded-xl border max-h-64 overflow-y-auto custom-scroll">
                    <table className="min-w-full text-sm">
                      <thead className="bg-green-50 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">Módulo</th>
                          <th className="px-4 py-3 text-left">Permisos/Privilegios</th>
                          <th className="px-4 py-3 text-center">Todos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.entries(permisosAgrupados).map(([modulo, permisos], i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {modulo}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-3">
                                {permisos.map((permiso, j) => {
                                  const key = `${modulo}-${permiso}`;
                                  return (
                                    <label key={j} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={form.permisos[key] || false}
                                        onChange={() => handlePermisoChange(modulo, permiso)}
                                        className="custom-checkbox"
                                      />
                                      <span className="text-green-600">{permiso}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                onChange={() => toggleSelectModule(modulo, permisos)}
                                checked={permisos.every(
                                  (permiso) => form.permisos[`${modulo}-${permiso}`]
                                )}
                                className="custom-checkbox"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                  >
                    Crear Rol
                  </button>
                </div>
              </motion.form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
