import React, { useState } from "react";
import Paginator from "../../../../../shared/components/paginator";
import {
  X,
  Package,
  Calendar,
  User,
  FileText,
  RefreshCw,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DetailsClientReturn = ({ isOpen, onClose, returnData }) => {
  const [currentCarouselStep, setCurrentCarouselStep] = useState(0);

  // Estado para paginación de Productos devueltos
  const [salePage, setSalePage] = useState(1);
  const salePerPage = 5;
  const saleProducts = returnData?.productsToReturn || [];
  const saleTotalPages = Math.ceil(saleProducts.length / salePerPage);
  const salePageProducts = saleProducts.slice(
    (salePage - 1) * salePerPage,
    salePage * salePerPage
  );

  // Estado para paginación de Productos cliente devueltos
  const [returnPage, setReturnPage] = useState(1);
  const returnPerPage = 5;
  const returnProducts = returnData?.productsClientReturn || [];
  const returnTotalPages = Math.ceil(returnProducts.length / returnPerPage);
  const returnPageProducts = returnProducts.slice(
    (returnPage - 1) * returnPerPage,
    returnPage * returnPerPage
  );

  if (!isOpen || !returnData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProductTotal = (product) => {
    return product.quantity * product.price;
  };

  const calculateTotalReturn = () => {
    return returnData.productsClientReturn.reduce((total, product) => {
      return total + calculateProductTotal(product);
    }, 0);
  };

  return (
    <>
      {/* Estilos CSS para animaciones */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Detalles de Devolución
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    ID Devolución
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  #{returnData.idReturn}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    ID Venta
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  #{returnData.idSale}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Fecha
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {returnData.dateReturn}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Cliente
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {returnData.client}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Tipo de Devolución
                  </span>
                </div>
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  {returnData.typeReturn}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Responsable
                  </span>
                </div>
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  {returnData.responsable}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 lg:col-span-full">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    Total
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(returnData.total)}
                </p>
              </div>
            </div>

            {/* Carrusel de Productos */}
            <div className="space-y-4">
              {/* Navegación del Carrusel */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentCarouselStep(0)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      currentCarouselStep === 0
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    Productos devueltos
                  </button>
                  <button
                    onClick={() => setCurrentCarouselStep(1)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      currentCarouselStep === 1
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    Productos cliente devueltos
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentCarouselStep(
                        Math.max(0, currentCarouselStep - 1)
                      )
                    }
                    disabled={currentCarouselStep === 0}
                    className={`p-2 rounded-full transition-colors ${
                      currentCarouselStep === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-500">
                    {currentCarouselStep + 1} de 2
                  </span>
                  <button
                    onClick={() =>
                      setCurrentCarouselStep(
                        Math.min(1, currentCarouselStep + 1)
                      )
                    }
                    disabled={currentCarouselStep === 1}
                    className={`p-2 rounded-full transition-colors ${
                      currentCarouselStep === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Contenido del Carrusel */}
              <div className="relative min-h-[300px]">
                {/* Productos devueltos */}
                {currentCarouselStep === 0 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Productos devueltos
                    </h3>
                    <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-green-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                              Producto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                              Precio Unitario
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-200">
                          {salePageProducts.map((product, index) => (
                            <tr key={index} className="hover:bg-green-100">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {product.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {product.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatCurrency(product.price)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {formatCurrency(calculateProductTotal(product))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-center mt-2">
                      <Paginator
                        currentPage={salePage}
                        perPage={salePerPage}
                        totalPages={saleTotalPages}
                        filteredLength={saleProducts.length}
                        goToPage={setSalePage}
                      />
                    </div>
                  </div>
                )}

                {/* Productos cliente devueltos */}
                {currentCarouselStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Productos cliente devueltos
                    </h3>
                    <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-red-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Producto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Razon
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Proveedor
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Precio Unitario
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-200">
                          {returnPageProducts.map((product, index) => (
                            <tr key={index} className="hover:bg-red-100">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {product.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {product.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {product.reason}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {product.statusSuppliers}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatCurrency(product.price)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {formatCurrency(calculateProductTotal(product))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-red-100">
                          <tr>
                            <td
                              colSpan="5"
                              className="px-4 py-3 text-sm font-semibold text-right text-red-800"
                            >
                              Total a Devolver:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-red-900">
                              {formatCurrency(calculateTotalReturn())}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="flex justify-center mt-2">
                      <Paginator
                        currentPage={returnPage}
                        perPage={returnPerPage}
                        totalPages={returnTotalPages}
                        filteredLength={returnProducts.length}
                        goToPage={setReturnPage}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsClientReturn;
