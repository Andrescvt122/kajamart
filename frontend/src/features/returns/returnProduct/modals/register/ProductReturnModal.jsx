import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Trash2,
  Minus,
  Plus,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import ProductRegistrationModal from "./ProductRegistrationModal";
import PurchaseSearchSelect from "../../../../../shared/components/searchBars/PurchaseSearchSelect";
import { usePostReturnProducts } from "../../../../../shared/components/hooks/returnProducts/usePostReturnProducts";
import { useFetchReturnProducts } from "../../../../../shared/components/hooks/returnProducts/useFetchReturnProducts";
import { useFetchPurchases } from "../../../../../shared/components/hooks/purchases/useFetchPurcchases";
import { usePostDetailProduct } from "../../../../../shared/components/hooks/productDetails/usePostDetailProduct";
import { useAuth } from "../../../../../context/useAtuh";
const ProductReturnModal = ({ isOpen, onClose }) => {
  const isReturnProduct = true;
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseProducts, setPurchaseProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [productToRegister, setProductToRegister] = useState(null);
  const [openConfigProductId, setOpenConfigProductId] = useState(null); // dropdown por producto
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [registrationMode, setRegistrationMode] = useState("create"); // 'create' | 'edit'
  const [detailToEdit, setDetailToEdit] = useState(null);
  // ?Y???? NUEVOS estados para la factura
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  // ?Y???? Detalles de producto registrados TEMPORALMENTE
  const [pendingDetails, setPendingDetails] = useState([]);
  const { postReturnProducts, loading } = usePostReturnProducts();
  const { postDetailProduct } = usePostDetailProduct();
  const { refetch, returns } = useFetchReturnProducts();
  const { purchases } = useFetchPurchases();
  const { payload: payloadId } = useAuth();
  const returnReasons = [
    { value: "cerca de vencer", label: "Cerca de vencer" },
    { value: "vencido", label: "Vencido" },
  ];

  const actionTypes = [
    { value: "descuento", label: "Descuento" },
    { value: "registrar", label: "Registrar" },
  ];
  const normalizeInvoice = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();
  // ?Y???? Lista de n?meros de factura ya usados en compras y devoluciones
  const existingInvoiceNumbers = useMemo(() => {
    const fromPurchases =
      purchases
        ?.map((p) => {
          // Intentamos varios nombres de campo y, si no, usamos id_compra como fallback
          return (
            p.numero_factura ||
            p.numeroFactura ||
            p.invoiceNumber ||
            (p.id_compra != null ? String(p.id_compra) : null)
          );
        })
        .filter(Boolean) || [];

    const fromReturns =
      returns
        ?.map((r) => {
          return r.invoiceNumber || r.numero_factura || r.numeroFactura || null;
        })
        .filter(Boolean) || [];

    // normalizamos y quitamos duplicados
    const all = [...fromPurchases, ...fromReturns]
      .map((n) => normalizeInvoice(n))
      .filter(Boolean);

    return Array.from(new Set(all));
  }, [purchases, returns]);



  const parseDateSafe = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getPurchaseExpiryStatus = (purchase) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const detalles = Array.isArray(purchase?.detalle_compra)
      ? purchase.detalle_compra
      : [];

    const hasExpiredOrNearExpiry = detalles.some((detail) => {
      const expiryDate = parseDateSafe(
        detail?.detalle_productos?.fecha_vencimiento,
      );
      if (!expiryDate) return false;

      const normalizedExpiry = new Date(expiryDate);
      normalizedExpiry.setHours(0, 0, 0, 0);

      const diffInDays = Math.ceil(
        (normalizedExpiry - today) / (1000 * 60 * 60 * 24),
      );

      return diffInDays <= 7;
    });

    return {
      selectable: hasExpiredOrNearExpiry,
      message: hasExpiredOrNearExpiry
        ? ""
        : "Sin productos vencidos o próximos a vencer (<= 7 días)",
    };
  };

  const normalizePurchaseProducts = (purchase) => {
    const detalles = Array.isArray(purchase?.detalle_compra)
      ? purchase.detalle_compra
      : [];

    return detalles
      .map((d) => {
        const dp = d?.detalle_productos || {};
        const prod = dp?.productos || {};

        return {
          // lo que tu flujo ya usa:
          id_producto: prod?.id_producto,
          productos: prod,

          // muy importante para tu payload final:
          id_detalle_producto: dp?.id_detalle_producto,

          // l?mite de devoluci?n basado en el detalle del producto listado:
          quantity: Number(
            dp?.stock_producto ?? d?.cantidad_total_unidades ?? d?.cantidad ?? 0,
          ),
          codigo_barras_producto_compra:
            dp?.codigo_barras_producto_compra ?? "",

          // por si tu UI lo usa en otros lados:
          stock_producto: Number(dp?.stock_producto ?? 0),
        };
      })
      .filter((p) => p?.id_producto != null && p?.id_detalle_producto != null);
  };

  const handleSelectPurchase = (purchase) => {
    setSelectedPurchase(purchase);

    // Cargamos productos disponibles de esa compra
    const normalized = normalizePurchaseProducts(purchase);
    setPurchaseProducts(normalized);

    // Si cambiaste de compra, lo m?s seguro es reiniciar la devoluci?n actual
    setSelectedProducts([]);
    setPendingDetails([]);
    setOpenConfigProductId(null);
  };

  const validateInvoiceNumber = (value) => {
    const raw = String(value ?? "").trim();
    const normalized = normalizeInvoice(raw);

    if (!raw) {
      return "El número de factura es obligatorio.";
    }
    if (raw.length < 4) {
      return "El número de factura debe tener al menos 4 caracteres.";
    }
    if (raw.length > 20) {
      return "El número de factura no puede superar los 20 caracteres.";
    }
    if (existingInvoiceNumbers.includes(normalized)) {
      return "El codigo de barras no puede repertirse";
    }

    return "";
  };

  const handleInvoiceChange = (e) => {
    const value = e.target.value;
    setInvoiceNumber(value);
    setInvoiceError(validateInvoiceNumber(value)); // ?Y???? validaci?n en tiempo real
  };

  // Helper: encontrar detalle para un producto
  const getPendingDetailForProduct = (detailId) =>
    pendingDetails.find((d) => d.productKey === detailId);

  // Adaptar producto del buscador
  const handleAddProduct = (product) => {
    const existingIndex = selectedProducts.findIndex(
      (p) => p.id_detalle_producto === product.id_detalle_producto,
    );

    // aseguramos n?mero
    const initialQty = Number(product.returnQuantity);
    const safeQuantity =
      Number.isFinite(initialQty) && initialQty > 0 ? initialQty : 1;

    if (existingIndex > -1) {
      const updated = [...selectedProducts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        returnQuantity: safeQuantity,
      };
      setSelectedProducts(updated);
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          ...product,
          returnQuantity: safeQuantity,
          returnReason: "",
          actionType: "",
          id_detalle_producto: product.id_detalle_producto,
        },
      ]);
    }
  };

  const handleRemoveProduct = (detailId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.id_detalle_producto !== detailId),
    );
    setPendingDetails((prev) => prev.filter((d) => d.productKey !== detailId));
    if (openConfigProductId === detailId) setOpenConfigProductId(null);
  };

  const handleUpdateQuantity = (detailId, delta) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id_detalle_producto !== detailId) return p;

        // valor actual seguro (si viene string "1", lo convertimos a n?mero)
        const current = Number.isFinite(p.returnQuantity)
          ? p.returnQuantity
          : Number(p.returnQuantity) || 1;

        const candidate = current + delta;

        // m?ximo disponible: primero quantity, luego stock_producto
        const maxAvailable = Number.isFinite(p.quantity)
          ? p.quantity
          : Number.isFinite(p.stock_producto)
            ? p.stock_producto
            : null;

        let newQuantity = candidate;

        // solo aplicamos l?mite superior si tenemos un m?ximo v?lido
        if (maxAvailable !== null) {
          newQuantity = Math.min(maxAvailable, newQuantity);
        }

        // nunca bajamos de 1
        newQuantity = Math.max(1, newQuantity);

        return { ...p, returnQuantity: newQuantity };
      }),
    );
  };

  // Cambiar raz?n por producto
  const handleProductReasonChange = (detailId, reasonValue) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id_detalle_producto === detailId
          ? { ...p, returnReason: reasonValue }
          : p,
      ),
    );
    setShowErrors(false); // Ocultar errores cuando se selecciona una raz?n
  };

  /**
   * Cambiar accion por producto.
   * - Solo "registrar" abre ProductRegistrationModal.
   * - "descuento" solo marca la accion y no abre modal.
   */
  const handleProductActionChange = (product, actionValue) => {
    const hasDetail = !!getPendingDetailForProduct(product.id_detalle_producto);

    // Actualizamos la acci?n
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id_detalle_producto === product.id_detalle_producto
          ? { ...p, actionType: actionValue }
          : p,
      ),
    );
    setShowErrors(false); // Ocultar errores cuando se selecciona una acci?n

    if (!hasDetail && actionValue === "registrar") {
      setProductToRegister(product);
      setDetailToEdit(null); // no hay detalle aun
      setRegistrationMode("create"); // estamos creando
      setIsRegistrationModalOpen(true);
    }
  };

  const toggleConfigDropdown = (detailId) => {
    setOpenConfigProductId((prev) => (prev === detailId ? null : detailId));
  };

  // Cuando el modal de registro confirma el detalle (NO se guarda a?n en BD)
  const handleConfirmRegistration = (registeredDetail) => {
    if (!registeredDetail || !registeredDetail.productKey) {
      console.log("No se envio detalle", registeredDetail);
      return;
    }

    setPendingDetails((prev) => {
      const filtered = prev.filter(
        (d) => d.productKey !== registeredDetail.productKey,
      );
      return [...filtered, registeredDetail];
    });
    console.log("registeredDetail", registeredDetail);
    console.log("pendingDetails", pendingDetails);
    setIsRegistrationModalOpen(false);
    setProductToRegister(null);
  };

  /**
   * Borrar un detalle registrado:
   * - Lo quitamos de pendingDetails
   * - Limpiamos la acci?n del producto (se desmarca "Registrar")
   */
  const handleDeleteDetail = (detailId) => {
    setPendingDetails((prev) => prev.filter((d) => d.productKey !== detailId));

    // Desmarcar acci?n "registrar" para dejar el producto libre de nuevo
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id_detalle_producto === detailId ? { ...p, actionType: "" } : p,
      ),
    );
  };

  const handleCloseModal = () => {
    setSelectedProducts([]);
    setIsRegistrationModalOpen(false);
    setProductToRegister(null);
    setOpenConfigProductId(null);
    setPendingDetails([]);
    setInvoiceNumber(""); // ????? limpiar n?mero de factura
    setInvoiceError(""); // ????? limpiar error
    onClose();
  };

  const handleConfirmReturn = async () => {
    const errorMsg = validateInvoiceNumber(invoiceNumber);
    if (errorMsg) {
      setInvoiceError(errorMsg);
      alert("Corrige el número de factura antes de continuar.");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("Selecciona al menos un producto.");
      return;
    }

    if (selectedProducts.some((p) => !p.returnReason)) {
      setShowErrors(true);
      return;
    }

    if (selectedProducts.some((p) => !p.actionType)) {
      setShowErrors(true);
      return;
    }

    const missingDetail = selectedProducts.find(
      (p) =>
        p.actionType === "registrar" &&
        !getPendingDetailForProduct(p.id_detalle_producto),
    );

    if (missingDetail) {
      alert(
        `El producto "${missingDetail.productos.nombre}" no tiene detalle cargado para registrar.`,
      );
      return;
    }

    // Si todo est? bien -> mostramos alerta de confirmaci?n
    setShowConfirmAlert(true);
  };
  const handleCancelAlert = () => setShowConfirmAlert(false);

  const handleAcceptAlert = async () => {
    console.log("handleAcceptAlert DISPARADO");
    setShowConfirmAlert(false);
    console.log("selectedProducts al confirmar:", payloadId.uid);
    const id_responsable = payloadId.uid; // TODO: reemplazar con el usuario logueado

    try {
      console.log("selectedProducts en handleAcceptAlert:", selectedProducts);
      console.log("pendingDetails en handleAcceptAlert:", pendingDetails);

      // ?Y???? PRIMERO: Guardar todos los detalles pendientes en la BD
      const savedDetails = [];
      const detailsToPersist = pendingDetails.filter((detail) =>
        selectedProducts.some(
          (p) =>
            p.actionType === "registrar" &&
            String(p.id_detalle_producto) === String(detail.productKey),
        ),
      );
      for (const detail of detailsToPersist) {
        console.log("Guardando detalle:", detail);
        const saved = await postDetailProduct({
          id_producto: detail.id_producto,
          registeredBarcode: detail.registeredBarcode,
          registeredExpiry: detail.registeredExpiry,
          registeredQuantity: detail.registeredQuantity,
        });
        const createdDetail =
          saved?.newDetail ??
          saved?.newProductDetail ??
          saved?.detail ??
          saved;

        if (!createdDetail?.id_detalle_producto) {
          throw new Error(
            `No se pudo guardar el detalle para el producto ${detail.productKey}`,
          );
        }

        savedDetails.push({
          productKey: String(detail.productKey),
          id_detalle_producto_creado: createdDetail.id_detalle_producto,
        });
      }

      console.log("Detalles guardados:", savedDetails);

      // ?Y???? SEGUNDO: Construir payload con los IDs de detalles guardados
      const productsPayload = selectedProducts
        .map((p) => {
          const idDetalleOrigen = p.id_detalle_producto;

          if (!idDetalleOrigen) {
            console.error(
              "Falta id_detalle_producto (origen) para este producto:",
              p,
            );
            alert(
              `El producto "${
                p.productos?.nombre ?? p.nombre_producto
              }" no tiene detalle origen válido.`,
            );
            return null;
          }

          const savedDetail = savedDetails.find(
            (d) => String(d.productKey) === String(p.id_detalle_producto),
          );
          const idDetalleCreado =
            p.id_detalle_producto_creado ??
            savedDetail?.id_detalle_producto_creado ??
            null;

          if (p.actionType === "registrar" && !idDetalleCreado) {
            console.error(
              "Falta id_detalle_producto_creado para la linea de reemplazo:",
              p,
              "savedDetails:",
              savedDetails,
            );
            alert(
              `El producto "${
                p.productos?.nombre ?? p.nombre_producto
              }" no tiene detalle de reemplazo creado para registrar.`,
            );
            return null;
          }

          return {
            id_producto: p.id_producto,
            id_detalle_producto: idDetalleOrigen,
            id_detalle_producto_creado:
              p.actionType === "registrar" ? idDetalleCreado : null,
            cantidad: p.returnQuantity || 1,
            motivo: p.returnReason,
            nombre_producto: p.productos?.nombre ?? p.nombre_producto,
            es_descuento: p.actionType === "descuento",
          };
        })
        .filter(Boolean); // quitamos los null

      if (productsPayload.length === 0) {
        console.error(
          "No hay productos validos para enviar en el payload (productsPayload vacio).",
        );
        return;
      }

      const payload = {
        id_responsable,
        id_compra: selectedPurchase?.id_compra,
        numero_factura: invoiceNumber.trim(),
        products: productsPayload,
      };

      console.log("Payload FINAL antes de POST:", payload);

      const result = await postReturnProducts(payload);

      console.log("Resultado de postReturnProducts:", result);

      if (result) {
        refetch();
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          handleCloseModal();
        }, 2500);
        console.log("Devolucion registrada con exito");
      } else {
        console.warn("postReturnProducts devolvio null/undefined");
      }
    } catch (err) {
      console.error("Error en handleAcceptAlert:", err);
      alert(err.message || "No fue posible registrar la devolucion.");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    if (invoiceNumber) {
      setInvoiceError(validateInvoiceNumber(invoiceNumber));
    }
  }, [existingInvoiceNumbers, invoiceNumber]);

  useEffect(() => {
    if (selectedProducts.length === 0) {
      setIsRegistrationModalOpen(false);
      setProductToRegister(null);
      setOpenConfigProductId(null);
      setPendingDetails([]);
    }
  }, [selectedProducts.length]);
  const handleRegistrationModalClose = () => {
    setIsRegistrationModalOpen(false);
    setProductToRegister(null);
    setDetailToEdit(null);
    setRegistrationMode("create");
  };

  const handleRegistrationModalCancel = () => {
    // si estaba en modo CREAR registro, limpiamos acci?n
    if (registrationMode === "create" && productToRegister) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id_detalle_producto === productToRegister.id_detalle_producto
            ? { ...p, actionType: "" }
            : p,
        ),
      );
    }

    setIsRegistrationModalOpen(false);
    setProductToRegister(null);
    setDetailToEdit(null);
    setRegistrationMode("create");
  };
  const handleEditDetail = (detailId) => {
    const detail = getPendingDetailForProduct(detailId);
    const product = selectedProducts.find(
      (p) => p.id_detalle_producto === detailId,
    );
    if (!detail || !product) return;

    setProductToRegister(product);
    setDetailToEdit(detail);
    setRegistrationMode("edit");
    setIsRegistrationModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />

            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl relative flex flex-col max-h-[90vh] ${
                  loading ? "pointer-events-none opacity-50" : ""
                }`}
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              >
                {/* Header */}
                <motion.div
                  className="p-6 border-b rounded-2xl border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50"
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
                        <Package size={18} className="text-green-700" />
                      </motion.div>
                      Devolución de Productos
                    </h3>
                    <motion.button
                      onClick={handleCloseModal}
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
                  </div>
                </motion.div>

                {/* Contenido */}
                <div className="flex flex-col p-6 space-y-4 flex-grow overflow-y-auto">
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        Número de factura
                      </label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={handleInvoiceChange}
                        maxLength={20}
                        className={`w-full px-3 py-2 rounded-lg border text-sm outline-none text-gray-700 ${
                          invoiceError
                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-gray-300 focus:ring-1 focus:ring-emerald-500"
                        }`}
                        placeholder="Ej. 0001-2025"
                      />
                      {invoiceError && (
                        <p className="text-xs text-red-500 mt-1">
                          {invoiceError}
                        </p>
                      )}
                    </motion.div>
                    {/* B?squeda y listado de productos */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Seleccionar compra y productos a devolver
                      </h3>

                      {/* 1) Buscador de compras */}
                      <PurchaseSearchSelect
                        placeholder="Buscar compra por #, proveedor, fecha, producto..."
                        onSelect={handleSelectPurchase}
                        isOptionDisabled={(purchase) =>
                          !getPurchaseExpiryStatus(purchase).selectable
                        }
                        getOptionDisabledMessage={(purchase) =>
                          getPurchaseExpiryStatus(purchase).message
                        }
                      />

                      {/* 2) Lista de productos de la compra seleccionada (como devoluci?n de clientes) */}
                      <AnimatePresence>
                        {selectedPurchase && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  Productos de la compra #
                                  {selectedPurchase?.id_compra}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Proveedor:{" "}
                                  {selectedPurchase?.proveedores?.nombre || "-"}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPurchase(null);
                                  setPurchaseProducts([]);
                                  setSelectedProducts([]);
                                  setPendingDetails([]);
                                  setOpenConfigProductId(null);
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                              >
                                Limpiar compra
                              </button>
                            </div>

                            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                              {purchaseProducts
                                // evitar mostrar productos ya agregados por id_detalle_producto
                                .filter(
                                  (p) =>
                                    !selectedProducts.some(
                                      (sp) =>
                                        sp.id_detalle_producto ===
                                        p.id_detalle_producto,
                                    ),
                                )
                                .map((p) => (
                                  <motion.div
                                    key={p.id_detalle_producto}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-800 truncate">
                                        {p.productos?.nombre}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Código de barras:{" "}
                                        {p.codigo_barras_producto_compra ||
                                          "Sin codigo"}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAddProduct({
                                          ...p,
                                          returnQuantity: 1,
                                        })
                                      }
                                      className="text-xs px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                    >
                                      Agregar
                                    </button>
                                  </motion.div>
                                ))}

                              {purchaseProducts.length === 0 && (
                                <div className="p-3 text-center text-sm text-gray-500">
                                  Esta compra no tiene productos disponibles.
                                </div>
                              )}

                              {purchaseProducts.length > 0 &&
                                purchaseProducts.filter(
                                  (p) =>
                                    !selectedProducts.some(
                                      (sp) =>
                                        sp.id_detalle_producto ===
                                        p.id_detalle_producto,
                                    ),
                                ).length === 0 && (
                                  <div className="p-3 text-center text-sm text-gray-500">
                                    Ya agregaste todos los productos de esta
                                    compra.
                                  </div>
                                )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    {/* Lista de productos seleccionados */}
                    <AnimatePresence>
                      {selectedProducts.length > 0 && (
                        <motion.div
                          className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Productos a devolver
                          </h4>
                          <motion.div
                            className="space-y-3"
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: {
                                transition: { staggerChildren: 0.1 },
                              },
                            }}
                          >
                            {selectedProducts.map((product) => {
                              const detail = getPendingDetailForProduct(
                                product.id_detalle_producto,
                              );
                              return (
                                <motion.div
                                  key={product.id_detalle_producto}
                                  className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg"
                                  variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                  }}
                                  whileHover={{
                                    scale: 1.0,
                                    backgroundColor: "#f0f9ff",
                                    transition: { duration: 0.2 },
                                  }}
                                >
                                  {/* fila principal */}
                                  <div className="flex items-center gap-4">
                                    <motion.div
                                      className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                                      whileHover={{
                                        scale: 1.1,
                                        backgroundColor: "#dcfce7",
                                      }}
                                    >
                                      <Package className="w-4 h-4 text-green-700" />
                                    </motion.div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-gray-800">
                                        {product.productos.nombre}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatPrice(
                                          product.productos.precio_venta,
                                        )}{" "}
                                        c/u
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Código de barras:{" "}
                                        {product.codigo_barras_producto_compra ||
                                          "Sin codigo"}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <motion.button
                                        onClick={() =>
                                          handleUpdateQuantity(
                                            product.id_detalle_producto,
                                            -1,
                                          )
                                        }
                                        disabled={product.returnQuantity <= 1}
                                        className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                        whileHover={{
                                          scale: 1.1,
                                          backgroundColor: "#a7f3d0",
                                        }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Minus size={14} />
                                      </motion.button>
                                      <motion.span
                                        className="font-bold text-sm text-gray-800 min-w-[20px] text-center"
                                        key={product.returnQuantity}
                                        initial={{
                                          scale: 1.2,
                                          color: "#16a34a",
                                        }}
                                        animate={{
                                          scale: 1,
                                          color: "#1f2937",
                                        }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        {product.returnQuantity}
                                      </motion.span>
                                      <motion.button
                                        onClick={() =>
                                          handleUpdateQuantity(
                                            product.id_detalle_producto,
                                            1,
                                          )
                                        }
                                        disabled={
                                          product.returnQuantity >=
                                          product.quantity
                                        }
                                        className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                        whileHover={{
                                          scale: 1.1,
                                          backgroundColor: "#a7f3d0",
                                        }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Plus size={14} />
                                      </motion.button>
                                    </div>

                                    {/* bot?n dropdown */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleConfigDropdown(
                                          product.id_detalle_producto,
                                        )
                                      }
                                      className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full hover:bg-emerald-100 transition"
                                    >
                                      Opciones
                                      {openConfigProductId ===
                                      product.id_detalle_producto ? (
                                        <ChevronUp size={14} />
                                      ) : (
                                        <ChevronDown size={14} />
                                      )}
                                    </button>

                                    <motion.button
                                      onClick={() =>
                                        handleRemoveProduct(
                                          product.id_detalle_producto,
                                        )
                                      }
                                      className="text-gray-400 hover:text-red-500 transition-all p-1 rounded-full"
                                      whileHover={{
                                        scale: 1.2,
                                        backgroundColor: "#fee2e2",
                                        color: "#dc2626",
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Trash2 size={16} />
                                    </motion.button>
                                  </div>

                                  {/* Dropdown por producto */}
                                  <AnimatePresence>
                                    {openConfigProductId ===
                                      product.id_detalle_producto && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 border-t pt-3 space-y-3"
                                      >
                                        {/* Razón */}
                                        <div>
                                          <p className="text-xs font-semibold text-gray-700 mb-2">
                                            Razón de la devolución
                                          </p>
                                          <div className="space-y-2">
                                            {returnReasons.map((reason) => {
                                              const isSelected =
                                                product.returnReason ===
                                                reason.value;
                                              return (
                                                <label
                                                  key={reason.value}
                                                  className={`flex items-center gap-3 cursor-pointer rounded-lg border p-2 transition-all select-none ${
                                                    isSelected
                                                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                                      : "border-gray-200 hover:bg-gray-50"
                                                  }`}
                                                >
                                                    <input
                                                      type="radio"
                                                      name={`returnReason-${product.id_detalle_producto}`}
                                                      value={reason.value}
                                                      checked={isSelected}
                                                      onChange={() =>
                                                        handleProductReasonChange(
                                                          product.id_detalle_producto,
                                                          reason.value,
                                                        )
                                                      }
                                                    className="hidden"
                                                  />
                                                  <div
                                                    className={`w-5 h-5 flex items-center justify-center rounded-md border transition ${
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
                                                    className={`text-xs font-medium transition ${
                                                      isSelected
                                                        ? "text-emerald-700"
                                                        : "text-gray-700"
                                                    }`}
                                                  >
                                                    {reason.label}
                                                  </span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                          {showErrors &&
                                            !product.returnReason && (
                                              <p className="text-red-500 text-xs mt-1">
                                                Selecciona una razón
                                              </p>
                                            )}
                                        </div>

                                        {/* Acción + detalle */}
                                        <div>
                                          <p className="text-xs font-semibold text-gray-700 mb-2">
                                            Acción a realizar
                                          </p>
                                          <div className="space-y-2">
                                            {actionTypes.map((action) => {
                                              const isSelected =
                                                product.actionType ===
                                                action.value;

                                              return (
                                                <div key={action.value}>
                                                  <label
                                                    className={`flex items-center gap-3 cursor-pointer rounded-lg border p-2 transition-all select-none ${
                                                      isSelected
                                                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                                        : "border-gray-200 hover:bg-gray-50"
                                                    }`}
                                                    onClick={() =>
                                                      handleProductActionChange(
                                                        product,
                                                        action.value,
                                                      )
                                                    }
                                                  >
                                                    <input
                                                      type="radio"
                                                      name={`actionType-${product.id_detalle_producto}`}
                                                      value={action.value}
                                                      checked={isSelected}
                                                      readOnly
                                                      className="hidden"
                                                    />
                                                    <div
                                                      className={`w-5 h-5 flex items-center justify-center rounded-md border transition ${
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
                                                      className={`text-xs font-medium transition ${
                                                        isSelected
                                                          ? "text-emerald-700"
                                                          : "text-gray-700"
                                                      }`}
                                                    >
                                                      {action.label}
                                                    </span>
                                                  </label>

                                                  {/* Código de barras debajo del checkbox "Registrar" */}

                                                  {action.value ===
                                                    product.actionType &&
                                                    detail && (
                                                      <div className="ml-7 mt-1 text-xs bg-emerald-50 border border-emerald-200 rounded-md p-2 flex items-center justify-between gap-2">
                                                        <div className="space-y-1">
                                                          <p className="font-semibold text-emerald-800">
                                                            Detalle registrado
                                                            temporalmente
                                                          </p>
                                                          <p className="text-gray-700">
                                                            <span className="font-medium">
                                                              Código de barras:
                                                            </span>{" "}
                                                            {
                                                              detail.registeredBarcode
                                                            }
                                                          </p>
                                                          <p className="text-gray-700">
                                                            <span className="font-medium">
                                                              Cantidad:
                                                            </span>{" "}
                                                            {
                                                              detail.registeredQuantity
                                                            }
                                                          </p>
                                                          {detail.fecha_vencimiento && (
                                                            <p className="text-gray-700">
                                                              <span className="font-medium">
                                                                Vencimiento:
                                                              </span>{" "}
                                                              {new Date(
                                                                detail.registeredExpiry,
                                                              ).toLocaleDateString(
                                                                "es-ES",
                                                              )}
                                                            </p>
                                                          )}
                                                        </div>

                                                        {/* Botones Eliminar + Editar */}
                                                        <div className="flex flex-col gap-2">
                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              handleDeleteDetail(
                                                                product.id_detalle_producto,
                                                              )
                                                            }
                                                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700"
                                                          >
                                                            <Trash2 size={14} />
                                                            <span>
                                                              Eliminar
                                                            </span>
                                                          </button>

                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              handleEditDetail(
                                                                product.id_detalle_producto,
                                                              )
                                                            }
                                                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                                                          >
                                                            <Pencil size={14} />
                                                            <span>Editar</span>
                                                          </button>
                                                        </div>
                                                      </div>
                                                    )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                          {showErrors &&
                                            !product.actionType && (
                                              <p className="text-red-500 text-xs mt-1">
                                                Selecciona una acción
                                              </p>
                                            )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                  className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200 rounded-b-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <motion.button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
                    whileHover={{
                      scale: 1.0,
                      backgroundColor: "#d1d5db",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmReturn}
                    disabled={loading}
                    className="flex-1 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{
                      scale: 1.0,
                      backgroundColor: "#15803d",
                      boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
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
                        <CheckCircle size={20} />
                        Confirmar Devolución
                      </>
                    )}
                  </motion.button>
                </motion.div>
                {/* Alerta de confirmación */}
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
                        ¿Estás seguro de registrar la devolución de los
                        productos?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Se actualizarán los{" "}
                        <span className="font-semibold text-emerald-600">
                          stocks de los productos seleccionados
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
                          disabled={loading}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.05 }}
                        >
                          {loading ? (
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

                {/* Animación de éxito */}
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
                        ¡Devolución registrada!
                      </h3>
                      <p className="text-gray-600">
                        Los productos fueron devueltos exitosamente.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de registro de producto */}
      <ProductRegistrationModal
        isReturnProduct={true}
        isOpen={isRegistrationModalOpen}
        onClose={handleRegistrationModalClose}
        onCancelRegistration={handleRegistrationModalCancel}
        product={productToRegister}
        onConfirm={handleConfirmRegistration}
        fixedQuantity={productToRegister?.returnQuantity ?? null}
        existingBarcodes={pendingDetails
          .map(
            (d) =>
              d.registeredBarcode || d.codigo_barras_producto_compra || null,
          )
          .filter(Boolean)}
        initialDetail={detailToEdit}
        ignoreBarcode={
          detailToEdit
            ? detailToEdit.registeredBarcode ||
              detailToEdit.codigo_barras_producto_compra ||
              null
            : null
        }
      />
    </>
  );
};

export default ProductReturnModal;

