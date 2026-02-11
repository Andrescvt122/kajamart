// PurchaseDetailModal.jsx
import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

// ID compra sin ceros
const formatPurchaseId = (val) => {
  if (val == null) return "—";
  const s = String(val).trim();
  if (!s) return "—";
  const n = Number(s);
  if (Number.isFinite(n) && n > 0) return String(Math.trunc(n));
  return s;
};

const computeSubtotal = (p) => {
  if (p?.subtotal != null) return Number(p.subtotal || 0);

  const cantidad = Number(p?.cantidad || 0);
  const precioCompra = Number(p?.precioCompra ?? p?.precio ?? 0);

  const ivaPct = Number(p?.subida ?? 0); // IVA %
  const icuPct = Number(p?.descuento ?? 0); // ICU %

  const base = precioCompra * cantidad;
  const iva = (base * ivaPct) / 100;
  const icu = (base * icuPct) / 100;

  return base + iva + icu;
};

// ✅ Detecta imagen por extensión (jpg, png, etc.) y/o mimetype si existe
const isImageLike = (url = "", mime = "") => {
  const m = String(mime || "").toLowerCase();
  if (m.startsWith("image/")) return true;

  const clean = String(url || "").split("?")[0].split("#")[0].toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|tif|tiff|ico|avif)$/i.test(clean);
};

