import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import {
  ViewButton,
  PrinterButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import { useNavigate } from "react-router-dom";
import PurchaseDetailModal from "./PurchaseDetailModal";

export default function IndexPurchases() {
  const navigate = useNavigate();

  // 🧾 Datos simulados de compras con NIT incluido
  const [purchases] = useState([
    {
      id: "C001",
      factura: "FAC-0001",
      proveedor: "Global Supplies Inc.",
      nit: "900123456-1",
      subtotal: 1200,
      total: 1608,
      fecha: "2024-07-26",
      estado: "Completada",
      productos: [
        { nombre: "Papel A4", cantidad: 10, precio: 12 },
        { nombre: "Tinta HP", cantidad: 3, precio: 45 },
      ],
    },
    {
      id: "C002",
      factura: "FAC-0002",
      proveedor: "Local Goods Co.",
      nit: "900987654-2",
      subtotal: 850,
      total: 918,
      fecha: "2024-07-25",
      estado: "Anulada",
      productos: [
        { nombre: "Cajas de cartón", cantidad: 5, precio: 20 },
        { nombre: "Cinta adhesiva", cantidad: 10, precio: 3 },
      ],
    },
    {
      id: "C003",
      factura: "FAC-0003",
      proveedor: "Tech Hardware Ltd.",
      nit: "900112233-3",
      subtotal: 2300,
      total: 2777,
      fecha: "2024-07-24",
      estado: "Completada",
      productos: [
        { nombre: "Mouse inalámbrico", cantidad: 15, precio: 25 },
        { nombre: "Teclado mecánico", cantidad: 10, precio: 75 },
        { nombre: "USB 32GB", cantidad: 20, precio: 10 },
      ],
    },
    {
      id: "C004",
      factura: "FAC-0004",
      proveedor: "Office Essentials",
      nit: "900445566-4",
      subtotal: 1450,
      total: 1705,
      fecha: "2024-07-23",
      estado: "Pendiente",
      productos: [
        { nombre: "Archivadores", cantidad: 12, precio: 15 },
        { nombre: "Marcadores", cantidad: 30, precio: 2 },
        { nombre: "Resmas de papel", cantidad: 8, precio: 14 },
      ],
    },
    {
      id: "C005",
      factura: "FAC-0005",
      proveedor: "Industrial Tools SA",
      nit: "900667788-5",
      subtotal: 3100,
      total: 3725,
      fecha: "2024-07-22",
      estado: "Completada",
      productos: [
        { nombre: "Taladros eléctricos", cantidad: 5, precio: 200 },
        { nombre: "Martillos", cantidad: 20, precio: 25 },
        { nombre: "Destornilladores", cantidad: 50, precio: 5 },
      ],
    },
    {
      id: "C006",
      factura: "FAC-0006",
      proveedor: "Stationery World",
      nit: "900998877-6",
      subtotal: 600,
      total: 708,
      fecha: "2024-07-21",
      estado: "Completada",
      productos: [
        { nombre: "Lápices", cantidad: 50, precio: 1 },
        { nombre: "Gomas de borrar", cantidad: 20, precio: 2 },
        { nombre: "Cuadernos", cantidad: 10, precio: 10 },
      ],
    },
  ]);

  // 🔹 Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const perPage = 5;

  // 🔍 Filtro
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return purchases;
    return purchases.filter((v) =>
      `${v.proveedor} ${v.estado} ${v.fecha} ${v.factura} ${v.nit}`
        .toLowerCase()
        .includes(s)
    );
  }, [purchases, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // 👁 Ver detalles
  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailOpen(true);
  };

  // ❌ Cerrar modal
  const handleCloseModal = () => {
    setIsDetailOpen(false);
    setSelectedPurchase(null);
  };

  // 🖨 Imprimir
  const handlePrint = (purchase) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const productosHtml = purchase.productos
      .map(
        (p) =>
          `<tr>
            <td>${p.nombre}</td>
            <td>${p.cantidad}</td>
            <td>$${p.precio.toFixed(2)}</td>
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
          <p><b>Total:</b> $${purchase.total.toFixed(2)}</p>
          <table>
            <thead>
              <tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
            </thead>
            <tbody>${productosHtml}</tbody>
          </table>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(contenido);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    };
  };

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
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">Compras</h2>
              <p className="text-sm text-gray-500 mt-1">
                Historial y análisis de compras realizadas.
              </p>
            </div>
          </div>

          {/* 🔍 Buscador + botones */}
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
              >
                Registrar Nueva Compra
              </button>
            </div>
          </div>

          {/* 🧾 Tabla */}
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
                    <motion.tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No se encontraron compras.
                      </td>
                    </motion.tr>
                  ) : (
                    pageItems.map((v, i) => (
                      <motion.tr
                        key={v.id + "-" + i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">{v.fecha}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{v.factura}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{v.proveedor}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          ${v.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              v.estado === "Completada"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {v.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <ViewButton event={() => handleViewDetails(v)} />
                            <PrinterButton alert={() => handlePrint(v)} />
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* 📄 Paginación */}
          <Paginator
            currentPage={currentPage}
            perPage={perPage}
            totalPages={totalPages}
            filteredLength={filtered.length}
            goToPage={goToPage}
          />
        </div>
      </div>

      {/* 🪟 Modal de detalle */}
      {isDetailOpen && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
