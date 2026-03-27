import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  Minus,
  Plus,
  ArrowLeftRight,
  Package,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../../context/useAtuh";
import { usePostReturnClients } from "../../../../../shared/components/hooks/returnClients/usePostReturnClients";
import { useFetchProduct } from "../../../../../shared/components/hooks/searchBars/useFetchProducts";

const ProductSearch = ({ onAddProduct, disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
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
    return products;
  }, [products]);

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
    setSelectedProduct(product);
    setSearchTerm(product.productos?.nombre || "");
    setQuantity(1);
    setShowDropdown(false);
  };

  const handleAddSelectedProduct = () => {
    if (!selectedProduct) {
      showTemporaryAlert("Selecciona un producto antes de añadirlo.");
      return;
    }

    const availableStock = Number(selectedProduct.stock_producto ?? 0);
    const requestedQuantity = Math.max(1, Number(quantity) || 1);

    if (availableStock <= 0) {
      showTemporaryAlert("El producto seleccionado no tiene stock disponible.");
      return;
    }

    if (requestedQuantity > availableStock) {
      showTemporaryAlert(
        `No hay suficiente stock. Solo quedan ${availableStock} unidades.`,
      );
      return;
    }

    onAddProduct?.({
      ...selectedProduct,
      requestedQuantity,
    });
    setSelectedProduct(null);
    setSearchTerm("");
    setDebouncedTerm("");
    setQuantity(1);
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
                  onClick={() => {
                    if (isOutOfStock) {
                      showTemporaryAlert(
                        `El producto "${
                          product.productos?.nombre || "sin nombre"
                        }" no tiene stock disponible.`,
                      );
                      return;
                    }
                    handleSelectProduct(product);
                  }}
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
    <div className="relative mb-6" ref={anchorRef}>
      <div className="flex items-end gap-4">
        <div className="relative flex-1">
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
              setSelectedProduct(null);
              setShowDropdown(true);
            }}
            onFocus={openDropdown}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddSelectedProduct();
              }
            }}
            autoComplete="off"
            disabled={disabled}
          />
        </div>

        <div className="flex-shrink-0">
          <label className="text-sm font-semibold text-gray-700">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            max={selectedProduct?.stock_producto || undefined}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-24 mt-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-black text-center focus:ring-2 focus:ring-green-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
            disabled={disabled}
          />
        </div>

        <motion.button
          type="button"
          onClick={handleAddSelectedProduct}
          disabled={disabled}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
          Añadir producto
        </motion.button>
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

