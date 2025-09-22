import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Calendar, CheckCircle } from "lucide-react";

const ProductRegistrationModal = ({ isOpen, onClose, product, onConfirm }) => {
  const [formData, setFormData] = useState({
    barcode: product?.barcode || "",
    quantity: product?.returnQuantity || 1,
    expiryDate: ""
  });

  const [errors, setErrors] = useState({});

  // Fecha mínima: 4 días después de hoy
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 4);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.barcode.trim()) {
      newErrors.barcode = "El código de barras es obligatorio";
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = "La cantidad debe ser mayor a 0";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "La fecha de vencimiento es obligatoria";
    } else {
      const selectedDate = new Date(formData.expiryDate);
      if (selectedDate < minDate) {
        newErrors.expiryDate = "La fecha debe ser mínimo 4 días después de hoy";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const registeredProduct = {
      ...product,
      ...formData,
      registeredAt: new Date().toISOString()
    };

    onConfirm(registeredProduct);
    
    // Resetear formulario
    setFormData({
      barcode: "",
      quantity: 1,
      expiryDate: ""
    });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      barcode: product?.barcode || "",
      quantity: product?.returnQuantity || 1,
      expiryDate: ""
    });
    setErrors({});
    onClose();
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-70 p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            >
              {/* Header */}
              <motion.div
                className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <motion.div
                      className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}
                    >
                      <Package className="w-5 h-5 text-green-600" />
                    </motion.div>
                    Registrar Producto
                  </h3>
                  <motion.button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-all"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 90,
                      backgroundColor: "rgba(255, 255, 255, 0.8)"
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </motion.div>

              <div className="p-6">
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {/* Información del producto */}
                  <motion.div
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Package className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.h4 
                        className="font-semibold text-gray-800 mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {product?.name}
                      </motion.h4>
                      <motion.p 
                        className="text-sm text-gray-600 mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        Cantidad a devolver: <span className="font-medium text-green-600">{product?.returnQuantity}</span>
                      </motion.p>
                      <motion.p 
                        className="text-sm text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        Precio: {formatPrice(product?.salePrice || 0)}
                      </motion.p>
                    </div>
                  </motion.div>

                  {/* Formulario */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    {/* Código de barras */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Código de barras *
                      </label>
                      <motion.input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => {
                          setFormData({...formData, barcode: e.target.value});
                          if (errors.barcode) {
                            setErrors({...errors, barcode: ""});
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all ${
                          errors.barcode ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                        placeholder="Ingrese el código de barras"
                        whileFocus={{ scale: 1.02 }}
                      />
                      <AnimatePresence>
                        {errors.barcode && (
                          <motion.p
                            className="text-red-600 text-sm mt-1 flex items-center gap-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {errors.barcode}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cantidad *
                      </label>
                      <motion.input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => {
                          setFormData({...formData, quantity: parseInt(e.target.value) || 1});
                          if (errors.quantity) {
                            setErrors({...errors, quantity: ""});
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all ${
                          errors.quantity ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                        whileFocus={{ scale: 1.02 }}
                      />
                      <AnimatePresence>
                        {errors.quantity && (
                          <motion.p
                            className="text-red-600 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {errors.quantity}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Fecha de vencimiento */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha de vencimiento *
                      </label>
                      <div className="relative">
                        <motion.input
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => {
                            setFormData({...formData, expiryDate: e.target.value});
                            if (errors.expiryDate) {
                              setErrors({...errors, expiryDate: ""});
                            }
                          }}
                          min={formatDate(minDate)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all ${
                            errors.expiryDate ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
                          }`}
                          whileFocus={{ scale: 1.02 }}
                        />
                        <motion.div 
                          className="absolute right-3 top-3.5 pointer-events-none"
                          initial={{ opacity: 0.6 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                      <motion.p 
                        className="text-xs text-gray-500 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        Mínimo 4 días después de hoy ({formatDate(minDate)})
                      </motion.p>
                      <AnimatePresence>
                        {errors.expiryDate && (
                          <motion.p
                            className="text-red-600 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {errors.expiryDate}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Botones */}
                <motion.div
                  className="flex gap-3 pt-6 mt-6 border-t border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <motion.button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    whileHover={{ 
                      scale: 1.02, 
                      backgroundColor: "#f9fafb",
                      borderColor: "#d1d5db"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg"
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "#15803d",
                      boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <CheckCircle size={18} />
                    </motion.div>
                    Confirmar Registro
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductRegistrationModal;