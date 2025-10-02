import React, { useMemo, useState } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
  ViewDetailsButton,
} from "../../../shared/components/buttons";
import { Search } from "lucide-react";
import ondas from "../../../assets/ondasHorizontal.png";
import Paginator from "../../../shared/components/paginator";
import { motion } from "framer-motion";
import RegisterLow from "./modals/registerLow";
import DetailsLow from './modals/detailsLow';
import generateProductLowsPDF from "./helpers/exportToPdf";
import generateProductLowsXLS from "./helpers/exportToXls";

// Datos base de bajas
const baseLows = [];
for (let i = 1; i <= 44; i++) {
  baseLows.push({
    idLow: i,
    idDetailProduct: 100 + i,
    dateLow: `2023-11-${(i + 15) % 30 < 10 ? "0" : ""}${(i + 15) % 30}`,
    type: i % 3 === 0 ? "Reembolso del dinero" : "Cambio por otro producto",
    responsible: i % 3 === 0 ? "Arturo" : "Federico",
    cantidad: Math.floor(Math.random() * (5 - 1 + 1)) + 1,
    products:[
      { id: 1, name: "Producto A", lowQuantity: 2, quantity: 5,reason: i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",},
      { id: 2, name: "Producto B", lowQuantity: 1, quantity: 3,reason: i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",},
      { id: 3, name: "Producto C", lowQuantity: 4, quantity: 1,reason: i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite", },
      { id: 4, name: "Producto D", lowQuantity: 3, quantity: 8,reason: i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",},
      { id: 5, name: "Producto E", lowQuantity: 2, quantity: 6,reason: i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",},
    ]
  });
}


export default function IndexLow() {
  const [lows, setLows] = useState([...baseLows]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false); // 👈 Estado del modal
  const [selectedLow, setSelectedLow] = useState(null); // 👈 Estado para el producto de baja seleccionado
  const perPage = 6;

  // Normalización de texto
  const normalizeText = (text) =>
    text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return lows;
    return lows.filter((p) =>
      Object.values(p).some((value) => normalizeText(value).includes(s))
    );
  }, [lows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // 👇 Cuando se confirma un producto de baja en el modal
  const handleConfirmLow = (product) => {
    const newLow = {
      idLow: lows.length + 1,
      idDetailProduct: product.id,
      dateLow: new Date().toISOString().split("T")[0],
      reason: product.reason,
      responsible: "Administrador",
      cantidad: product.requestedQuantity,
    };
    // Insertar como primer registro
    setLows((prev) => [newLow, ...prev]);
    console.log("Nueva baja registrada:", newLow);
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
            <h2 className="text-3xl font-semibold">Productos de baja</h2>
            <p className="text-sm text-gray-500 mt-1">Administrador de tienda</p>
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
            <ExportExcelButton event={generateProductLowsXLS}>Excel</ExportExcelButton>
            <ExportPDFButton event={generateProductLowsPDF}>PDF</ExportPDFButton>
            <button
              onClick={() => setIsOpen(true)} // 👈 abre el modal
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              Registrar nueva baja
            </button>
          </div>
        </div>

        {/* Tabla con animación */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial="hidden"
          animate="visible"
        >
          <table key={currentPage} className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">Baja</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Responsable</th>
                <th className="px-6 py-4">Cantidad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <motion.tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No se encontraron devoluciones.
                  </td>
                </tr>
              ) : (
                pageItems.map((s, i) => (
                  <motion.tr
                    key={s.idLow + "-" + i}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {s.idLow}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.idDetailProduct}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700">
                      {s.dateLow}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                        {s.responsible}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.cantidad}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ViewDetailsButton event={() => {
                          setSelectedLow(s);
                          setIsOpen(true);
                        }} />
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

      {/* Modal de baja */}
      <RegisterLow
        isOpen={isOpen && !selectedLow}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirmLow}
      />

      {/* Modal de detalles */}
      <DetailsLow
        isOpen={isOpen && selectedLow !== null}
        onClose={() => {
          setIsOpen(false);
          setSelectedLow(null);
        }}
        lowData={selectedLow}
      />
    </>
  );
}