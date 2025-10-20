// ClientDetailModal.jsx
import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

export default function ClientDetailModal({ isOpen, onClose, client }) {
  if (!isOpen || !client) return null;

  const modalVars = {
    hidden: { opacity: 0, y: -20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 22, stiffness: 300 } },
    exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2 } },
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.22 } }}
        exit={{ opacity: 0, transition: { duration: 0.22 } }}
      />

      {/* Modal */}
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
        variants={modalVars}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Detalles del Cliente</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">✕</button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-500">Nombre</p>
            <p className="font-medium">{client.nombre || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Tipo de Documento</p>
            <p className="font-medium">{client.tipoDocumento || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Número de Documento</p>
            <p className="font-medium">{client.numeroDocumento || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Correo Electrónico</p>
            <p className="font-medium">{client.correo || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Número de Teléfono</p>
            <p className="font-medium">{client.telefono || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Activo</p>
            <p className="font-medium">{client.activo ? "Sí" : "No"}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