const CompleteReturn = ({
  isOpen,
  setIsOpen,
  selectedSale,
  productsToReturn,
  returnTotal,
  onReturnRegistered,
}) => {
  const { payload: payloadId } = useAuth();
  const { postReturnClients, loading } = usePostReturnClients();
  const [newProducts, setNewProducts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const isBusy = isProcessing || loading;

  const newProductsTotal = useMemo(
    () =>
      newProducts.reduce((t, p) => t + p.requestedQuantity * p.salePrice, 0),
    [newProducts]
  );

  const montoDevolver = Math.max(returnTotal - newProductsTotal, 0);
  const montoSolicitar = Math.max(newProductsTotal - returnTotal, 0);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  // Al añadir, nos aseguramos de no permitir requestedQuantity > stock
  const handleAddProduct = (product) => {
    const normalized = {
      id: product.id ?? product.id_detalle_producto,
      name: product.name ?? product.productos?.nombre ?? "",
      quantity: Number(product.quantity ?? product.stock_producto ?? 0),
      salePrice: Number(product.salePrice ?? product.productos?.precio_venta ?? 0),
      requestedQuantity: Number(product.requestedQuantity ?? 0),
    };

    // normalize requestedQuantity
    const requested = Math.max(0, normalized.requestedQuantity || 0);
    const allowed = Math.min(requested, normalized.quantity || requested);

    if (requested > allowed) {
      alert(`No hay suficiente stock. Stock disponible: ${normalized.quantity}`);
    }

    const toAdd = { ...normalized, requestedQuantity: allowed };

    setNewProducts((prev) => {
      const existingProductIndex = prev.findIndex((p) => p.id === toAdd.id);
      if (existingProductIndex > -1) {
        const updatedProducts = [...prev];
        // Reemplazamos la cantidad del producto existente por la nueva (limitada)
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          requestedQuantity: toAdd.requestedQuantity,
        };
        return updatedProducts;
      }
      return [...prev, toAdd];
    });
  };

  const handleRemoveProduct = (productId) => {
    setNewProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateNewProductQuantity = (productId, amount) => {
    setNewProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.requestedQuantity || 0;
          const attempted = current + amount;

          // Si intentan aumentar por encima del stock
          if (amount > 0 && attempted > p.quantity) {
            alert(`No hay suficiente stock. Solo quedan ${p.quantity} unidades.`);
            return { ...p, requestedQuantity: p.quantity };
          }

          const newQty = Math.max(0, Math.min(p.quantity || attempted, attempted));
          return { ...p, requestedQuantity: newQty };
        }
        return p;
      })
    );
  };

  const getReturnReasonLabel = (reason) => {
    switch (reason) {
      case "producto_dañado":
        return "Producto dañado";
      case "producto_vencido":
        return "Producto vencido";
      case "producto_incorrecto":
        return "Producto incorrecto";
      case "producto_no_requerido":
        return "Producto no requerido";
      default:
        return "No especificado";
    }
  };

  const getReturnCondition = (reason) => {
    switch (reason) {
      case "producto_dañado":
        return "dañado";
      case "producto_vencido":
        return "vencido";
      case "producto_incorrecto":
      case "producto_no_requerido":
        return "bueno";
      default:
        return "bueno";
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedSale?.id_venta) {
      alert("Debe seleccionar una venta antes de continuar.");
      return;
    }

    const id_responsable = payloadId?.uid;
    if (!id_responsable) {
      alert("No se encontró el responsable para registrar la devolución.");
      return;
    }

    const productosVenta = productsToReturn
      .filter((product) => product.returnQuantity > 0)
      .map((product) => ({
        id_detalle_venta: product.id,
        cantidad: product.returnQuantity,
        motivo: getReturnReasonLabel(product.reason),
        valor_unitario: product.salePrice * product.returnQuantity,
        condicion: getReturnCondition(product.reason),
      }));

    const productosEntrega = newProducts
      .filter((product) => product.requestedQuantity > 0)
      .map((product) => ({
        id_detalle_producto: product.id,
        cantidad: product.requestedQuantity,
        valor_unitario: product.salePrice * product.requestedQuantity,
      }));

    const payload = {
      id_responsable,
      id_venta: selectedSale.id_venta,
      total_devolucion_cliente: returnTotal,
      total_devolucion_producto: newProductsTotal,
      productosVenta,
      productosEntrega,
    };

    setIsProcessing(true);
    try {
      const response = await postReturnClients(payload);
      if (response) {
        await onReturnRegistered?.();
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setIsOpen(false);
        }, 3000);
      } else {
        alert("No fue posible registrar la devolución.");
      }
    } catch (error) {
      console.error("❌ Error al registrar devolución:", error);
      alert("No fue posible registrar la devolución.");
    } finally {
      setIsProcessing(false);
    }
  };
  const validationReason = (rason) =>{
    switch (rason) {
      case "producto_dañado":
        return "Producto Dañado";
      case "producto_vencido":
        return "Producto Vencido";
      case "producto_incorrecto":
        return "Producto Incorrecto";
      case "producto_no_requerido":
        return "Producto no requerido";
      default:
        return "No especificado";
    }
  } 
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isBusy) setIsOpen(false);
            }}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            >
              {/* Header */}
              <motion.div
                className="p-6 border-b border-gray-200 flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-800">Devolución de Venta</h2>
                <motion.button
                  onClick={() => {
                    if (!isBusy) setIsOpen(false);
                  }}
                  disabled={isBusy}
                  className="text-gray-400 hover:text-gray-600 transition-all p-2 rounded-full"
                  aria-label="Cerrar modal"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "#f3f4f6",
                    rotate: 90,
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </motion.div>

              {/* Contenido del formulario */}
              <div
                className={`flex-1 overflow-y-auto p-6 ${
                  isBusy ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                  {/* Detalles de la venta */}
                  <motion.div className="flex justify-between items-center mb-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
                    <h3 className="text-lg font-semibold text-gray-800">Productos de la venta {selectedSale?.id}</h3>
                  </motion.div>

                  {/* Sección de productos de la venta original */}
                  <motion.div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
                    <motion.div className="max-h-52 overflow-y-auto space-y-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                      {productsToReturn?.map((product) => (
                        <motion.div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.0, backgroundColor: "#f0f9ff", transition: { duration: 0.2 } }}>
                          <motion.div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center" whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}>
                            <Package className="w-4 h-4 text-green-700" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-500">Cant. a devolver: {product.returnQuantity}</p>
                            <p className="text-xs text-gray-500">Razon: {validationReason(product.reason)}</p>
                          </div>
                          <motion.p className="font-semibold text-sm text-gray-800" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}>
                            {formatPrice(product.returnQuantity * product.salePrice)}
                          </motion.p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Sección de nuevos productos */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Añadir nuevos productos</h3>
                      <motion.div animate={{ rotate: [0, 45, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                        <ArrowLeftRight size={20} className="text-gray-500" />
                      </motion.div>
                    </div>
                    
                    <ProductSearch
                      onAddProduct={handleAddProduct}
                      disabled={isBusy}
                    />
                    <AnimatePresence>
                      {newProducts.length > 0 && (
                        <motion.div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mt-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                          <motion.div className="max-h-52 overflow-y-auto space-y-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                            <AnimatePresence mode="popLayout">
                              {newProducts.map((product) => (
                                <motion.div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg" variants={{ hidden: { opacity: 0, x: -20, scale: 0.8 }, visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } } }} exit={{ opacity: 0, x: 20, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } }} layout whileHover={{ scale: 1.00, backgroundColor: "#f0f9ff", transition: { duration: 0.2 } }}>
                                  <motion.div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center" whileHover={{ scale: 1.1, backgroundColor: "#dcfce7", transition: { duration: 0.2 } }}>
                                    <Package className="w-4 h-4 text-green-700" />
                                  </motion.div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-800">{product.name}</p>
                                    <p className="text-xs text-gray-500">{formatPrice(product.salePrice)} c/u</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      onClick={() => handleUpdateNewProductQuantity(product.id, -1)}
                                      disabled={isBusy || product.requestedQuantity <= 1}
                                      className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                      whileHover={{ scale: 1.1, backgroundColor: "#a7f3d0" }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Minus size={14} />
                                    </motion.button>
                                    <motion.span className="font-bold text-sm text-gray-800 min-w-[20px] text-center" key={product.requestedQuantity} initial={{ scale: 1.2, color: "#16a34a" }} animate={{ scale: 1, color: "#1f2937" }} transition={{ duration: 0.2 }}>
                                      {product.requestedQuantity}
                                    </motion.span>
                                    <motion.button
                                      onClick={() => handleUpdateNewProductQuantity(product.id, 1)}
                                      disabled={isBusy || product.requestedQuantity >= product.quantity}
                                      className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                      whileHover={{ scale: 1.1, backgroundColor: "#a7f3d0" }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Plus size={14} />
                                    </motion.button>
                                  </div>
                                  <motion.button
                                    onClick={() => handleRemoveProduct(product.id)}
                                    disabled={isBusy}
                                    className="text-gray-400 hover:text-red-500 transition-all p-1 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                                    whileHover={!isBusy ? { scale: 1.2, backgroundColor: "#fee2e2", color: "#dc2626" } : {}}
                                    whileTap={!isBusy ? { scale: 0.9 } : {}}
                                  >
                                    <Trash2 size={16} />
                                  </motion.button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Totales con animaciones */}
                  <motion.div className="space-y-2 mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>
                    <motion.div className="flex justify-between font-semibold text-gray-700" whileHover={{ scale: 1.0 }} transition={{ duration: 0.2 }}>
                      <span>Total de productos a devolver:</span>
                      <motion.span key={returnTotal} initial={{ scale: 1.1, color: "#16a34a" }} animate={{ scale: 1, color: "#374151" }} transition={{ duration: 0.3 }}>
                        {formatPrice(returnTotal)}
                      </motion.span>
                    </motion.div>
                    <motion.div className="flex justify-between font-semibold text-gray-700" whileHover={{ scale: 1.0 }} transition={{ duration: 0.2 }}>
                      <span>Total de nuevos productos:</span>
                      <motion.span key={newProductsTotal} initial={{ scale: 1.1, color: "#16a34a" }} animate={{ scale: 1, color: "#374151" }} transition={{ duration: 0.3 }}>
                        {formatPrice(newProductsTotal)}
                      </motion.span>
                    </motion.div>
                    <motion.div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.3 }} whileHover={{ scale: 1.0 }}>
                      {returnTotal >= newProductsTotal ? (
                        <>
                          <span className="text-green-600">Monto a devolver:</span>
                          <motion.span className="text-green-600" key={`devolver-${montoDevolver}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 0.4, type: "spring" }}>
                            {formatPrice(montoDevolver)}
                          </motion.span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-600">Monto a solicitar:</span>
                          <motion.span className="text-red-600" key={`solicitar-${montoSolicitar}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 0.4, type: "spring" }}>
                            {formatPrice(montoSolicitar)}
                          </motion.span>
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Footer con botones */}
              <motion.div className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200 rounded-b-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.4 }}>
                <motion.button onClick={() => setIsOpen(false)} disabled={isBusy} className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" whileHover={!isBusy ? { scale: 1.00, backgroundColor: "#d1d5db" } : {}} whileTap={!isBusy ? { scale: 0.98 } : {}}>
                  Cancelar
                </motion.button>
                <motion.button onClick={handleConfirmReturn} disabled={isBusy || (productsToReturn?.length === 0 && newProducts.length === 0)} className="flex-1 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" whileHover={!isBusy ? { scale: 1.00, backgroundColor: "#15803d", boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)" } : {}} whileTap={!isBusy ? { scale: 0.98 } : {}}>
                  {isBusy ? (
                    <>
                      <motion.div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Procesando...</motion.span>
                    </>
                  ) : (
                    <>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <CheckCircle size={20} />
                      </motion.div>
                      Confirmar Devolución
                    </>
                  )}
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {isBusy && !showSuccessMessage && (
                  <motion.div
                    className="absolute inset-0 z-10 rounded-2xl bg-white/35 backdrop-blur-[1px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>

              {/* Mensaje de éxito */}
              <AnimatePresence>
                {showSuccessMessage && (
                  <motion.div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                    <motion.div className="text-center" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>
                      <motion.div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <motion.h3 className="text-xl font-bold text-gray-800 mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        ¡Devolución Procesada!
                      </motion.h3>
                      <motion.p className="text-gray-600" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        La devolución se ha procesado exitosamente.
                      </motion.p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompleteReturn;
