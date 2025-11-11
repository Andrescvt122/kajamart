// src/pages/users/detailsUsers.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Componente visual para el estado (Activo/Inactivo)
const EstadoToggleView = ({ enabled }) => (
  <div
    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
      enabled ? "bg-green-600" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full ${
        enabled ? "translate-x-6" : "translate-x-1"
      } transition-transform duration-200`}
    />
  </div>
);

export default function DetailsUsers({ isOpen, onClose, user }) {
  const [form, setForm] = useState({
    Nombre: "",
    Correo: "",
    Documento: "",   
    Telefono: "",    
    Rol: "",
    Estado: true,
    // ❌ FechaCreacion eliminada
  });

  useEffect(() => {
    if (!user) {
      // Limpiar el formulario si no hay usuario
      setForm({
        Nombre: "",
        Correo: "",
        Documento: "",
        Telefono: "",
        Rol: "",
        Estado: true,
        // ❌ FechaCreacion eliminada
      });
      return;
    }
    
    // Mapear los datos del usuario a la estructura del formulario
    setForm({
      Nombre: user.Nombre || "",
      Correo: user.Correo || "",
      Documento: user.Documento || "", 
      Telefono: user.Telefono || "", 
      Rol: user.Rol || "",
      // Convertimos el estado de cadena ("Activo"/"Inactivo") a booleano (true/false)
      Estado:
        (user.Estado || "").toString().toLowerCase() === "activo"
          ? true
          : false,
    });
  }, [user]);

  // ❌ La función formatDate ya no es necesaria, pero la dejo si la necesitas en otro lado.

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Contenedor (mismo estilo que EditUsers, solo lectura) */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-1 text-gray-800">
                Detalles del usuario: {form.Nombre}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Información del usuario (solo lectura).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna 1 */}
                <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={form.Nombre}
                        readOnly
                        className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-black"
                      />
                    </div>
                    
                    {/* Documento */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Documento</label>
                      <input
                        type="text"
                        value={form.Documento}
                        readOnly
                        className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-black"
                      />
                    </div>
                    
                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="text"
                        value={form.Telefono}
                        readOnly
                        className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-black"
                      />
                    </div>

                    {/* Espacio extra para mantener columnas alineadas si es necesario */}
                    <div className="h-4"></div> 
                </div>

                {/* Columna 2 */}
                <div className="space-y-4">
                    {/* Correo Electrónico */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Correo Electrónico</label>
                      <input
                        type="text"
                        value={form.Correo}
                        readOnly
                        className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-black"
                      />
                    </div>

                    {/* Rol Asignado */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Rol Asignado</label>
                      <input
                        type="text"
                        value={form.Rol}
                        readOnly
                        className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-black"
                      />
                    </div>
                    
                    {/* Estado del Usuario */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Estado del Usuario</label>
                      <div className="flex items-center gap-3 mt-3">
                        <EstadoToggleView enabled={form.Estado} />
                        <span className={`text-sm font-medium ${form.Estado ? "text-green-600" : "text-red-600"}`}>
                          {form.Estado ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Espacio extra para mantener columnas alineadas */}
                    <div className="h-4"></div> 
                </div>
              </div>


              {/* Botón: ahora verde como el botón de guardar en EditUsers */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Volver a la lista de usuarios
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}