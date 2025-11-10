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

  // Soportar ambas formas de objeto para el detalle
  const detalleId =
    detail.id_detalle_producto ?? detail.id ?? "—";

  const codigoBarras =
    detail.codigo_barras_producto_compra ?? detail.barcode ?? "—";

  const stockLote =
    detail.stock_producto ?? detail.cantidad ?? "—";

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

  // ------- UI -------
  const productInfo = [
    { label: "ID Producto", value: product.id_producto, icon: Hash },
    { label: "Nombre producto", value: product.nombre, icon: Package },
    { label: "Stock total (producto)", value: product.stock_actual, icon: Boxes },
    { label: "Stock mínimo", value: product.stock_minimo, icon: Layers },
    { label: "Stock máximo", value: product.stock_maximo, icon: Layers },
    {
      label: "Costo unitario",
      value:
        product.costo_unitario != null
          ? `$${product.costo_unitario.toLocaleString()}`
          : "—",
      icon: DollarSign,
    },
    {
      label: "Precio venta",
      value:
        product.precio_venta != null
          ? `$${product.precio_venta.toLocaleString()}`
          : "—",
      icon: DollarSign,
    },
    { label: "IVA (%)", value: ivaValor, icon: Percent },
    { label: "ICU (%)", value: icuValor, icon: QrCode },
    { label: "Incremento venta (%)", value: incrementoValor, icon: TrendingUp },
  ];

  const detailInfo = [
    { label: "ID Detalle", value: detalleId, icon: Hash },
    { label: "Código de barras", value: codigoBarras, icon: Barcode },
    {
      label: "Fecha de vencimiento",
      value: formatDate(fechaVencimiento),
      icon: Calendar,
    },
    { label: "Stock en este lote", value: stockLote, icon: Boxes },
    {
      label: "¿Es devolución?",
      value: esDevolucion ? "Sí" : "No",
      icon: Boxes,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
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
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl relative text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles del producto y lote
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Producto: <span className="font-medium">{product.nombre}</span>{" "}
                  · Detalle{" "}
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

            {/* Contenido principal: izquierda info, derecha imagen */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
              {/* Info secciones */}
              <div className="space-y-5">
                {/* Sección Producto */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    Información del producto
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productInfo.map(({ label, value, icon: Icon }, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border hover:shadow-sm transition"
                      >
                        <Icon className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                            {label}
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
                </section>

                {/* Sección Lote */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    Información del lote
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detailInfo.map(({ label, value, icon: Icon }, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border hover:shadow-sm transition"
                      >
                        <Icon className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                            {label}
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
                </section>
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
                    className="w-48 h-48 object-cover rounded-xl border shadow"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML =
                        '<div class="w-48 h-48 flex items-center justify-center rounded-xl border-2 border-dashed text-gray-500 text-xs text-center px-2">Imagen no encontrada</div>';
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center rounded-xl border-2 border-dashed text-gray-500 text-xs text-center px-2">
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
