import React, { useMemo, useState } from "react";
import {
  ExportExcelButton,
  ExportPDFButton,
  ViewDetailsButton,
} from "../../../shared/components/buttons";
import { Search, Loader2 } from "lucide-react";
import ondas from "../../../assets/ondasHorizontal.png";
import Paginator from "../../../shared/components/paginator";
import { motion } from "framer-motion";
import RegisterLow from "./modals/registerLow";
import DetailsLow from "./modals/detailsLow";
import generateProductLowsPDF from "./helpers/exportToPdf";
import generateProductLowsXLS from "./helpers/exportToXls";
import { useGetLowProducts } from "../../../shared/components/hooks/lowProducts/useGetLowProducts";


export default function IndexLow() {
  const { data: lows, loading, error, refetch } = useGetLowProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLow, setSelectedLow] = useState(null);
  const perPage = 6;

  // Normalización de texto
  const normalizeText = (text) =>
    text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Filtrado + expansión de productos
  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    const match = (val) => normalizeText(String(val ?? "")).includes(s);

    const expanded = lows.flatMap((low) =>
      low.products.map((product) => ({
        ...low,
        currentProduct: product,
      }))
    );

    if (!s) return expanded;

    return expanded.filter((item) =>
      Object.values(item).some((val) =>
        typeof val === "object"
          ? Object.values(val).some((v) => match(v))
          : match(val)
      )
    );
  }, [lows, searchTerm]);

  // Paginación basada en filas (productos)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  const handleConfirmLow = () => {
    refetch();
  };

  return (
    <>
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

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Productos de baja</h2>
            <p className="text-sm text-gray-500 mt-1">Administrador de tienda</p>
          </div>
        </div>

        {/* Buscador y botones */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar bajas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:flex-nowrap sm:justify-end">
            <ExportExcelButton event={() => generateProductLowsXLS(filtered)}>
              Excel
            </ExportExcelButton>
            <ExportPDFButton event={() => generateProductLowsPDF(filtered)}>
              PDF
            </ExportPDFButton>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
            >
              Registrar nueva baja
            </button>
          </div>
        </div>

        {/* Tabla */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              Error al cargar las bajas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table key={currentPage} className="min-w-full lg:min-w-[720px]">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-6 py-4">Baja</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Cantidad</th>
                    <th className="px-6 py-4">Razón</th>
                    <th className="px-6 py-4">Responsable</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <motion.tbody className="divide-y divide-gray-100">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No se encontraron productos dados de baja.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item, i) => (
                      <motion.tr
                        key={`${item.idLow}-${item.currentProduct.id}-${i}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.idLow}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-700">
                          {item.dateLow}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.currentProduct.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.currentProduct.lowQuantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.currentProduct.reason}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                            {item.responsible}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <ViewDetailsButton
                              event={() => {
                                setSelectedLow(item);
                                setIsOpen(true);
                              }}
                            />
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </motion.tbody>
              </table>
            </div>
          )}
        </motion.div>


        {/* Paginador */}
        <div className="pb-4">
          <Paginator
            currentPage={currentPage}
            perPage={perPage}
            totalPages={totalPages}
            filteredLength={filtered.length}
            goToPage={goToPage}
          />
        </div>
      </div>

      {/* Modal de registro */}
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