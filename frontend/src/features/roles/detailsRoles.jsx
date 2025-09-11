// src/pages/roles/detailsRoles.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function DetailsRoles({ isOpen, onClose, role }) {
  const [selectedRole, setSelectedRole] = useState(null);

  // sincronizar role entrante
  useEffect(() => {
    if (role) setSelectedRole(role);
    else setSelectedRole(null);
  }, [role]);

  // agrupar permisos por módulo para presentación
  const permisosPorModulo = useMemo(() => {
    if (!selectedRole || !Array.isArray(selectedRole.Permisos)) return {};
    return selectedRole.Permisos.reduce((acc, p) => {
      const modulo = p.modulo || p.Modulo || "General";
      const permiso = p.permiso || p.Permiso || String(p);
      if (!acc[modulo]) acc[modulo] = [];
      if (!acc[modulo].includes(permiso)) acc[modulo].push(permiso);
      return acc;
    }, {});
  }, [selectedRole]);

  // NOTA: ya no retornamos null inmediatamente para permitir que AnimatePresence
  // ejecute la animación de salida correctamente.

  return (
    <AnimatePresence>
      {isOpen && selectedRole && (
        <>
          {/* Fondo (overlay) */}
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Detalles del rol ${selectedRole.NombreRol || ""}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Detalles del rol
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRole.NombreRol || "—"}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 text-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Columna izquierda: info general */}
                  <div className="md:col-span-2 space-y-4">
                    <section>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        Información general
                      </h3>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Nombre</p>
                          <p className="font-medium">{selectedRole.NombreRol || "—"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Descripción</p>
                          <p className="font-medium">
                            {selectedRole.Descripción || "Sin descripción"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-500">Estado</p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              selectedRole.Estado === "Activo"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {selectedRole.Estado || "—"}
                          </span>
                        </div>

                        {selectedRole.FechaCreacion && (
                          <div>
                            <p className="text-xs text-gray-500">Fecha de creación</p>
                            <p className="font-medium">{selectedRole.FechaCreacion}</p>
                          </div>
                        )}

                        {/* Usuarios asignados (si vienen) */}
                        {selectedRole.Usuarios && selectedRole.Usuarios.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500">Usuarios asignados</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedRole.Usuarios.map((u, i) => (
                                <span
                                  key={i}
                                  className="text-sm px-2 py-1 bg-gray-100 rounded-md"
                                >
                                  {u}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Permisos - lista detallada compacta */}
                    <section>
                      <h3 className="text-lg font-medium text-gray-700 mb-3">
                        Permisos asignados
                      </h3>

                      {Object.keys(permisosPorModulo).length === 0 ? (
                        <p className="text-sm text-gray-500">No hay permisos asignados.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
                            <div
                              key={modulo}
                              className="p-3 border rounded-lg bg-gray-50"
                            >
                              <p className="text-sm font-semibold text-green-700 mb-2">
                                {modulo}
                              </p>
                              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {permisos.map((perm, idx) => (
                                  <li key={idx}>{perm}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Columna derecha: resumen / acciones */}
                  <aside className="space-y-4">
                    <div className="p-4 border rounded-lg bg-white">
                      <p className="text-xs text-gray-500">Resumen</p>
                      <p className="text-sm font-medium mt-2">
                        {selectedRole.Permisos?.length || 0} permiso(s)
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedRole.Usuarios ? `${selectedRole.Usuarios.length} usuario(s) asignado(s)` : "Sin usuarios asignados"}
                      </p>
                    </div>

                    {/* Acción: volver (primario verde) */}
                    <div>
                      <button
                        onClick={onClose}
                        className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Volver a la lista de roles
                      </button>
                    </div>
                  </aside>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
