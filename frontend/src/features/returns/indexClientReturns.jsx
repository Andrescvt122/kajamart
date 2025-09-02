import React, { useMemo, useState } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/buttons";
import { Search } from "lucide-react";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/paginator";
import { motion } from "framer-motion";
export default function IndexClientReturns() {
  const [returns] = useState([
    {
      idReturn: 1,
      idSale: 1,
      dateReturn: "2023-10-01",
      client: "Juan Perez",
      reason: "Producto defectuoso",
      typeReturn: "Reembolso del dinero",
      total: 5000,
    },
    {
      idReturn: 2,
      idSale: 2,
      dateReturn: "2023-10-02",
      client: "Maria Gomez",
      reason: "Cambio de producto",
      typeReturn: "Cambio por otro producto",
      total: 3000,
    },
    {
      idReturn: 3,
      idSale: 3,
      dateReturn: "2023-10-03",
      client: "Carlos Lopez",
      reason: "Producto vencido",
      typeReturn: "Reembolso del dinero",
      total: 4500,
    },
    {
      idReturn: 4,
      idSale: 4,
      dateReturn: "2023-10-04",
      client: "Ana Martinez",
      reason: "Producto defectuoso",
      typeReturn: "Cambio por otro producto",
      total: 6000,
    },
    {
      idReturn: 5,
      idSale: 5,
      dateReturn: "2023-10-05",
      client: "Luis Rodriguez",
      reason: "Cambio de producto",
      typeReturn: "Reembolso del dinero",
      total: 3500,
    },
    {
      idReturn: 6,
      idSale: 6,
      dateReturn: "2023-10-06",
      client: "Sofia Hernandez",
      reason: "Producto vencido",
      typeReturn: "Cambio por otro producto",
      total: 4000,
    },
    {
      idReturn: 7,
      idSale: 7,
      dateReturn: "2023-10-07",
      client: "Miguel Torres",
      reason: "Producto defectuoso",
      typeReturn: "Reembolso del dinero",
      total: 5500,
    },
    {
      idReturn: 8,
      idSale: 8,
      dateReturn: "2023-10-08",
      client: "Laura Garcia",
      reason: "Cambio de producto",
      typeReturn: "Cambio por otro producto",
      total: 2500,
    },
    {
      idReturn: 9,
      idSale: 9,
      dateReturn: "2023-10-09",
      client: "Jorge Ramirez",
      reason: "Producto vencido",
      typeReturn: "Reembolso del dinero",
      total: 7000,
    },
    {
      idReturn: 10,
      idSale: 10,
      dateReturn: "2023-10-10",
      client: "Elena Flores",
      reason: "Producto defectuoso",
      typeReturn: "Cambio por otro producto",
      total: 8000,
    },
    {
      idReturn: 11,
      idSale: 11,
      dateReturn: "2023-10-11",
      client: "Pedro Sanchez",
      reason: "Cambio de producto",
      typeReturn: "Reembolso del dinero",
      total: 4500,
    },
    {
      idReturn: 12,
      idSale: 12,
      dateReturn: "2023-10-12",
      client: "Marta Diaz",
      reason: "Producto vencido",
      typeReturn: "Cambio por otro producto",
      total: 6000,
    },
    {
      idReturn: 13,
      idSale: 13,
      dateReturn: "2023-10-13",
      client: "Diego Morales",
      reason: "Producto defectuoso",
      typeReturn: "Reembolso del dinero",
      total: 5200,
    },
    {
      idReturn: 14,
      idSale: 14,
      dateReturn: "2023-10-14",
      client: "Carmen Ruiz",
      reason: "Cambio de producto",
      typeReturn: "Cambio por otro producto",
      total: 3300,
    },
    {
      idReturn: 15,
      idSale: 15,
      dateReturn: "2023-10-15",
      client: "Rafael Jimenez",
      reason: "Producto vencido",
      typeReturn: "Reembolso del dinero",
      total: 4800,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // 🔑 Normalizar texto (quita tildes, mayúsculas, etc.)
  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return returns;

    return returns.filter((p) =>
      Object.values(p).some((value) => normalizeText(value).includes(s))
    );
  }, [returns, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // 🎬 Variantes de animación
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen">
      {/* Contenido principal */}
      {/* Fondo de ondas */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%", // Solo mitad inferior
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
              <h2 className="text-3xl font-semibold">Devolucion a clientes</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administrador de tienda
              </p>
            </div>
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
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                style={{ color: "#000" }} // fuerza el texto negro si Tailwind no aplica
              />
            </div>
            <input
              type="text"
              placeholder="Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              style={{ color: "#000" }} // fuerza el texto negro si Tailwind no aplica
            />
          </div>
            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton>Excel</ExportExcelButton>
              <ExportPDFButton>PDF</ExportPDFButton>
              <button
                onClick={() => console.log("Registrar nuevo proveedor")}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nueva devolucion a cliente
              </button>
            </div>
          </div>
        </div>
          {/* Tabla con animación */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            key={currentPage} // 👈 cambia la animación en cada paginación
          >
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">Devolcion</th>
                  <th className="px-6 py-4">Venta</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Razon</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Tipo de devolucion</th>
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
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontro devolucion a clientes
                    </td>
                  </tr>
                ) : (
                  pageItems.map((s, i) => (
                    <motion.tr
                      key={s.idReturn + "-" + i}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {s.idReturn}
                      </td>
                      <td className="px-6 py-4 align-top text-sm font-medium text-gray-600">
                        {s.idSale}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-green-700">
                        {s.dateReturn}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {s.client}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {s.reason}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600">
                        {s.total}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                          {s.typeReturn}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewButton />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </motion.div>

          {/* Paginador */}
          <Paginator
            currentPage={currentPage}
            perPage={perPage}
            totalPages={totalPages}
            filteredLength={filtered.length}
            goToPage={goToPage}
          />
        </div>

        {/* Paginador - componente separado */}
        <Paginator
          currentPage={currentPage}
          perPage={perPage}
          totalPages={totalPages}
          filteredLength={filtered.length}
          goToPage={goToPage}
        />
      </div>
    </>
  );
}
