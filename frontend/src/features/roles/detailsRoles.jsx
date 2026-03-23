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
        axios.get(`https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api/roles/${role.rol_id}`)
          .then(response => {
            setRolCompleto(response.data);
          })
          .catch(error => console.error("Error cargando detalles del rol", error))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else if (!isOpen) {
      setRolCompleto(null);
      setLoading(false);
    }
  }, [isOpen, role]);

  // 🧩 Lógica mejorada para agrupar permisos
  const permisosPorModulo = useMemo(() => {
    if (!rolCompleto) return {};

    const lista = Array.isArray(rolCompleto.rol_permisos)
      ? rolCompleto.rol_permisos
      : Array.isArray(rolCompleto.permisos)
      ? rolCompleto.permisos
      : [];

    if (!Array.isArray(lista)) return {};

    return lista.reduce((acc, p) => {
      // 1. Obtener el nombre limpio del permiso
      const permisoObj = p.permisos || p.Permisos || p;
      const nombre = permisoObj?.permiso_nombre || permisoObj?.nombre || "Permiso sin nombre";
      
      // 2. Determinar el módulo analizando el nombre (Keywords)
      let modulo = "General";
      const n = nombre.toLowerCase();

      // Reglas de agrupación basadas en tus permisos actuales:
      if (n.includes("cliente")) {
        modulo = "Clientes";
      } else if (n.includes("venta")) {
        modulo = "Ventas";
      } else if (n.includes("compra") || n.includes("proveedor")) {
        modulo = "Compras";
      } else if (n.includes("producto") || n.includes("categoría") || n.includes("baja")) {
        modulo = "Inventario y Productos";
      } else if (n.includes("rol") || n.includes("usuario") || n.includes("permiso")) {
        modulo = "Seguridad y Usuarios";
      } else if (n.includes("devolución") || n.includes("devolucion")) {
        modulo = "Devoluciones";
      }

      // 3. Agrupar
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
                {!role ? (
                  <p>No se encontró el rol.</p>
                ) : (
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
                        Permisos asignados por módulo
                      </h3>

                      {loading || !rolCompleto ? (
                        <p className="text-sm text-gray-500">Cargando permisos...</p>
                      ) : Object.keys(permisosPorModulo).length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No hay permisos asignados.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(permisosPorModulo).map(
                            ([modulo, permisos]) => (
                              <div
                                key={modulo}
                                className="border rounded-lg overflow-hidden flex flex-col h-full shadow-sm"
                              >
                                {/* Encabezado de la tarjeta del Módulo */}
                                <div className="bg-gray-100 px-3 py-2 border-b">
                                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    {modulo}
                                  </h4>
                                </div>
                                {/* Lista de permisos */}
                                <div className="p-3 bg-white flex-1">
                                  <ul className="space-y-1">
                                    {permisos.map((perm, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                        <span className="text-green-500 mt-0.5">•</span>
                                        {perm}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
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
                  className="w-full px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors"
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