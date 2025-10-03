import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import {
  ViewButton,
  PrinterButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import SaleDetailModal from "./SaleDetailModal";

// ✅ Función para formatear dinero
const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

  
export default function IndexSales() {
  const navigate = useNavigate();

  const [sales] = useState([
    {
      id: "V001",
      fecha: "2023-12-01",
      cliente: "Sofía Rodríguez",
      total: 250000,
      medioPago: "Tarjeta",
      iva: 47500,
      icu: 2000,
      estado: "Completada",
    },
    {
      id: "V002",
      fecha: "2023-12-05",
      cliente: "Carlos López",
      total: 150000,
      medioPago: "Efectivo",
      iva: 28500,
      icu: 1200,
      estado: "Completada",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const [selectedSale, setSelectedSale] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Función para abrir modal
  const handleView = (sale) => {
    setSelectedSale(sale);
    setIsViewModalOpen(true);
  };

  // ✅ Normalizar texto para búsqueda
  const normalizeText = (text) =>
    String(text ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // ✅ Filtro de búsqueda
  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return sales;
    return sales.filter((v) =>
      Object.values(v).some((value) =>
        normalizeText(value).includes(s)
      )
    );
  }, [sales, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // ✅ Animaciones
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  // Formateo de IVA y ICU
  const formatCurrency = (value) => Number(value.toFixed(2));
  // ✅ Botón de imprimir venta con estilo original y funcionalidad
const PrintSaleButton = ({ sale }) => (
  <PrinterButton
    alert={() => {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Venta ${sale.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              td, th { border: 1px solid #ddd; padding: 8px; }
              th { background-color: #f4f4f4; text-align: left; }
            </style>
          </head>
          <body>
            <h2>Detalle de Venta - ${sale.id}</h2>
            <table>
              <tr><th>ID Venta</th><td>${sale.id}</td></tr>
              <tr><th>Fecha</th><td>${sale.fecha}</td></tr>
              <tr><th>Cliente</th><td>${sale.cliente}</td></tr>
              <tr><th>Total</th><td>${formatMoney(sale.total)}</td></tr>
              <tr><th>Medio de Pago</th><td>${sale.medioPago}</td></tr>
              <tr><th>IVA</th><td>${Number(sale.iva.toFixed(2))}</td></tr>
              <tr><th>ICU</th><td>${Number(sale.icu.toFixed(2))}</td></tr>
              <tr><th>Estado</th><td>${sale.estado}</td></tr>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }}
  />
);


  return (
    <>
      {/* Fondo ondas */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          transform: "scaleX(1.15)",
          zIndex: 0,
        }}
      />

      {/* Contenedor principal */}
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Ventas</h2>
            <p className="text-sm text-gray-500 mt-1">Historial de ventas</p>
          </div>
        </div>

        {/* Barra búsqueda + botones */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <ExportExcelButton>Excel</ExportExcelButton>
            <ExportPDFButton>PDF</ExportPDFButton>
            <button
              onClick={() => navigate("/app/sales/register")}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              Registrar Nueva Venta
            </button>
          </div>
        </div>

        {/* Tabla de ventas */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <table key={currentPage} className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">ID Venta</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Medio de Pago</th>
                <th className="px-6 py-4">IVA</th>
                <th className="px-6 py-4">ICU</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <motion.tbody
              className="divide-y divide-gray-100"
              variants={tableVariants}
            >
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No se encontraron ventas.
                  </td>
                </tr>
              ) : (
                pageItems.map((v, i) => (
                  <motion.tr
                    key={v.id + "-" + i}
                    className="hover:bg-gray-50"
                    variants={rowVariants}
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">{v.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {v.fecha}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {v.cliente}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatMoney(v.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {v.medioPago}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCurrency(v.iva)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCurrency(v.icu)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
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
                        <ViewButton event={() => handleView(v)} />
                        <PrintSaleButton sale={v} />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </motion.div>

        {/* Paginación */}
        <Paginator
          currentPage={currentPage}
          perPage={perPage}
          totalPages={totalPages}
          filteredLength={filtered.length}
          goToPage={goToPage}
        />

        {/* Modal de detalles */}
        <SaleDetailModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          sale={selectedSale}
        />
      </div>
    </>
  );
}
