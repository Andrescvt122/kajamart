import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, CheckCircle } from "lucide-react";
// PrimeReact Calendar
import { Calendar } from "primereact/calendar";
// ❌ YA NO usamos el hook aquí
// import { usePostDetailProduct } from "../../../../../shared/components/hooks/detailsProducts/usePostDetailProduct";

const ProductRegistrationModal = ({ isOpen, onClose, product, onConfirm }) => {
  const [formData, setFormData] = useState({
    barcode: "",
    quantity: "",
    expiryDate: "",
    isReturn: true,
  });

  const [errors, setErrors] = useState({});

  // Fecha mínima: 4 días después de hoy
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 4);
  minDate.setHours(0, 0, 0, 0);

  // Resetear campos cuando se abre un producto nuevo
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        barcode: "",
        quantity: "",
        expiryDate: "",
        isReturn: true,
      });
      setErrors({});
    }
  }, [isOpen, product]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs = {};

    // ✅ Código de barras: obligatorio, solo números, exactamente 13
    const barcode = String(formData.barcode ?? "").trim();
    if (!barcode) {
      errs.barcode = "Código de barras requerido";
    } else if (!isExactly13Digits(barcode)) {
      errs.barcode = "El código debe tener exactamente 13 dígitos numéricos";
    }

    // ✅ Cantidad: obligatoria, solo números, no negativa (permito 0)
    const qtyStr = String(formData.quantity ?? "").trim();
    if (!qtyStr) {
      errs.quantity = "Cantidad requerida";
    } else if (!isOnlyDigits(qtyStr)) {
      errs.quantity = "La cantidad solo puede contener números";
    } else {
      const qtyNum = Number(qtyStr);
      if (!Number.isFinite(qtyNum) || qtyNum < 0) {
        errs.quantity = "La cantidad no puede ser negativa";
      }
    }

    // ✅ Fecha: opcional; si se llena => debe ser >= hoy + 4 días
    const expStr = String(formData.expiryDate ?? "").trim();
    if (expStr) {
      const expDate = ymdToDate(expStr);
      if (!expDate) {
        errs.expiryDate = "Fecha inválida";
      } else {
        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);
        if (expDate < min) {
          errs.expiryDate = "La fecha debe ser mínimo 4 días después de hoy";
        }
      }
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    console.log("product", product);
    const cleanBarcode = String(formData.barcode).trim();
    const cleanQty = Number(String(formData.quantity).trim());

    // 🔹 Detalle local, NO se envía a BD aquí
    const registeredDetail = {
      ...product,
      productKey: product?.id_producto, // para vincularlo al producto en ProductReturnModal
      registeredBarcode: formData.barcode,
      registeredQuantity: Number(formData.quantity),
      registeredExpiry: formData.expiryDate || null,
      isReturn: true,
    };

    // devolvemos al padre
    if (onConfirm) {
      onConfirm(registeredDetail);
    }

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      barcode: "",
      quantity: "",
      expiryDate: "",
      isReturn: true,
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

  // Helpers para el input number
  const handleQuantityKeyDown = (e) => {
    const blocked = ["e", "E", "+", "-", ".", ","];
    if (blocked.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleQuantityPaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    if (!/^\d+$/.test(paste)) {
      e.preventDefault();
    }
  };

  const handleQuantityWheel = (e) => {
    e.target.blur();
    setTimeout(() => e.target.focus(), 0);
  };
  const isExactly13Digits = (s) => /^\d{13}$/.test(s);
  const isOnlyDigits = (s) => /^\d+$/.test(s);
  const ymdToDate = (ymd) => {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro SIN cerrar al hacer click */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[70] p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.05, duration: 0.25 }}
            >
              {/* Header */}
              <motion.div
                className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06, duration: 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <motion.div
                      className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}
                    >
                      <Package size={18} className="text-green-700" />
                    </motion.div>
                    Registrar producto
                  </h3>
                  <motion.button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-all p-2 rounded-full"
                    aria-label="Cerrar modal"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <div className="mt-1 text-gray-800 font-medium">
                      {product?.productos?.nombre || "—"}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Precio
                    </label>
                    <div className="mt-1 text-gray-700">
                      {product
                        ? formatPrice(product.productos.precio_venta)
                        : "—"}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Código de barras
                    </label>
                    <input
                      value={formData.barcode}
                      onChange={(e) => {
                        const digits = e.target.value
                          .replace(/\D+/g, "")
                          .slice(0, 13);
                        handleChange("barcode", digits);
                      }}
                      onPaste={(e) => {
                        const paste = (
                          e.clipboardData || window.clipboardData
                        ).getData("text");
                        const digits = paste.replace(/\D+/g, "");
                        if (!digits) e.preventDefault();
                      }}
                      inputMode="numeric"
                      maxLength={13}
                      className="w-full mt-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-black"
                      placeholder="13 dígitos"
                    />
                    {errors.barcode && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.barcode}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Cantidad a registrar
                    </label>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleChange(
                          "quantity",
                          e.target.value.replace(/\D+/g, "")
                        )
                      }
                      onKeyDown={handleQuantityKeyDown}
                      onPaste={handleQuantityPaste}
                      onWheel={handleQuantityWheel}
                      className="w-full mt-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-black"
                      placeholder="0"
                    />
                    {errors.quantity && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.quantity}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Fecha de vencimiento
                    </label>

                    <div className="mt-1">
                      <Calendar
                        value={
                          formData.expiryDate
                            ? new Date(formData.expiryDate)
                            : null
                        }
                        onChange={(e) => {
                          const dateVal = e.value
                            ? e.value.toISOString().slice(0, 10)
                            : "";
                          handleChange("expiryDate", dateVal);
                        }}
                        minDate={minDate}
                        showIcon
                        dateFormat="yy-mm-dd"
                        placeholder="YYYY-MM-DD"
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-black"
                      />
                      {errors.expiryDate && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.expiryDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition"
                  >
                    <CheckCircle size={16} /> Registrar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductRegistrationModal;