import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ClipboardList,
  Search,
  Package,
  Trash2,
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePostLowProducts } from "../../../../shared/components/hooks/lowProducts/usePostLowProducts";
import UnitTransferProductModal from "./UnitTransferProductModal";
import { useAuth } from "../../../../context/useAtuh";
import { useFetchProduct } from "../../../../shared/components/hooks/searchBars/useFetchProducts";
import Swal from "sweetalert2";

const LowProductSearch = ({
  onSelectProduct,
  excludedProducts = [],
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const anchorRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!showAlert) return undefined;

    const timer = setTimeout(() => setShowAlert(false), 3000);
    return () => clearTimeout(timer);
  }, [showAlert]);

  useEffect(() => {
    if (!disabled) return undefined;

    setShowDropdown(false);
    return undefined;
  }, [disabled]);

  const { data: products, loading, error } = useFetchProduct(debouncedTerm);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    const excludedSet = new Set(excludedProducts);
    return products.filter(
      (product) => !excludedSet.has(product.id_detalle_producto),
    );
  }, [excludedProducts, products]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price || 0);

  const showTemporaryAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const updateDropdownPosition = () => {
    const element = anchorRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    const width = rect.width;
    const approxHeight = Math.min(
      320,
      56 + (filteredProducts?.length || 0) * 64,
    );
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    if (top + approxHeight > viewportHeight - 8) {
      top = Math.max(8, rect.top - 8 - approxHeight);
    }

    if (left + width > viewportWidth - 8) {
      left = Math.max(8, viewportWidth - width - 8);
    }

    setDropdownPos({ top, left, width });
  };

  const handleSelectProduct = (product) => {
    const availableStock = Number(product.stock_producto ?? 0);

    if (availableStock <= 0) {
      showTemporaryAlert(
        `El producto "${product.productos?.nombre || "sin nombre"}" no tiene stock disponible.`,
      );
      return;
    }

    onSelectProduct?.(product);
    setSearchTerm("");
    setDebouncedTerm("");
    setShowDropdown(false);
  };

  const openDropdown = () => {
    if (disabled) return;
    setShowDropdown(true);
    requestAnimationFrame(updateDropdownPosition);
  };

  useEffect(() => {
    if (!showDropdown) return undefined;

    const handleWindowChange = () => updateDropdownPosition();
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);
    handleWindowChange();

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [showDropdown, filteredProducts.length]);

  useEffect(() => {
    if (!showDropdown) return undefined;

    const handleMouseDown = (event) => {
      const anchorElement = anchorRef.current;
      const dropdownElement = dropdownRef.current;
      if (anchorElement?.contains(event.target)) return;
      if (dropdownElement?.contains(event.target)) return;
      setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showDropdown]);

  const dropdownUI = (
    <AnimatePresence>
      {showDropdown && searchTerm && (
        <motion.div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 60,
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Buscando productos...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const isOutOfStock = Number(product.stock_producto ?? 0) <= 0;

              return (
                <motion.button
                  key={product.id_detalle_producto}
                  type="button"
                  className={`w-full px-4 py-3 border-b border-gray-100 last:border-0 text-left transition-colors ${
                    isOutOfStock
                      ? "bg-gray-50 cursor-not-allowed opacity-60"
                      : "hover:bg-green-50"
                  }`}
                  onClick={() => handleSelectProduct(product)}
                  whileHover={!isOutOfStock ? { scale: 1.01 } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {product.productos?.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cód. {product.codigo_barras_producto_compra} •{" "}
                        {formatPrice(product.productos?.precio_venta)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock disponible: {product.stock_producto ?? 0}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron coincidencias.
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative mb-2" ref={anchorRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-400 transition-all bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
          placeholder="Buscar y seleccionar producto..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setShowDropdown(true);
          }}
          onFocus={openDropdown}
          autoComplete="off"
          disabled={disabled}
        />
      </div>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            className="mt-4 p-4 flex items-center gap-3 rounded-lg shadow-sm bg-red-100 text-red-700 border border-red-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{alertMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {createPortal(dropdownUI, document.body)}
    </div>
  );
};

const RegisterLow = ({ isOpen, onClose, onConfirm }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [openConfigProductId, setOpenConfigProductId] = useState(null);
  const [isUnitTransferModalOpen, setIsUnitTransferModalOpen] = useState(false);
  const [reasonLockAlertByProduct, setReasonLockAlertByProduct] = useState({});
  const [isSubmittingLow, setIsSubmittingLow] = useState(false);
  const [activeUnitTransferProductId, setActiveUnitTransferProductId] =
    useState(null);
  const { payload: payloadId } = useAuth();
  const toggleConfigDropdown = (productId) => {
    setOpenConfigProductId((prev) => (prev === productId ? null : productId));
  };

  const { postLowProducts, loading } = usePostLowProducts();
  const id_responsable = payloadId.uid;
  const isBusy = loading || isSubmittingLow;
  const parseDateSafe = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isExpiredProduct = (expiryDateValue) => {
    const expiryDate = parseDateSafe(expiryDateValue);
    if (!expiryDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalizedExpiry = new Date(expiryDate);
    normalizedExpiry.setHours(0, 0, 0, 0);

    return normalizedExpiry < today;
  };


  const reasonOptions = [
    { value: "vencido", label: "Superó fecha de vencimiento" },
    { value: "dañado", label: "Producto dañado" },
    { value: "venta unitaria", label: "Venta unitaria" },
    { value: "requerido personal", label: "Requerido personal" },
  ];

  const showReasonLockedAlert = (productId) => {
    setReasonLockAlertByProduct((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setReasonLockAlertByProduct((prev) => ({ ...prev, [productId]: false }));
    }, 2500);
  };

  const handleRemoveTransfer = (productId) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              reason: "", // ✅ deselecciona "venta unitaria"
              id_producto_traslado: null,
              id_producto_destino: null,
              cantidad_traslado: null,
              nombre_producto_traslado: "",
              pending_transfer_registration: null,
            }
          : p,
      ),
    );
  };

  const handleAddProduct = (product) => {
    const adaptedProduct = {
      id: product.id_detalle_producto,
      name: product.productos?.nombre || "Sin nombre",
      quantity: product.stock_producto || 0,
      salePrice: product.productos?.precio_venta || 0,
      requestedQuantity: 1,
      unitCost: product.productos?.costo_unitario || 0,
      cantidad_unitaria: product?.productos?.cantidad_unitaria ?? null,
      reason: "",
      expiryDate: product.fecha_vencimiento || null,
      isExpired: isExpiredProduct(product.fecha_vencimiento),
    };
    setSelectedProducts((prev) => {
      if (prev.some((item) => item.id === adaptedProduct.id)) {
        return prev;
      }
      return [...prev, adaptedProduct];
    });
    setOpenConfigProductId(adaptedProduct.id);
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    if (openConfigProductId === id) setOpenConfigProductId(null);
  };

  const handleUpdateProductQuantity = (id, delta) =>
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newQuantity = Math.max(
          1,
          Math.min(p.quantity, (p.requestedQuantity || 1) + delta),
        );

        let newTransferQuantity = p.cantidad_traslado;
        // Si es venta unitaria y tiene destino, actualizamos la cantidad a trasladar
        if (
          p.reason === "venta unitaria" &&
          (p.id_producto_traslado != null || p.pending_transfer_registration) &&
          p.cantidad_unitaria
        ) {
          newTransferQuantity = p.cantidad_unitaria * newQuantity;
        }

        return {
          ...p,
          requestedQuantity: newQuantity,
          cantidad_traslado: newTransferQuantity,
        };
      }),
    );

  const handleProductReasonSelect = (productId, reason) => {
    const current = selectedProducts.find((p) => p.id === productId);
    const hasUnitTransferConfigured =
      current?.reason === "venta unitaria" &&
      (current?.id_producto_traslado != null ||
        current?.pending_transfer_registration);

    // Si ya configuró traslado (destino confirmado), no permitimos cambiar a otro motivo
    if (hasUnitTransferConfigured && reason !== "venta unitaria") {
      showReasonLockedAlert(productId);
      return;
    }
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, reason } : p)),
    );

    // Si el motivo es venta unitaria, abre modal para elegir producto destino
    if (reason === "venta unitaria") {
      setActiveUnitTransferProductId(productId);
      setIsUnitTransferModalOpen(true);
    } else {
      // si cambia a otro motivo, limpiamos campos de traslado por seguridad
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, id_producto_traslado: null, id_producto_destino: null, cantidad_traslado: null, pending_transfer_registration: null }
            : p,
        ),
      );
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  // 🔹 Paso 1: Mostrar alerta de confirmación
  const handleConfirmLow = async () => {
    if (selectedProducts.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Selecciona al menos un producto.",
        confirmButtonColor: "#059669",
      });
      return;
    }

    if (selectedProducts.some((p) => !p.reason)) {
      await Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Todos los productos deben tener un motivo de baja.",
        confirmButtonColor: "#059669",
      });
      return;
    }
    const invalidUnitSale = selectedProducts.some(
      (p) =>
        p.reason === "venta unitaria" &&
        ((p.id_producto_traslado == null && !p.pending_transfer_registration) ||
          p.cantidad_traslado == null),
    );

    if (invalidUnitSale) {
      await Swal.fire({
        icon: "warning",
        title: "Validación de traslado",
        text: "Para 'venta unitaria' debes seleccionar el producto destino y el producto caja debe tener cantidad_unitaria.",
        confirmButtonColor: "#059669",
      });
      return;
    }
    setShowConfirmAlert(true);
  };

  // 🔹 Paso 2: Cancelar alerta
  const handleCancelAlert = () => setShowConfirmAlert(false);

  // 🔹 Paso 3: Confirmar alerta → Enviar POST y mostrar éxito
  const handleAcceptAlert = async () => {
    setShowConfirmAlert(false);
    setIsSubmittingLow(true);

    try {
      const response = await postLowProducts(id_responsable, selectedProducts);
      if (response) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSelectedProducts([]);
          onConfirm();
        }, 2500);
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "No fue posible completar la baja.",
        confirmButtonColor: "#059669",
      });
    } finally {
      setIsSubmittingLow(false);
    }
  };
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
          {/* Contenedor del modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 "
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh] ${isBusy ? "pointer-events-none opacity-50" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  Registrar Baja de Productos
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido */}
              <div className="flex flex-col p-6 space-y-4 flex-grow max-h-[70vh]">
                <LowProductSearch
                  onSelectProduct={handleAddProduct}
                  excludedProducts={selectedProducts.map((p) => p.id)}
                  disabled={isBusy}
                />

                {selectedProducts.length > 0 && (
                  <div
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 
                 flex-1 overflow-y-auto max-h-[45vh] space-y-2 pr-2 custom-scroll"
                  >
                    {selectedProducts.map((p) => (
                      <motion.div
                        key={p.id}
                        className="flex flex-col gap-3 bg-gray-50 p-3 rounded-lg"
                        layout
                      >
                        {/* Producto */}
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-green-700" />
                          </div>

                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatPrice(p.salePrice)} c/u
                            </p>
                            {p.isExpired && (
                              <p className="text-xs text-red-600 font-medium mt-0.5">
                                Producto vencido: se habilita motivo "Superó fecha de vencimiento"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() =>
                                handleUpdateProductQuantity(p.id, -1)
                              }
                              className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Minus size={14} />
                            </motion.button>

                            <span className="font-bold text-sm text-gray-800">
                              {p.requestedQuantity}
                            </span>

                            <motion.button
                              onClick={() =>
                                handleUpdateProductQuantity(p.id, 1)
                              }
                              className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>

                          {/* Botón dropdown estilo ProductReturnModal */}
                          <button
                            type="button"
                            onClick={() => toggleConfigDropdown(p.id)}
                            className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full hover:bg-emerald-100 transition"
                          >
                            Motivos
                            {openConfigProductId === p.id ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>

                          <button
                            onClick={() => handleRemoveProduct(p.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Dropdown por producto: Motivos */}
                        <AnimatePresence>
                          {openConfigProductId === p.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 border-t pt-3 space-y-3 pl-12"
                            >
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                Motivo de baja
                              </p>

                              <div className="space-y-2">
                                {reasonOptions.map((r) => {
                                  if (
                                    r.value === "venta unitaria" &&
                                    !p.cantidad_unitaria
                                  )
                                    return null;
                                  const isExpired = Boolean(p.isExpired);
                                  if (r.value === "vencido" && !isExpired) return null;

                                  const isSelected = p.reason === r.value;
                                  const hasTransferConfigured =
                                    p.reason === "venta unitaria" &&
                                    (p.id_producto_traslado != null ||
                                      p.pending_transfer_registration);
                                  const isLockedOption =
                                    hasTransferConfigured &&
                                    r.value !== "venta unitaria";
                                  return (
                                    <label
                                      key={r.value}
                                      className={` w-full flex items-center justify-start text-left gap-3 rounded-lg border p-2 transition-all select-none ${
                                        isLockedOption
                                          ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                                          : isSelected
                                            ? "border-emerald-500 bg-emerald-50 shadow-sm cursor-pointer"
                                            : "border-gray-200 hover:bg-gray-50 cursor-pointer"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`reason-${p.id}`}
                                        checked={isSelected}
                                        onClick={() => {
                                          if (isLockedOption)
                                            showReasonLockedAlert(p.id);
                                        }}
                                        onChange={() => {
                                          if (isLockedOption) {
                                            showReasonLockedAlert(p.id);
                                            return;
                                          }
                                          handleProductReasonSelect(
                                            p.id,
                                            r.value,
                                          );
                                        }}
                                        className="hidden"
                                      />
                                      <div
                                        className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all ${
                                          isSelected
                                            ? "bg-emerald-600 border-emerald-600"
                                            : "bg-white border-gray-300"
                                        }`}
                                      >
                                        {isSelected && (
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                      <span
                                        className={`text-sm font-medium ${
                                          isSelected
                                            ? "text-emerald-700"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {r.label}
                                      </span>
                                    </label>
                                  );
                                })}
                                <AnimatePresence>
                                  {reasonLockAlertByProduct[p.id] && (
                                    <motion.div
                                      className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2"
                                      initial={{ opacity: 0, y: -6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -6 }}
                                      transition={{ duration: 0.15 }}
                                    >
                                      <AlertTriangle className="w-4 h-4 mt-0.5" />
                                      <span>
                                        Para seleccionar otro motivo, elimina
                                        primero el destino.
                                      </span>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Resumen de traslado (solo venta unitaria) */}
                                {p.reason === "venta unitaria" &&
                                  (p.id_producto_traslado != null ||
                                    p.pending_transfer_registration) && (
                                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-emerald-800">
                                          Traslado configurado
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                          Destino:{" "}
                                          <span className="text-emerald-800">
                                            {p.nombre_producto_traslado ||
                                              (p.id_producto_traslado
                                                ? `ID ${p.id_producto_traslado}`
                                                : "Destino pendiente de registro")}
                                          </span>
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          Cantidad trasladada:{" "}
                                          <span className="font-semibold">
                                            {p.cantidad_traslado}
                                          </span>
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveTransfer(p.id)
                                        }
                                        className="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition"
                                        title="Eliminar traslado y deseleccionar venta unitaria"
                                      >
                                        <Trash2 size={14} />
                                        Eliminar
                                      </button>
                                    </div>
                                  )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <motion.div className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-black hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleConfirmLow}
                  disabled={isBusy}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                >
                  {isBusy ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirmar Baja
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* 🔸 Alerta de confirmación */}
              <AnimatePresence>
                {showConfirmAlert && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center text-center p-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <AlertTriangle className="text-yellow-500 w-14 h-14 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      ¿Estás seguro de darle de baja a los productos?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Será un cambio{" "}
                      <span className="font-semibold text-red-500">
                        irreversible
                      </span>
                      .
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelAlert}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <motion.button
                        onClick={handleAcceptAlert}
                        disabled={isBusy}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                      >
                        {isBusy ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Confirmar
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 🔹 Animación de éxito */}
              <AnimatePresence>
                {showSuccessMessage && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      ¡Baja confirmada!
                    </h3>
                    <p className="text-gray-600">
                      Los productos fueron dados de baja exitosamente.
                    </p>
                    {}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <UnitTransferProductModal
              isOpen={isUnitTransferModalOpen}
              onClose={() => {
                // Si se cierra el modal, deselecciona "venta unitaria" del producto activo
                if (activeUnitTransferProductId != null) {
                  setSelectedProducts((prev) =>
                    prev.map((p) =>
                      p.id === activeUnitTransferProductId
                        ? {
                            ...p,
                            reason: "", // <- deselecciona venta unitaria
                            id_producto_traslado: null,
                            id_producto_destino: null,
                            cantidad_traslado: null,
                            pending_transfer_registration: null,
                          }
                        : p,
                    ),
                  );
                }

                setIsUnitTransferModalOpen(false);
                setActiveUnitTransferProductId(null);
              }}
              currentBoxProductName={
                selectedProducts.find(
                  (p) => p.id === activeUnitTransferProductId,
                )?.name
              }
              onConfirmDestination={(detalleDestino) => {
                setSelectedProducts((prev) =>
                  prev.map((p) => {
                    if (p.id !== activeUnitTransferProductId) return p;

                    return {
                      ...p,
                      id_producto_traslado:
                        detalleDestino?.id_detalle_producto ?? null,
                      id_producto_destino:
                        detalleDestino?.id_producto ??
                        detalleDestino?.productos?.id_producto ??
                        detalleDestino?.pendingProduct?.id_producto ??
                        null,
                      cantidad_traslado: p.cantidad_unitaria
                        ? p.cantidad_unitaria * p.requestedQuantity
                        : null,
                      nombre_producto_traslado:
                        detalleDestino?.productos?.nombre ??
                        detalleDestino?.pendingProduct?.nombre ??
                        "",
                      pending_transfer_registration:
                        detalleDestino?.isPendingRegistration
                          ? {
                              pendingProduct: detalleDestino.pendingProduct,
                              pendingDetail: detalleDestino.pendingDetail,
                            }
                          : null,
                    };
                  }),
                );

                setIsUnitTransferModalOpen(false);
                setActiveUnitTransferProductId(null);
              }}
              transferQuantity={(() => {
                const p = selectedProducts.find(
                  (p) => p.id === activeUnitTransferProductId,
                );
                return p && p.cantidad_unitaria
                  ? p.cantidad_unitaria * (p.requestedQuantity || 1)
                  : null;
              })()}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RegisterLow;