export default function PurchaseDetailModal({ purchase, onClose }) {
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);

  const productos = useMemo(() => {
    const arr = purchase?.productos;
    return Array.isArray(arr) ? arr : [];
  }, [purchase]);

  const totalCompra = useMemo(() => {
    return productos.reduce((acc, p) => acc + computeSubtotal(p), 0);
  }, [productos]);

  // ✅ bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!purchase) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [purchase]);

  // ✅ reset visor si cambia la compra
  useEffect(() => {
    if (!purchase) return;
    setShowReceiptViewer(false);
  }, [purchase]);

  if (!purchase) return null;

  // =========================
  // Normalización de datos
  // =========================
  const purchaseId = formatPurchaseId(purchase?.id ?? purchase?._id);

  const fechaRaw =
    purchase?.fecha ?? purchase?.fecha_registro ?? purchase?.createdAt ?? null;
  const fecha = fechaRaw
    ? new Date(fechaRaw).toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const proveedorNombre = purchase?.proveedor?.nombre ?? purchase?.proveedor ?? "—";
  const proveedorNit = purchase?.proveedor?.nit ?? purchase?.nit ?? "—";

  const numFactura =
    purchase?.numero_factura ??
    purchase?.num_factura ??
    purchase?.factura?.num_factura ??
    purchase?.factura ??
    "—";

  // =========================
  // ✅ Comprobante: admite url string u objeto {url,name,mimetype}
  // =========================
  const receiptObj =
    typeof purchase?.comprobante === "object" && purchase?.comprobante
      ? purchase.comprobante
      : null;

  const receiptUrl =
    receiptObj?.url ??
    purchase?.comprobante_pago?.url ??
    purchase?.comprobante_pago ??
    (typeof purchase?.comprobante === "string" ? purchase.comprobante : null) ??
    purchase?.comprobante?.path ??
    null;

  const receiptName =
    receiptObj?.name ??
    receiptObj?.nombre ??
    purchase?.comprobante?.name ??
    purchase?.comprobante?.nombre ??
    "Comprobante";

  const receiptMime =
    receiptObj?.mimetype ?? receiptObj?.mime ?? purchase?.comprobante?.mimetype ?? "";

  const hasReceipt = Boolean(receiptUrl);
  const receiptIsImage = hasReceipt ? isImageLike(receiptUrl, receiptMime) : false;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm px-3 sm:px-4 pt-6 pb-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden"
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b">
            <div className="min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Detalles de la Compra
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {numFactura !== "—" ? `Factura: ${numFactura}` : "Factura no registrada"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-gray-600"
              aria-label="Cerrar"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-5 sm:px-6 py-5 space-y-5">
            {/* Info general */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">ID compra</p>
                <p className="font-semibold text-gray-900 break-words">{purchaseId}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Fecha</p>
                <p className="font-semibold text-gray-900 break-words">{fecha}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Proveedor</p>
                <p className="font-semibold text-gray-900 break-words">{proveedorNombre}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">NIT</p>
                <p className="font-semibold text-gray-900 break-words">{proveedorNit}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">N° Factura</p>
                <p className="font-semibold text-gray-900 break-words">{numFactura}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Estado</p>
                <p className="font-semibold text-gray-900 break-words">
                  {purchase?.estado ?? "—"}
                </p>
              </div>

              {/* ✅ Comprobante + botón */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 sm:col-span-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">
                      Comprobante
                    </p>
                    <p className="font-semibold text-gray-900 break-words">
                      {hasReceipt ? receiptName : "—"}
                    </p>
                    {hasReceipt && (
                      <p className="text-xs text-gray-500 mt-1 break-all">{receiptUrl}</p>
                    )}
                  </div>

                  <div className="shrink-0 flex gap-2">
                    <button
                      type="button"
                      disabled={!hasReceipt}
                      onClick={() => setShowReceiptViewer((v) => !v)}
                      className={[
                        "px-3 py-2 rounded-lg text-sm font-semibold",
                        hasReceipt
                          ? "bg-white border border-gray-200 hover:bg-gray-100 text-gray-800"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed",
                      ].join(" ")}
                    >
                      {showReceiptViewer ? "Ocultar" : "Ver comprobante"}
                    </button>

                    {hasReceipt && (
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
                      >
                        Abrir
                      </a>
                    )}
                  </div>
                </div>

                {/* ✅ Visor embebido */}
                <AnimatePresence>
                  {showReceiptViewer && hasReceipt && (
                    <motion.div
                      className="mt-3 border border-gray-200 bg-white rounded-xl overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-700">
                          {receiptIsImage ? "Vista previa (imagen)" : "Vista previa (documento)"}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowReceiptViewer(false)}
                          className="text-xs px-2 py-1 rounded-md hover:bg-gray-200 text-gray-700"
                        >
                          Cerrar vista
                        </button>
                      </div>

                      <div className="p-3">
                        {receiptIsImage ? (
                          <img
                            src={receiptUrl}
                            alt="Comprobante de pago"
                            className="w-full max-h-[520px] object-contain rounded-lg"
                            loading="lazy"
                          />
                        ) : (
                          <iframe
                            title="Comprobante"
                            src={receiptUrl}
                            className="w-full h-[520px] rounded-lg"
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tabla productos */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  Productos ({productos.length})
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3 text-center">Cant.</th>
                      <th className="px-4 py-3 text-right">Precio compra</th>
                      <th className="px-4 py-3 text-right">IVA%</th>
                      <th className="px-4 py-3 text-right">ICU%</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {productos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          Esta compra no tiene productos registrados.
                        </td>
                      </tr>
                    ) : (
                      productos.map((p, idx) => {
                        const cantidad = Number(p?.cantidad || 0);
                        const precioCompra = Number(p?.precioCompra ?? p?.precio ?? 0);
                        const ivaPct = Number(p?.subida ?? 0);
                        const icuPct = Number(p?.descuento ?? 0);

                        const subtotal = computeSubtotal(p);

                        return (
                          <tr key={`${p?.productoId ?? idx}`}>
                            <td className="px-4 py-3 text-gray-900 font-medium">
                              <div className="max-w-[520px] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {p?.nombre ?? "—"}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-center text-gray-700">{cantidad}</td>

                            <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                              {money(precioCompra)}
                            </td>

                            <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                              {ivaPct.toLocaleString("es-CO")}%
                            </td>

                            <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                              {icuPct.toLocaleString("es-CO")}%
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-green-700 whitespace-nowrap">
                              {money(subtotal)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-xl shadow-sm">
                <p className="text-xs text-green-800">Total a pagar</p>
                <p className="text-xl font-extrabold text-green-800">{money(totalCompra)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
              type="button"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
