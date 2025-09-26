// src/pages/users/editUsers.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { showConfirmAlert } from "../../shared/components/alerts.jsx";

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
  const [form, setForm] = useState({
    Nombre: "",
    Correo: "",
    Rol: "",
    Estado: true,
    FechaCreacion: "",
  });

  useEffect(() => {
    if (!user) {
      setForm({
        Nombre: "",
        Correo: "",
        Rol: "",
        Estado: true,
        FechaCreacion: "",
      });
      return;
    }
    setForm({
      Nombre: user.Nombre || user.nombre || "",
      Correo: user.Correo || user.correo || "",
      Rol: user.Rol || user.rol || "",
      Estado:
        (user.Estado || user.estado || "").toString().toLowerCase() === "activo"
          ? true
          : Boolean(user.estado) || false,
      FechaCreacion: user.FechaCreacion || user.fechaCreacion || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleEstadoChange = () => {
    const nuevoEstado = !form.Estado;
    const message = `¿Estás seguro de que quieres cambiar el estado a ${
      nuevoEstado ? "'Activo'" : "'Inactivo'"
    }?`;

    showConfirmAlert(message).then((confirmed) => {
      if (confirmed) setForm((p) => ({ ...p, Estado: nuevoEstado }));
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación automática con required / type=email
    showConfirmAlert("¿Confirmas actualizar este usuario?").then((confirmed) => {
      if (confirmed) {
        const updated = {
          ...user,
          Nombre: form.Nombre,
          Correo: form.Correo,
          Rol: form.Rol,
          Estado: form.Estado ? "Activo" : "Inactivo",
          FechaCreacion: form.FechaCreacion,
        };
        onSave(updated);
        onClose();
      }
    });
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.14 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.14 } },
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              key="edit-modal"
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Editar usuario ${form.Nombre}`}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-1 text-gray-800">
                Editar Usuario: {form.Nombre}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Modifica la información del usuario.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      name="Nombre"
                      value={form.Nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black border-gray-200 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  {/* Correo */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="Correo"
                      value={form.Correo}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black border-gray-200 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  {/* Rol */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Rol Asignado
                    </label>
                    <input
                      name="Rol"
                      value={form.Rol}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-black border-gray-200 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  {/* Fecha creación */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Fecha creación
                    </label>
                    <input
                      name="FechaCreacion"
                      value={form.FechaCreacion}
                      readOnly
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-black"
                    />
                  </div>

                  {/* Estado del usuario */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Estado del Usuario
                    </label>
                    <div className="flex items-center gap-3 mt-2">
                      <EstadoToggle
                        enabled={form.Estado}
                        onChange={handleEstadoChange}
                      />
                      <span className="text-sm text-gray-600">
                        {form.Estado ? "Activo" : "Inactivo"}
                      </span>
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
                    className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                  >
                    Actualizar Usuario
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
