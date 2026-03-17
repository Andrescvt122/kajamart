// PurchaseDetailModal.jsx
import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const safeNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const onlyDate = (v) => (v ? String(v).slice(0, 10) : "—");

const formatPurchaseId = (val) => {
  if (val == null) return "—";
  const s = String(val).trim();
  if (!s) return "—";
  const n = Number(s);
  if (Number.isFinite(n) && n > 0) return String(Math.trunc(n));
  return s;
};

const pick = (obj, ...keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v) !== "") return v;
  }
  return null;
};

const isImageLike = (url = "", mime = "") => {
  const m = String(mime || "").toLowerCase();
  if (m.startsWith("image/")) return true;
  const clean = String(url || "").split("?")[0].split("#")[0].toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|tif|tiff|ico|avif)$/i.test(clean);
};

const getQty = (p) => {
  const paquetes = Math.max(
    0,
    safeNum(
      pick(p, "cantidad_paquetes", "cantidadPaquetes", "paquetes", "qty_paq", "cantidad", "qty"),
      0
    )
  );

  const unidPorPaq = Math.max(
    0,
    safeNum(
      pick(
        p,
        "unidades_por_paquete",
        "unidadesPorPaquete",
        "unidadesPaquete",
        "unidades_paquete",
        "unidad_por_paquete",
        "unidades_x_paquete",
        "unid_por_paquete"
      ),
      0
    )
  );

  const totalUnid = Math.max(
    0,
    safeNum(
      pick(
        p,
        "cantidad_total_unidades",
        "cantidadTotalUnidades",
        "total_unidades",
        "unidades_totales",
        "cantidad_unidades"
      ),
      paquetes * unidPorPaq
    )
  );

  return { paquetes, unidPorPaq, totalUnid };
};

const computeLine = (p) => {
  const { paquetes } = getQty(p);

  const precioCompra = safeNum(p?.precioCompra ?? p?.precio_unitario ?? p?.precio ?? 0, 0);

  const ivaPct = safeNum(p?.iva_porcentaje ?? p?.subida ?? 0, 0);
  const icuPct = safeNum(p?.icu_porcentaje ?? p?.descuento ?? 0, 0);

  const base = precioCompra * paquetes;
  const iva = (base * ivaPct) / 100;
  const icu = (base * icuPct) / 100;

  const subtotal = base + iva + icu;

  return { base, iva, icu, subtotal, precioCompra, ivaPct, icuPct };
};

