// src/features/categories/CategoryDetailModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const CategoryDetailModal = ({ isOpen, onClose, category }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Detalle de Categoría</h2>
            {category ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {category.id}</p>
                <p><strong>Nombre:</strong> {category.nombre}</p>
                <p><strong>Descripción:</strong> {category.descripcion}</p>
              </div>
            ) : (
              <p>No hay categoría seleccionada.</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryDetailModal;
