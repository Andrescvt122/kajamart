import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";

export default function DetailsRoles({ isOpen, onClose, role }) {
  const [rolCompleto, setRolCompleto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      setRolCompleto(null);
      setLoading(true);

      // Si el prop ya trae permisos (caso creación), reutilizarlos y evitar fetch
      if (role.rol_permisos || role.permisos || role.Permisos) {
        setRolCompleto(role);
        setLoading(false);
        return;
      }

      // Solo hacer fetch si tenemos un id válido
      if (role?.rol_id) {
        axios.get(`http://localhost:3000/kajamart/api/roles/${role.rol_id}`)
          .then(response => {
            setRolCompleto(response.data);
          })
          .catch(error => console.error("Error cargando detalles del rol", error))
          .finally(() => setLoading(false));
      } else {
        // No hay id ni permisos: no hay más que cargar
        setLoading(false);
      }
    } else if (!isOpen) {
      setRolCompleto(null); // 💡 Limpiar el estado cuando el modal se cierra.
      setLoading(false);
    }
  }, [isOpen, role]);

  // 🧩 Agrupar permisos por módulo (usando texto del nombre del permiso)
const permisosPorModulo = useMemo(() => {
  if (!rolCompleto) return {};

  // los permisos pueden venir en rol_completo.rol_permisos o directamente en rol_permisos
  const lista = Array.isArray(rolCompleto.rol_permisos)
    ? rolCompleto.rol_permisos
    : Array.isArray(rolCompleto.permisos)
    ? rolCompleto.permisos
    : [];

  if (!Array.isArray(lista)) return {};

  return lista.reduce((acc, p) => {
    // p puede ser { permisos: {...} } o el objeto permiso directamente
    const permisoObj = p.permisos || p.Permisos || p;
    const nombre = permisoObj?.permiso_nombre || permisoObj?.nombre || "Permiso sin nombre";

    const match = String(nombre).match(/Gestión\s+\w+/);
    const modulo = match ? match[0] : "General";

    if (!acc[modulo]) acc[modulo] = [];
    acc[modulo].push(nombre);

    return acc;
  }, {});
}, [rolCompleto]);


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo */}
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Contenedor principal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-3 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative pointer-events-auto max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-4 py-3 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Detalles del rol
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {role?.rol_nombre || "—"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-4 text-gray-800 flex-1 overflow-y-auto">
                {!role ? ( // Mostrar "No encontrado" sólo si no hay objeto role
                  <p>No se encontró el rol.</p>
                ) : (
                  // Mostramos la información básica del 'role' prop inmediatamente
                  // Los permisos se cargarán con 'rolCompleto'
                  <>
                    {/* Información general */}
                    <section>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Información general
                      </h3>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Nombre</p>
                          <p className="font-medium">{role.rol_nombre || "—"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Descripción</p>
                          <p className="font-medium">
                            {role.descripcion || "Sin descripción"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">Estado</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              role.estado_rol
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {role.estado_rol ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* Permisos asignados */}
                    <section className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Permisos asignados
                      </h3>

                      {loading || !rolCompleto ? ( // Mostrar "Cargando permisos..." si estamos cargando o rolCompleto aún no está disponible
                        <p className="text-sm text-gray-500">Cargando permisos...</p>
                      ) : Object.keys(permisosPorModulo).length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No hay permisos asignados.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(permisosPorModulo).map(
                            ([modulo, permisos]) => (
                              <div
                                key={modulo}
                                className="p-2 border rounded-md bg-gray-50"
                              >
                                <p className="text-xs font-semibold text-green-700 mb-1">
                                  {modulo}
                                </p>
                                <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                                  {permisos.map((perm, idx) => (
                                    <li key={idx}>{perm}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </section>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t bg-white">
                <button
                  onClick={onClose}
                  className="w-full px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
                >
                  Volver a la lista de roles
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}