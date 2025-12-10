// src/pages/users/editUsers.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "../../shared/components/alerts.jsx";

// 💡 Importar el nuevo hook de acciones de usuario
import { useUserActions } from "../../shared/components/hooks/users/useUserActions.js";

// Componente para alternar el estado
const EstadoToggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none ${
      enabled ? "bg-green-600" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function EditUsers({ isOpen, onClose, user, onSave }) {
  // Usar el hook para las acciones de la API
  const { updatePersonalData, toggleUserStatus, loading: apiLoading } = useUserActions();

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: "", 
    apellido: "",
    documento: "", 
    telefono: "",
    correo: "", // Solo lectura
    rol: "", // Solo lectura
    estado: true,
  });
  
  // Estado para rastrear el estado original para ver si hubo cambios
  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => {
    if (!user) {
        // ... (limpiar formulario)
      return;
    }

    // El nombre completo viene como "Nombre Apellido", necesitamos separarlos
    const [nombre, ...apellidoParts] = (user.Nombre || "").split(" ");
    const apellido = apellidoParts.join(" ") || "";

    const initialForm = {
      nombre: nombre,
      apellido: apellido,
      documento: user.Documento || "", 
      telefono: user.Telefono || "",   
      correo: user.Correo || "", 
      rol: user.Rol || "", 
      estado: (user.Estado || "").toString().toLowerCase() === "activo",
    };

    setForm(initialForm);
    setOriginalForm(initialForm);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleEstadoChange = () => {
    const nuevoEstado = !form.estado;
    const message = `¿Estás seguro de que quieres cambiar el estado a ${
      nuevoEstado ? "'Activo'" : "'Inactivo'"
    }?`;

    showConfirmAlert(message).then((confirmed) => {
      if (confirmed) setForm((p) => ({ ...p, estado: nuevoEstado }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (apiLoading || !user || !originalForm) return;

    const confirmed = await showConfirmAlert("¿Confirmas actualizar este usuario?");
    if (!confirmed) return;

    try {
      let personalDataChanged = false;
      let statusChanged = false;
      const userId = user.id; 

      // 1. Verificar y enviar CAMBIOS DE DATOS PERSONALES
      const personalDataToUpdate = {
          nombre: form.nombre,
          apellido: form.apellido,
          documento: form.documento,
          telefono: form.telefono,
      };

      if (
          originalForm.nombre !== form.nombre ||
          originalForm.apellido !== form.apellido ||
          originalForm.documento !== form.documento ||
          originalForm.telefono !== form.telefono
      ) {
          personalDataChanged = true;
          await updatePersonalData(userId, personalDataToUpdate);
      }

      // 2. Verificar y enviar CAMBIO DE ESTADO
      if (form.estado !== originalForm.estado) {
          statusChanged = true;
          await toggleUserStatus(userId, form.estado);
      }

      // 3. MANEJO DE RESPUESTA
      if (personalDataChanged || statusChanged) {
          // Crear objeto actualizado para la actualización optimista
          const updatedUser = {
              ...user,
              Nombre: `${form.nombre} ${form.apellido}`.trim(),
              Documento: form.documento,
              Telefono: form.telefono,
              Estado: form.estado ? "Activo" : "Inactivo",
          };
          onSave(updatedUser); // Actualizar el estado en la lista principal
          showSuccessAlert("Usuario actualizado correctamente.");
          onClose();
      } else {
          showErrorAlert("No se detectaron cambios para actualizar.");
          onClose();
      }
      
    } catch (error) {
      showErrorAlert(error.message || "Ocurrió un error al guardar los cambios.");
    }
  };

  // ... (rest of the component, including motion and JSX)
  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && user && ( 
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 28 } }}
            exit={{ opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.14 } }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              key="edit-modal"
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-1 text-gray-800">
                Editar Usuario: {form.nombre}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Modifica la información del usuario.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre</label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black border-gray-200 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>
                  
                  {/* Apellido */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Apellido</label>
                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black border-gray-200 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  {/* Documento */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Documento</label>
                    <input
                      type="text"
                      name="documento"
                      value={form.documento}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black border-gray-200 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black border-gray-200 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  {/* Correo (Solo Lectura) */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      name="correo"
                      value={form.correo}
                      readOnly
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-600 focus:outline-none"
                    />
                  </div>

                  {/* Rol (Solo Lectura) */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Rol Asignado</label>
                    <input
                      name="rol"
                      value={form.rol}
                      readOnly
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-600 focus:outline-none"
                    />
                  </div>
                  
                  {/* Estado del usuario */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      Estado del Usuario (Acceso)
                    </label>
                    <div className="flex items-center gap-3 mt-2">
                      <EstadoToggle
                        enabled={form.estado}
                        onChange={handleEstadoChange}
                      />
                      <span className={`text-sm font-medium ${form.estado ? "text-green-600" : "text-red-600"}`}>
                        {form.estado ? "Activo" : "Inactivo"}
                      </span>
                      {apiLoading && <span className="text-xs text-gray-500">Guardando...</span>}
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={apiLoading}
                    className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition disabled:bg-green-300"
                  >
                    {apiLoading ? "Actualizando..." : "Actualizar Usuario"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}