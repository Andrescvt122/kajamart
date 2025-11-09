// src/pages/roles/deleteRoles.jsx
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccessAlert } from "../../shared/components/alerts.jsx";
import { useDeleteRole } from "../../shared/components/hooks/roles/useDeleteRole.js";

export default function DeleteRoleModal({ isOpen, onClose, onRoleDeleted, role }) {
  const cancelButtonRef = useRef(null);
  const { deleteRole, loading, error } = useDeleteRole();

  // Enfocar botón Cancelar al abrir
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleDelete = async () => {
    if (!role?.rol_id) return;
    const success = await deleteRole(role.rol_id);
    if (success) {
      showSuccessAlert("Rol eliminado correctamente.");
      onRoleDeleted(role.rol_id); // 🚀 Notifica al padre que el rol fue eliminado
      onClose(); // Cierra el modal
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 w-full h-full p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            initial={{ opacity: 0, scale: 0.9, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title" className="text-2xl font-bold mb-4 text-gray-800">
              Confirmar Eliminación
            </h2>

            <p id="modal-description" className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el rol{" "}
              <span className="font-semibold text-red-600">
                {role?.rol_nombre || ""}
              </span>
              ? Esta acción no se puede deshacer.
            </p>

            {error && <p className="text-red-600 mb-3">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                ref={cancelButtonRef}
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
