import React, { useMemo, useState } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
  ViewDetailsButton,
} from "../../../shared/components/buttons";
import { Search, Check, XCircle } from "lucide-react";
import ondas from "../../../assets/ondasHorizontal.png";
import Paginator from "../../../shared/components/paginator";
import { motion } from "framer-motion";
import ProductReturnModal from "./modals/register/ProductReturnModal";
import DetailsReturnProduct from "./modals/details/detailsReturnProduct";
import { generateProductReturnsPDF } from "./helper/exportToPdf";
import { generateProductReturnsXLS } from "./helper/exportToXls";
import { useFetchReturnProducts } from "../../../shared/components/hooks/returnProducts/useFetchReturnProducts";


export default function IndexProductReturns() {
  const {returns, loading, error, refetch} = useFetchReturnProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReturnData, setSelectedReturnData] = useState(null);
  const perPage = 6;

  // Normalización de texto
  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Función para aplanar los datos y mostrar productos individuales
  const flattenedProducts = useMemo(() => {
    return returns.flatMap(returnItem =>
      returnItem.products.map(products => ({
        idReturn: returnItem.idReturn,
        dateReturn: returnItem.dateReturn,
        responsable: returnItem.responsable,
        ...products
      }))
    );
  }, [returns]);

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return flattenedProducts;

    return flattenedProducts.filter((product) =>
      Object.values(product).some((value) => normalizeText(value).includes(s))
    );
  }, [flattenedProducts, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  const handleOpenReturnModal = () => {
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
    refetch();
  };

  const handleOpenDetailsModal = (productData) => {
    // Necesitamos encontrar la devolución completa que contiene este producto
    const returnItem = returns.find(r => r.idReturn === productData.idReturn);
    if (returnItem) {
      setSelectedReturnData(returnItem);
      setIsDetailsModalOpen(true);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedReturnData(null);
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
            <h2 className="text-3xl font-semibold">Devoluciones de productos</h2>
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
              placeholder="Buscar productos en devoluciones..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <ExportExcelButton event={() => generateProductReturnsXLS(filtered)}>Excel</ExportExcelButton>
            <ExportPDFButton event={() => generateProductReturnsPDF(filtered)}>PDF</ExportPDFButton>
            <motion.button
              onClick={handleOpenReturnModal}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all font-medium"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              Registrar nueva devolución
            </motion.button>
          </div>
        </div>

        {/* Tabla con animación */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <table key={currentPage} className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">Devolución</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Cantidad</th>
                <th className="px-6 py-4">Descuento</th>
                <th className="px-6 py-4">Razon</th>
                <th className="px-6 py-4">Responsable</th>
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
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No se encontraron productos en devoluciones.
                  </td>
                </tr>
              ) : (
                pageItems.map((products, i) => (
                  <motion.tr
                    key={`${products.idReturn}-${products.idProduct}-${i}`}
                    className="hover:bg-gray-50 transition-colors"
                    variants={rowVariants}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{products.idReturn.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {products.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {products.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {products.discount ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-500" />
                      )}
                    </td>                    
                    <td className="px-6 py-4 text-sm text-green-700">
                      {products.reason}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700">
                      {products.responsable}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ViewDetailsButton
                          event={() => handleOpenDetailsModal(products)}
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

      {/* Modal de devolución de productos */}
      <ProductReturnModal
        isOpen={isReturnModalOpen}
        onClose={handleCloseReturnModal}
      />

      {/* Modal de detalles de devolución */}
      <DetailsReturnProduct
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        returnData={selectedReturnData}
      />
    </>
  );
}