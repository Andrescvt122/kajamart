import React, { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAtuh";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import {
  ViewButton,
  PrinterButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import PurchaseDetailModal from "./PurchaseDetailModal";

export default function IndexPurchases() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("Crear compra");
  const canAnnular = hasPermission("Anular compra");

  // =========================
  // ✅ DATA REAL: LocalStorage (sin compras quemadas)
  // (Hasta que conectes hook/API)
  // =========================
  const purchases = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("compras")) || [];
      // Normalizar para que tu UI no se rompa si la data viene diferente
      return (Array.isArray(raw) ? raw : []).map((c) => ({
        id: c.id ?? c._id ?? "",
        factura: c.factura ?? c.numero_factura ?? c.comprobante?.name ?? "—",
        proveedor: c.proveedor?.nombre ?? c.proveedor ?? "—",
        nit: c.proveedor?.nit ?? c.nit ?? "—",
        subtotal: Number(c.subtotal ?? 0),
        total: Number(c.total ?? 0),
        fecha: c.fecha ?? c.created_at ?? new Date().toISOString().slice(0, 10),
        estado: c.estado ?? "Completada",
        productos: Array.isArray(c.productos) ? c.productos : [],
        comprobante: c.comprobante ?? null,
        raw: c,
      }));
    } catch {
      return [];
    }
  }, []);

  // =========================
  // UI State
  // =========================
  const perPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // =========================
  // Derived state (filtro + paginación)
  // =========================
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return purchases;

    return purchases.filter((p) =>
      `${p.proveedor} ${p.estado} ${p.fecha} ${p.factura} ${p.nit}`
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
  }, [filtered, currentPage, perPage]);

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

  const handleCloseModal = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedPurchase(null);
  }, []);

  const handlePrint = useCallback((purchase) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const productosHtml = (purchase.productos || [])
      .map(
        (p) =>
          `<tr>
            <td>${p.nombre ?? "—"}</td>
            <td>${p.cantidad ?? 0}</td>
            <td>$${Number(p.precioCompra ?? p.precio ?? 0).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const contenido = `
      <html>
        <head>
          <title>Compra ${purchase.factura}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; color: #16a34a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h2>Detalle de Compra - ${purchase.factura}</h2>
          <p><b>Fecha:</b> ${purchase.fecha}</p>
          <p><b>Proveedor:</b> ${purchase.proveedor}</p>
          <p><b>NIT:</b> ${purchase.nit}</p>
          <p><b>Total:</b> $${Number(purchase.total || 0).toFixed(2)}</p>
          <table>
            <thead>
              <tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
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

      {/* Contenedor principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">Compras</h2>
              <p className="text-sm text-gray-500 mt-1">
                Historial y análisis de compras realizadas.
              </p>
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
                  setCurrentPage(1);
                }}
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton>Excel</ExportExcelButton>
              <ExportPDFButton>PDF</ExportPDFButton>

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
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">N° Factura</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {pageItems.length === 0 ? (
                    <motion.tr
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td
                        colSpan={6}
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
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {p.fecha}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {p.factura}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {p.proveedor}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          ${Number(p.total || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              p.estado === "Completada" || p.estado === "Completado"
                                ? "bg-green-50 text-green-700"
                                : p.estado === "Pendiente"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <ViewButton event={() => handleViewDetails(p)} />
                            <PrinterButton alert={() => handlePrint(p)} />
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
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

      {/* Modal de detalle */}
      {isDetailOpen && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
