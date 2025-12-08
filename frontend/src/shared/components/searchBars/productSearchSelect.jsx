import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFetchProduct } from "../hooks/searchBars/useFetchProducts";

/**
 * ProductSearchSelect
 * - UI igual a productSearch.jsx
 * - Dropdown se renderiza AFUERA con Portal (no lo recorta el overflow del modal)
 * - Click en item => onSelect(item)
 */
const ProductSearchSelect = ({
  onSelect,
  placeholder = "Buscar por producto...",
  filterOutOfStock = true,
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

  // ⏳ Debounce (igual que productSearch.jsx)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: products, loading, error } = useFetchProduct(debouncedTerm);

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list;
  }, [products]);

  const showTemporaryAlert = (msg) => {
    setAlertMessage(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3500);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price || 0);

  const updateDropdownPosition = () => {
    const el = anchorRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    // posición base debajo del input
    let top = rect.bottom + 8;
    let left = rect.left;
    const width = rect.width;

    // Ajuste si no cabe hacia abajo (evitar que se salga de pantalla)
    const approxHeight = Math.min(320, 56 + (filteredProducts?.length || 0) * 64); // aprox max-h-80
    const viewportH = window.innerHeight;
    if (top + approxHeight > viewportH - 8) {
      // si no cabe abajo, lo mostramos arriba
      top = Math.max(8, rect.top - 8 - approxHeight);
    }

    // Ajuste horizontal básico
    const viewportW = window.innerWidth;
    if (left + width > viewportW - 8) {
      left = Math.max(8, viewportW - 8 - width);
    }

    setDropdownPos({ top, left, width });
  };

  const handleSelectProduct = (product) => {
    const isOutOfStock = product.stock_producto <= 0;

    if (filterOutOfStock && isOutOfStock) {
      showTemporaryAlert(
        `El producto "${product.productos?.nombre || "sin nombre"}" no tiene stock disponible.`
      );
      return;
    }

    onSelect?.(product);
    setSearchTerm(product.productos?.nombre || "");
    setShowDropdown(false);
  };

  // abrir dropdown y posicionarlo
  const openDropdown = () => {
    setShowDropdown(true);
    // en el próximo tick calculamos bien el rect
    requestAnimationFrame(updateDropdownPosition);
  };

  // Reposicionar en scroll/resize mientras esté abierto
  useEffect(() => {
    if (!showDropdown) return;

    const handler = () => updateDropdownPosition();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true); // captura scroll dentro de modales
    handler();

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [showDropdown, filteredProducts?.length]);

  // Cerrar al click fuera (input + dropdown)
  useEffect(() => {
    if (!showDropdown) return;

    const onMouseDown = (e) => {
      const a = anchorRef.current;
      const d = dropdownRef.current;
      if (a?.contains(e.target)) return;
      if (d?.contains(e.target)) return;
      setShowDropdown(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
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
            zIndex: 9999, // por encima del modal
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {loading ? (
            <div className="p-6 flex justify-center items-center">
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
          ) : filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((item) => {
              const isOutOfStock = item.stock_producto <= 0;

              return (
                <motion.div
                  key={item.id_detalle_producto}
                  className={`px-4 py-3 border-b border-gray-100 last:border-0 transition-colors duration-200 ${
                    isOutOfStock
                      ? "bg-gray-50 cursor-not-allowed opacity-60"
                      : "hover:bg-green-50 cursor-pointer"
                  }`}
                  onClick={() => handleSelectProduct(item)}
                  whileHover={
                    !isOutOfStock
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
                      {item.productos?.url_imagen ? (
                        <img src={item.productos.url_imagen} alt="" />
                      ) : null}
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
  );

  return (
    <div className="relative mb-6" ref={anchorRef}>
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={openDropdown}
            autoComplete="off"
            whileFocus={{ scale: 1.0 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            className="mt-4 p-4 flex items-center gap-3 rounded-lg shadow-sm bg-red-100 text-red-700 border border-red-200"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <AlertCircle size={20} />
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

      {/* ✅ Dropdown AFUERA */}
      {createPortal(dropdownUI, document.body)}
    </div>
  );
};

export default ProductSearchSelect;
