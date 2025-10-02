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
import {
  showInfoAlert,
} from "../../../shared/components/alerts";
import { Button } from "primereact/button";
import ProductReturnModal from "./modals/register/ProductReturnModal";
import DetailsReturnProduct from "./modals/details/detailsReturnProduct";
import { generateProductReturnsPDF } from "./helper/exportToPdf";
import { generateProductReturnsXLS } from "./helper/exportToXls";

const baseReturns = [];
for (let i = 1; i <= 44; i++) {
  baseReturns.push({
    idReturn: i,
    products: [
      { idProduct: 1, name: "Producto A", quantity: 2, price: 100, discount: true, reason: "Cerca de vencer", supplier: "Proveedor A" },
      { idProduct: 2, name: "Producto B", quantity: 1, price: 200, discount: false, reason: "Vencido", supplier: "Proveedor B" },
      { idProduct: 3, name: "Producto C", quantity: 3, price: 150, discount: true, reason: "Cerca de vencer", supplier: "Proveedor C" },
      { idProduct: 4, name: "Producto D", quantity: 5, price: 50, discount: false, reason: "Vencido", supplier: "Proveedor D" },
      { idProduct: 5, name: "Producto E", quantity: 1, price: 300, discount: true, reason: "Cerca de vencer", supplier: "Proveedor E" },
      { idProduct: 6, name: "Producto F", quantity: 2, price: 250, discount: false, reason: "Vencido", supplier: "Proveedor F" },
    ],
    dateReturn: `2023-11-${(i + 15) % 30 < 10 ? "0" : ""}${(i + 15) % 30}`,
    responsable: `Empleado ${i}`, 
  });
}

export default function IndexProductReturns() {
  const [returns] = useState([...baseReturns]);
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
      returnItem.products.map(product => ({
        idReturn: returnItem.idReturn,
        dateReturn: returnItem.dateReturn,
        responsable: returnItem.responsable,
        ...product
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
            <ExportExcelButton event={generateProductReturnsXLS}>Excel</ExportExcelButton>
            <ExportPDFButton event={generateProductReturnsPDF}>PDF</ExportPDFButton>
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
                pageItems.map((product, i) => (
                  <motion.tr
                    key={`${product.idReturn}-${product.idProduct}-${i}`}
                    className="hover:bg-gray-50 transition-colors"
                    variants={rowVariants}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{product.idReturn.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.discount ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700">
                      {product.responsable}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ViewDetailsButton
                          event={() => handleOpenDetailsModal(product)}
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