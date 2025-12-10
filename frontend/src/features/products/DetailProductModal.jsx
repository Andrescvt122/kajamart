// components/products/DetailProductModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Barcode,
  Calendar,
  Boxes,
  Layers,
  Package,
  Hash,
  DollarSign,
  Percent,
  TrendingUp,
  QrCode,
  XCircle,
} from "lucide-react";

export default function DetailProductModal({ isOpen, onClose, detail, product }) {
  if (!isOpen || !detail || !product) return null;

  // ------- Helpers -------
  const formatDate = (dateStr) => {
    if (!dateStr) return "Sin fecha";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "Sin fecha";
    return d.toLocaleDateString();
  };

  const detalleId = detail.id_detalle_producto ?? detail.id ?? "—";
  const codigoBarras =
    detail.codigo_barras_producto_compra ?? detail.barcode ?? "—";
  const stockLote = detail.stock_producto ?? detail.cantidad ?? "—";
  const fechaVencimiento = detail.fecha_vencimiento || detail.vencimiento || null;

  const esDevolucion =
    typeof detail.es_devolucion === "boolean"
      ? detail.es_devolucion
      : detail.es_devolucion === "true";

  // Impuestos
  const ivaValor = product.iva_detalle?.valor_impuesto ?? product.iva ?? "—";
  const icuValor = product.icu_detalle?.valor_impuesto ?? product.icu ?? "—";
  const incrementoValor =
    product.incremento_detalle?.valor_impuesto ??
    product.porcentaje_incremento ??
    "—";

  // ------- Info combinada (producto + lote) en un solo grid ancho -------
  const productInfo = [
    { label: "ID Producto", value: product.id_producto, icon: Hash, group: "Producto" },
    { label: "Nombre producto", value: product.nombre, icon: Package, group: "Producto" },
    { label: "Stock total (producto)", value: product.stock_actual, icon: Boxes, group: "Producto" },
    { label: "Stock mínimo", value: product.stock_minimo, icon: Layers, group: "Producto" },
    { label: "Stock máximo", value: product.stock_maximo, icon: Layers, group: "Producto" },
    {
      label: "Costo unitario",
      value:
        product.costo_unitario != null
          ? `$${product.costo_unitario.toLocaleString()}`
          : "—",
      icon: DollarSign,
      group: "Producto",
    },
    {
      label: "Precio venta",
      value:
        product.precio_venta != null
          ? `$${product.precio_venta.toLocaleString()}`
          : "—",
      icon: DollarSign,
      group: "Producto",
    },
    { label: "IVA (%)", value: ivaValor, icon: Percent, group: "Producto" },
    { label: "ICU (%)", value: icuValor, icon: QrCode, group: "Producto" },
    {
      label: "Incremento venta (%)",
      value: incrementoValor,
      icon: TrendingUp,
      group: "Producto",
    },
  ];

  const detailInfo = [
    { label: "ID Detalle", value: detalleId, icon: Hash, group: "Lote" },
    { label: "Código de barras", value: codigoBarras, icon: Barcode, group: "Lote" },
    {
      label: "Fecha de vencimiento",
      value: formatDate(fechaVencimiento),
      icon: Calendar,
      group: "Lote",
    },
    {
      label: "Stock en este lote",
      value: stockLote,
      icon: Boxes,
      group: "Lote",
    },
    {
      label: "¿Es devolución?",
      value: esDevolucion ? "Sí" : "No",
      icon: Boxes,
      group: "Lote",
    },
  ];

  const combinedInfo = [...productInfo, ...detailInfo];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // ⬆️ Alineado arriba y con scroll vertical si hace falta
          className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 px-4 pt-6 sm:pt-10 pb-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl my-6 relative text-gray-800 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles del producto y lote
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Producto:{" "}
                  <span className="font-medium">{product.nombre}</span> · Detalle{" "}
                  <span className="font-mono">#{detalleId}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-600 transition"
              >
                <XCircle className="w-7 h-7" />
              </button>
            </div>

            {/* Contenido principal: info a lo ancho + imagen */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-6">
              {/* Info combinada en un solo grid ancho */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Información general
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {combinedInfo.map(({ label, value, icon: Icon, group }, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border hover:shadow-sm transition"
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          group === "Producto" ? "text-green-600" : "text-blue-600"
                        }`}
                      />
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                          {label}
                        </p>
                        <p className="text-xs font-semibold text-gray-400 mb-0.5">
                          {group}
                        </p>
                        <p className="text-sm font-medium text-gray-800 break-all">
                          {value !== undefined && value !== null && value !== ""
                            ? value
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imagen */}
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 self-start">
                  Imagen del producto
                </h3>
                {product.url_imagen ? (
                  <img
                    src={product.url_imagen}
                    alt={product.nombre}
                    className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-xl border shadow"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML =
                        '<div class="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center rounded-xl border-2 border-dashed text-gray-500 text-xs text-center px-2">Imagen no encontrada</div>';
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center rounded-xl border-2 border-dashed text-gray-500 text-xs text-center px-2">
                    Imagen no encontrada
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
