import React, { useState, useEffect } from "react";
import { Search, Package, CheckCircle, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFetchProduct } from "../hooks/searchBars/useFetchProducts";

const ProductSearch = ({ onAddProduct, requireExpiryEligibility = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false); // loader del botón
  const [showCheck, setShowCheck] = useState(false); // ✅ animación de check

  // ⏳ Debounce de 500 ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Hook que llama la API
  const { data: products, loading, error } = useFetchProduct(debouncedTerm);

  const handleSelectProduct = (product) => {
    if (product.stock_producto <= 0) {
      showTemporaryAlert(
        `El producto "${
          product.productos?.nombre || "sin nombre"
        }" no tiene stock disponible.`
      );
      return;
    }

    if (requireExpiryEligibility && !getExpiryStatus(product).isEligible) {
      showTemporaryAlert(
        `El producto "${
          product.productos?.nombre || "sin nombre"
        }" no aplica para devolución por vencimiento.`
      );
      return;
    }

    setSelectedProduct(product);
    setSearchTerm(product.productos?.nombre || "");
    setShowDropdown(false);
    setQuantity(1);
  };

  const handleAddProduct = async () => {
    if (!selectedProduct)
      return showTemporaryAlert("Por favor, selecciona un producto.");
    if (quantity <= 0)
      return showTemporaryAlert("La cantidad debe ser mayor a 0.");
    if (quantity > selectedProduct.stock_producto)
      return showTemporaryAlert(
        `No hay suficiente stock. Solo quedan ${selectedProduct.stock_producto} unidades disponibles.`
      );

    setIsAdding(true);
    setShowCheck(false);

    // Simula el proceso de agregado
    setTimeout(() => {
      const newProduct = { ...selectedProduct, requestedQuantity: quantity };
      onAddProduct(newProduct);
      showTemporaryAlert(
        `${selectedProduct.productos?.nombre} añadido exitosamente`,
        true
      );

      // ✅ Mostrar check animado
      setShowCheck(true);
      setIsAdding(false);
      setTimeout(() => setShowCheck(false), 1000);

      setSelectedProduct(null);
      setSearchTerm("");
      setQuantity(1);
    }, 900);
  };

  const showTemporaryAlert = (msg, success = false) => {
    setAlertMessage(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), success ? 2500 : 3500);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="relative mb-6">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Campo de búsqueda */}
        <div className="relative flex-1">
          <motion.div
            className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </motion.div>
          <motion.input
            type="text"
            className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-400 transition-all bg-white"
            placeholder="Buscar por producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
            whileFocus={{ scale: 1.0 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Campo de cantidad */}
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <label className="text-sm font-semibold text-gray-700 p-6">
            Cantidad:
          </label>
          <motion.input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            className="w-16 mt-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-black text-center focus:ring-2 focus:ring-green-400 focus:outline-none"
            whileFocus={{ scale: 1.05, borderColor: "#16a34a" }}
          />
        </motion.div>

        {/* Botón agregar con loader + check */}
        <motion.button
          onClick={handleAddProduct}
          disabled={isAdding || showCheck}
          className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
            isAdding || showCheck
              ? "bg-green-500 cursor-not-allowed opacity-90"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          whileHover={!isAdding && !showCheck ? { scale: 1.05 } : {}}
          whileTap={!isAdding && !showCheck ? { scale: 0.95 } : {}}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {isAdding ? (
            // 🔄 Loader animado dentro del botón
            <motion.div
              className="flex gap-2 items-center"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.15,
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                },
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  variants={{
                    hidden: { opacity: 0.3, y: 0 },
                    visible: { opacity: 1, y: -5 },
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
          ) : showCheck ? (
            // ✅ Check animado con Framer Motion
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            "Añadir producto"
          )}
        </motion.button>
      </motion.div>

      {/* Alerta */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            className={`mt-4 p-4 flex items-center gap-3 rounded-lg shadow-sm ${
              alertMessage.includes("exitosamente")
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            {alertMessage.includes("exitosamente") ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <motion.p
              className="text-sm font-medium"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {alertMessage}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dropdown de resultados */}
      <AnimatePresence>
        {showDropdown && searchTerm && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {loading ? (
              <div className="p-6 flex justify-center items-center">
                {/* Loader animado */}
                <motion.div
                  className="flex gap-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.15,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    },
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-3 h-3 bg-green-500 rounded-full"
                      variants={{
                        hidden: { opacity: 0.3, y: 0 },
                        visible: { opacity: 1, y: -6 },
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  ))}
                </motion.div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : products && products.length > 0 ? (
              products.map((item) => {
                const isOutOfStock = item.stock_producto <= 0;
                const expiryStatus = getExpiryStatus(item);
                const isDisabledByExpiry =
                  requireExpiryEligibility && !expiryStatus.isEligible;
                const isDisabled = isOutOfStock || isDisabledByExpiry;

                return (
                  <motion.div
                    key={item.id_detalle_producto}
                    className={`px-4 py-3 border-b border-gray-100 last:border-0 transition-colors duration-200 ${
                      isDisabled
                        ? "bg-gray-50 cursor-not-allowed opacity-60"
                        : "hover:bg-green-50 cursor-pointer"
                    }`}
                    onClick={() => handleSelectProduct(item)}
                    whileHover={
                      !isDisabled
                        ? {
                            scale: 1.01,
                            backgroundColor: "#dcfce7",
                            transition: { duration: 0.2 },
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img src={item.productos?.url_imagen} alt="" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.productos?.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cód. {item.codigo_barras_producto_compra} •{" "}
                          {formatPrice(item.productos?.precio_venta || 0)}
                        </p>
                        {isOutOfStock && (
                          <p className="text-xs text-red-500 font-semibold mt-1">
                            Sin stock disponible
                          </p>
                        )}
                        {!isOutOfStock && isDisabledByExpiry && (
                          <p className="text-xs text-amber-600 font-semibold mt-1">
                            {expiryStatus.label}
                          </p>
                        )}
                        {!isOutOfStock && requireExpiryEligibility && !isDisabledByExpiry && (
                          <p className="text-xs text-emerald-600 font-semibold mt-1">
                            {expiryStatus.label}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
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
    </div>
  );
};

export default ProductSearch;
  const normalizeDate = (rawDate) => {
    if (!rawDate) return null;
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  };

  const getExpiryDate = (product) =>
    normalizeDate(
      product?.fecha_vencimiento ||
        product?.expiryDate ||
        product?.fechaVencimiento ||
        product?.registeredExpiry
    );

  const getExpiryStatus = (product) => {
    const expiryDate = getExpiryDate(product);
    if (!expiryDate) {
      return {
        isEligible: false,
        isExpired: false,
        isNearExpiry: false,
        label: "Sin fecha de vencimiento registrada",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inAWeek = new Date(today);
    inAWeek.setDate(inAWeek.getDate() + 7);

    const isExpired = expiryDate < today;
    const isNearExpiry = expiryDate >= today && expiryDate <= inAWeek;

    if (isExpired) {
      return {
        isEligible: true,
        isExpired: true,
        isNearExpiry: false,
        label: "Vencido",
      };
    }

    if (isNearExpiry) {
      return {
        isEligible: true,
        isExpired: false,
        isNearExpiry: true,
        label: "Cerca de vencer (≤ 7 días)",
      };
    }

    return {
      isEligible: false,
      isExpired: false,
      isNearExpiry: false,
      label: "No vencido ni próximo a vencer",
    };
  };
