import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, CheckCircle } from "lucide-react";
// PrimeReact Calendar
import { Calendar } from "primereact/calendar";
import { useFetchAllDetails } from "../../../../shared/components/hooks/productDetails/useFetchAllDetails";
import { usePostDetailProduct } from "../../../../shared/components/hooks/productDetails/usePostDetailProduct";

const ProductRegistrationModal = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  existingBarcodes,
  onCancelRegistration,
  initialDetail,
  ignoreBarcode,
  isReturnProduct,
  transferQuantity
}) => {
  const {
    details,
    loading: loadingDetails,
    error,
    refetch,
  } = useFetchAllDetails();
  const [submitting, setSubmitting] = useState(false);
  const { postDetailProduct } = usePostDetailProduct();
  const [formData, setFormData] = useState({
    barcode: "",
    quantity: isReturnProduct ? "" : 0,
    expiryDate: "",
    isReturn: true,
  });

  // Fecha mínima: 4 días después de hoy (00:00:00)
  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4);
    return d;
  }, []);

  // Resetear campos cuando se abre un producto nuevo
  useEffect(() => {
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
          quantity: isReturnProduct ? "" : "0",
          expiryDate: "",
          isReturn: true,
        });
      }

      // refrescamos detalles para validar códigos únicos
      refetch && refetch();
    }
  }, [isOpen, product, initialDetail, refetch]);

  // --- handlers de cambio ---

  // Código de barras: solo dígitos y máximo 13
  const handleBarcodeChange = (value) => {
    let digitsOnly = value.replace(/\D+/g, "");
    if (digitsOnly.length > 13) digitsOnly = digitsOnly.slice(0, 13);
    setFormData((prev) => ({ ...prev, barcode: digitsOnly }));
  };

  const handleQuantityChange = (value) => {
    const digitsOnly = value.replace(/\D+/g, "");
    setFormData((prev) => ({ ...prev, quantity: digitsOnly }));
  };

  const handleExpiryChange = (e) => {
    const dateVal = e.value ? e.value.toISOString().slice(0, 10) : "";
    setFormData((prev) => ({ ...prev, expiryDate: dateVal }));
  };

  // --- helpers para inputs numéricos ---

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

  const handleNumberWheel = (e) => {
    e.target.blur();
    setTimeout(() => e.target.focus(), 0);
  };

  // --- VALIDACIONES EN TIEMPO REAL ---

  // 1) Código de barras
  const barcode = formData.barcode;
  const isBarcodeFilled = barcode.length > 0;
  const isBarcode13Digits = /^\d{13}$/.test(barcode);

  // Filtramos el código actual de los detalles de BD
  const filteredDetails = Array.isArray(details)
    ? details.filter((d) => d.codigo_barras_producto_compra !== ignoreBarcode)
    : [];

  // Ya existentes en BD (excepto el actual si estamos editando)
  const barcodeExistsDB =
    !!barcode &&
    filteredDetails.some((d) => d.codigo_barras_producto_compra === barcode);

  // Ya existentes temporalmente (excepto el actual)
  const effectiveTempBarcodes = Array.isArray(existingBarcodes)
    ? existingBarcodes.filter((code) => code !== ignoreBarcode)
    : [];

  const barcodeExistsTemp =
    !!barcode && effectiveTempBarcodes.includes(barcode);

  let barcodeError = "";
  if (!isBarcodeFilled) {
    barcodeError = "Código de barras requerido";
  } else if (!isBarcode13Digits) {
    barcodeError = "El código de barras debe de ser de 13 dígitos";
  } else if (barcodeExistsDB || barcodeExistsTemp) {
    barcodeError = "El código de barras ya existe";
  }

  const isBarcodeValid =
    isBarcodeFilled &&
    isBarcode13Digits &&
    !barcodeExistsDB &&
    !barcodeExistsTemp;

  // 2) Cantidad
  const quantityStr = formData.quantity;
  const quantityNum = Number(quantityStr);
  const isQuantityNumeric = /^\d+$/.test(quantityStr);
  const isQuantityValid =
    isReturnProduct == true
      ? isQuantityNumeric && Number.isFinite(quantityNum) && quantityNum > 0
      : true;
  console.log(isQuantityValid);
  let quantityError = "";
  if (isReturnProduct) {
    if (quantityStr === "") quantityError = "Cantidad requerida";
    else if (!isQuantityValid) quantityError = "Cantidad inválida";
  } else {
    // baja: cantidad fija 0, no validamos
    quantityError = "";
  }
  // 3) Fecha de vencimiento
  const expiryStr = formData.expiryDate;
  let expiryError = "";
  let isExpiryValid = false;

  if (!expiryStr) {
    expiryError = "Fecha de vencimiento requerida";
  } else {
    const selected = new Date(expiryStr);
    selected.setHours(0, 0, 0, 0);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);

    if (selected < min) {
      expiryError =
        "La fecha mínima permitida es " + min.toLocaleDateString("es-CO");
    } else {
      isExpiryValid = true;
    }
  }

  // Formulario válido solo si TODO está ok
  console.log(isBarcodeValid, isQuantityValid, isExpiryValid, loadingDetails);
  const isFormValid =
    isBarcodeValid && isQuantityValid && isExpiryValid && !loadingDetails;

  // --- submit ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);

    try {
      const registeredDetail = {
        ...product,
        productKey: product?.id_producto,
        registeredBarcode: formData.barcode,
        registeredQuantity: transferQuantity,
        registeredExpiry: formData.expiryDate || null,
        isReturn: true,
      };

      if (isReturnProduct) {
        // ✅ modo devolución: NO postea aquí, solo devuelve al padre
        await onConfirm?.(registeredDetail);

        setFormData({
          barcode: "",
          quantity: "",
          expiryDate: "",
          isReturn: true,
        });

        onClose();
        return;
      }

      // ✅ modo baja: aquí SÍ postea detalle
      console.log(registeredDetail);
      console.log(product);
      const payload = {
        id_producto: product?.id_producto,
        registeredBarcode: registeredDetail?.registeredBarcode,
        registeredExpiry: registeredDetail?.registeredExpiry,
        registeredQuantity: transferQuantity,
      };
      console.log(payload);
      const createdDetailResp = await postDetailProduct(payload);

      // ✅ si el backend envuelve la respuesta (message + newDetail)
      const createdDetail =
        createdDetailResp?.newDetail ??
        createdDetailResp?.newProductDetail ??
        createdDetailResp?.detail ??
        createdDetailResp;

      // ✅ inyecta "productos" para que el preview del destino muestre nombre
      const createdDetailWithProduct = {
        ...createdDetail,
        productos: createdDetail?.productos ||
          product?.productos || {
            nombre: product?.productos?.nombre,
            precio_venta: product?.productos?.precio_venta ?? 0,
          },
      };
      console.log("creacion", createdDetailWithProduct);
      await onConfirm?.(createdDetailWithProduct);

      setFormData({
        barcode: "",
        quantity: transferQuantity,
        expiryDate: "",
        isReturn: true,
      });

      onClose();
    } catch (err) {
      // aquí puedes mostrar un mensaje visual si quieres
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      barcode: "",
      quantity: isReturnProduct ? "" : "0",
      expiryDate: "",
      isReturn: true,
    });
    onClose();
  };

  const handleCancel = () => {
    // limpiar formulario
    setFormData({
      barcode: "",
      quantity: isReturnProduct ? "" : "0",
      expiryDate: "",
      isReturn: true,
    });

    // avisar explícitamente que el usuario canceló el registro
    if (onCancelRegistration) {
      onCancelRegistration();
    }

    // cerrar modal visualmente
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
                className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl"
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
                    onClick={handleCancel}
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

                  {/* Código de barras */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Código de barras
                    </label>
                    <input
                      value={formData.barcode}
                      onChange={(e) => handleBarcodeChange(e.target.value)}
                      onKeyDown={handleNumericKeyDown}
                      onPaste={handleNumericPaste}
                      className={`w-full mt-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 text-black ${
                        barcodeError
                          ? "border-red-400 focus:ring-red-200"
                          : "border-gray-300 focus:ring-emerald-200"
                      }`}
                      maxLength={13}
                      inputMode="numeric"
                      placeholder="Ingrese código de barras (13 dígitos)"
                    />
                    {barcodeError && (
                      <div className="text-xs text-red-500 mt-1">
                        {barcodeError}
                      </div>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Cantidad a registrar
                    </label>
                    <input
                      type="number"
                      min={isReturnProduct ? 1 : 0}
                      inputMode="numeric"
                      value={isReturnProduct ? formData.quantity : transferQuantity}
                      onChange={
                        isReturnProduct
                          ? (e) => handleQuantityChange(e.target.value)
                          : undefined
                      }
                      onKeyDown={handleNumericKeyDown}
                      onPaste={handleNumericPaste}
                      onWheel={handleNumberWheel}
                      disabled={isReturnProduct ? false : true}
                      className={
                        isReturnProduct
                          ? `w-full mt-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 text-black ${
                              quantityError
                                ? "border-red-400 focus:ring-red-200"
                                : "border-gray-300 focus:ring-emerald-200"
                            }`
                          : `w-full mt-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 text-black bg-gray-100 cursor-not-allowed ${
                              quantityError
                                ? "border-red-400 focus:ring-red-200"
                                : "border-gray-300 focus:ring-emerald-200"
                            }`
                      }
                      placeholder="0"
                    />
                    {quantityError && (
                      <div className="text-xs text-red-500 mt-1">
                        {quantityError}
                      </div>
                    )}
                  </div>

                  {/* Fecha de vencimiento */}
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
                        onChange={handleExpiryChange}
                        minDate={minDate}
                        showIcon
                        dateFormat="yy-mm-dd"
                        placeholder="YYYY-MM-DD"
                        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 text-black ${
                          expiryError
                            ? "border-red-400 focus:ring-red-200"
                            : "border-gray-300 focus:ring-emerald-200"
                        }`}
                      />
                    </div>
                    {expiryError && (
                      <div className="text-xs text-red-500 mt-1">
                        {expiryError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || submitting}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 text-white transition ${
                      isFormValid
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle size={16} />{" "}
                    {submitting ? "Registrando..." : "Registrar"}
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
