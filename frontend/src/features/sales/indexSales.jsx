import React, { useMemo, useState } from "react";
import Sidebar from "../../shared/sidebar";
import { Search, Printer, Eye } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/paginator";
import { ExportExcelButton, ExportPDFButton } from "../../shared/buttons";

export default function IndexSales() {
  const [sales] = useState([
    {
      id: "V001",
      fecha: "2023-12-01",
      cliente: "Sofía Rodríguez",
      total: 250000,
      medioPago: "Tarjeta",
      estado: "Completada",
      codigoBarras: "1234567890123",
    },
    {
      id: "V002",
      fecha: "2023-12-05",
      cliente: "Carlos López",
      total: 150000,
      medioPago: "Efectivo",
      estado: "Anulada",
      codigoBarras: "9876543210987",
    },
    {
      id: "V003",
      fecha: "2023-12-10",
      cliente: "Diego García",
      total: 320000,
      medioPago: "Transferencia",
      estado: "Completada",
      codigoBarras: "4567891234567",
    },
    {
      id: "V003",
      fecha: "2023-12-10",
      cliente: "Diego García",
      total: 320000,
      medioPago: "Transferencia",
      estado: "Completada",
      codigoBarras: "4567891234567",
    },
    {
      id: "V004",
      fecha: "2023-12-10",
      cliente: "Diego García",
      total: 320000,
      medioPago: "Transferencia",
      estado: "Completada",
      codigoBarras: "4567891234567",
    },
    {
      id: "V005",
      fecha: "2023-12-10",
      cliente: "Diego García",
      total: 320000,
      medioPago: "Transferencia",
      estado: "Completada",
      codigoBarras: "4567891234567",
    },
    {
      id: "V006",
      fecha: "2023-12-10",
      cliente: "Diego García",
      total: 320000,
      medioPago: "Transferencia",
      estado: "Completada",
      codigoBarras: "4567891234567",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return sales;
    return sales.filter((v) =>
      `${v.fecha} ${v.cliente} ${v.medioPago} ${v.estado} ${v.codigoBarras}`
        .toLowerCase()
        .includes(s)
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

  return (
    <div className="flex min-h-screen">

      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
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

        {/* Contenido encima */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Ventas</h2>
              <p className="text-sm text-gray-500 mt-1">Historial de ventas</p>
            </div>
          </div>

          {/* Barra de búsqueda + botones */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por cliente, fecha, estado, código..."
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
              <button className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700">
                Registrar Nueva Venta
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">ID Venta</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Medio de Pago</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Código de Barras</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron ventas.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((v, i) => (
                    <tr key={v.id + "-" + i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {v.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {v.fecha}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {v.cliente}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${v.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {v.medioPago}
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {v.codigoBarras}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
                            <Printer size={16} />
                          </button>
                          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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