import React, { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/useAtuh";
import { exportPurchaseReceiptPDF } from "../purchases/helper/eportPurchaseReceiptPDF";


import ondas from "../../assets/ondasHorizontal.png";

import Paginator from "../../shared/components/paginator";
import {
  ViewButton,
  PrinterButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";

import PurchaseDetailModal from "./PurchaseDetailModal";

// ✅ Helpers exportación
import { exportPurchasesToExcel } from "./helper/exportPurchasesExcel";
import { exportPurchasesToPdf } from "./helper/exportPurchasesPdf";

// ✅ API
import api from "../../api/axiosConfig";

// Helpers UI
const onlyDate = (v) => (v ? String(v).slice(0, 10) : "—");
const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

// ✅ Anulación (30 minutos) — solo UI por ahora
const MAX_MINUTES_ANNUL = 30;
const diffMinutesFromNow = (isoDate) => {
  const t = new Date(isoDate).getTime();
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 60000;
};
const canAnnulPurchase = (purchase) => {
  const mins = diffMinutesFromNow(purchase?.fecha);
  return mins >= 0 && mins < MAX_MINUTES_ANNUL;
};
const isAnulada = (estado) => {
  const s = String(estado || "").toLowerCase();
  return s === "anulada" || s === "anulado" || s === "cancelada" || s === "cancelado";
};

// ✅ util: unique conservando orden
const uniqueKeepOrder = (arr) => {
  const out = [];
  const seen = new Set();
  for (const x of arr) {
    const v = String(x || "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
};

const ONE_LINE_SAFE =
  "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";

function ChevronIcon({ open }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      className="text-gray-500"
    >
      <path
        d="M5.5 7.5l4.5 4 4.5-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

export default function IndexPurchases() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission("Crear compra");
  const canAnnular = hasPermission("Anular compra");

  // ✅ fuerza refresh compras
  const [comprasVersion, setComprasVersion] = useState(0);

  // =========================
  // Purchases desde BACKEND
  // =========================
  const [purchasesApi, setPurchasesApi] = useState([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [apiError, setApiError] = useState("");

  const fetchPurchases = useCallback(async () => {
    try {
      setIsLoadingApi(true);
      setApiError("");

      const { data } = await api.get("/purchase");
      const arr = Array.isArray(data) ? data : [];
      setPurchasesApi(arr);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Error cargando compras desde el servidor.";
      setApiError(msg);
      setPurchasesApi([]);
    } finally {
      setIsLoadingApi(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases, comprasVersion]);

  // =========================
  // (Opcional) LocalStorage legacy
  // =========================
  const purchasesLocal = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("compras")) || [];
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }, [comprasVersion]);

  // =========================
  // Normalizar compras API => UI shape
  // ✅ AGRUPA detalle_compra por producto (sin duplicar)
  // ✅ GUARDA vencimientos/códigos por paquete (arrays)
  // =========================
  const normalizedApiPurchases = useMemo(() => {
    return purchasesApi.map((c) => {
      const id = c?.id_compra ?? c?.id ?? c?._id ?? "";

      // factura fallback: id_compra => 003 etc.
      const factura =
        c?.numero_factura ??
        c?.num_factura ??
        c?.factura ??
        (id ? String(id).padStart(3, "0") : "—");

      const proveedorNombre =
        c?.proveedores?.nombre ??
        c?.proveedor?.nombre ??
        c?.proveedor_nombre ??
        "—";

      const proveedorNit =
        c?.proveedores?.nit ??
        c?.proveedor?.nit ??
        c?.proveedor_nit ??
        "—";

      const fecha =
        c?.fecha_compra ??
        c?.fecha ??
        c?.created_at ??
        new Date().toISOString();

      const estado = c?.estado_compra ?? c?.estado ?? "Completada";
      const total = Number(c?.total ?? 0);

      // ✅ AGRUPAR detalle_compra por producto
      const productos = (() => {
        const det = Array.isArray(c?.detalle_compra) ? c.detalle_compra : [];
        const map = new Map();

        for (const d of det) {
          // id producto (si existe)
          const idProducto =
            d?.detalle_productos?.productos?.id_producto ??
            d?.detalle_productos?.id_producto ??
            d?.id_producto ??
            d?.productoId ??
            null;

          const nombre =
            d?.detalle_productos?.productos?.nombre ??
            d?.productos?.nombre ??
            d?.nombre ??
            "—";

          // key estable para agrupar
          const key = idProducto ?? nombre;

          // cantidades de este detalle
          const paquetes = Number(d?.cantidad_paquetes ?? d?.cantidad ?? 1) || 1;
          const unidPorPaq = Number(d?.unidades_por_paquete ?? 0) || 0;

          const totalUnid =
            Number(d?.cantidad_total_unidades ?? 0) || paquetes * unidPorPaq;

          // impuestos
          const iva = Number(d?.iva_porcentaje ?? 0) || 0;
          const icu = Number(d?.icu_porcentaje ?? 0) || 0;

          // precios
          const precioCompra = Number(d?.precio_unitario ?? 0) || 0;
          const precioVenta = Number(d?.precio_venta ?? 0) || 0;

          // vencimiento y codigo (por paquete)
          const fechaVenc =
            d?.detalle_productos?.fecha_vencimiento ??
            d?.fecha_vencimiento ??
            "";

          const codigo =
            d?.detalle_productos?.codigo_barras_producto_compra ??
            d?.codigo_barras_producto_compra ??
            "";

          if (!map.has(key)) {
            map.set(key, {
              productoId: idProducto,
              nombre,

              // ✅ cantidades agregadas
              cantidad_paquetes: 0,
              unidades_por_paquete: unidPorPaq,
              cantidad_total_unidades: 0,

              precioCompra,
              precioVenta,
              iva_porcentaje: iva,
              icu_porcentaje: icu,

              // ✅ arrays por paquete
              vencimientos: [],
              codigosBarras: [],
            });
          }

          const acc = map.get(key);

          // acumuladores
          acc.cantidad_paquetes += paquetes;
          acc.unidades_por_paquete = Math.max(acc.unidades_por_paquete, unidPorPaq);
          acc.cantidad_total_unidades += totalUnid;

          // últimos valores “actuales”
          acc.precioCompra = precioCompra;
          acc.precioVenta = precioVenta;
          acc.iva_porcentaje = iva;
          acc.icu_porcentaje = icu;

          // push vencimientos/códigos (1 por cada detalle/paquete)
          if (fechaVenc) acc.vencimientos.push(String(fechaVenc).slice(0, 10));
          if (codigo) acc.codigosBarras.push(String(codigo));
        }

        // ✅ IMPORTANTE:
        // - vencimientos NO se deduplican (para que salgan 2 fechas aunque sean iguales)
        // - codigos sí se puede deduplicar si quieres
        return Array.from(map.values()).map((p) => ({
          ...p,
          vencimientos: (p.vencimientos || []).filter(Boolean),
          codigosBarras: uniqueKeepOrder(p.codigosBarras),
        }));
      })();

      // comprobante
      const comprobante = {
        name: c?.comprobante_nombre ?? null,
        type: c?.comprobante_mime ?? null,
        url: c?.comprobante_url ?? null,
        size: c?.comprobante_size ?? null,
      };

      return {
        id: String(id),
        factura: String(factura),
        proveedor: proveedorNombre,
        nit: String(proveedorNit),
        total,
        fecha: typeof fecha === "string" ? fecha : new Date(fecha).toISOString(),
        estado,

        // ✅ lo que consume el modal
        productos,

        comprobante,
        raw: c,
      };
    });
  }, [purchasesApi]);

  // =========================
  // Normalizar Local => UI shape (legacy)
  // =========================
  const normalizedLocalPurchases = useMemo(() => {
    return purchasesLocal.map((c) => {
      const id = c?.id ?? c?._id ?? "";
      const factura = c?.numero_factura ?? c?.num_factura ?? c?.factura ?? "—";

      const proveedorNombre =
        c?.proveedor?.nombre ??
        (typeof c?.proveedor === "string" ? c.proveedor : null) ??
        "—";

      const proveedorNit = c?.proveedor?.nit ?? c?.nit ?? "—";
      const fecha = c?.fecha ?? c?.created_at ?? new Date().toISOString();
      const estado = c?.estado ?? "Completada";

      return {
        id: String(id),
        factura: String(factura),
        proveedor: proveedorNombre,
        nit: String(proveedorNit ?? "—"),
        total: Number(c?.total ?? 0),
        fecha,
        estado,
        productos: Array.isArray(c?.productos) ? c.productos : [],
        comprobante: c?.comprobante ?? null,
        raw: c,
      };
    });
  }, [purchasesLocal]);

  // =========================
  // Lista final (API + Local sin duplicar)
  // =========================
  const purchases = useMemo(() => {
  const apiIds = new Set(normalizedApiPurchases.map((p) => String(p.id)));

  const localNoDup = normalizedLocalPurchases.filter(
    (p) => !apiIds.has(String(p.id))
  );

  const merged = [...normalizedApiPurchases, ...localNoDup];

  // ✅ Ordenar por número de factura ASC (001 → último)
  return merged.sort((a, b) => {
    const fa = Number(a.factura) || 0;
    const fb = Number(b.factura) || 0;
    return fa - fb;
  });

}, [normalizedApiPurchases, normalizedLocalPurchases]);


  // =========================
  // UI State
  // =========================
  const perPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState(new Set());

  // Modal detalle
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // =========================
  // Filtro + Paginación
  // =========================
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return purchases;

    return purchases.filter((p) =>
      `${p.proveedor} ${p.estado} ${onlyDate(p.fecha)} ${p.factura} ${p.nit}`
        .toLowerCase()
        .includes(s)
    );
  }, [purchases, searchTerm]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / perPage)),
    [filtered.length]
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(Math.max(1, prev), totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  // =========================
  // Handlers
  // =========================
  const goToPage = useCallback(
    (n) => {
      const p = Math.min(Math.max(1, n), totalPages);
      setCurrentPage(p);
    },
    [totalPages]
  );

  const handleViewDetails = useCallback((purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailOpen(true);
  }, []);
  const toggleExpand = useCallback((rowId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedPurchase(null);
  }, []);

  // ✅ Anular compra (solo UI por ahora)
 const handleAnnulPurchase = useCallback(
  async (purchase) => {
    if (!purchase) return;

    // 1) permisos
    if (!canAnnular) {
      await Swal.fire({
        icon: "warning",
        title: "Sin permisos",
        text: "No tienes permisos para anular compras.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    // 2) ya cancelada
    if (isAnulada(purchase.estado)) {
      await Swal.fire({
        icon: "info",
        title: "Compra cancelada",
        text: "Esta compra ya fue cancelada previamente.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    // 3) ventana 30 min
    const mins = diffMinutesFromNow(purchase.fecha);

    if (!(mins >= 0 && mins < MAX_MINUTES_ANNUL)) {
      await Swal.fire({
        icon: "warning",
        title: "Tiempo agotado",
        text: `Han pasado más de ${MAX_MINUTES_ANNUL} minutos. Esta compra ya no puede anularse.`,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#6b7280",
      });
      return; // ⛔ NO permitir continuar
    }
    // 4) pedir motivo
    const { value: motivo } = await Swal.fire({
      title: "Motivo de anulación",
      input: "textarea",
      inputLabel: `Factura: ${purchase.factura}`,
      inputPlaceholder: "Escriba el motivo de la anulación...",
      inputAttributes: {
        maxlength: 300,
      },
      showCancelButton: true,
      confirmButtonText: "Confirmar anulación",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      inputValidator: (value) => {
        if (!value || value.trim().length < 5) {
          return "Debe ingresar un motivo válido (mínimo 5 caracteres)";
        }
      },
    });

    if (!motivo) return;

    // 5) llamar backend con motivo
    try {
      await api.put(`/purchase/${purchase.id}/cancel`, {
        motivo: motivo.trim(),
      });

      // refrescar lista
      setComprasVersion((v) => v + 1);

      await Swal.fire({
        icon: "success",
        title: "Compra anulada",
        text: "La compra fue cancelada y el stock fue revertido.",
        confirmButtonColor: "#16a34a",
      });
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo cancelar la compra.";

      await Swal.fire({
        icon: status === 409 ? "info" : "error",
        title: status === 409 ? "No se puede anular" : "No se pudo cancelar",
        text: msg,
        confirmButtonColor: "#16a34a",
      });
    }
  },
  [canAnnular]
);
  // =========================
  // Print Compra
  // =========================
const handleDownloadReceiptPdf = useCallback((purchase) => {
  console.log("CLICK PDF", purchase);
  exportPurchaseReceiptPDF({
    purchase,
    filename: `recibo_compra_${purchase.factura}.pdf`,
  });
}, []);


  const handlePrint = useCallback((purchase) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const productosHtml = (purchase.productos || [])
      .map((p) => {
        const nombre = p?.nombre ?? "—";
        const paq = Number(p?.cantidad_paquetes ?? 0);
        const precio = Number(p?.precioCompra ?? 0);

        return `
          <tr>
            <td>${nombre}</td>
            <td>${paq}</td>
            <td>$${precio.toFixed(0)}</td>
          </tr>
        `;
      })
      .join("");

    const contenido = `
      <html>
        <head>
          <title>Compra ${purchase.factura}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; color: #16a34a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h2>Detalle de Compra - ${purchase.factura}</h2>
          <p><b>Fecha:</b> ${onlyDate(purchase.fecha)}</p>
          <p><b>Proveedor:</b> ${purchase.proveedor}</p>
          <p><b>NIT:</b> ${purchase.nit}</p>
          <p><b>Total:</b> ${money(purchase.total)}</p>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Paquetes</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>${productosHtml}</tbody>
          </table>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(contenido);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    };
  }, []);

  // =========================
  // Render
  // =========================
  return (
    <div className="flex min-h-screen">
      {/* Fondo decorativo */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          zIndex: 0,
        }}
      />

      <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip">
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Compras</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Historial y análisis de compras realizadas.
              </p>
              {apiError ? (
                <p className="text-sm text-red-600 mt-2">{apiError}</p>
              ) : null}
            </div>
          </div>

          {/* Buscador + botones */}
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_auto_auto] items-center gap-3">
              <div className="relative min-w-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>

                <input
                  type="text"
                  placeholder="Buscar por factura, proveedor, NIT, fecha o estado..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 pr-4 py-3 w-full rounded-full border text-gray-500 border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="flex gap-2">
                <ExportExcelButton event={() => exportPurchasesToExcel(filtered)}>
                  Excel
                </ExportExcelButton>

                <ExportPDFButton
                  event={() =>
                    exportPurchasesToPdf({
                      rows: filtered,
                      filename: "compras.pdf",
                    })
                  }
                >
                  PDF
                </ExportPDFButton>
              </div>

              <div className="hidden xl:block" />

              <button
                onClick={() => navigate("/app/purchases/register")}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition w-full xl:w-auto"
                hidden={!canCreate}
              >
                Registrar Nueva Compra
              </button>
            </div>
          </div>

          <motion.div
            className="md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isLoadingApi ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                Cargando compras...
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron compras.
              </div>
            ) : (
              <motion.ul className="space-y-3">
                {pageItems.map((p) => {
                  const rowId = String(p.id);
                  const isExpanded = expanded.has(rowId);
                  const annulled = isAnulada(p.estado);

                  return (
                    <motion.li
                      key={`${rowId}-mobile`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(rowId)}
                        className="w-full p-4 text-left"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                                Factura {p.factura}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-[2px] text-[11px] font-semibold rounded-full ${
                                  annulled
                                    ? "bg-red-100 text-red-700"
                                    : p.estado === "Completada" || p.estado === "Completado"
                                    ? "bg-green-50 text-green-700"
                                    : p.estado === "Pendiente"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.estado}
                              </span>
                            </div>
                            <p className={`mt-1 text-base font-semibold text-gray-900 ${ONE_LINE_SAFE}`}>
                              {p.proveedor}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {onlyDate(p.fecha)}
                            </p>
                          </div>
                          <ChevronIcon open={isExpanded} />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="px-4 py-4 space-y-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">NIT</p>
                                  <p className="mt-1 font-medium text-gray-800">{p.nit}</p>
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Total</p>
                                  <p className="mt-1 font-medium text-gray-800">{money(p.total)}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                                <button
                                  type="button"
                                  onClick={() => handleAnnulPurchase(p)}
                                  disabled={!canAnnular || annulled}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                    !canAnnular || annulled
                                      ? "opacity-70 cursor-not-allowed"
                                      : "cursor-pointer hover:opacity-90"
                                  } ${
                                    annulled
                                      ? "bg-red-100 text-red-700"
                                      : p.estado === "Completada" || p.estado === "Completado"
                                      ? "bg-green-50 text-green-700"
                                      : p.estado === "Pendiente"
                                      ? "bg-yellow-50 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {p.estado}
                                </button>
                                <ViewButton event={() => handleViewDetails(p)} />
                                <PrinterButton
                                  event={() =>
                                    exportPurchaseReceiptPDF({
                                      purchase: p,
                                      filename: `recibo_compra_${p.factura}.pdf`,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </motion.div>

          {/* Tabla */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <colgroup>
                  <col className="w-[160px]" />
                  <col className="w-[260px]" />
                  <col className="w-[160px]" />
                  <col className="w-[140px]" />
                  <col className="w-[160px]" />
                  <col className="w-[140px]" />
                  <col className="w-[120px]" />
                </colgroup>

                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                    <th className="px-4 py-4">N° Factura</th>
                    <th className="px-4 py-4">Proveedor</th>
                    <th className="px-4 py-4">NIT</th>
                    <th className="px-4 py-4 text-right">Total</th>
                    <th className="px-4 py-4">Fecha</th>
                    <th className="px-4 py-4">Estado</th>
                    <th className="px-4 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {isLoadingApi ? (
                      <motion.tr
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-gray-400"
                        >
                          Cargando compras...
                        </td>
                      </motion.tr>
                    ) : pageItems.length === 0 ? (
                      <motion.tr
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-gray-400"
                        >
                          No se encontraron compras.
                        </td>
                      </motion.tr>
                    ) : (
                      pageItems.map((p) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap truncate">
                            {p.factura}
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-700 truncate">
                            {p.proveedor}
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate">
                            {p.nit}
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                            {money(p.total)}
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {onlyDate(p.fecha)}
                          </td>

                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleAnnulPurchase(p)}
                              disabled={!canAnnular || isAnulada(p.estado)}
                              title={
                                !canAnnular
                                  ? "No tienes permiso para anular"
                                  : isAnulada(p.estado)
                                  ? "Esta compra ya está anulada"
                                  : canAnnulPurchase(p)
                                  ? "Click para anular (menos de 30 min)"
                                  : `No se puede anular: tiempo agotado (${MAX_MINUTES_ANNUL} min)`
                              }
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition
                                ${
                                  !canAnnular || isAnulada(p.estado)
                                    ? "opacity-70 cursor-not-allowed"
                                    : "cursor-pointer hover:opacity-90"
                                }
                                ${
                                  isAnulada(p.estado)
                                    ? "bg-red-100 text-red-700"
                                    : p.estado === "Completada" ||
                                      p.estado === "Completado"
                                    ? "bg-green-50 text-green-700"
                                    : p.estado === "Pendiente"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                            >
                              {p.estado}
                            </button>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <ViewButton event={() => handleViewDetails(p)} />
                              <PrinterButton
                                event={() => {
                                  console.log("CLICK PDF", p);
                                  exportPurchaseReceiptPDF({
                                    purchase: p,
                                    filename: `recibo_compra_${p.factura}.pdf`,
                                  });
                                }}
                              />
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <Paginator
            currentPage={currentPage}
            perPage={perPage}
            totalPages={totalPages}
            filteredLength={filtered.length}
            goToPage={goToPage}
          />
        </div>
      </div>

      {/* Modal */}
      {isDetailOpen && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
