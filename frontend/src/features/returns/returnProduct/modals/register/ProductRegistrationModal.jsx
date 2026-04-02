import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, CheckCircle } from "lucide-react";
// PrimeReact Calendar
import { Calendar } from "primereact/calendar";
import {
  DETAIL_BARCODE_CHECKING_MESSAGE,
  DETAIL_BARCODE_DUPLICATE_MESSAGE,
  isValidDetailBarcode,
  validateDetailProductBarcode,
} from "../../../../../shared/components/hooks/productDetails/detailBarcodeValidation";
const ProductRegistrationModal = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  initialDetail,
  existingBarcodes = [],
  ignoreBarcode = null,
  fixedQuantity = null,
}) => {
  const [formData, setFormData] = useState({
    barcode: "",
    quantity: fixedQuantity != null ? String(fixedQuantity) : "",
    expiryDate: "",
    isReturn: true,
  });
  const barcodeValidationRequestRef = useRef(0);
  const [errors, setErrors] = useState({});
  const [barcodeValidation, setBarcodeValidation] = useState({
    status: "idle",
    message: "",
  });

  // Fecha mínima: 4 días después de hoy
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 4);
  minDate.setHours(0, 0, 0, 0);

  // Resetear campos cuando se abre un producto nuevo
  React.useEffect(() => {
    if (isOpen) {
      if (initialDetail) {
        setFormData({
          barcode:
            initialDetail.registeredBarcode ||
            initialDetail.codigo_barras_producto_compra ||
            "",
          quantity: String(
            initialDetail.registeredQuantity ??
              initialDetail.stock_producto ??
              fixedQuantity ??
              ""
          ),
          expiryDate:
            initialDetail.registeredExpiry?.slice(0, 10) ||
            initialDetail.fecha_vencimiento?.slice(0, 10) ||
            "",
          isReturn: true,
        });
      } else {
        setFormData({
          barcode: "",
          quantity: fixedQuantity != null ? String(fixedQuantity) : "",
          expiryDate: "",
          isReturn: true,
        });
      }
      setErrors({});
      setBarcodeValidation({ status: "idle", message: "" });
    }
  }, [isOpen, product, initialDetail, fixedQuantity]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBarcodeChange = (value) => {
    let digitsOnly = String(value ?? "").replace(/\D+/g, "");
    if (digitsOnly.length > 13) digitsOnly = digitsOnly.slice(0, 13);
    setErrors((prev) => ({ ...prev, barcode: undefined }));
    setFormData((prev) => ({ ...prev, barcode: digitsOnly }));
  };

  const validate = () => {
    const errs = {};

    // Código de barras: obligatorio, solo números, exactamente 13, y no duplicado
    if (barcodeError) {
      errs.barcode = barcodeError;
    }

    // Cantidad: obligatoria, solo números, no negativa (permito 0)
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
      if (fixedQuantity != null && qtyNum !== Number(fixedQuantity)) {
        errs.quantity = `La cantidad debe ser ${fixedQuantity}`;
      }
    }

    // Fecha: opcional; si se llena => debe ser >= hoy + 4 días
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const barcodeIsUnique = await runBarcodeValidation(formData.barcode);
    if (!barcodeIsUnique) {
      setErrors((prev) => ({
        ...prev,
        barcode:
          barcodeValidation.message || DETAIL_BARCODE_DUPLICATE_MESSAGE,
      }));
      return;
    }

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // Detalle local, NO se envia a BD aqui
    const registeredDetail = {
      ...product,
      productKey: product?.id_detalle_producto, // para vincularlo a la linea exacta en ProductReturnModal
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
      quantity: fixedQuantity != null ? String(fixedQuantity) : "",
      expiryDate: "",
      isReturn: true,
    });
    setErrors({});
    setBarcodeValidation({ status: "idle", message: "" });
    onClose();
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  // Helpers para el input number
  const handleNumericKeyDown = (e) => {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];
    if (!/\d/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericPaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    if (!/^\d+$/.test(paste)) {
      e.preventDefault();
    }
  };

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
  React.useEffect(() => {
    if (fixedQuantity != null) {
      setFormData((prev) => ({ ...prev, quantity: String(fixedQuantity) }));
    }
  }, [fixedQuantity]);

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

  const barcode = String(formData.barcode ?? "").trim();
  const isBarcodeFilled = barcode.length > 0;
  const isBarcode13Digits = isExactly13Digits(barcode);

  const effectiveTempBarcodes = Array.isArray(existingBarcodes)
    ? existingBarcodes
        .map((code) => String(code ?? "").trim())
        .filter((code) => code && code !== String(ignoreBarcode ?? "").trim())
    : [];

  const barcodeExistsTemp =
    !!barcode && effectiveTempBarcodes.includes(barcode);
  const ignoreDetailId = Number(initialDetail?.id_detalle_producto ?? 0);

  const resetBarcodeValidation = () => {
    setBarcodeValidation({ status: "idle", message: "" });
  };

  const runBarcodeValidation = async (barcodeToValidate) => {
    if (
      !isValidDetailBarcode(barcodeToValidate) ||
      effectiveTempBarcodes.includes(barcodeToValidate)
    ) {
      resetBarcodeValidation();
      return !effectiveTempBarcodes.includes(barcodeToValidate);
    }

    const requestId = barcodeValidationRequestRef.current + 1;
    barcodeValidationRequestRef.current = requestId;
    setBarcodeValidation({
      status: "checking",
      message: DETAIL_BARCODE_CHECKING_MESSAGE,
    });

    try {
      const response = await validateDetailProductBarcode({
        barcode: barcodeToValidate,
        ignoreDetailId:
          Number.isFinite(ignoreDetailId) && ignoreDetailId > 0
            ? ignoreDetailId
            : undefined,
      });

      if (barcodeValidationRequestRef.current !== requestId) {
        return response.isUnique;
      }

      if (!response?.isUnique) {
        setBarcodeValidation({
          status: "error",
          message: DETAIL_BARCODE_DUPLICATE_MESSAGE,
        });
        return false;
      }

      setBarcodeValidation({ status: "valid", message: "" });
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo validar el código de barras";

      if (barcodeValidationRequestRef.current === requestId) {
        setBarcodeValidation({
          status: "error",
          message,
        });
      }

      return false;
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;

    if (!barcode) {
      resetBarcodeValidation();
      return;
    }

    if (!isBarcode13Digits || barcodeExistsTemp) {
      resetBarcodeValidation();
      return;
    }

    const timeoutId = setTimeout(() => {
      runBarcodeValidation(barcode);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [barcode, isOpen, isBarcode13Digits, barcodeExistsTemp]);

  let barcodeError = "";
  if (!isBarcodeFilled) {
    barcodeError = "Código de barras requerido";
  } else if (!isBarcode13Digits) {
    barcodeError = "El código debe tener exactamente 13 dígitos numéricos";
  } else if (barcodeExistsTemp) {
    barcodeError = DETAIL_BARCODE_DUPLICATE_MESSAGE;
  } else if (barcodeValidation.status === "checking") {
    barcodeError = DETAIL_BARCODE_CHECKING_MESSAGE;
  } else if (barcodeValidation.status === "error") {
    barcodeError = barcodeValidation.message;
  }

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
                      {product?.productos?.nombre || "-"}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Precio
                    </label>
                    <div className="mt-1 text-gray-700">
                      {product
                        ? formatPrice(product.productos.precio_venta)
                        : "-"}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Código de barras
                    </label>
                    <input
                      value={formData.barcode}
                      onChange={(e) => handleBarcodeChange(e.target.value)}
                      onBlur={() => runBarcodeValidation(formData.barcode)}
                      onKeyDown={handleNumericKeyDown}
                      onPaste={handleNumericPaste}
                      inputMode="numeric"
                      maxLength={13}
                      className={`w-full mt-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 text-black ${
                        barcodeError
                          ? "border-red-400 focus:ring-red-200"
                          : "border-gray-300 focus:ring-emerald-200"
                      }`}
                      placeholder="13 dígitos"
                    />
                    {barcodeError && (
                      <div className="text-red-500 text-sm mt-1">
                        {barcodeError}
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
                      disabled={fixedQuantity != null}
                      onChange={(e) =>
                        handleChange(
                          "quantity",
                          e.target.value.replace(/\D+/g, "")
                        )
                      }
                      onKeyDown={handleQuantityKeyDown}
                      onPaste={handleQuantityPaste}
                      onWheel={handleQuantityWheel}
                      className={`w-full mt-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-black ${
                        fixedQuantity != null ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
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
                            ? ymdToDate(formData.expiryDate)
                            : null
                        }
                        onChange={(e) => {
                          if (!e.value) {
                            handleChange("expiryDate", "");
                            return;
                          }
                          const localDate = new Date(e.value);
                          localDate.setHours(0, 0, 0, 0);
                          const year = localDate.getFullYear();
                          const month = String(localDate.getMonth() + 1).padStart(2, '0');
                          const day = String(localDate.getDate()).padStart(2, '0');
                          const dateVal = `${year}-${month}-${day}`;
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