export default function PurchaseDetailModal({ purchase, onClose }) {
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);

  useEffect(() => {
    if (!purchase) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [purchase]);

  useEffect(() => {
    if (!purchase) return;
    setShowReceiptViewer(false);
  }, [purchase]);

  if (!purchase) return null;

  // =========================
  // Normalización: Compra
  // =========================
  const purchaseId = formatPurchaseId(pick(purchase, "id", "_id", "id_compra"));
  const estado = pick(purchase, "estado", "estado_compra") ?? "—";

  // ✅ NUEVO: motivo de anulación
  const motivoAnulacion =
    purchase?.motivo_anulacion ??
    purchase?.motivo ??
    purchase?.raw?.motivo_anulacion ??
    purchase?.raw?.motivo ??
    null;

  const factura =
    pick(purchase, "numero_factura", "num_factura", "factura") ??
    (purchaseId !== "—" ? String(purchaseId).padStart(3, "0") : "—");

  const fechaRaw = pick(
    purchase,
    "fecha",
    "fecha_compra",
    "fecha_registro",
    "createdAt",
    "created_at"
  );
  const fecha = fechaRaw
    ? new Date(fechaRaw).toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const proveedorNombre =
    purchase?.proveedor?.nombre ??
    purchase?.proveedores?.nombre ??
    pick(purchase, "proveedor", "proveedor_nombre") ??
    "—";

  const proveedorNit =
    purchase?.proveedor?.nit ??
    purchase?.proveedores?.nit ??
    pick(purchase, "nit", "proveedor_nit") ??
    "—";

  const productos = useMemo(() => {
    const arr = purchase?.productos;
    return Array.isArray(arr) ? arr : [];
  }, [purchase]);

  const rawDetalle = useMemo(() => {
    const det = purchase?.raw?.detalle_compra;
    return Array.isArray(det) ? det : [];
  }, [purchase]);

  const getVencimientosFromRaw = (p) => {
    const nombre = String(p?.nombre ?? "").trim();
    const pid = p?.productoId ?? null;

    const list = rawDetalle
      .filter((d) => {
        const pidD =
          d?.detalle_productos?.productos?.id_producto ??
          d?.detalle_productos?.id_producto ??
          d?.id_producto ??
          null;

        const nomD =
          d?.detalle_productos?.productos?.nombre ?? d?.productos?.nombre ?? d?.nombre ?? "";

        if (pid != null && pidD != null) return String(pidD) === String(pid);
        return String(nomD).trim() === nombre;
      })
      .map((d) => {
        const f = d?.detalle_productos?.fecha_vencimiento ?? d?.fecha_vencimiento ?? null;
        return f ? String(f).slice(0, 10) : null;
      })
      .filter(Boolean);

    return list;
  };

  const receiptObj =
    typeof purchase?.comprobante === "object" && purchase?.comprobante ? purchase.comprobante : null;

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
    receiptObj?.mimetype ??
    receiptObj?.mime ??
    purchase?.comprobante?.mimetype ??
    purchase?.comprobante?.type ??
    "";

  const receiptSize =
    receiptObj?.size ?? purchase?.comprobante?.size ?? purchase?.raw?.comprobante_size ?? null;

  const hasReceipt = Boolean(receiptUrl);
  const receiptIsImage = hasReceipt ? isImageLike(receiptUrl, receiptMime) : false;

  const totals = useMemo(() => {
    return productos.reduce(
      (acc, p) => {
        const q = getQty(p);
        const ln = computeLine(p);

        acc.productos += 1;
        acc.paquetes += q.paquetes;
        acc.unidades += q.totalUnid;

        acc.base += ln.base;
        acc.iva += ln.iva;
        acc.icu += ln.icu;
        acc.total += ln.subtotal;

        return acc;
      },
      { productos: 0, paquetes: 0, unidades: 0, base: 0, iva: 0, icu: 0, total: 0 }
    );
  }, [productos]);

  const rawSubtotal = safeNum(purchase?.raw?.subtotal ?? purchase?.subtotal ?? 0, 0);
  const rawImpuestos = safeNum(purchase?.raw?.total_impuestos ?? purchase?.total_impuestos ?? 0, 0);
  const rawTotal = safeNum(purchase?.raw?.total ?? purchase?.total ?? 0, 0);

  const purchaseTotals = {
    subtotal: rawSubtotal > 0 ? rawSubtotal : totals.base,
    impuestos: rawImpuestos > 0 ? rawImpuestos : totals.iva + totals.icu,
    total: rawTotal > 0 ? rawTotal : totals.total,
  };

  const badgeClass = (() => {
    const s = String(estado || "").toLowerCase();
    if (s.includes("anul")) return "bg-red-100 text-red-700 border-red-200";
    if (s.includes("pend")) return "bg-yellow-50 text-yellow-800 border-yellow-200";
    if (s.includes("compl")) return "bg-green-50 text-green-700 border-green-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  })();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm px-3 sm:px-4 pt-4 pb-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden"
          initial={{ opacity: 0, scale: 0.98, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 border-b">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                  Detalles de la Compra
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                  <span className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
                    <b>Factura:</b> {factura}
                  </span>

                  <span className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
                    <b>ID:</b> {purchaseId}
                  </span>

                  <span className={`px-2 py-1 rounded-lg border ${badgeClass}`}>
                    <b>Estado:</b> {estado}
                  </span>
                </div>

                {/* ✅ MOTIVO SOLO SI ANULADA */}
                {String(estado).toLowerCase().includes("anul") && motivoAnulacion && (
                  <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    Motivo de anulación: {motivoAnulacion}
                  </div>
                )}
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
          </div>

          {/* Body */}
          <div className="px-4 sm:px-5 py-4 space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-gray-500">Productos</p>
                <p className="text-base font-extrabold text-gray-900">{totals.productos}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-gray-500">Paquetes</p>
                <p className="text-base font-extrabold text-gray-900">{totals.paquetes}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-gray-500">Unidades</p>
                <p className="text-base font-extrabold text-gray-900">{totals.unidades}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-gray-500">Subtotal</p>
                <p className="text-base font-extrabold text-gray-900">{money(purchaseTotals.subtotal)}</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-gray-500">Impuestos</p>
                <p className="text-base font-extrabold text-gray-900">{money(purchaseTotals.impuestos)}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-green-800">Total</p>
                <p className="text-base font-extrabold text-green-800">{money(purchaseTotals.total)}</p>
              </div>
            </div>

            {/* Secciones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-100 rounded-2xl p-3 lg:col-span-2">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Datos generales</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Fecha</p>
                    <p className="font-semibold text-gray-900">{fecha}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">N° Factura</p>
                    <p className="font-semibold text-gray-900">{factura}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">ID Compra</p>
                    <p className="font-semibold text-gray-900">{purchaseId}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Estado</p>
                    <p className="font-semibold text-gray-900">{estado}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Proveedor</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Nombre</p>
                    <p className="font-semibold text-gray-900 break-words">{proveedorNombre}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">NIT</p>
                    <p className="font-semibold text-gray-900 break-words">{proveedorNit}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprobante */}
            <div className="bg-white border border-gray-100 rounded-2xl p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900">Comprobante</h4>
                  <p className="text-sm text-gray-700 mt-1 break-words">
                    {hasReceipt ? receiptName : "—"}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-1">
                    {hasReceipt ? `${receiptMime || "—"}${receiptSize ? ` • ${receiptSize} bytes` : ""}` : ""}
                  </p>
                </div>

                <div className="shrink-0 flex gap-2">
                  <button
                    type="button"
                    disabled={!hasReceipt}
                    onClick={() => setShowReceiptViewer((v) => !v)}
                    className={[
                      "px-3 py-2 rounded-lg text-[11px] font-semibold",
                      hasReceipt
                        ? "bg-white border border-gray-200 hover:bg-gray-100 text-gray-800"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {showReceiptViewer ? "Ocultar" : "Ver"}
                  </button>

                  {hasReceipt && (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg text-[11px] font-semibold bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Abrir
                    </a>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showReceiptViewer && hasReceipt && (
                  <motion.div
                    className="mt-3 border border-gray-200 bg-white rounded-xl overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-gray-700">
                        {receiptIsImage ? "Vista previa (imagen)" : "Vista previa (documento)"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowReceiptViewer(false)}
                        className="text-[11px] px-2 py-1 rounded-md hover:bg-gray-200 text-gray-700"
                      >
                        Cerrar
                      </button>
                    </div>

                    <div className="p-2">
                      {receiptIsImage ? (
                        <img
                          src={receiptUrl}
                          alt="Comprobante"
                          className="w-full max-h-[220px] object-contain rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <iframe title="Comprobante" src={receiptUrl} className="w-full h-[220px] rounded-lg" />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Productos */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Productos</h4>
                  <p className="text-[12px] text-gray-500">
                    Subtotal por línea = (precio × paquetes) + IVA + ICU
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                  {productos.length} ítems
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr className="text-left text-[11px] text-gray-500 uppercase">
                      <th className="px-3 py-3">Producto</th>
                      <th className="px-3 py-3 text-center">Paq</th>
                      <th className="px-3 py-3 text-center">Unid/paq</th>
                      <th className="px-3 py-3 text-center">Total unid</th>
                      <th className="px-3 py-3 text-right">P. compra</th>
                      <th className="px-3 py-3 text-right">IVA</th>
                      <th className="px-3 py-3 text-right">ICU</th>
                      <th className="px-3 py-3 text-right">Subtotal</th>
                      <th className="px-3 py-3">Vencimientos</th>
                      <th className="px-3 py-3">Códigos</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {productos.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                          Esta compra no tiene productos registrados.
                        </td>
                      </tr>
                    ) : (
                      productos.map((p, idx) => {
                        const { paquetes, unidPorPaq, totalUnid } = getQty(p);
                        const ln = computeLine(p);

                        const vencs1 = Array.isArray(p?.vencimientos) ? p.vencimientos.filter(Boolean) : [];
                        const vencsFinal = vencs1.length > 0 ? vencs1 : getVencimientosFromRaw(p);

                        const codigos = Array.isArray(p?.codigosBarras)
                          ? p.codigosBarras.filter(Boolean)
                          : p?.codigoBarrasIngreso
                          ? [String(p.codigoBarrasIngreso)]
                          : [];

                        return (
                          <tr key={`${p?.productoId ?? idx}`} className="hover:bg-gray-50">
                            <td className="px-3 py-3 text-gray-900 font-semibold">
                              <div className="max-w-[320px] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {p?.nombre ?? "—"}
                              </div>
                            </td>

                            <td className="px-3 py-3 text-center font-semibold text-gray-900">{paquetes}</td>

                            <td className="px-3 py-3 text-center text-gray-700">{unidPorPaq}</td>

                            <td className="px-3 py-3 text-center text-gray-700">{totalUnid}</td>

                            <td className="px-3 py-3 text-right text-gray-700 whitespace-nowrap">
                              {money(ln.precioCompra)}
                            </td>

                            <td className="px-3 py-3 text-right text-gray-700 whitespace-nowrap">
                              {ln.ivaPct.toLocaleString("es-CO")}%
                            </td>

                            <td className="px-3 py-3 text-right text-gray-700 whitespace-nowrap">
                              {ln.icuPct.toLocaleString("es-CO")}%
                            </td>

                            <td className="px-3 py-3 text-right font-extrabold text-green-700 whitespace-nowrap">
                              {money(ln.subtotal)}
                            </td>

                            <td className="px-3 py-3 text-gray-700">
                              {vencsFinal.length === 0 ? (
                                "—"
                              ) : (
                                <div className="max-w-[240px] whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-xs">
                                  {vencsFinal.map((f, i) => (
                                    <div key={i}>{onlyDate(f)}</div>
                                  ))}
                                </div>
                              )}
                            </td>

                            <td className="px-3 py-3 text-gray-700">
                              {codigos.length === 0 ? (
                                "—"
                              ) : (
                                <div className="max-w-[320px] whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-xs">
                                  {codigos.map((c, i) => (
                                    <div key={i}>{c}</div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-3 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm font-semibold"
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
