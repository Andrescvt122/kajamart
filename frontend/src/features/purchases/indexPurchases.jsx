import React, { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/useAtuh";
import { exportPurchaseReceiptPDF } from "../purchases/helper/eportPurchaseReceiptPDF";
import { useFetchPurchases as useSearchPurchases } from "../../shared/components/hooks/search/useFetchPruchases";


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
import { useAnnulmentWindow } from "../../shared/components/hooks/useAnnulmentWindow";

// Helpers UI
const onlyDate = (v) => (v ? String(v).slice(0, 10) : "—");
const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const isAnulada = (estado) => {
  const s = String(estado || "").toLowerCase();
  return s === "anulada" || s === "anulado" || s === "cancelada" || s === "cancelado";
};
const normalizeDateTimeValue = (value, fallback = new Date().toISOString()) => {
  if (!value) return fallback;
  if (typeof value === "string") return value;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
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

const normalizeApiPurchasesForUI = (list) => {
  return (list || []).map((c) => {
    const id = c?.id_compra ?? c?.id ?? c?._id ?? "";

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
    const createdAt =
      c?.created_at ??
      c?.createdAt ??
      c?.fecha_creacion ??
      fecha;

    const estado = c?.estado_compra ?? c?.estado ?? "Completada";
    const total = Number(c?.total ?? 0);

    const productos = (() => {
      const det = Array.isArray(c?.detalle_compra) ? c.detalle_compra : [];
      const map = new Map();

      for (const d of det) {
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

        const key = idProducto ?? nombre;
        const paquetes = Number(d?.cantidad_paquetes ?? d?.cantidad ?? 1) || 1;
        const unidPorPaq = Number(d?.unidades_por_paquete ?? 0) || 0;
        const totalUnid =
          Number(d?.cantidad_total_unidades ?? 0) || paquetes * unidPorPaq;
        const iva = Number(d?.iva_porcentaje ?? 0) || 0;
        const icu = Number(d?.icu_porcentaje ?? 0) || 0;
        const precioCompra = Number(d?.precio_unitario ?? 0) || 0;
        const precioVenta = Number(d?.precio_venta ?? 0) || 0;

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
            cantidad_paquetes: 0,
            unidades_por_paquete: unidPorPaq,
            cantidad_total_unidades: 0,
            precioCompra,
            precioVenta,
            iva_porcentaje: iva,
            icu_porcentaje: icu,
            vencimientos: [],
            codigosBarras: [],
          });
        }

        const acc = map.get(key);

        acc.cantidad_paquetes += paquetes;
        acc.unidades_por_paquete = Math.max(acc.unidades_por_paquete, unidPorPaq);
        acc.cantidad_total_unidades += totalUnid;
        acc.precioCompra = precioCompra;
        acc.precioVenta = precioVenta;
        acc.iva_porcentaje = iva;
        acc.icu_porcentaje = icu;

        if (fechaVenc) acc.vencimientos.push(String(fechaVenc).slice(0, 10));
        if (codigo) acc.codigosBarras.push(String(codigo));
      }

      return Array.from(map.values()).map((p) => ({
        ...p,
        vencimientos: (p.vencimientos || []).filter(Boolean),
        codigosBarras: uniqueKeepOrder(p.codigosBarras),
      }));
    })();

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
      fecha: normalizeDateTimeValue(fecha),
      createdAt: normalizeDateTimeValue(createdAt, normalizeDateTimeValue(fecha)),
      estado,
      productos,
      comprobante,
      raw: c,
    };
  });
};

