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


export default function IndexPurchases() {
    const navigate = useNavigate();
  const [purchases] = useState([
    {
      id: "C001",
      proveedor: "Global Supplies Inc.",
      subtotal: 1200,
      iva: 19,
      icu: 15,
      total: 1608,
      fecha: "2024-07-26",
      estado: "Completada",
    },
    {
      id: "C002",
      proveedor: "Local Goods Co.",
      subtotal: 850,
      iva: 8,
      icu: 0,
      total: 918,
      fecha: "2024-07-25",
      estado: "Anulada",
    },
    {
      id: "C003",
      proveedor: "Tech Gadgets Ltd.",
      subtotal: 2500,
      iva: 19,
      icu: 15,
      total: 3350,
      fecha: "2024-07-24",
      estado: "Anulada",
    },
    {
      id: "C004",
      proveedor: "Office Essentials LLC",
      subtotal: 450,
      iva: 0,
      icu: 0,
      total: 450,
      fecha: "2024-07-23",
      estado: "Completada",
    },
    {
      id: "C005",
      proveedor: "Wholesale Foods Corp.",
      subtotal: 1800,
      iva: 8,
      icu: 15,
      total: 2190,
      fecha: "2024-07-22",
      estado: "Completada",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return purchases;
    return purchases.filter((v) =>
      `${v.proveedor} ${v.estado} ${v.fecha}`.toLowerCase().includes(s)
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

  return (
    <div className="flex min-h-screen">
      {/* Fondo de ondas */}
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
        {/* Contenido */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Compras</h2>
              <p className="text-sm text-gray-500 mt-1">Historial de compras</p>
            </div>
          </div>

          {/* Barra búsqueda + botones */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por proveedor, fecha o estado..."
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
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nueva Compra
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Subtotal</th>
                  <th className="px-6 py-4">IVA</th>
                  <th className="px-6 py-4">ICU</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {pageItems.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-gray-400"
                      >
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
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {v.proveedor}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          ${v.subtotal.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {v.iva}%
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {v.icu}%
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          ${v.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {v.fecha}
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
                            <ViewButton />
                            <PrinterButton />
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          <Paginator
            currentPage={currentPage}
            perPage={perPage}
            totalPages={totalPages}
            filteredLength={filtered.length}
            goToPage={goToPage}
          />
        </div>
      </div>
    </div>
  );
}
