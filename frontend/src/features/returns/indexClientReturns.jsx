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
import {
  showInfoAlert,
  showInputAlert,
  showLoadingAlert,
} from "../../shared/alerts";

export default function IndexClientReturns() {
const [returns] = useState([
  {
    idReturn: 1,
    idSale: 101,
    dateReturn: "2023-11-01",
    client: "Juan Pérez",
    reason: "Producto defectuoso",
    typeReturn: "Reembolso del dinero",
    total: 5000,
  },
  {
    idReturn: 2,
    idSale: 102,
    dateReturn: "2023-11-05",
    client: "María Gómez",
    reason: "Cambio de talla",
    typeReturn: "Cambio por otro producto",
    total: 3500,
  },
  {
    idReturn: 3,
    idSale: 103,
    dateReturn: "2023-11-10",
    client: "Carlos López",
    reason: "Producto vencido",
    typeReturn: "Reembolso del dinero",
    total: 4200,
  },
  {
    idReturn: 4,
    idSale: 104,
    dateReturn: "2023-11-12",
    client: "Ana Martínez",
    reason: "Producto dañado",
    typeReturn: "Reembolso del dinero",
    total: 2800,
  },

  // 40 más
  { idReturn: 5, idSale: 105, dateReturn: "2023-11-14", client: "Pedro Sánchez", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 3100 },
  { idReturn: 6, idSale: 106, dateReturn: "2023-11-15", client: "Laura Torres", reason: "Producto vencido", typeReturn: "Cambio por otro producto", total: 2900 },
  { idReturn: 7, idSale: 107, dateReturn: "2023-11-16", client: "Andrés Castro", reason: "Producto no requerido", typeReturn: "Reembolso del dinero", total: 3600 },
  { idReturn: 8, idSale: 108, dateReturn: "2023-11-17", client: "Sofía Ramírez", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 4100 },
  { idReturn: 9, idSale: 109, dateReturn: "2023-11-18", client: "Ricardo Díaz", reason: "Producto dañado", typeReturn: "Cambio por otro producto", total: 2700 },
  { idReturn: 10, idSale: 110, dateReturn: "2023-11-19", client: "Daniela Herrera", reason: "Producto no requerido", typeReturn: "Reembolso del dinero", total: 3500 },
  { idReturn: 11, idSale: 111, dateReturn: "2023-11-20", client: "Felipe Morales", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 4300 },
  { idReturn: 12, idSale: 112, dateReturn: "2023-11-21", client: "Valentina López", reason: "Producto dañado", typeReturn: "Cambio por otro producto", total: 3900 },
  { idReturn: 13, idSale: 113, dateReturn: "2023-11-22", client: "Camilo Rojas", reason: "Producto no requerido", typeReturn: "Reembolso del dinero", total: 3100 },
  { idReturn: 14, idSale: 114, dateReturn: "2023-11-23", client: "Gabriela Méndez", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 4500 },
  { idReturn: 15, idSale: 115, dateReturn: "2023-11-24", client: "José Fernández", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 2500 },
  { idReturn: 16, idSale: 116, dateReturn: "2023-11-25", client: "Natalia Vargas", reason: "Producto no requerido", typeReturn: "Cambio por otro producto", total: 2800 },
  { idReturn: 17, idSale: 117, dateReturn: "2023-11-26", client: "Diego Castillo", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 3000 },
  { idReturn: 18, idSale: 118, dateReturn: "2023-11-27", client: "Mónica Reyes", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 4700 },
  { idReturn: 19, idSale: 119, dateReturn: "2023-11-28", client: "Sebastián Ortega", reason: "Producto no requerido", typeReturn: "Cambio por otro producto", total: 3200 },
  { idReturn: 20, idSale: 120, dateReturn: "2023-11-29", client: "Patricia Gómez", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 2900 },
  { idReturn: 21, idSale: 121, dateReturn: "2023-11-30", client: "Jorge Navarro", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 4200 },
  { idReturn: 22, idSale: 122, dateReturn: "2023-12-01", client: "Carolina Silva", reason: "Producto no requerido", typeReturn: "Reembolso del dinero", total: 3400 },
  { idReturn: 23, idSale: 123, dateReturn: "2023-12-02", client: "Alejandro Pérez", reason: "Producto vencido", typeReturn: "Cambio por otro producto", total: 3100 },
  { idReturn: 24, idSale: 124, dateReturn: "2023-12-03", client: "Lucía Torres", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 3800 },
  { idReturn: 25, idSale: 125, dateReturn: "2023-12-04", client: "Manuel Gutiérrez", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 3600 },
  { idReturn: 26, idSale: 126, dateReturn: "2023-12-05", client: "Paola Romero", reason: "Producto no requerido", typeReturn: "Cambio por otro producto", total: 3300 },
  { idReturn: 27, idSale: 127, dateReturn: "2023-12-06", client: "Tomás Mendoza", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 4100 },
  { idReturn: 28, idSale: 128, dateReturn: "2023-12-07", client: "Isabela Duarte", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 2900 },
  { idReturn: 29, idSale: 129, dateReturn: "2023-12-08", client: "Mauricio Peña", reason: "Producto no requerido", typeReturn: "Reembolso del dinero", total: 3500 },
  { idReturn: 30, idSale: 130, dateReturn: "2023-12-09", client: "Carmen Álvarez", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 4000 },
  { idReturn: 31, idSale: 131, dateReturn: "2023-12-10", client: "Rodrigo Campos", reason: "Producto dañado", typeReturn: "Cambio por otro producto", total: 2600 },
  { idReturn: 32, idSale: 132, dateReturn: "2023-12-11", client: "Fernanda Vega", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 3900 },
  { idReturn: 33, idSale: 133, dateReturn: "2023-12-12", client: "Óscar Jiménez", reason: "Producto no requerido", typeReturn: "Reembolso del dinero", total: 2800 },
  { idReturn: 34, idSale: 134, dateReturn: "2023-12-13", client: "Liliana Cárdenas", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 3600 },
  { idReturn: 35, idSale: 135, dateReturn: "2023-12-14", client: "Esteban Ruiz", reason: "Producto dañado", typeReturn: "Cambio por otro producto", total: 3100 },
  { idReturn: 36, idSale: 136, dateReturn: "2023-12-15", client: "Verónica Lozano", reason: "Producto no requerido", typeReturn: "Reembolso del dinero", total: 4200 },
  { idReturn: 37, idSale: 137, dateReturn: "2023-12-16", client: "Martín Salazar", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 3700 },
  { idReturn: 38, idSale: 138, dateReturn: "2023-12-17", client: "Adriana Muñoz", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 4500 },
  { idReturn: 39, idSale: 139, dateReturn: "2023-12-18", client: "Gustavo León", reason: "Producto no requerido", typeReturn: "Cambio por otro producto", total: 3400 },
  { idReturn: 40, idSale: 140, dateReturn: "2023-12-19", client: "Mariana Fajardo", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 3000 },
  { idReturn: 41, idSale: 141, dateReturn: "2023-12-20", client: "Pablo Hernández", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 3100 },
  { idReturn: 42, idSale: 142, dateReturn: "2023-12-21", client: "Lorena Pardo", reason: "Producto no requerido", typeReturn: "Cambio por otro producto", total: 2700 },
  { idReturn: 43, idSale: 143, dateReturn: "2023-12-22", client: "Héctor Aguirre", reason: "Producto vencido", typeReturn: "Reembolso del dinero", total: 3600 },
  { idReturn: 44, idSale: 144, dateReturn: "2023-12-23", client: "Andrea Beltrán", reason: "Producto dañado", typeReturn: "Reembolso del dinero", total: 3900 },
]);



  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // Normalización de texto
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

  // Animaciones
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
    <>
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

      {/* Contenido */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Devoluciones de clientes</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administrador de tienda
            </p>
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
              placeholder="Buscar devoluciones..."
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
              onClick={() => console.log("Registrar nueva devolución")}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              Registrar nueva devolución
            </button>
          </div>
        </div>

        {/* Tabla con animación */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">Devolución</th>
                <th className="px-6 py-4">Venta</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Razón</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Total</th>
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
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No se encontraron devoluciones.
                  </td>
                </tr>
              ) : (
                pageItems.map((s, i) => (
                  <motion.tr
                    key={s.idReturn + "-" + i}
                    className="hover:bg-gray-50"
                    variants={rowVariants}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {s.idReturn}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.idSale}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700">
                      {s.dateReturn}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.client}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                        {s.typeReturn}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${s.total}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ViewButton
                          alert={() => showInfoAlert("Ver devolución")}
                        />
                        <EditButton
                          alert={() => showLoadingAlert("Editar devolución")}
                        />
                        <DeleteButton
                          alert={() => showInputAlert("Eliminar devolución")}
                        />
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
    </>
  );
}