export default function IndexPurchases() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { getAnnulmentMeta } = useAnnulmentWindow();

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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const trimmedSearchTerm = searchTerm.trim();
  const isSearchMode = trimmedSearchTerm.length > 0;
  const {
    data: searchedPurchasesApi,
    loading: searchLoading,
    error: searchError,
  } = useSearchPurchases(trimmedSearchTerm);


 const fetchPurchases = useCallback(async () => {
  try {
    setIsLoadingApi(true);
    setApiError("");

    const { data } = await api.get(`/purchase?page=${page}&limit=10`);

    const arr = Array.isArray(data.data) ? data.data : [];
    setPurchasesApi(arr);
    setTotalPages(data.pagination?.totalPages || 1);
    setTotalItems(data.pagination?.total || 0);
    setPerPage(data.pagination?.limit || 10);

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
}, [page]);

useEffect(() => {
  fetchPurchases();
}, [fetchPurchases, comprasVersion, page]);

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
  const normalizedApiPurchases = useMemo(
    () => normalizeApiPurchasesForUI(purchasesApi),
    [purchasesApi]
  );
  const normalizedSearchedApiPurchases = useMemo(
    () => normalizeApiPurchasesForUI(searchedPurchasesApi),
    [searchedPurchasesApi]
  );

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
      const createdAt = c?.created_at ?? c?.createdAt ?? c?.fecha_creacion ?? fecha;
      const estado = c?.estado ?? "Completada";

      return {
        id: String(id),
        factura: String(factura),
        proveedor: proveedorNombre,
        nit: String(proveedorNit ?? "—"),
        total: Number(c?.total ?? 0),
        fecha: normalizeDateTimeValue(fecha),
        createdAt: normalizeDateTimeValue(createdAt, normalizeDateTimeValue(fecha)),
        estado,
        productos: Array.isArray(c?.productos) ? c.productos : [],
        comprobante: c?.comprobante ?? null,
        raw: c,
      };
    });
  }, [purchasesLocal]);

  const getPurchaseAnnulmentMeta = useCallback(
    (purchase) =>
      getAnnulmentMeta(
        purchase?.createdAt ??
          purchase?.raw?.created_at ??
          purchase?.raw?.createdAt ??
          purchase?.fecha ??
          null,
        !isAnulada(purchase?.estado)
      ),
    [getAnnulmentMeta]
  );

  const canAnnulPurchase = useCallback(
    (purchase) => !getPurchaseAnnulmentMeta(purchase).isDisabled,
    [getPurchaseAnnulmentMeta]
  );

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

  // Modal detalle
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [expanded, setExpanded] = useState(new Set());

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

  const searchedLocalPurchases = useMemo(() => {
    if (!isSearchMode) return [];

    const s = trimmedSearchTerm.toLowerCase();

    return normalizedLocalPurchases.filter((p) =>
      `${p.proveedor} ${p.estado} ${onlyDate(p.fecha)} ${p.factura} ${p.nit} ${p.total}`
        .toLowerCase()
        .includes(s)
    );
  }, [isSearchMode, normalizedLocalPurchases, trimmedSearchTerm]);

  const searchedPurchases = useMemo(() => {
    if (!isSearchMode) return [];

    const apiIds = new Set(normalizedSearchedApiPurchases.map((p) => String(p.id)));
    const localNoDup = searchedLocalPurchases.filter(
      (p) => !apiIds.has(String(p.id))
    );

    return [...normalizedSearchedApiPurchases, ...localNoDup].sort((a, b) => {
      const fa = Number(a.factura) || 0;
      const fb = Number(b.factura) || 0;
      return fa - fb;
    });
  }, [isSearchMode, normalizedSearchedApiPurchases, searchedLocalPurchases]);

  const pageSize = perPage || 10;
  const searchTotalPages = Math.max(1, Math.ceil(searchedPurchases.length / pageSize));
  const safeSearchPage = Math.min(searchPage, searchTotalPages);
  const searchPageStart = (safeSearchPage - 1) * pageSize;

  const displayedPurchases = useMemo(() => {
    if (!isSearchMode) return filtered;
    return searchedPurchases.slice(searchPageStart, searchPageStart + pageSize);
  }, [filtered, isSearchMode, searchedPurchases, searchPageStart, pageSize]);

  const currentPageValue = isSearchMode ? safeSearchPage : page;
  const currentTotalPages = isSearchMode ? searchTotalPages : totalPages;
  const currentTotalItems = isSearchMode ? searchedPurchases.length : totalItems;
  const currentLoading = isSearchMode ? searchLoading : isLoadingApi;
  const currentError = isSearchMode ? searchError : apiError;

  // =========================
  // Handlers
  // =========================
  const goToPage = useCallback(
    (n) => {
      if (isSearchMode) {
        const p = Math.min(Math.max(1, n), searchTotalPages);
        setSearchPage(p);
        return;
      }

      const p = Math.min(Math.max(1, n), totalPages);
      setPage(p);
    },
    [isSearchMode, searchTotalPages, totalPages]
  );

  const handleViewDetails = useCallback((purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedPurchase(null);
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
    const annulmentMeta = getPurchaseAnnulmentMeta(purchase);

    if (annulmentMeta.hasExpired) {
      await Swal.fire({
        icon: "warning",
        title: "Tiempo agotado",
        text: `Han pasado más de ${annulmentMeta.limitMinutes} minutos. Esta compra ya no puede anularse.`,
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

      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">Compras</h2>
              <p className="text-sm text-gray-500 mt-1">
                Historial y análisis de compras realizadas.
              </p>
              {currentError ? (
                <p className="text-sm text-red-600 mt-2">{currentError}</p>
              ) : null}
            </div>
          </div>

          {/* Buscador + botones */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>

              <input
                type="text"
                placeholder="Buscar por factura, proveedor, NIT, fecha o estado..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchPage(1);
                }}
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 text-black"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton
                event={() =>
                  exportPurchasesToExcel(
                    isSearchMode ? searchedPurchases : filtered
                  )
                }
              >
                Excel
              </ExportExcelButton>

              <ExportPDFButton
                event={() =>
                  exportPurchasesToPdf({
                    rows: isSearchMode ? searchedPurchases : filtered,
                    filename: "compras.pdf",
                  })
                }
              >
                PDF
              </ExportPDFButton>

              <button
                onClick={() => navigate("/app/purchases/register")}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                hidden={!canCreate}
              >
                Registrar Nueva Compra
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                    {currentLoading ? (
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
                    ) : displayedPurchases.length === 0 ? (
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
                      displayedPurchases.map((p) => (
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
                                  : `No se puede anular: tiempo agotado (${getPurchaseAnnulmentMeta(p).limitMinutes} min)`
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
            currentPage={currentPageValue}
            perPage={pageSize}
            totalPages={currentTotalPages}
            filteredLength={displayedPurchases.length}
            totalItems={currentTotalItems}
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