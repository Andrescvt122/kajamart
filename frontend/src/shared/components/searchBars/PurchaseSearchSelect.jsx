import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFetchPurchases } from "../hooks/search/useFetchPruchases.jsx";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  // es-CO, Bogota: fecha legible
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function getFirstProductText(purchase) {
  const detalles = Array.isArray(purchase?.detalle_compra) ? purchase.detalle_compra : [];
  if (detalles.length === 0) return "Sin productos";

  const firstName =
    detalles?.[0]?.detalle_productos?.productos?.nombre?.trim?.() ||
    "Producto";

  return detalles.length > 1 ? `${firstName} ...` : firstName;
}

export default function PurchaseSearchSelect({
  onSelect,
  placeholder = "Buscar compra por número, proveedor, etc...",
  isOptionDisabled,
  getOptionDisabledMessage,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ⏳ Debounce 500ms (igual que tu estilo) :contentReference[oaicite:4]{index=4}
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: purchases, loading, error } = useFetchPurchases(debouncedTerm);

  const list = useMemo(() => {
    return Array.isArray(purchases) ? purchases : [];
  }, [purchases]);

  const handlePick = (purchase) => {
    if (isOptionDisabled?.(purchase)) return;
    onSelect?.(purchase);
    setSearchTerm(String(purchase?.id_compra ?? ""));
    setShowDropdown(false);
  };

  return (
    <div className="relative mb-6">
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
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
            whileFocus={{ scale: 1.0 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </motion.div>

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
            ) : list.length > 0 ? (
              list.map((p) => {
                const isDisabled = Boolean(isOptionDisabled?.(p));
                const compra = p?.id_compra ?? "-";
                const proveedor = p?.proveedores?.nombre || "Sin proveedor";
                const fecha = formatDate(p?.fecha_compra);
                const producto = getFirstProductText(p);
                const disabledMessage = getOptionDisabledMessage?.(p);

                return (
                  <motion.div
                    key={p?.id_compra}
                    className={`px-4 py-3 border-b border-gray-100 last:border-0 transition-colors duration-200 ${
                      isDisabled
                        ? "bg-gray-50 opacity-70 cursor-not-allowed"
                        : "hover:bg-green-50 cursor-pointer"
                    }`}
                    onClick={() => handlePick(p)}
                    whileHover={{
                      ...(isDisabled
                        ? {}
                        : {
                            scale: 1.01,
                            backgroundColor: "#dcfce7",
                            transition: { duration: 0.2 },
                          }),
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Compra #{compra}
                        </p>

                        <p className="text-xs text-gray-600 mt-0.5">
                          {proveedor} • {fecha}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {producto}
                        </p>
                        {isDisabled && disabledMessage ? (
                          <p className="text-xs text-amber-700 mt-1 font-medium">
                            {disabledMessage}
                          </p>
                        ) : null}
                      </div>

                      {/* Badge estado (opcional) */}
                      {p?.estado_compra ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {p.estado_compra}
                        </span>
                      ) : null}
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
}
